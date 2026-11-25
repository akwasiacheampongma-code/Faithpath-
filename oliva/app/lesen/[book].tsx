import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Pressable, ScrollView, useWindowDimensions } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Shell } from "../../src/components/Shell";
import { T, Button, Card, IconButton, Tag } from "../../src/components/ui";
import { useTheme } from "../../src/design-system/theme";
import { useApp } from "../../src/state/store";
import {
  BOOKS,
  chapterTextNotes,
  getChapter,
  getPassage,
  bookByCode,
  referenceLabel,
  validReference,
  type Reference,
} from "../../src/features/bible/repository";
import { PATHS } from "../../src/features/paths/catalog";
import { guidedReadingContext } from "../../src/features/paths/reader-context";
import { markRead, chapterId, savedEditionReading } from "../../src/state/model";
import FlowText from "../../src/features/bible/flow/FlowText";
import type { FlowTextHandle } from "../../src/features/bible/flow/types";
import { flowParagraphs } from "../../src/features/bible/flow/model";
import { LegacyVerseText } from "../../src/features/bible/flow/LegacyVerseText";
import { ChapterPicker } from "../../src/features/bible/ChapterPicker";
import { useReaderFont } from "../../src/features/bible/reader-font";
import { ReaderPreferences } from "../../src/features/bible/ReaderPreferences";
import { BIBLE_EDITIONS, alternateEdition, bibleEdition, editionChapterRoute, readerRoute, type AlternateEdition, type BibleEdition } from "../../src/features/bible/editions";
import { passageKeyOf, sameBibleChapter } from "../../src/features/bible/reference-key";
import { useEditionText } from "../../src/features/bible/useEditionText";
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
import { bibleNoteParams, linksChapter } from "../../src/features/notebook/links";
type ReaderParams = {
  book: string;
  chapter: string;
  edition?: string;
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
};

export default function Reader({ fixedEdition }: { fixedEdition?: AlternateEdition } = {}) {
  const params = useLocalSearchParams<ReaderParams>();
  const edition = fixedEdition ?? alternateEdition(params.edition);
  const status = useEditionText(bibleEdition(edition));
  if (status !== "ready") return <Shell reader>
    <T accessibilityLiveRegion="polite">{status === "error" ? "Der Bibeltext konnte gerade nicht geladen werden." : "Der Bibeltext wird geöffnet …"}</T>
    {status === "error" && <Button kind="secondary" onPress={() => router.replace({ pathname: "/bibel", params: { ausgabe: edition } })}>
      Zur Buchauswahl
    </Button>}
  </Shell>;
  return <ReaderContent key={edition ?? "luther"} params={params} edition={edition} />;
}

