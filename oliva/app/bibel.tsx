import { useEffect, useMemo, useState } from "react";
import { View, Pressable, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { Shell } from "../src/components/Shell";
import { T, Button, Card, Field } from "../src/components/ui";
import { Icon } from "../src/components/Icon";
import { useTheme } from "../src/design-system/theme";
import {
  BOOKS,
  referenceLabel,
  searchBible,
} from "../src/features/bible/repository";
import { useApp } from "../src/state/store";
import { countBookRead } from "../src/state/model";
import { StoryLibrary } from "../src/features/bible/StoryCard";
import { SpiritualWordCard } from "../src/features/bible/SpiritualWordCard";
import { BookChapterGrid } from "../src/features/bible/BookChapterGrid";
import { BibleScopeSelect } from "../src/features/bible/BibleScopeSelect";
import {
  normalizeBookSearch,
  type BibleScope,
} from "../src/features/bible/book-search";
export default function Bible() {
  const t = useTheme(),
    data = useApp((s) => s.data),
    { width } = useWindowDimensions(),
    [group, setGroup] = useState<BibleScope>("Alle"),
    [query, setQuery] = useState(""),
    [mode, setMode] = useState<"books" | "text">("books"),
    [expanded, setExpanded] = useState<string | null>(null),
    [debounced, setDebounced] = useState(""),
    [showStory, setShowStory] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(timer);
  }, [query]);
  const hits = useMemo(
    () => (mode === "text" ? searchBible(debounced) : []),
    [mode, debounced],
  );
  const normalizedQuery = normalizeBookSearch(query);
  const books = BOOKS.filter(
    (b) =>
      (group === "Alle" || b.testament === group) &&
      normalizeBookSearch(b.name).includes(normalizedQuery),
  );
  return (
    <Shell wide>
      <T
        variant="title"
        accessibilityRole="header"
        style={{ fontSize: 34, lineHeight: 40, marginBottom: 4 }}
      >
        Deine Bibel.
      </T>
      <T style={{ color: t.muted, fontSize: 12, lineHeight: 19, marginBottom: 14 }}>
        Luther 1912 · vollständig offline enthalten
      </T>
      <Card
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
      </Card>
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
              setMode(id as "books");
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
      <Field
        label={mode === "books" ? "Buch suchen" : "Wörter im Bibeltext suchen"}
        value={query}
        onChangeText={setQuery}
        placeholder={
          mode === "books"
            ? "Zum Beispiel Markus oder Psalmen"
            : "Zum Beispiel Liebe, Hoffnung oder Friede"
        }
      />
      {mode === "books" ? (
        <>
          <View style={{ marginVertical: 8 }}>
            <BibleScopeSelect value={group} onChange={setGroup} inline />
          </View>
          <View style={{ flexDirection: width >= 960 ? "row" : "column", gap: 24, alignItems: "flex-start" }}>
          <View style={{ width: width >= 960 ? undefined : "100%", flex: width >= 960 ? 1 : undefined, minWidth: 0 }}>
          <View testID="bible-book-list" style={{ width: "100%" }}>
            {books.map((book) => (
              <View key={book.code} style={{ borderBottomWidth: 1, borderBottomColor: t.line }}>
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
                      {book.chapters} Kapitel · {countBookRead(data, book.code)}{" "}
                      gelesen
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
                    <BookChapterGrid code={book.code} />
                    <T style={{ fontSize: 12, color: t.muted }}>
                      {book.description}
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
                    </View>
                  </View>
                )}
              </View>
            ))}
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
          <T style={{ fontSize: 11, lineHeight: 18, color: t.muted, marginTop: 8 }}>{data.readChapters.length} Kapitel bewusst als gelesen bestätigt</T>
          {width < 960 && <View style={{ width: "100%", marginTop: 20 }}><SpiritualWordCard /></View>}
          </View>
            {width >= 960 && <View style={{ width: 320 }}><SpiritualWordCard /></View>}
          </View>
        </>
      ) : (
        <View style={{ gap: 12, marginTop: 20 }}>
          {!debounced.trim() ? (
            <T style={{ color: t.muted }}>
              Gib ein oder mehrere Wörter ein. Gesucht wird im vollständigen
              Wortlaut der Lutherbibel 1912.
            </T>
          ) : (
            <>
              <T style={{ fontSize: 12, color: t.muted }}>
                {hits.length === 60
                  ? "Die ersten 60 Treffer"
                  : `${hits.length} Treffer`}{" "}
                · alle Suchwörter müssen im Vers vorkommen
              </T>
              {hits.map((hit) => (
                <Pressable
                  key={`${hit.book}:${hit.chapter}:${hit.verse}`}
                  accessibilityRole="button"
                  onPress={() =>
                    router.push({
                      pathname: "/lesen/[book]",
                      params: {
                        book: hit.book,
                        chapter: hit.chapter,
                        verse: hit.verse,
                      },
                    })
                  }
                >
                  <Card style={{ gap: 8 }}>
                    <T variant="label" style={{ color: t.gold, fontSize: 9 }}>
                      {referenceLabel({ ...hit, from: hit.verse })}
                    </T>
                    <T
                      style={{
                        fontFamily: "Cormorant",
                        fontSize: 24,
                        lineHeight: 31,
                      }}
                    >
                      {hit.text}
                    </T>
                  </Card>
                </Pressable>
              ))}
              {!hits.length && (
                <Card>
                  <T>Keine passenden Verse gefunden.</T>
                  <T style={{ fontSize: 12, color: t.muted, marginTop: 7 }}>
                    Diese historische Übersetzung verwendet ältere Wörter.
                    Versuche zum Beispiel „Friede“ statt „Frieden“.
                  </T>
                </Card>
              )}
            </>
          )}
        </View>
      )}
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
      </View>
    </Shell>
  );
}
