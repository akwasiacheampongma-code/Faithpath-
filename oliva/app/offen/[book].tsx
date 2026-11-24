import { useEffect, useMemo, useRef, useState, type ComponentRef } from "react";
import { ScrollView, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import { Shell } from "../../src/components/Shell";
import { Button, IconButton, T } from "../../src/components/ui";
import { useTheme } from "../../src/design-system/theme";
import { useApp } from "../../src/state/store";
import { editionChapterRoute, OTB_BOOKS, OTB_CREDIT, OTB_LICENCE, otbBook } from "../../src/features/bible/open-bible";
import { adjacentOtbChapter, otbChapter } from "../../src/features/bible/open-bible-content";
import { ChapterPicker } from "../../src/features/bible/ChapterPicker";
import { ReaderPreferences } from "../../src/features/bible/ReaderPreferences";
import { useReaderFont } from "../../src/features/bible/reader-font";
import { referenceLabel, type Reference } from "../../src/features/bible/repository";
import FlowText from "../../src/features/bible/flow/FlowText";
import { flowParagraphs } from "../../src/features/bible/flow/model";
import { LegacyVerseText } from "../../src/features/bible/flow/LegacyVerseText";
import type { FlowTextHandle } from "../../src/features/bible/flow/types";

const openBookList = () => router.replace({ pathname: "/bibel", params: { ausgabe: "otb" } });
const readEdition = (ref: Reference) => router.replace(editionChapterRoute("otb", ref));

export default function OpenBibleChapter() {
  const { book = "", chapter = "1", verse } = useLocalSearchParams<{ book: string; chapter?: string; verse?: string }>();
  const reference = { book, chapter: Number(chapter) };
  const content = otbChapter(book, reference.chapter);
  if (!content) return <Shell reader>
    <T variant="heading">Diese Stelle gibt es in der OTB nicht.</T>
    <Button kind="secondary" onPress={openBookList}>Zur OTB-Buchauswahl</Button>
  </Shell>;
  return <OpenBiblePage key={book + ":" + chapter + ":" + (verse ?? "")} reference={reference} content={content} requestedVerse={Number(verse)} />;
}

function OpenBiblePage({ reference, content, requestedVerse }: {
  reference: Reference;
  content: NonNullable<ReturnType<typeof otbChapter>>;
  requestedVerse: number;
}) {
  const theme = useTheme();
  const { fontSize, lineHeight } = useApp((state) => state.data.settings);
  const font = useReaderFont();
  const [flow, setFlow] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [prefs, setPrefs] = useState(false);
  const [picker, setPicker] = useState(false);
  const [notes, setNotes] = useState(false);
  const initialVerse = content.verses.some((verse) => verse.n === requestedVerse) ? requestedVerse : null;
  const [selected, setSelected] = useState<number[]>(() => initialVerse === null ? [] : [initialVerse]);
  const [status, setStatus] = useState("");
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const list = useRef<ComponentRef<typeof View>>(null);
  const renderer = useRef<FlowTextHandle>(null);
  const listTop = useRef(0);
  const scrolled = useRef(false);
  const paragraphs = useMemo(() => flowParagraphs(reference, content.verses), [reference, content]);
  const name = otbBook(reference.book)!.name;
  const next = adjacentOtbChapter(reference.book, reference.chapter, 1);
  const previous = adjacentOtbChapter(reference.book, reference.chapter, -1);
  const onSelect = (verse: number) => { setStatus(""); setSelected((current) => current.includes(verse) ? current.filter((number) => number !== verse)
    : [...current, verse].sort((a, b) => a - b)); };

  async function jumpToResult() {
    if (initialVerse === null || scrolled.current || !list.current || !renderer.current) return;
    const frames = await renderer.current.measure(list.current);
    const frame = frames?.find((item) => item.verse === initialVerse);
    if (!frame || scrolled.current) return;
    scroll.current?.scrollTo({ y: listTop.current + frame.y, animated: false });
    scrolled.current = true;
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => void jumpToResult());
    return () => cancelAnimationFrame(frame);
  }, [initialVerse, flow, unavailable]);

  async function copy() {
    const includes = new Set(selected);
    const label = name + " " + reference.chapter + ", Verse " + selected.join(", ");
    const quote = content.verses.filter((verse) => includes.has(verse.n)).map((verse) => verse.n + " " + verse.text).join("\n");
    try {
      const copied = await Clipboard.setStringAsync(label + "\n" + quote + "\n" + OTB_CREDIT + "\n" + OTB_LICENCE);
      setStatus(copied ? "Mit Quellenangabe kopiert." : "Kopieren ist hier gerade nicht möglich.");
    } catch {
      setStatus("Kopieren ist hier gerade nicht möglich.");
    }
  }

  return <Shell reader scrollRef={scroll} readerActions={selected.length > 0 && !picker && !prefs ?
    <View style={{ padding: 9, flexDirection: "row", flexWrap: "wrap", gap: 6, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.line, borderRadius: 14 }}>
      <Button kind="ghost" icon={null} onPress={() => { setSelected([]); setStatus(""); }}>Auswahl aufheben</Button>
      <Button kind="secondary" icon={null} onPress={() => void copy()}>Kopieren</Button>
      {!!status && <T variant="small" accessibilityLiveRegion="polite">{status}</T>}
    </View> : undefined}>
    <View style={{ maxWidth: 660, width: "100%", alignSelf: "center", gap: 12 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <IconButton name="back" label="Zurück" onPress={() => router.canGoBack() ? router.back() : openBookList()} />
        <Button kind="ghost" icon={null} onPress={() => { setPicker(!picker); setPrefs(false); }}>
          {referenceLabel(reference)} ⌄
        </Button>
        <IconButton name="settings" label="Leseeinstellungen" selected={prefs} onPress={() => { setPrefs(!prefs); setPicker(false); }} />
      </View>
      {picker && <ChapterPicker books={OTB_BOOKS} currentBook={reference.book} currentChapter={reference.chapter}
        onClose={() => setPicker(false)} onChoose={(book, chapter) => {
          setPicker(false);
          if (book !== reference.book || chapter !== reference.chapter) readEdition({ book, chapter });
        }} />}
      {prefs && <ReaderPreferences flow={flow} unavailable={unavailable} onClose={() => setPrefs(false)}
        editionSwitch={{
          label: "Zu Luther 1912 wechseln",
          onPress: () => router.replace(editionChapterRoute("luther", reference)),
        }}
        onFlowChange={(nextLayout) => { setFlow(nextLayout); setUnavailable(false); }} />}
      <T variant="title" accessibilityRole="header">{referenceLabel(reference)}</T>
      <T variant="small" style={{ color: theme.muted }}>{OTB_CREDIT}</T>
      <View ref={list} onLayout={(event) => { listTop.current = event.nativeEvent.layout.y; void jumpToResult(); }}>
        {flow && !unavailable ?
          <FlowText ref={renderer} paragraphs={paragraphs} selected={null} selectedVerses={selected}
            highlights={{}} bookmarks={[]} fontSize={fontSize + 3} lineHeight={lineHeight} fontFamily={font}
            layoutKey={font + ":" + fontSize + ":" + lineHeight} onSelect={onSelect} onGeometryChange={() => void jumpToResult()}
            onUnavailable={() => setUnavailable(true)} renderActions={() => null} /> :
          <LegacyVerseText ref={renderer} reference={reference} verses={content.verses} selected={null} selectedVerses={selected}
            highlights={{}} bookmarks={[]} fontSize={fontSize + 3} lineHeight={lineHeight} fontFamily={font}
            onSelect={onSelect} renderActions={() => null} />}
      </View>
      {!!content.notes.length && <>
        <Button kind="ghost" icon={null} onPress={() => setNotes(!notes)}>{notes ? "Textanmerkungen schließen" : "Textanmerkungen der OTB"}</Button>
        {notes && content.notes.map((note, index) => <T variant="small" key={index}>{note.after > 0 ? `Nach Vers ${note.after} · ` : ""}{note.text}</T>)}
      </>}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "space-between" }}>
        {previous && <Button kind="ghost" icon="back" onPress={() => readEdition(previous)}>Vorheriges Kapitel</Button>}
        {next && <Button kind="secondary" onPress={() => readEdition(next)}>Nächstes Kapitel</Button>}
      </View>
      <Button kind="ghost" icon="info" onPress={() => router.push({ pathname: "/quellen", params: { ausgabe: "otb" } })}>Quelle, Lizenz und Bedingungen</Button>
    </View>
  </Shell>;
}
