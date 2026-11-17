import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Pressable, ScrollView, useWindowDimensions } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Shell } from "../../src/components/Shell";
import { T, Button, Card, IconButton, Tag } from "../../src/components/ui";
import { Icon } from "../../src/components/Icon";
import { useTheme } from "../../src/design-system/theme";
import { useApp } from "../../src/state/store";
import {
  getChapter,
  getPassage,
  bookByCode,
  referenceLabel,
  validReference,
  type Reference,
} from "../../src/features/bible/repository";
import { PATHS, pathById } from "../../src/features/paths/catalog";
import { markRead, chapterId } from "../../src/state/model";
import FlowText from "../../src/features/bible/flow/FlowText";
import type { FlowTextHandle } from "../../src/features/bible/flow/types";
import { flowParagraphs } from "../../src/features/bible/flow/model";
import { LegacyVerseText } from "../../src/features/bible/flow/LegacyVerseText";
import { ReaderPreferences } from "../../src/features/bible/ReaderPreferences";
import { focusReaderControl } from "../../src/features/bible/flow/focus";
import { useReaderDismiss } from "../../src/features/bible/flow/useReaderDismiss";
import { TextCheck } from "../../src/features/paths/TextCheck";
import { StoryCard } from "../../src/features/bible/StoryCard";
import { sceneFor } from "../../src/features/bible/scenes";
import { useReaderPosition } from "../../src/features/bible/useReaderPosition";
import { sameReadingScope } from "../../src/features/bible/position";
import { ReaderFooter } from "../../src/features/bible/ReaderFooter";
import {
  displayReference,
  selectionReference,
  toggleVerseSelection,
} from "../../src/features/bible/selection";
import {
  SelectionTools,
  type SelectionPanel,
} from "../../src/features/bible/SelectionTools";
import { ReaderSelectionBar } from "../../src/features/bible/ReaderSelectionBar";
import { useVolatileDrafts } from "../../src/features/personal/volatile-drafts";
import { resolveBibleDraft } from "../../src/features/personal/resolve-bible-draft";
import { storyById } from "../../src/features/stories/index";
export default function Reader() {
  const params = useLocalSearchParams<{
      book: string;
      chapter: string;
      from?: string;
      to?: string;
      path?: string;
      step?: string;
      mode?: string;
      verse?: string;
      selectFrom?: string;
      selectTo?: string;
      draft?: string;
      story?: string;
      storyStage?: string;
      storyIndex?: string;
    }>(),
    t = useTheme(),
    { width, fontScale } = useWindowDimensions(),
    data = useApp((s) => s.data),
    mutate = useApp((s) => s.mutate),
    busy = useApp((s) => s.busy);
  const ref = {
      book: params.book ?? "",
      chapter: Number(params.chapter ?? 1),
      ...(params.from ? { from: Number(params.from) } : {}),
      ...(params.to ? { to: Number(params.to) } : {}),
    },
    book = bookByCode(ref.book),
    valid = validReference(ref),
    verses = valid ? getChapter(ref.book, ref.chapter) : [],
    stepKey =
      params.path && params.step !== undefined
        ? `${params.path}:${params.step}`
        : undefined;
  const path = params.path ? pathById(params.path) : null,
    step = path?.steps[Number(params.step)],
    context =
      step ??
      PATHS.flatMap((p) => p.steps).find(
        (s) => s.ref.book === ref.book && s.ref.chapter === ref.chapter,
      ),
    related = PATHS.filter((p) =>
      p.steps.some(
        (s) => s.ref.book === ref.book && s.ref.chapter === ref.chapter,
      ),
    );
  const [mode, setMode] = useState<"read" | "deep">(
      params.mode === "deep"
        ? "deep"
        : params.mode === "read"
          ? "read"
          : data.readingPosition &&
              sameReadingScope(data.readingPosition.ref, ref)
            ? data.readingPosition.mode
            : "read",
    ),
    [tools, setTools] = useState(false),
    [flow, setFlow] = useState(true),
    [flowUnavailable, setFlowUnavailable] = useState(false),
    [chooseVerse, setChooseVerse] = useState(false),
    [noteFocused, setNoteFocused] = useState(false),
    [focus, setFocus] = useState(false),
    [selectedVerses, setSelectedVerses] = useState<number[]>([]),
    [selectionOrder, setSelectionOrder] = useState<number[]>([]),
    [selectionToolsOpen, setSelectionToolsOpen] = useState(false),
    [selectionError, setSelectionError] = useState<string | null>(null),
    [selectionPanel, setSelectionPanel] = useState<SelectionPanel>("note"),
    [copyText, setCopyText] = useState<string | null>(null),
    [ack, setAck] = useState<string | null>(null);
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const flowText = useRef<FlowTextHandle>(null),
    focusEntry = useRef<React.ComponentRef<typeof Pressable>>(null),
    pickerEntry = useRef<React.ComponentRef<typeof Pressable>>(null),
    settingsEntry = useRef<React.ComponentRef<typeof Pressable>>(null),
    wasFocus = useRef(false),
    routeActive = useRef(false),
    selectionReturnFocus = useRef<(() => void) | null>(null);
  const openKey = JSON.stringify(ref);
  const paragraphs = useMemo(
    () => (valid ? flowParagraphs(displayReference(ref), verses) : []),
    [ref.book, ref.chapter, valid],
  );
  const position = useReaderPosition({
    reference: ref,
    scroll,
    explicitVerse:
      params.verse && !params.draft ? Number(params.verse) : undefined,
    mode,
    toolsOpen: tools || chooseVerse || selectionToolsOpen,
    pauseRemember: noteFocused || chooseVerse || selectionToolsOpen,
    measureVerses: flow
      ? (node) => flowText.current?.measure(node) ?? Promise.resolve(null)
      : undefined,
    layoutKey: `${width}:${fontScale}:${data.settings.fontSize}:${data.settings.lineHeight}:${mode}:${flow}:${chooseVerse}:${focus}:${selectionToolsOpen}`,
  });
  const jumpToVerse = position.restore;
  useEffect(() => {
    setAck(null);
    setNoteFocused(false);
    setFocus(false);
    setSelectedVerses([]);
    setSelectionOrder([]);
    setSelectionToolsOpen(false);
    setSelectionError(null);
    setCopyText(null);
    const saved = useApp.getState().data.readingPosition;
    setMode(
      params.mode === "deep"
        ? "deep"
        : params.mode === "read"
          ? "read"
          : saved && sameReadingScope(saved.ref, ref)
            ? saved.mode
            : "read",
    );
  }, [openKey]);
  useEffect(() => {
    if (params.verse && !params.draft) {
      const requested = Number(params.verse);
      if (
        valid &&
        getChapter(ref.book, ref.chapter).some((verse) => verse.n === requested)
      ) {
        setSelectedVerses([requested]);
        setSelectionOrder([requested]);
      }
      // Consume the incoming jump once. A reload must resume the subsequently
      // read verse, while a fresh bookmark/search link still takes precedence.
      router.setParams({ verse: undefined });
    }
  }, [params.verse, params.draft, openKey]);
  useFocusEffect(
    useCallback(() => {
      routeActive.current = true;
      return () => {
        routeActive.current = false;
        setSelectionToolsOpen(false);
        setNoteFocused(false);
      };
    }, []),
  );
  useEffect(() => {
    if (!params.draft && !params.selectFrom && !params.selectTo) return;
    try {
      let requested: Reference | null = null;
      if (params.draft) {
        const volatile = useVolatileDrafts.getState();
        const draft = resolveBibleDraft({
          draftId: params.draft,
          reference: ref,
          durable: useApp.getState().data.drafts,
          held: volatile.items,
          settled: volatile.settled,
        });
        requested = draft.values.source.ref;
      } else
        requested = {
          book: ref.book,
          chapter: ref.chapter,
          from: Number(params.selectFrom),
          to: Number(params.selectTo),
        };
      if (
        !validReference(requested) ||
        requested.from === undefined ||
        requested.to === undefined ||
        requested.from > requested.to
      )
        throw new Error("Diese Versauswahl ist nicht vorhanden.");
      const selectedVerses = getPassage(requested).map((verse) => verse.n);
      selectionReference(ref, selectedVerses);
      setSelectedVerses(selectedVerses);
      setSelectionOrder(selectedVerses);
      setSelectionError(null);
      if (params.draft) {
        jumpToVerse(requested.from);
        setSelectionPanel("note");
        setSelectionToolsOpen(true);
      }
    } catch (error) {
      rejectDraftResume(error);
    }
    router.setParams({
      draft: undefined,
      selectFrom: undefined,
      selectTo: undefined,
      ...(params.draft ? { verse: undefined } : {}),
    });
  }, [params.draft, params.selectFrom, params.selectTo, openKey]);
  useEffect(() => {
    const leaving = wasFocus.current && !focus;
    wasFocus.current = focus;
    if (!leaving) return;
    const frame = requestAnimationFrame(() =>
      focusReaderControl(focusEntry.current),
    );
    return () => cancelAnimationFrame(frame);
  }, [focus]);
  function rejectDraftResume(error: unknown) {
    setSelectedVerses([]);
    setSelectionOrder([]);
    setSelectionToolsOpen(false);
    setNoteFocused(false);
    setSelectionError(
      error instanceof Error
        ? error.message
        : "Die Auswahl konnte nicht geöffnet werden.",
    );
  }
  function closeTools() {
    setTools(false);
    requestAnimationFrame(() => focusReaderControl(settingsEntry.current));
  }
  function closePicker() {
    setChooseVerse(false);
    requestAnimationFrame(() => focusReaderControl(pickerEntry.current));
  }
  function selectVerse(verse: number) {
    if (params.draft || !valid || !verses.some((entry) => entry.n === verse))
      return;
    setNoteFocused(false);
    setSelectionError(null);
    if (focus) setFocus(false);
    setSelectedVerses((current) => toggleVerseSelection(ref, current, verse));
    setSelectionOrder((current) =>
      current.includes(verse)
        ? current.filter((item) => item !== verse)
        : [...current, verse],
    );
  }
  function closeSelectionTools() {
    setSelectionToolsOpen(false);
    setNoteFocused(false);
    const verse = selectionOrder.at(-1) ?? selectedVerses.at(-1);
    const returnFocus = () => {
      if (routeActive.current) {
        if (verse !== undefined) flowText.current?.focusVerse(verse);
        else focusReaderControl(pickerEntry.current);
      }
    };
    // Web/iOS dismiss their focus trap after this state update. Its actual
    // dismissal callback owns the final return; Android has no onDismiss.
    selectionReturnFocus.current = returnFocus;
    requestAnimationFrame(returnFocus);
  }
  function selectionDismissed() {
    const returnFocus = selectionReturnFocus.current;
    selectionReturnFocus.current = null;
    if (!selectionToolsOpen) returnFocus?.();
  }
  function clearSelection() {
    const verse = selectionOrder.at(-1) ?? selectedVerses.at(-1);
    setSelectionToolsOpen(false);
    setSelectedVerses([]);
    setSelectionOrder([]);
    setSelectionError(null);
    setNoteFocused(false);
    setCopyText(null);
    requestAnimationFrame(() => {
      if (routeActive.current && verse !== undefined)
        flowText.current?.focusVerse(verse);
    });
  }
  function startFocus() {
    setTools(false);
    setChooseVerse(false);
    setNoteFocused(false);
    setFocus(true);
    setSelectedVerses([]);
    setSelectionOrder([]);
    setSelectionToolsOpen(false);
  }
  useReaderDismiss(() => {
    if (selectionToolsOpen) {
      closeSelectionTools();
      return true;
    }
    if (tools) {
      closeTools();
      return true;
    }
    if (chooseVerse) {
      closePicker();
      return true;
    }
    if (selectedVerses.length) {
      clearSelection();
      return true;
    }
    if (focus) {
      setFocus(false);
      return true;
    }
    return false;
  });
  const back = () => {
    if (stepKey && path)
      router.dismissTo({ pathname: "/weg/[id]", params: { id: path.id } });
    else if (router.canGoBack()) router.back();
    else if (params.story && storyById(params.story)?.references.some((source) => source.book === ref.book && source.chapter === ref.chapter))
      router.replace({ pathname: "/geschichte/[id]", params: { id: params.story, stage: ["lesen", "verstehen", "gedanken"].includes(params.storyStage ?? "") ? params.storyStage : "lesen",
        index: String(Number.isInteger(Number(params.storyIndex)) && Number(params.storyIndex) >= 0 && Number(params.storyIndex) < storyById(params.story)!.questions.length ? params.storyIndex : 0) } });
    else router.replace("/bibel");
  };
  async function complete() {
    if (!valid) return;
    if (
      await mutate((d) => {
        markRead(d, ref, stepKey);
      })
    )
      setAck(completionScope);
  }
  const completionScope = JSON.stringify([ref, stepKey ?? null]);
  const read = data.readChapters.includes(chapterId(ref)),
    passage = !!(ref.from || ref.to),
    done =
      ack === completionScope ||
      (stepKey
        ? data.readSteps.includes(stepKey)
        : passage
          ? data.readPassages.includes(
              `${ref.book}:${ref.chapter}:${ref.from ?? getChapter(ref.book, ref.chapter)[0]?.n}:${ref.to ?? getChapter(ref.book, ref.chapter).at(-1)?.n}`,
            )
          : read);
  let selectedReference: Reference | null = null;
  if (selectedVerses.length) {
    try {
      selectedReference = selectionReference(ref, selectedVerses);
    } catch {
      /* Disjoint verses remain valid for copying, marking and bookmarks. */
    }
  }
  const focusRange =
    passage && valid
      ? { from: ref.from ?? verses[0]!.n, to: ref.to ?? verses.at(-1)!.n }
      : undefined;
  return (
    <Shell
      reader
      scrollRef={scroll}
      onScroll={position.onScroll}
      readerToolbar={
        focus ? (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <T variant="small" style={{ color: t.muted }}>
              {referenceLabel(ref)}
            </T>
            <Button kind="ghost" icon="close" onPress={() => setFocus(false)}>
              Lesefokus beenden
            </Button>
          </View>
        ) : undefined
      }
      readerActions={
        valid &&
        selectedVerses.length > 0 &&
        !params.draft &&
        !selectionToolsOpen ? (
          <ReaderSelectionBar
            reference={ref}
            selected={selectedVerses}
            onClear={clearSelection}
            onNote={() => {
              setSelectionPanel("note");
              setSelectionToolsOpen(true);
            }}
            onMore={() => {
              setSelectionPanel("more");
              setSelectionToolsOpen(true);
            }}
            onFallback={(text) => {
              setCopyText(text);
              setSelectionPanel("copy");
              setSelectionToolsOpen(true);
            }}
          />
        ) : undefined
      }
    >
      <SelectionTools
        visible={selectionToolsOpen && valid && !params.draft}
        panel={selectionPanel}
        reference={selectedReference}
        logicalReference={ref}
        selected={selectedVerses}
        copyText={copyText}
        onClose={closeSelectionTools}
        onDismiss={selectionDismissed}
        onFocusChange={setNoteFocused}
      />
      <View
        ref={position.rootRef}
        onLayout={position.rootLayout}
        style={{ maxWidth: 860, width: "100%", alignSelf: "center", gap: 22 }}
      >
        {!focus && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                flex: 1,
                minWidth: 0,
              }}
            >
              <IconButton
                name="back"
                label={path ? "Zurück zum Weg" : "Zurück"}
                onPress={back}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/bibel")}
                style={{
                  minHeight: 44,
                  justifyContent: "center",
                  flexShrink: 1,
                }}
              >
                <T style={{ fontSize: 14 }}>{referenceLabel(ref)}⌄</T>
              </Pressable>
            </View>
            <View style={{ flexDirection: "row", gap: 3 }}>
              {width >= 600 && <Tag>Luther 1912</Tag>}
              <IconButton
                name="settings"
                label="Leseeinstellungen"
                buttonRef={settingsEntry}
                selected={tools}
                onPress={() => {
                  setChooseVerse(false);
                  if (tools) closeTools();
                  else setTools(true);
                }}
              />
              <IconButton
                name={t.dark ? "sun" : "moon"}
                label={
                  t.dark
                    ? "Hellen Modus aktivieren"
                    : "Dunklen Modus aktivieren"
                }
                onPress={() =>
                  void mutate((d) => {
                    d.settings.theme = t.dark ? "light" : "dark";
                  })
                }
              />
            </View>
          </View>
        )}
        {!valid ? (
          <Card>
            <T variant="heading">Diese Bibelstelle gibt es nicht.</T>
            <T style={{ marginVertical: 15 }}>
              Wähle ein vorhandenes Buch und Kapitel.
            </T>
            <Button onPress={() => router.replace("/bibel")}>
              Zur Buchauswahl
            </Button>
          </Card>
        ) : (
          <>
            {tools && !focus && (
              <ReaderPreferences
                flow={flow}
                unavailable={flowUnavailable}
                onClose={closeTools}
                onFlowChange={(next) => {
                  if (next) setFlowUnavailable(false);
                  setFlow(next);
                }}
              />
            )}

            {!focus && (
              <View style={{ alignItems: "center", gap: 14, marginTop: 12 }}>
                {path && (
                  <Tag icon="path">
                    {path.title} · Schritt {Number(params.step) + 1}
                  </Tag>
                )}
                <T variant="label" style={{ color: t.gold, fontSize: 9 }}>
                  {book?.testament === "NT"
                    ? "NEUES TESTAMENT"
                    : "ALTES TESTAMENT"}
                </T>
                <T
                  variant="hero"
                  accessibilityRole="header"
                  style={{
                    fontSize: width < 500 ? 40 : 51,
                    textAlign: "center",
                  }}
                >
                  {step?.title ?? book?.name}
                </T>
                <T style={{ color: t.muted, fontSize: 12 }}>
                  {referenceLabel(ref)} · Bibeltext
                </T>
                {passage && (
                  <T
                    variant="small"
                    style={{ color: t.muted, textAlign: "center" }}
                  >
                    Das ganze Kapitel bleibt lesbar. Der farbig hinterlegte
                    Abschnitt ist dein Bezug; eine Bestätigung gilt nur für
                    diesen Abschnitt.
                  </T>
                )}
                <Button
                  kind="ghost"
                  icon="back"
                  onPress={() => {
                    if (passage) {
                      const target = ref.from ?? verses[0]!.n;
                      position.restore(target);
                      if (routeActive.current)
                        flowText.current?.focusVerse(target);
                    } else position.beginning();
                  }}
                >
                  {passage ? "Zum Abschnittsanfang" : "Zum Kapitelanfang"}
                </Button>
                <View
                  style={{
                    flexDirection: "row",
                    backgroundColor: t.soft,
                    padding: 4,
                    borderRadius: 30,
                    marginTop: 7,
                  }}
                >
                  {[
                    ["read", "Einfach lesen"],
                    ["deep", "Tiefer verstehen"],
                  ].map(([id, label]) => (
                    <Pressable
                      key={id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: mode === id }}
                      aria-pressed={mode === id}
                      onPress={() => {
                        setMode(id as "read");
                        router.setParams({ mode: id });
                      }}
                      style={{
                        paddingHorizontal: 18,
                        paddingVertical: 12,
                        minHeight: 44,
                        borderRadius: 25,
                        backgroundColor:
                          mode === id ? t.surface : "transparent",
                      }}
                    >
                      <T
                        style={{
                          fontSize: 11,
                          color: mode === id ? t.text : t.muted,
                        }}
                      >
                        {label}
                      </T>
                    </Pressable>
                  ))}
                </View>
                <Button
                  kind="ghost"
                  icon="book"
                  buttonRef={focusEntry}
                  onPress={startFocus}
                >
                  Lesefokus starten
                </Button>
              </View>
            )}
            {!focus && mode === "deep" && (
              <Card
                style={{ gap: 12, backgroundColor: t.soft, borderWidth: 0 }}
              >
                <T variant="label" style={{ color: t.gold, fontSize: 9 }}>
                  KI-UNTERSTÜTZTER ENTWURF · KEIN BIBELTEXT
                </T>
                <T variant="heading">
                  {context
                    ? "Was du zum Abschnitt wissen solltest"
                    : "Das Buch im Überblick"}
                </T>
                <T style={{ fontSize: 13, lineHeight: 23 }}>
                  {context?.explanation ?? book?.description}
                </T>
                {context && (
                  <T style={{ fontSize: 10, color: t.muted }}>
                    Diese Einordnung bezieht sich auf{" "}
                    {referenceLabel(context.ref)}.
                  </T>
                )}
                {context?.word && (
                  <View
                    style={{
                      borderTopWidth: 1,
                      borderColor: t.line,
                      paddingTop: 13,
                      gap: 4,
                    }}
                  >
                    <T style={{ fontSize: 12, fontWeight: "600" }}>
                      {context.word[0]} – einfach erklärt
                    </T>
                    <T style={{ fontSize: 12, color: t.muted }}>
                      {context.word[1]}
                    </T>
                  </View>
                )}
                {!context && (
                  <T style={{ fontSize: 11, color: t.muted }}>
                    Für dieses Kapitel liegt noch keine geprüfte Zusammenfassung
                    vor. Der Bibeltext ist vollständig lesbar.
                  </T>
                )}
                {context && <TextCheck reference={context.ref} />}
              </Card>
            )}
            {!focus && mode === "deep" && sceneFor(ref) && (
              <StoryCard scene={sceneFor(ref)!} context />
            )}
            <View
              key={openKey}
              ref={position.listRef}
              onLayout={position.listLayout}
              style={{
                maxWidth: 660,
                width: "100%",
                alignSelf: "center",
                gap: 5,
                marginTop: 12,
              }}
            >
              {selectionError && !selectionToolsOpen && (
                <T accessibilityRole="alert">{selectionError}</T>
              )}
              {!focus && (
                <T
                  variant="small"
                  style={{ fontSize: 10, color: t.muted, marginBottom: 15 }}
                >
                  Tippe Verse an. Unten kannst du sie markieren, kopieren oder
                  eine Notiz schreiben. Erneutes Antippen hebt die Auswahl auf.
                </T>
              )}
              {!focus &&
                data.drafts
                  .filter(
                    (d) =>
                      d.type === "capture" &&
                      (d.values.source.type === "verse" ||
                        d.values.source.type === "passage") &&
                      d.values.source.ref.book === ref.book &&
                      d.values.source.ref.chapter === ref.chapter,
                  )
                  .map((d) => {
                    if (
                      d.type !== "capture" ||
                      (d.values.source.type !== "verse" &&
                        d.values.source.type !== "passage")
                    )
                      return null;
                    const source = d.values.source;
                    return (
                      <Button
                        key={d.id}
                        kind="secondary"
                        icon="pen"
                        onPress={() => {
                          try {
                            const volatile = useVolatileDrafts.getState();
                            const resolved = resolveBibleDraft({
                              draftId: d.id,
                              reference: source.ref,
                              durable: useApp.getState().data.drafts,
                              held: volatile.items,
                              settled: volatile.settled,
                            });
                            const requested = resolved.values.source;
                            setSelectionError(null);
                            const selectedVerses = getPassage(
                              requested.ref,
                            ).map((verse) => verse.n);
                            setSelectedVerses(selectedVerses);
                            setSelectionOrder(selectedVerses);
                            setSelectionPanel("note");
                            setSelectionToolsOpen(true);
                            requestAnimationFrame(() => {
                              if (routeActive.current)
                                jumpToVerse(requested.ref.from!);
                            });
                          } catch (error) {
                            rejectDraftResume(error);
                          }
                        }}
                      >
                        Notizentwurf zu {referenceLabel(source.ref)} fortsetzen
                      </Button>
                    );
                  })}
              {!focus && (
                <View
                  style={{
                    alignItems: "flex-start",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <Button
                    kind="ghost"
                    icon="pen"
                    buttonRef={pickerEntry}
                    onPress={() => {
                      setTools(false);
                      if (chooseVerse) closePicker();
                      else setChooseVerse(true);
                    }}
                  >
                    {chooseVerse ? "Verswahl schließen" : "Zu Vers springen"}
                  </Button>
                </View>
              )}
              {chooseVerse && (
                <Card style={{ gap: 12, marginBottom: 20 }}>
                  <T variant="heading">Zu welchem Vers möchtest du springen?</T>
                  <T variant="small" style={{ color: t.muted }}>
                    Wähle eine Zahl, um direkt zu diesem Vers zu springen.
                  </T>
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                  >
                    {verses.map((verse) => (
                      <Button
                        key={verse.n}
                        kind="secondary"
                        icon={null}
                        onPress={() => {
                          setSelectedVerses([]);
                          setSelectionOrder([]);
                          setNoteFocused(false);
                          setChooseVerse(false);
                          requestAnimationFrame(() => {
                            position.restore(verse.n);
                            flowText.current?.focusVerse(verse.n);
                          });
                        }}
                      >
                        Vers {verse.n}
                      </Button>
                    ))}
                  </View>
                </Card>
              )}
              {flow ? (
                <FlowText
                  ref={flowText}
                  paragraphs={paragraphs}
                  selected={null}
                  selectedVerses={params.draft ? [] : selectedVerses}
                  focusRange={focusRange}
                  highlights={data.highlights}
                  bookmarks={data.bookmarks}
                  fontSize={data.settings.fontSize + 3}
                  lineHeight={data.settings.lineHeight}
                  layoutKey={`${width}:${fontScale}:${data.settings.fontSize}:${data.settings.lineHeight}:${mode}`}
                  onSelect={selectVerse}
                  onGeometryChange={position.layoutChanged}
                  onUnavailable={() => {
                    setNoteFocused(false);
                    setFlowUnavailable(true);
                    setFlow(false);
                  }}
                  renderActions={() => null}
                />
              ) : (
                <LegacyVerseText
                  ref={flowText}
                  reference={ref}
                  verses={verses}
                  selected={null}
                  selectedVerses={params.draft ? [] : selectedVerses}
                  focusRange={focusRange}
                  highlights={data.highlights}
                  bookmarks={data.bookmarks}
                  fontSize={data.settings.fontSize + 3}
                  lineHeight={data.settings.lineHeight}
                  position={position}
                  onSelect={selectVerse}
                  renderActions={() => null}
                />
              )}
            </View>
            {!focus && (
              <ReaderFooter
                reference={ref}
                done={done}
                busy={busy}
                onComplete={() => void complete()}
                pathId={path?.id}
                question={context?.question}
                relatedPath={related[0]}
                mode={mode}
                celebrate={ack === completionScope && read}
              />
            )}
            <T
              style={{
                fontSize: 9,
                color: t.muted,
                textAlign: "center",
                lineHeight: 17,
              }}
            >
              Bibeltext: Lutherbibel 1912 · gemeinfrei · Quelle: eBible.org
              {!focus && mode === "deep"
                ? "\nEinordnungen: OLIVA-Entwürfe; theologische Freigabe vor Veröffentlichung offen."
                : ""}
            </T>
          </>
        )}
      </View>
    </Shell>
  );
}
