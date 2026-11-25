import { useCallback, useRef, useState, type ComponentRef } from "react";
import { View, Pressable, ScrollView, useWindowDimensions } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Shell } from "../src/components/Shell";
import { T, Button, Card, Field } from "../src/components/ui";
import { Icon } from "../src/components/Icon";
import { useTheme } from "../src/design-system/theme";
import {
  BOOKS,
  referenceLabel,
  type SearchHit,
} from "../src/features/bible/repository";
import { OTB_BOOKS, OTB_NAME, OTB_CREDIT } from "../src/features/bible/open-bible";
import { bookGroup } from "../src/features/bible/book-groups";
import { useApp } from "../src/state/store";
import { countBookRead } from "../src/state/model";
import { StoryLibrary } from "../src/features/bible/StoryCard";
import { SpiritualWordCard } from "../src/features/bible/SpiritualWordCard";
import { BookChapterGrid } from "../src/features/bible/BookChapterGrid";
import { BibleTextSearch } from "../src/features/bible/BibleTextSearch";
import { BibleScopeSelect } from "../src/features/bible/BibleScopeSelect";
import {
  normalizeBookSearch,
  type BibleScope,
} from "../src/features/bible/book-search";
export default function Bible() {
  const otb = useLocalSearchParams<{ ausgabe?: string }>().ausgabe === "otb";
  const t = useTheme(),
    data = useApp((s) => s.data),
    { width } = useWindowDimensions(),
    [group, setGroup] = useState<BibleScope>("Alle"),
    [query, setQuery] = useState(""),
    [mode, setMode] = useState<"books" | "text">("books"),
    [expanded, setExpanded] = useState<string | null>(null),
    [showStory, setShowStory] = useState(false);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const offset = useRef(0);
  const returnOffset = useRef<number | null>(null);
  useFocusEffect(useCallback(() => {
    const saved = returnOffset.current;
    if (saved === null) return;
    const frame = requestAnimationFrame(() => {
      scroll.current?.scrollTo({ y: saved, animated: false });
      returnOffset.current = null;
    });
    return () => cancelAnimationFrame(frame);
  }, []));
  const openHit = (hit: SearchHit) => {
    // React Native Web returns the DOM scroll node, while native returns its handle.
    const scrollTop = (scroll.current?.getScrollableNode() as unknown as { scrollTop?: number } | undefined)?.scrollTop;
    returnOffset.current = typeof scrollTop === "number" ? scrollTop : offset.current;
    router.push({
      pathname: otb ? "/offen/[book]" : "/lesen/[book]",
      params: { book: hit.book, chapter: hit.chapter, verse: hit.verse },
    });
  };
  const changeEdition = (next: boolean) => {
    if (otb === next) return;
    setExpanded(null);
    setQuery("");
    router.setParams({ ausgabe: next ? "otb" : "luther" });
  };
  const normalizedQuery = normalizeBookSearch(query);
  const books = (otb ? OTB_BOOKS : BOOKS).filter(
    (b) =>
      (group === "Alle" || b.testament === group) &&
      normalizeBookSearch(b.name).includes(normalizedQuery),
  );
  return (
    <Shell wide scrollRef={scroll} onScroll={(event) => { offset.current = event.nativeEvent.contentOffset.y; }}>
      <View style={{ width: "100%", ...(mode === "text" ? { maxWidth: 690, alignSelf: "center" } : {}) }}>
      <T
        variant="title"
        accessibilityRole="header"
        style={{ fontSize: 34, lineHeight: 40, marginBottom: 4 }}
      >
        {mode === "text" ? "Im Bibeltext suchen" : "Deine Bibel."}
      </T>
      {mode === "books" && <T style={{ color: t.muted, fontSize: 12, lineHeight: 19, marginBottom: 14 }}>
        {otb ? OTB_CREDIT : "Luther 1912 · vollständig offline enthalten"}
      </T>}
      <View role="group" accessibilityLabel="Bibelübersetzung" style={{ flexDirection: "row", gap: 7, flexWrap: "wrap", marginTop: mode === "text" ? 8 : 0, marginBottom: 12 }}>
        <Button icon={null} style={{ paddingHorizontal: 11 }} selected={!otb} kind={!otb ? "primary" : "secondary"} onPress={() => changeEdition(false)}>Luther 1912</Button>
        <Button icon={null} style={{ paddingHorizontal: 11 }} selected={otb} kind={otb ? "primary" : "secondary"} onPress={() => changeEdition(true)}>{OTB_NAME}</Button>
      </View>
      {mode === "books" && (otb ? <View style={{ gap: 4, alignItems: "flex-start", marginBottom: 10 }}>
        <T variant="small" style={{ color: t.muted }}>Deutsch · eigene Kapitel- und Verszählung. Wähle ein Buch zum Lesen.</T>
        <Button kind="ghost" icon="info" onPress={() => router.push({ pathname: "/quellen", params: { ausgabe: "otb" } })}>Quelle, Lizenz und Bedingungen</Button>
      </View> : <Card
        style={{
          backgroundColor: t.soft,
          borderWidth: 0,
          marginBottom: 16,
          padding: 14,
        }}
      >
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          <View style={{ flexGrow: 1, flexBasis: 120, minWidth: 0 }}>
            <T variant="heading" style={{ fontSize: 24, lineHeight: 28 }}>{referenceLabel(data.reading)}</T>
            {data.readingPosition && <T variant="small" style={{ color: t.muted, fontSize: 11, lineHeight: 18 }}>Zuletzt bei Vers {data.readingPosition.verse}</T>}
          </View>
          <Button icon={null} style={{ paddingHorizontal: 12, maxWidth: "100%" }} onPress={() => router.push({
            pathname: "/lesen/[book]", params: {
              book: data.reading.book, chapter: data.reading.chapter, from: data.reading.from,
              to: data.reading.to, mode: data.readingPosition?.mode,
            },
          })}>Weiterlesen</Button>
        </View>
      </Card>)}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
        {[
          ["books", "Bücher", "Bücher finden"],
          ["text", "Bibeltext", "Bibeltext durchsuchen"],
        ].map(([id, label, accessibleLabel]) => (
          <Pressable
            key={id}
            accessibilityRole="button"
            accessibilityLabel={accessibleLabel}
            accessibilityState={{ selected: mode === id }}
            aria-pressed={mode === id}
            onPress={() => {
              setMode(id === "text" ? "text" : "books");
              setQuery("");
            }}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 11,
              minHeight: 44,
              borderRadius: 11,
              backgroundColor: mode === id ? t.primary : t.soft,
            }}
          >
            <T
              style={{
                fontSize: 12,
                color: mode === id ? t.onPrimary : t.text,
              }}
            >
              {label}
            </T>
          </Pressable>
        ))}
      </View>
      {mode === "books" ? (
        <>
          <Field label="Buch suchen" value={query} onChangeText={setQuery} placeholder="Zum Beispiel Markus oder Psalmen" />
          <View style={{ marginVertical: 8 }}>
            <BibleScopeSelect value={group} onChange={setGroup} inline />
          </View>
          <View style={{ flexDirection: width >= 960 ? "row" : "column", gap: 24, alignItems: "flex-start" }}>
          <View style={{ width: width >= 960 ? undefined : "100%", flex: width >= 960 ? 1 : undefined, minWidth: 0 }}>
          <View testID="bible-book-list" style={{ width: "100%" }}>
            {books.map((book) => {
              const read = otb ? 0 : countBookRead(data, book.code);
              return <View key={book.code} style={{ borderBottomWidth: 1, borderBottomColor: t.line }}>
                {!normalizedQuery && bookGroup[book.code] && <T variant="label" accessibilityRole="header" aria-level={2}
                  style={{ marginTop: 15, marginBottom: 3, color: t.muted }}>{bookGroup[book.code]}</T>}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${book.name}, ${book.chapters} Kapitel`}
                  accessibilityState={{ expanded: expanded === book.code }}
                  aria-expanded={expanded === book.code}
                  onPress={() =>
                    setExpanded(expanded === book.code ? null : book.code)
                  }
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 4,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    minHeight: 64,
                  }}
                >
                  <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                    <T variant="heading" style={{ fontSize: 23, lineHeight: 28 }}>
                      {book.name}
                    </T>
                    <T style={{ fontSize: 11, lineHeight: 18, color: t.muted }}>
                      {book.chapters} Kapitel{read > 0 ? " · " + read + " gelesen" : ""}
                    </T>
                  </View>
                  <Icon
                    name={expanded === book.code ? "close" : "chevron"}
                    color={t.muted}
                    size={17}
                  />
                </Pressable>
                {expanded === book.code && (
                  <View style={{ paddingHorizontal: 4, paddingBottom: 18, gap: 14 }}>
                    <BookChapterGrid code={book.code} otb={otb} />
                    {!otb && <><T style={{ fontSize: 12, color: t.muted }}>
                      {BOOKS.find((entry) => entry.code === book.code)?.description}
                    </T>
                    <View style={{ alignItems: "flex-start" }}>
                      <Button
                        kind="ghost"
                        icon="book"
                        onPress={() =>
                          router.push({
                            pathname: "/buch/[book]",
                            params: { book: book.code },
                          })
                        }
                      >
                        Über dieses Buch
                      </Button>
                    </View></>}
                  </View>
                )}
              </View>;
            })}
          </View>
          {!books.length && (
            <Card>
              <T>
                Kein Buch gefunden. Probiere einen anderen Namen oder wähle
                „Gesamte Bibel“ im Bibelbereich.
              </T>
            </Card>
          )}
          <T style={{ fontSize: 12, lineHeight: 19, color: t.muted, marginTop: 16 }}>
            {group === "NT"
              ? "Das Neue Testament erzählt von Jesus und den Anfängen christlicher Gemeinden."
              : group === "AT"
                ? "Das Alte Testament umfasst Israels Geschichte, Gebete, Weisheit und prophetische Texte."
                : "Die Bibel ist eine Sammlung verschiedener Bücher – von Erzählungen bis zu Briefen."}
          </T>
          {!otb && data.readChapters.length > 0 && <T style={{ fontSize: 11, lineHeight: 18, color: t.muted, marginTop: 8 }}>{data.readChapters.length} Kapitel bewusst als gelesen bestätigt</T>}
          {width < 960 && <View style={{ width: "100%", marginTop: 20 }}><SpiritualWordCard /></View>}
          </View>
            {width >= 960 && <View style={{ width: 320 }}><SpiritualWordCard /></View>}
          </View>
        </>
      ) : <BibleTextSearch otb={otb} openHit={openHit} />}
      {mode === "books" && (
      <View style={{ marginTop: 32, borderTopWidth: 1, borderTopColor: t.line, paddingTop: 24 }}>
      <View style={{ marginBottom: 22, gap: 9 }}>
        <Button kind="secondary" icon="book" onPress={() => router.push("/geschichten")}>Geschichten und Abschnitte entdecken</Button>
        <T variant="small" style={{ color: t.muted }}>436 Originaleinheiten · lesen, verstehen und eigene Gedanken festhalten.</T>
      </View>
      <View style={{ gap: 14, marginBottom: 20, alignItems: "flex-start" }}>
        <Button
          kind="secondary"
          icon="book"
          onPress={() => setShowStory(!showStory)}
        >
          {showStory
            ? "Geschichtenvorschlag schließen"
            : "Eine Geschichte entdecken"}
        </Button>
        {showStory && <StoryLibrary />}
        <Button
          kind="ghost"
          icon="book"
          onPress={() => router.push("/verstehen")}
        >
          Fragen zum Neuen Testament
        </Button>
      </View>
      </View>)}
      </View>
    </Shell>
  );
}
