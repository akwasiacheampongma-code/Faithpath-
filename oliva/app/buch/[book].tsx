import { View, Pressable, useWindowDimensions } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Shell } from "../../src/components/Shell";
import { Button, Card, Progress, T, Tag } from "../../src/components/ui";
import { useTheme } from "../../src/design-system/theme";
import { useApp } from "../../src/state/store";
import { bookJourney } from "../../src/features/swords/model";
import { BookSwordArtwork } from "../../src/features/swords/BookSwordArtwork";
import type { Reference } from "../../src/features/bible/repository";

/** A read-only view of the Bible catalog and confirmed chapter history. */
export default function BookIdentity() {
  const { book: code } = useLocalSearchParams<{ book: string }>(),
    data = useApp((s) => s.data),
    t = useTheme(),
    { width } = useWindowDimensions();
  const journey = bookJourney(data, code ?? ""),
    columns = width >= 1100;
  function read(ref: Reference) {
    router.push({ pathname: "/lesen/[book]", params: { ...ref } });
  }
  const toBible = () => router.dismissTo("/bibel");
  const back = () => (router.canGoBack() ? router.back() : toBible());
  if (!journey)
    return (
      <Shell>
        <Card style={{ gap: 18 }}>
          <T variant="title" accessibilityRole="header">
            Dieses Buch gibt es hier nicht.
          </T>
          <T>In der Bibelübersicht findest du alle 66 Bücher.</T>
          <Button icon="back" onPress={toBible}>
            Zur Bibel
          </Button>
        </Card>
      </Shell>
    );
  const { identity, readCount, progress, readChapters, nextChapter } = journey,
    { book } = identity;
  return (
    <Shell>
      <View style={{ alignItems: "flex-start", marginBottom: 20 }}>
        <Button icon="back" kind="ghost" onPress={back}>
          Zurück
        </Button>
      </View>
      <Tag icon="book">Deine Bibelreise</Tag>
      <T
        variant="title"
        accessibilityRole="header"
        style={{ fontSize: 44, marginTop: 14, marginBottom: 10 }}
      >
        {book.name}
      </T>
      <T style={{ color: t.muted, maxWidth: 620, marginBottom: 28 }}>
        {book.description}
      </T>
      <View
        style={{
          flexDirection: columns ? "row" : "column",
          gap: 24,
          alignItems: "stretch",
        }}
      >
        <Card
          style={{
            width: columns ? 330 : "100%",
            backgroundColor: t.soft,
            borderWidth: 0,
            alignItems: "center",
            paddingVertical: 22,
            gap: 12,
          }}
        >
          <T
            variant="heading"
            style={{ fontSize: 27, lineHeight: 31, textAlign: "center" }}
          >
            {identity.title}
          </T>
          <T
            style={{ fontSize: 13, color: t.muted }}
          >{`${readCount} von ${book.chapters} Kapiteln gelesen`}</T>
          <BookSwordArtwork
            book={book.code}
            progress={progress}
            size={Math.min(width < 500 ? 220 : 256, Math.max(180, width - 100))}
          />
          <T style={{ fontSize: 11, color: t.muted, textAlign: "center" }}>
            Künstlerisches Symbol · {book.name}
          </T>
        </Card>
        <View style={{ flex: 1, gap: 22, justifyContent: "center" }}>
          <View style={{ gap: 12 }}>
            <T variant="heading">Das Bild verstehen</T>
            <T style={{ color: t.muted }}>{identity.explanation}</T>
          </View>
          <View style={{ gap: 10 }}>
            <Progress
              value={progress}
              label={`Lesefortschritt in ${book.name}`}
            />
            <T style={{ fontSize: 12, color: t.muted, lineHeight: 21 }}>
              Die Lichtspur erinnert an Kapitel, die du selbst als gelesen
              bestätigt hast. Ein kurzer Abschnitt zählt dabei nicht als ganzes
              Kapitel.
            </T>
          </View>
          <View style={{ alignItems: "flex-start", gap: 7 }}>
            <Button
              icon="book"
              onPress={() => read({ book: book.code, chapter: nextChapter })}
            >{`${book.name} lesen`}</Button>
            <T
              style={{ fontSize: 11, color: t.muted }}
            >{`Öffnet Kapitel ${nextChapter}. In deinem Tempo.`}</T>
          </View>
          <T style={{ fontSize: 12, color: t.muted, lineHeight: 21 }}>
            Die Bildidee knüpft an Epheser 6,17 an: Gottes Wort als
            Orientierung. Alle Buchschwerter sind von Anfang an zugänglich. Dein
            Lesefortschritt bewertet weder deinen Glauben noch deinen Wert.
          </T>
          <View style={{ alignItems: "flex-start" }}>
            <Button
              kind="ghost"
              icon="book"
              onPress={() =>
                read({ book: "EPH", chapter: 6, from: 17, to: 17 })
              }
            >
              Epheser 6,17 lesen
            </Button>
          </View>
        </View>
      </View>
      {identity.references.length > 0 && (
        <Card style={{ marginTop: 24, gap: 12 }}>
          <T variant="heading">Die Bilder in den Worten entdecken</T>
          <T style={{ fontSize: 13, color: t.muted }}>
            Die Einordnung oben ist eine künstlerische Deutung. Hier kannst du
            die zugehörigen Bibelstellen selbst lesen.
          </T>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {identity.references.map((source) => (
              <Button
                key={source.label}
                icon="book"
                kind="secondary"
                onPress={() => read(source.ref)}
              >
                {source.label}
              </Button>
            ))}
          </View>
        </Card>
      )}
      <Card style={{ marginTop: 24, gap: 15 }}>
        <T variant="heading">Deine Kapitel</T>
        <T style={{ fontSize: 12, color: t.muted }}>
          Wähle einen Anfang oder kehre zu einem Kapitel zurück. Durch das
          Öffnen wird nichts als gelesen markiert.
        </T>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {Array.from({ length: book.chapters }, (_, i) => i + 1).map(
            (chapter) => {
              const done = readChapters.includes(chapter);
              return (
                <Pressable
                  key={chapter}
                  accessibilityRole="button"
                  accessibilityLabel={`${book.name}, Kapitel ${chapter}${done ? ", gelesen" : ""}`}
                  onPress={() => read({ book: book.code, chapter })}
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: done ? t.primary : t.soft,
                  }}
                >
                  <T
                    style={{ fontSize: 13, color: done ? t.onPrimary : t.text }}
                  >
                    {chapter}
                  </T>
                </Pressable>
              );
            },
          )}
        </View>
      </Card>
    </Shell>
  );
}
