import { View } from "react-native";
import { router } from "expo-router";
import { Button, Card, T, Tag } from "../../components/ui";
import { SwordArt } from "../../components/Artwork";
import { useTheme } from "../../design-system/theme";
import { countBookRead } from "../../state/model";
import { useApp } from "../../state/store";
import { ntChapterIndex } from "../quiz/index";
import {
  adjacentChapter,
  bookByCode,
  referenceLabel,
  type Reference,
} from "./repository";

export type ReaderFooterProps = {
  reference: Reference;
  done: boolean;
  busy: boolean;
  onComplete: () => void;
  pathId?: string;
  question?: string;
  relatedPath?: { id: string; title: string };
  mode: "read" | "deep";
  celebrate: boolean;
};

/** Completion and onward navigation retain the reader's logical reference. */
export function ReaderFooter({
  reference,
  done,
  busy,
  onComplete,
  pathId,
  question,
  relatedPath,
  mode,
  celebrate,
}: ReaderFooterProps) {
  const t = useTheme(),
    data = useApp((state) => state.data),
    book = bookByCode(reference.book),
    passage = !!(reference.from || reference.to),
    readCount = countBookRead(data, reference.book);

  function navigate(delta: -1 | 1) {
    const next = adjacentChapter(reference.book, reference.chapter, delta);
    if (next)
      router.replace({
        pathname: "/lesen/[book]",
        params: { book: next.book, chapter: next.chapter, mode },
      });
  }

  return (
    <>
      <View style={{ height: 1, backgroundColor: t.line, marginTop: 20 }} />
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
          onPress={onComplete}
        >
          {done
            ? "Als gelesen festgehalten"
            : passage
              ? "Abschnitt als gelesen bestätigen"
              : "Kapitel als gelesen bestätigen"}
        </Button>
        {done && pathId ? (
          <Button
            kind="secondary"
            onPress={() =>
              router.dismissTo({
                pathname: "/weg/[id]",
                params: { id: pathId },
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
                  book: reference.book,
                  chapter: reference.chapter,
                  mode,
                },
              })
            }
          >
            Ganzes Kapitel als Lesebereich öffnen
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
              disabled={!adjacentChapter(reference.book, reference.chapter, -1)}
              onPress={() => navigate(-1)}
            >
              Vorheriges Kapitel
            </Button>
            <Button
              kind="secondary"
              disabled={!adjacentChapter(reference.book, reference.chapter, 1)}
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
            book={reference.book}
            size={70}
            celebrate={celebrate}
            progress={readCount / (book?.chapters ?? 1)}
          />
          <View style={{ maxWidth: 230 }}>
            <T variant="heading" style={{ fontSize: 24 }}>
              {book?.sword}
            </T>
            <T style={{ fontSize: 11, color: t.muted }}>
              {readCount} von {book?.chapters}{" "}
              Kapiteln gelesen. Die Lichtlinie erinnert daran.
            </T>
            <Button
              kind="ghost"
              icon="sword"
              onPress={() =>
                router.push({
                  pathname: "/buch/[book]",
                  params: { book: reference.book },
                })
              }
            >
              Buchschwert ansehen
            </Button>
          </View>
        </View>
      )}
      {mode === "deep" && question && (
        <Card style={{ gap: 14 }}>
          <T variant="heading">Ein Gedanke für dich</T>
          <T style={{ fontSize: 13 }}>{question}</T>
          <T style={{ fontSize: 11, color: t.muted }}>
            Du musst jetzt keine Antwort haben.
          </T>
        </Card>
      )}
      {ntChapterIndex(reference.book, reference.chapter) && (
        <Card style={{ gap: 13 }}>
          <Tag icon="book">In Ruhe weiterdenken</Tag>
          <T variant="heading">Was ist dir im Text begegnet?</T>
          <T style={{ fontSize: 13, color: t.muted }}>
            Fünf Fragen zum ganzen Kapitel helfen dir beim Verstehen.
            Du kannst jederzeit nachlesen oder pausieren.
          </T>
          <Button
            kind="secondary"
            onPress={() =>
              router.push({
                pathname: "/verstehen/[book]",
                params: { book: reference.book, chapter: reference.chapter },
              })
            }
          >
            Fragen zu{" "}
            {referenceLabel({ book: reference.book, chapter: reference.chapter })}{" "}
            entdecken
          </Button>
        </Card>
      )}
      {!pathId && relatedPath && (
        <Card style={{ gap: 13 }}>
          <T variant="heading">Gemeinsam weiterdenken</T>
          <T style={{ fontSize: 12, color: t.muted }}>
            Dieser Abschnitt begegnet dir auch im geführten Weg „
            {relatedPath.title}“.
          </T>
          <Button
            kind="secondary"
            onPress={() =>
              router.push({
                pathname: "/weg/[id]",
                params: { id: relatedPath.id },
              })
            }
          >
            Passenden Weg ansehen
          </Button>
        </Card>
      )}
    </>
  );
}