function ReaderContent({ params, edition }: { params: ReaderParams; edition?: AlternateEdition }) {
  const currentEdition = bibleEdition(edition);
  const editionDetails = BIBLE_EDITIONS[currentEdition];
  const t = useTheme(),
    { width, fontScale } = useWindowDimensions(),
    data = useApp((s) => s.data),
    mutate = useApp((s) => s.mutate),
    busy = useApp((s) => s.busy);
  const font = useReaderFont();
  const [chapterPicker, setChapterPicker] = useState(false);
  const [showTextNotes, setShowTextNotes] = useState(false);
  const ref = {
      book: params.book ?? "",
      chapter: Number(params.chapter ?? 1),
      ...(edition ? { edition } : {}),
      ...(params.from ? { from: Number(params.from) } : {}),
      ...(params.to ? { to: Number(params.to) } : {}),
    },
    book = bookByCode(ref.book),
    valid = validReference(ref),
    verses = valid ? getChapter(ref.book, ref.chapter, edition) : [];
  const textNotes = chapterTextNotes(ref);
  const savedPosition = savedEditionReading(data, currentEdition)?.position;
  const hasChapterNotes = data.notebook?.some((note) => !note.deletedAt && linksChapter(note.link, ref)) ||
    data.notes.some((note) => !!note.ref && sameBibleChapter(note.ref, ref));
  const openChapterNotes = () => router.push({ pathname: "/notizen", params: bibleNoteParams(ref) });
  const binding = edition ? undefined : guidedReadingContext(ref, params.path, params.step),
    stepKey = binding?.key,
    path = binding?.path,
    step = binding?.step,
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
  const topicContext = path?.kind === "life-topic" && !!step && context === step;
  const story = params.story ? storyById(params.story) : undefined;
  const reflection = (story?.references.some((source) => sameReadingScope(source, ref)) ? story.reflection : undefined)
    || step?.question
    || related.flatMap((candidate) => candidate.steps).find((candidate) => sameReadingScope(candidate.ref, ref))?.question;
  const [mode, setMode] = useState<"read" | "deep">(
      params.mode === "deep"
        ? "deep"
        : params.mode === "read"
          ? "read"
          : savedPosition && sameReadingScope(savedPosition.ref, ref)
            ? savedPosition.mode
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
    layoutKey: `${width}:${fontScale}:${data.settings.fontSize}:${data.settings.lineHeight}:${font}:${mode}:${flow}:${chooseVerse}:${focus}:${selectionToolsOpen}`,
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
    setShowTextNotes(false);
    const saved = savedEditionReading(useApp.getState().data, currentEdition)?.position;
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
        getChapter(ref.book, ref.chapter, edition).some((verse) => verse.n === requested)
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
          ...displayReference(ref),
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
      router.dismissTo({ pathname: "/weg/[id]", params: { id: path.id, step: params.step } });
    else if (router.canGoBack()) router.back();
    else if (params.story && storyById(params.story)?.references.some((source) => source.book === ref.book && source.chapter === ref.chapter))
      router.replace({ pathname: "/geschichte/[id]", params: { id: params.story, stage: ["lesen", "verstehen", "gedanken"].includes(params.storyStage ?? "") ? params.storyStage : "lesen",
        index: String(Number.isInteger(Number(params.storyIndex)) && Number(params.storyIndex) >= 0 && Number(params.storyIndex) < storyById(params.story)!.questions.length ? params.storyIndex : 0) } });
    else router.replace({ pathname: "/bibel", params: { ausgabe: edition } });
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
              passageKeyOf(ref, ref.from ?? verses[0]?.n ?? 0, ref.to ?? verses.at(-1)?.n ?? 0),
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
        style={{ maxWidth: 660, width: "100%", alignSelf: "center", gap: 12 }}
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
                accessibilityLabel="Buchauswahl"
                accessibilityState={{ expanded: chapterPicker }}
                onPress={() => { setTools(false); setChapterPicker(!chapterPicker); }}
                style={{
                  minHeight: 44,
                  justifyContent: "center",
                  flexShrink: 1,
                }}
              >
                <T style={{ fontSize: 13, lineHeight: 20 }}>{valid ? referenceLabel({ book: ref.book, chapter: ref.chapter }) : "Buchauswahl"} ⌄</T>
              </Pressable>
            </View>
            <View style={{ flexDirection: "row", gap: 3 }}>
              <IconButton
                name="settings"
                label="Leseeinstellungen"
                buttonRef={settingsEntry}
                selected={tools}
                onPress={() => {
                  setChooseVerse(false);
                  setChapterPicker(false);
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
        {chapterPicker && !focus && <ChapterPicker books={BOOKS} currentBook={ref.book} currentChapter={ref.chapter}
          onClose={() => setChapterPicker(false)}
          onChoose={(book, chapter) => {
            setChapterPicker(false);
            if (book !== ref.book || chapter !== ref.chapter || ref.from || ref.to) {
              router.push(readerRoute({ book, chapter, edition }, { mode }));
            }
          }} />}
        {!valid ? (
          <Card>
            <T variant="heading">Diese Bibelstelle gibt es nicht.</T>
            <T style={{ marginVertical: 15 }}>
              Wähle ein vorhandenes Buch und Kapitel.
            </T>
            <Button onPress={() => router.replace({ pathname: "/bibel", params: { ausgabe: edition } })}>
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
                onOpenNotes={openChapterNotes}
                editionSwitches={(Object.keys(BIBLE_EDITIONS) as BibleEdition[])
                  .filter((candidate) => candidate !== currentEdition)
                  .map((candidate) => ({
                    label: "Zu " + BIBLE_EDITIONS[candidate].name + " wechseln",
                    onPress: () => router.replace(editionChapterRoute(candidate, ref)),
                  }))}
                onFlowChange={(next) => {
                  if (next) setFlowUnavailable(false);
                  setFlow(next);
                }}
              />
            )}

            {!focus && (
              <View style={{ alignItems: "flex-start", gap: 8 }}>
                {path && (
                  <Tag icon="path">
                    {path.title} · Schritt {Number(params.step) + 1}
                  </Tag>
                )}
                <T
                  variant="title"
                  accessibilityRole="header"
                  style={{ fontSize: width < 500 ? 34 : 42, lineHeight: width < 500 ? 40 : 48 }}
                >
                  {step?.title ?? referenceLabel(ref)}
                </T>
                <T variant="small" style={{ color: t.muted }}>
                  {step ? `${referenceLabel(ref)} · ` : ""}{edition ? editionDetails.credit : editionDetails.name}
                </T>
                {passage && (
                  <T
                    variant="small"
                    style={{ color: t.muted }}
                  >
                    Das Kapitel bleibt vollständig lesbar. Die Lesebestätigung gilt für den farbig hinterlegten Abschnitt.
                  </T>
                )}
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    maxWidth: "100%",
                    gap: 4,
                    backgroundColor: t.soft,
                    padding: 4,
                    borderRadius: 14,
                    marginTop: 4,
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
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        minHeight: 44,
                        maxWidth: "100%",
                        borderRadius: 10,
                        justifyContent: "center",
                        backgroundColor:
                          mode === id ? t.surface : "transparent",
                      }}
                    >
                      <T
                        style={{
                          fontSize: 12,
                          lineHeight: 19,
                          color: mode === id ? t.text : t.muted,
                        }}
                      >
                        {label}
                      </T>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
            {!focus && mode === "deep" && (
              <Card
                style={{ gap: 12, backgroundColor: t.soft, borderWidth: 0 }}
              >
                <T variant="label" style={{ color: t.gold, fontSize: 9 }}>
                  {topicContext ? "ORIGINALE FAITHPATH-EINORDNUNG · KEIN BIBELTEXT" : "KI-UNTERSTÜTZTER ENTWURF · KEIN BIBELTEXT"}
                </T>
                <T variant="heading">
                  {context
                    ? "Was du zum Abschnitt wissen solltest"
                    : "Das Buch im Überblick"}
                </T>
                <T style={{ fontSize: 13, lineHeight: 23 }}>
                  {context?.explanation ?? book?.description}
                </T>
                {context?.editorialNote && <View style={{ gap: 8, borderLeftWidth: 2, borderColor: t.gold, paddingLeft: 14 }}>
                  <T variant="label" style={{ fontSize: 9, color: t.gold }}>ERGÄNZENDER OLIVA-HINWEIS</T>
                  <T style={{ fontSize: 13, lineHeight: 23 }}>{context.editorialNote}</T>
                </View>}
                {context && (
                  <T style={{ fontSize: 10, color: t.muted }}>
                    Diese Einordnung bezieht sich auf{" "}
                    {referenceLabel(context.ref)}{edition ? " in Luther 1912" : ""}.
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
                {context && !topicContext && <TextCheck reference={context.ref} />}
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
              }}
            >
              {selectionError && !selectionToolsOpen && (
                <T accessibilityRole="alert">{selectionError}</T>
              )}
              {!focus &&
                data.drafts
                  .filter(
                    (d) =>
                      d.type === "capture" &&
                      (d.values.source.type === "verse" ||
                        d.values.source.type === "passage") &&
                      sameBibleChapter(d.values.source.ref, ref),
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
                    columnGap: 16,
                    rowGap: 0,
                  }}
                >
                  <Button
                    kind="ghost"
                    icon={null}
                    buttonRef={pickerEntry}
                    style={{ paddingHorizontal: 2, paddingVertical: 9, minHeight: 44, maxWidth: "100%" }}
                    onPress={() => {
                      setTools(false);
                      if (chooseVerse) closePicker();
                      else setChooseVerse(true);
                    }}
                  >
                    {chooseVerse ? "Verswahl schließen" : "Zu Vers springen"}
                  </Button>
                  {hasChapterNotes && !tools && <Button kind="ghost" icon={null} style={{ minHeight: 44, paddingHorizontal: 2 }}
                    onPress={openChapterNotes}>Notizen zu diesem Kapitel</Button>}
                  <Button kind="ghost" icon={null} buttonRef={focusEntry} onPress={startFocus}
                    style={{ paddingHorizontal: 2, paddingVertical: 9, minHeight: 44, maxWidth: "100%" }}>
                    Lesefokus starten
                  </Button>
                  <Button kind="ghost" icon={null}
                    style={{ paddingHorizontal: 2, paddingVertical: 9, minHeight: 44, maxWidth: "100%" }}
                    onPress={() => {
                      if (passage) {
                        const target = ref.from ?? verses[0]!.n;
                        position.restore(target);
                        if (routeActive.current) flowText.current?.focusVerse(target);
                      } else position.beginning();
                    }}>
                    {passage ? "Zum Abschnittsanfang" : "Zum Kapitelanfang"}
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
              {!focus && (
                <T variant="small" style={{ color: t.muted, marginBottom: 10 }}>
                  Verse antippen, um sie zu markieren, zu kopieren oder eine Notiz zu schreiben.
                </T>
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
                  fontFamily={font}
                  lineHeight={data.settings.lineHeight}
                  layoutKey={`${width}:${fontScale}:${data.settings.fontSize}:${data.settings.lineHeight}:${font}:${mode}`}
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
                  fontFamily={font}
                  lineHeight={data.settings.lineHeight}
                  position={position}
                  onSelect={selectVerse}
                  renderActions={() => null}
                />
              )}
            </View>
            {!focus && <>
              {textNotes.length > 0 && <View style={{ gap: 8, alignItems: "flex-start" }}>
                <Button kind="ghost" icon={null} onPress={() => setShowTextNotes(!showTextNotes)}>
                  {showTextNotes ? "Textanmerkungen schließen" : "Textanmerkungen der OTB"}
                </Button>
                {showTextNotes && textNotes.map((note, index) => <T variant="small" key={index}>
                  {note.after > 0 ? `Nach Vers ${note.after} · ` : ""}{note.text}
                </T>)}
              </View>}
              {edition && <Button kind="ghost" icon="info" style={{ alignSelf: "flex-start" }}
                onPress={() => router.push({ pathname: "/quellen", params: { ausgabe: edition } })}>
                Quelle, Lizenz und Bedingungen
              </Button>}
              <ReaderFooter
                reference={ref}
                done={done}
                busy={busy}
                onComplete={() => void complete()}
                pathId={path?.id}
                pathStep={binding ? Number(params.step) : undefined}
                question={context?.question}
                reflection={reflection}
                relatedPath={related[0]}
                mode={mode}
              />
            </>}
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
                ? topicContext
                  ? "\nEinordnung: ursprüngliche FaithPath-Vorarbeit. Zusätzliche OLIVA-Hinweise sind getrennt gekennzeichnet; unabhängige theologische Freigabe offen."
                  : "\nEinordnungen: OLIVA-Entwürfe; theologische Freigabe vor Veröffentlichung offen."
                : ""}
            </T>
          </>
        )}
      </View>
    </Shell>
  );
}
