import { useEffect, useMemo, useState } from "react";
import { View, Pressable, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { Shell } from "../src/components/Shell";
import { T, Button, Card, Field, Tag, Progress } from "../src/components/ui";
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
export default function Bible() {
  const t = useTheme(),
    data = useApp((s) => s.data),
    { width } = useWindowDimensions(),
    [group, setGroup] = useState("NT"),
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
  const books = BOOKS.filter(
    (b) =>
      (group === "Alle" || b.testament === group) &&
      b.name.toLocaleLowerCase("de").includes(query.toLocaleLowerCase("de")),
  );
  return (
    <Shell>
      <Tag icon="book">Luther 1912 · vollständig offline enthalten</Tag>
      <T
        variant="title"
        accessibilityRole="header"
        style={{ fontSize: 44, marginTop: 14, marginBottom: 10 }}
      >
        Worte für dein Leben.
      </T>
      <T style={{ color: t.muted, fontSize: 13, marginBottom: 24 }}>
        66 Bücher. Viele Stimmen. Eine Einladung zum Entdecken.
      </T>
      <Card
        style={{
          backgroundColor: t.soft,
          borderWidth: 0,
          marginBottom: 24,
          gap: 12,
        }}
      >
        <T variant="label" style={{ color: t.muted, fontSize: 9 }}>
          HIER KANNST DU WEITERLESEN
        </T>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <View>
            <T variant="heading">{referenceLabel(data.reading)}</T>
            {data.readingPosition && <T variant="small" style={{color:t.muted}}>Zuletzt bei Vers {data.readingPosition.verse}</T>}
            <T style={{ fontSize: 11, color: t.muted }}>
              {data.readChapters.length} Kapitel bewusst als gelesen bestätigt
            </T>
          </View>
          <Button
            onPress={() =>
              router.push({
                pathname: "/lesen/[book]",
                params: {
                  book: data.reading.book,
                  chapter: data.reading.chapter,
                  from: data.reading.from,
                  to: data.reading.to,
                  mode: data.readingPosition?.mode,
                },
              })
            }
          >
            Weiterlesen
          </Button>
        </View>
      </Card>
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
      </View>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 15 }}>
        {[
          ["books", "Bücher finden"],
          ["text", "Bibeltext durchsuchen"],
        ].map(([id, label]) => (
          <Pressable
            key={id}
            accessibilityRole="button"
            accessibilityState={{ selected: mode === id }}
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
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginVertical: 20,
              flexWrap: "wrap",
            }}
          >
            {[
              ["NT", "Neues Testament"],
              ["AT", "Altes Testament"],
              ["Alle", "Alle Bücher"],
            ].map(([id, label]) => (
              <Pressable
                key={id}
                accessibilityRole="button"
                accessibilityState={{ selected: group === id }}
                onPress={() => setGroup(id!)}
                style={{
                  borderBottomWidth: 2,
                  borderColor: group === id ? t.gold : "transparent",
                  padding: 10,
                  minHeight: 44,
                }}
              >
                <T
                  style={{
                    fontSize: 12,
                    color: group === id ? t.text : t.muted,
                  }}
                >
                  {label}
                </T>
              </Pressable>
            ))}
          </View>
          <T style={{ fontSize: 12, color: t.muted, marginBottom: 22 }}>
            {group === "NT"
              ? "Das Neue Testament erzählt von Jesus und den Anfängen christlicher Gemeinden."
              : group === "AT"
                ? "Das Alte Testament umfasst Israels Geschichte, Gebete, Weisheit und prophetische Texte."
                : "Die Bibel ist eine Sammlung verschiedener Bücher – von Erzählungen bis zu Briefen."}
          </T>
          <View style={{ gap: 10 }}>
            {books.map((book) => (
              <Card key={book.code} style={{ padding: 0, overflow: "hidden" }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${book.name}, ${book.chapters} Kapitel`}
                  accessibilityState={{ expanded: expanded === book.code }}
                  onPress={() =>
                    setExpanded(expanded === book.code ? null : book.code)
                  }
                  style={{
                    padding: 18,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 16,
                    minHeight: 72,
                  }}
                >
                  <View
                    style={{
                      width: 38,
                      height: 42,
                      borderRadius: 9,
                      backgroundColor: t.soft,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name="book" color={t.primary} size={21} />
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <T variant="heading" style={{ fontSize: 24 }}>
                      {book.name}
                    </T>
                    <T style={{ fontSize: 10, color: t.muted }}>
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
                  <View style={{ padding: 20, paddingTop: 0, gap: 14 }}>
                    <T style={{ fontSize: 12, color: t.muted }}>
                      {book.description}
                    </T>
                    <T variant="label" style={{ fontSize: 9 }}>
                      Wähle ein Kapitel
                    </T>
                    <View
                      style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}
                    >
                      {Array.from(
                        { length: book.chapters },
                        (_, n) => n + 1,
                      ).map((n) => (
                        <Pressable
                          key={n}
                          accessibilityRole="button"
                          accessibilityLabel={`${book.name}, Kapitel ${n}${data.readChapters.includes(`${book.code}:${n}`) ? ", gelesen" : ""}`}
                          onPress={() =>
                            router.push({
                              pathname: "/lesen/[book]",
                              params: { book: book.code, chapter: n },
                            })
                          }
                          style={{
                            width: 46,
                            height: 46,
                            borderRadius: 9,
                            backgroundColor: data.readChapters.includes(
                              `${book.code}:${n}`,
                            )
                              ? t.primary
                              : t.soft,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <T
                            style={{
                              fontSize: 12,
                              color: data.readChapters.includes(
                                `${book.code}:${n}`,
                              )
                                ? t.onPrimary
                                : t.text,
                            }}
                          >
                            {n}
                          </T>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}
              </Card>
            ))}
          </View>
          {!books.length && (
            <Card>
              <T>
                Kein Buch gefunden. Probiere einen anderen Namen oder „Alle
                Bücher“.
              </T>
            </Card>
          )}
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
    </Shell>
  );
}
