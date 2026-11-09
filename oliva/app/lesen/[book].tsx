import { useEffect, useMemo, useRef, useState } from "react";
import { View, Pressable, ScrollView, useWindowDimensions } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Shell } from "../../src/components/Shell";
import { T, Button, Card, IconButton, Tag } from "../../src/components/ui";
import { Icon } from "../../src/components/Icon";
import { SwordArt } from "../../src/components/Artwork";
import { useTheme } from "../../src/design-system/theme";
import { useApp } from "../../src/state/store";
import {
  getChapter,
  getPassage,
  bookByCode,
  referenceLabel,
  validReference,
  adjacentChapter,
} from "../../src/features/bible/repository";
import { PATHS, pathById } from "../../src/features/paths/catalog";
import { markRead, chapterId, countBookRead } from "../../src/state/model";
import FlowText from "../../src/features/bible/flow/FlowText";
import type { FlowTextHandle } from "../../src/features/bible/flow/types";
import { flowParagraphs } from "../../src/features/bible/flow/model";
import { LegacyVerseText } from "../../src/features/bible/flow/LegacyVerseText";
import { VerseActions } from "../../src/features/bible/VerseActions";
import { ReaderPreferences } from "../../src/features/bible/ReaderPreferences";
import { focusReaderControl } from "../../src/features/bible/flow/focus";
import { useReaderDismiss } from "../../src/features/bible/flow/useReaderDismiss";
import { TextCheck } from "../../src/features/paths/TextCheck";
import { StoryCard } from "../../src/features/bible/StoryCard";
import { sceneFor } from "../../src/features/bible/scenes";
import { useReaderPosition } from "../../src/features/bible/useReaderPosition";
import { sameReadingScope } from "../../src/features/bible/position";
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
    verses = getPassage(ref),
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
    [selected, setSelected] = useState<number | null>(
      params.verse ? Number(params.verse) : null,
    ),
    [ack, setAck] = useState<string | null>(null);
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const flowText = useRef<FlowTextHandle>(null),
    focusEntry = useRef<React.ComponentRef<typeof Pressable>>(null),
    pickerEntry = useRef<React.ComponentRef<typeof Pressable>>(null),
    settingsEntry = useRef<React.ComponentRef<typeof Pressable>>(null),
    wasFocus = useRef(false);
  const openKey = JSON.stringify(ref);
  const paragraphs = useMemo(
    () => (valid ? flowParagraphs(ref, verses) : []),
    [openKey],
  );
  const position = useReaderPosition({
    reference: ref,
    scroll,
    explicitVerse: params.verse ? Number(params.verse) : undefined,
    mode,
    toolsOpen: tools || chooseVerse,
    pauseRemember: noteFocused || chooseVerse,
    measureVerses: flow
      ? (node) => flowText.current?.measure(node) ?? Promise.resolve(null)
      : undefined,
    layoutKey: `${width}:${fontScale}:${data.settings.fontSize}:${data.settings.lineHeight}:${mode}:${selected ?? ""}:${flow}:${chooseVerse}:${focus}`,
  });
  const jumpToVerse = position.restore;
  useEffect(() => {
    setAck(null);
    setNoteFocused(false);
    setFocus(false);
    setSelected(params.verse ? Number(params.verse) : null);
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
    if (params.verse) {
      setSelected(Number(params.verse));
      // Consume the incoming jump once. A reload must resume the subsequently
      // read verse, while a fresh bookmark/search link still takes precedence.
      router.setParams({ verse: undefined });
    }
  }, [params.verse, openKey]);
  useEffect(() => {
    const leaving = wasFocus.current && !focus;
    wasFocus.current = focus;
    if (!leaving) return;
    const frame = requestAnimationFrame(() =>
      focusReaderControl(focusEntry.current),
    );
    return () => cancelAnimationFrame(frame);
  }, [focus]);
  function closeTools() {
    setTools(false);
    requestAnimationFrame(() => focusReaderControl(settingsEntry.current));
  }
  function closePicker() {
    setChooseVerse(false);
    requestAnimationFrame(() => focusReaderControl(pickerEntry.current));
  }
  function selectVerse(verse: number) {
    setNoteFocused(false);
    if (focus) setFocus(false);
    setSelected(selected === verse ? null : verse);
  }
  function closeActions() {
    const verse = selected;
    setSelected(null);
    setNoteFocused(false);
    if (verse !== null)
      requestAnimationFrame(() => flowText.current?.focusVerse(verse));
  }
  function startFocus() {
    setTools(false);
    setChooseVerse(false);
    setSelected(null);
    setNoteFocused(false);
    setFocus(true);
  }
  useReaderDismiss(() => {
    if (tools) {
      closeTools();
      return true;
    }
    if (chooseVerse) {
      closePicker();
      return true;
    }
    if (selected !== null) {
      closeActions();
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
  function navigate(delta: -1 | 1) {
    const next = adjacentChapter(ref.book, ref.chapter, delta);
    if (next)
      router.replace({
        pathname: "/lesen/[book]",
        params: { book: next.book, chapter: next.chapter },
      });
  }
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
    >
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
                <Button kind="ghost" icon="back" onPress={position.beginning}>
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
              {!focus && (
                <T
                  variant="small"
                  style={{ fontSize: 10, color: t.muted, marginBottom: 15 }}
                >
                  Tippe auf einen Vers, um ihn zu markieren, zu merken oder eine
                  Notiz zu schreiben.
                </T>
              )}
              {!focus &&
                data.drafts
                  .filter(
                    (d) =>
                      d.type === "capture" &&
                      d.values.source.type === "verse" &&
                      d.values.source.ref.book === ref.book &&
                      d.values.source.ref.chapter === ref.chapter,
                  )
                  .map((d) => {
                    if (
                      d.type !== "capture" ||
                      d.values.source.type !== "verse"
                    )
                      return null;
                    const source = d.values.source;
                    return (
                      <Button
                        key={d.id}
                        kind="secondary"
                        icon="pen"
                        onPress={() => {
                          setSelected(source.ref.from!);
                          requestAnimationFrame(() =>
                            jumpToVerse(source.ref.from!),
                          );
                        }}
                      >
                        Notizentwurf zu {referenceLabel(source.ref)} fortsetzen
                      </Button>
                    );
                  })}
              {!focus && (
                <View style={{ alignItems: "flex-start", marginBottom: 12 }}>
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
                    {chooseVerse ? "Verswahl schließen" : "Versaktionen"}
                  </Button>
                </View>
              )}
              {chooseVerse && (
                <Card style={{ gap: 12, marginBottom: 20 }}>
                  <T variant="heading">Welchen Vers möchtest du auswählen?</T>
                  <T variant="small" style={{ color: t.muted }}>
                    Die kleinen Zahlen kennzeichnen Verse. Du kannst hier eine
                    Zahl wählen oder direkt auf den Bibeltext tippen.
                  </T>
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                  >
                    {verses.map((verse) => (
                      <Button
                        key={verse.n}
                        kind={selected === verse.n ? "primary" : "secondary"}
                        icon={null}
                        onPress={() => {
                          setSelected(verse.n);
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
                  selected={selected}
                  highlights={data.highlights}
                  bookmarks={data.bookmarks}
                  fontSize={data.settings.fontSize + 3}
                  lineHeight={data.settings.lineHeight}
                  layoutKey={`${width}:${fontScale}:${data.settings.fontSize}:${data.settings.lineHeight}:${mode}:${selected ?? ""}`}
                  onSelect={selectVerse}
                  onGeometryChange={position.layoutChanged}
                  onUnavailable={() => {
                    setNoteFocused(false);
                    setFlowUnavailable(true);
                    setFlow(false);
                  }}
                  renderActions={(verse) => (
                    <VerseActions
                      reference={ref}
                      onFocusChange={setNoteFocused}
                      verse={verse}
                      onClose={closeActions}
                    />
                  )}
                />
              ) : (
                <LegacyVerseText
                  reference={ref}
                  verses={verses}
                  selected={selected}
                  highlights={data.highlights}
                  bookmarks={data.bookmarks}
                  fontSize={data.settings.fontSize + 3}
                  lineHeight={data.settings.lineHeight}
                  position={position}
                  onSelect={selectVerse}
                  renderActions={(verse) => (
                    <VerseActions
                      reference={ref}
                      onFocusChange={setNoteFocused}
                      verse={verse}
                      onClose={closeActions}
                    />
                  )}
                />
              )}
            </View>
            {!focus && (
              <>
                <View
                  style={{ height: 1, backgroundColor: t.line, marginTop: 20 }}
                />
                <View style={{ alignItems: "center", gap: 15 }}>
                  <T
                    style={{
                      fontFamily: "Cormorant",
                      fontSize: 27,
                      textAlign: "center",
                    }}
                  >
                    {done
                      ? "Ein guter Moment zum Innehalten."
                      : passage
                        ? "Ein kleiner Abschnitt. Ein neuer Gedanke."
                        : "Du bist am Ende dieses Kapitels."}
                  </T>
                  <Button
                    disabled={done || busy}
                    icon={done ? "check" : "leaf"}
                    onPress={() => void complete()}
                  >
                    {done
                      ? "Als gelesen festgehalten"
                      : passage
                        ? "Abschnitt als gelesen bestätigen"
                        : "Kapitel als gelesen bestätigen"}
                  </Button>
                  {done && path ? (
                    <Button
                      kind="secondary"
                      onPress={() =>
                        router.dismissTo({
                          pathname: "/weg/[id]",
                          params: { id: path.id },
                        })
                      }
                    >
                      Weiter zum Verstehen
                    </Button>
                  ) : passage ? (
                    <Button
                      kind="ghost"
                      onPress={() =>
                        router.replace({
                          pathname: "/lesen/[book]",
                          params: {
                            book: ref.book,
                            chapter: ref.chapter,
                            mode,
                          },
                        })
                      }
                    >
                      Das ganze Kapitel lesen
                    </Button>
                  ) : (
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 12,
                        flexWrap: "wrap",
                        justifyContent: "center",
                      }}
                    >
                      <Button
                        kind="secondary"
                        icon="back"
                        disabled={!adjacentChapter(ref.book, ref.chapter, -1)}
                        onPress={() => navigate(-1)}
                      >
                        Vorheriges Kapitel
                      </Button>
                      <Button
                        kind="secondary"
                        disabled={!adjacentChapter(ref.book, ref.chapter, 1)}
                        onPress={() => navigate(1)}
                      >
                        Nächstes Kapitel
                      </Button>
                    </View>
                  )}
                  <T
                    style={{
                      fontSize: 10,
                      color: t.muted,
                      textAlign: "center",
                    }}
                  >
                    Lesefortschritt ist eine Erinnerung – keine Bewertung deines
                    Glaubens.
                  </T>
                </View>
                {done && !passage && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 20,
                      paddingVertical: 10,
                    }}
                  >
                    <SwordArt
                      book={ref.book}
                      size={70}
                      celebrate={ack === completionScope && read}
                      progress={
                        countBookRead(data, ref.book) / (book?.chapters ?? 1)
                      }
                    />
                    <View style={{ maxWidth: 230 }}>
                      <T variant="heading" style={{ fontSize: 24 }}>
                        {book?.sword}
                      </T>
                      <T style={{ fontSize: 11, color: t.muted }}>
                        {countBookRead(data, ref.book)} von {book?.chapters}{" "}
                        Kapiteln gelesen. Die Lichtlinie erinnert daran.
                      </T>
                      <Button
                        kind="ghost"
                        icon="sword"
                        onPress={() =>
                          router.push({
                            pathname: "/buch/[book]",
                            params: { book: ref.book },
                          })
                        }
                      >
                        Buchschwert ansehen
                      </Button>
                    </View>
                  </View>
                )}
                {!focus && mode === "deep" && context && (
                  <Card style={{ gap: 14 }}>
                    <T variant="heading">Ein Gedanke für dich</T>
                    <T style={{ fontSize: 13 }}>{context.question}</T>
                    <T style={{ fontSize: 11, color: t.muted }}>
                      Du musst jetzt keine Antwort haben.
                    </T>
                  </Card>
                )}
                {!path && related.length > 0 && (
                  <Card style={{ gap: 13 }}>
                    <T variant="heading">Gemeinsam weiterdenken</T>
                    <T style={{ fontSize: 12, color: t.muted }}>
                      Dieser Abschnitt begegnet dir auch im geführten Weg „
                      {related[0]?.title}“.
                    </T>
                    <Button
                      kind="secondary"
                      onPress={() =>
                        router.push({
                          pathname: "/weg/[id]",
                          params: { id: related[0]!.id },
                        })
                      }
                    >
                      Passenden Weg ansehen
                    </Button>
                  </Card>
                )}
              </>
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
