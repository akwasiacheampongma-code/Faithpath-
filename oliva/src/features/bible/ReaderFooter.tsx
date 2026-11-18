import { View } from "react-native";
import { router } from "expo-router";
import { Button, Card, T, Tag } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { ntChapterIndex } from "../quiz/index";
import {
  adjacentChapter,
  referenceLabel,
  type Reference,
} from "./repository";

export type ReaderFooterProps = {
  reference: Reference;
  done: boolean;
  busy: boolean;
  onComplete: () => void;
  pathId?: string;
  pathStep?: number;
  question?: string;
  relatedPath?: { id: string; title: string };
  mode: "read" | "deep";
};

/** Completion and onward navigation retain the reader's logical reference. */
export function ReaderFooter({
  reference,
  done,
  busy,
  onComplete,
  pathId,
  pathStep,
  question,
  relatedPath,
  mode,
}: ReaderFooterProps) {
  const t = useTheme(),
    passage = !!(reference.from || reference.to);

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
      <View style={{ height: 1, backgroundColor: t.line, marginTop: 12 }} />
      <View style={{ alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
        <T
          style={{
            fontFamily: "Cormorant",
            fontSize: 24,
            lineHeight: 29,
          }}
        >
          {passage ? "Am Ende der Lesung" : "Kapitel wechseln"}
        </T>
        {!passage && (
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <Button kind="secondary" icon="back" style={{ paddingHorizontal: 10, maxWidth: "100%" }}
              disabled={!adjacentChapter(reference.book, reference.chapter, -1)} onPress={() => navigate(-1)}>
              Vorheriges Kapitel
            </Button>
            <Button kind="secondary" style={{ paddingHorizontal: 10, maxWidth: "100%" }}
              disabled={!adjacentChapter(reference.book, reference.chapter, 1)} onPress={() => navigate(1)}>
              Nächstes Kapitel
            </Button>
          </View>
        )}
        <Button
          kind={passage ? "primary" : "ghost"}
          style={{ maxWidth: "100%", ...(passage ? {} : { paddingHorizontal: 0 }) }}
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
                params: { id: pathId, ...(pathStep !== undefined ? { step: pathStep } : {}) },
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
        ) : null}
        <T
          style={{
            fontSize: 10,
            color: t.muted,
          }}
        >
          Lesefortschritt ist eine Erinnerung – keine Bewertung deines
          Glaubens.
        </T>
      </View>
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
