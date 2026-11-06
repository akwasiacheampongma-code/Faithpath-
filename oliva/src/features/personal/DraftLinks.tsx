import { router, type Href } from "expo-router";
import { View } from "react-native";
import { useState } from "react";
import { useApp } from "../../state/store";
import { T, Card, Button, Tag } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { referenceLabel } from "../bible/repository";
import type { Draft } from "./schema";
import { useVolatileDrafts, volatileExport } from "./volatile-drafts";
import { exportText } from "../../services/storage";
export function draftDestination(draft: Draft): { label: string; href: Href } {
  switch (draft.type) {
    case "capture": {
      const s = draft.values.source;
      switch (s.type) {
        case "daily":
          return { label: "Deine Tagesreflexion", href: "/" };
        case "experience":
          return { label: "Deine Erfahrung im Garten", href: "/garten" };
        case "verse":
          return {
            label: `Notiz zu ${referenceLabel(s.ref)}`,
            href: {
              pathname: "/lesen/[book]",
              params: {
                book: s.ref.book,
                chapter: s.ref.chapter,
                verse: s.ref.from,
              },
            },
          };
        case "guided":
          return {
            label: `Reflexion: ${s.snapshot.title}`,
            href: {
              pathname: "/weg/[id]",
              params: { id: s.pathId, step: s.step },
            },
          };
      }
    }
    case "journal":
      return { label: "Deine Journalworte", href: "/sammlung" };
    case "goal":
      return {
        label: draft.values.title || "Dein Vorhaben",
        href: draft.values.targetId
          ? {
              pathname: "/vorhaben/[id]",
              params: { id: draft.values.targetId },
            }
          : "/vorhaben?start=1",
      };
    case "step":
    case "review":
      return {
        label:
          draft.type === "step" ? "Dein eigener Schritt" : "Dein Rückblick",
        href: {
          pathname: "/vorhaben/[id]",
          params: { id: draft.values.goalId },
        },
      };
  }
}
export function DraftLinks({ onJournal }: { onJournal?: () => void }) {
  const [message, setMessage] = useState("");
  const durable = useApp((s) => s.data.drafts),
    held = useVolatileDrafts((s) => s.items),
    drafts = [
      ...durable.map((d) => held[d.key]?.draft ?? d),
      ...Object.values(held)
        .filter((x) => !durable.some((d) => d.key === x.draft.key))
        .map((x) => x.draft),
    ],
    t = useTheme();
  return (
    <View style={{ gap: 14 }}>
      <T variant="heading">Was du begonnen hast.</T>
      <T variant="small" style={{ color: t.muted }}>
        Entwürfe sind privat auf diesem Gerät. Sie schließen keinen Lernschritt
        ab und bestätigen keine Erfahrung.
      </T>
      {Object.keys(held).length > 0 && (
        <>
          <T variant="small" style={{ color: t.danger }}>
            Einige Worte sind nur in dieser Sitzung erhalten. Schließe die App
            erst, wenn du sie erfolgreich gesichert, exportiert oder kopiert
            hast.
          </T>
          <Button
            kind="secondary"
            icon="download"
            onPress={() =>
              void exportText(
                JSON.stringify(volatileExport(), null, 2),
                `oliva-ungesicherte-entwuerfe-${Date.now()}.json`,
              )
                .then(() =>
                  setMessage("Ungesicherte Entwürfe zum Speichern übergeben."),
                )
                .catch((e) => setMessage((e as Error).message))
            }
          >
            Ungesicherte Entwürfe exportieren
          </Button>
        </>
      )}
      {message && (
        <T accessibilityRole="alert" variant="small">
          {message}
        </T>
      )}
      {drafts.map((d) => {
        const destination = draftDestination(d);
        return (
          <Card key={d.id} style={{ gap: 12 }}>
            <Tag icon="pen">
              {held[d.key]
                ? held[d.key]?.reason === "error"
                  ? "Nur in dieser Sitzung erhalten"
                  : "Wird noch gesichert"
                : "Gesicherter Entwurf"}
            </Tag>
            <T style={{ fontWeight: "600", fontSize: 13 }}>
              {destination.label}
            </T>
            <T variant="small" numberOfLines={3}>
              {"text" in d.values
                ? d.values.text
                : "why" in d.values
                  ? d.values.why
                  : ""}
            </T>
            <Button
              kind="secondary"
              icon="pen"
              onPress={() =>
                d.type === "journal" && onJournal
                  ? onJournal()
                  : router.push(destination.href)
              }
            >
              Entwurf fortsetzen: {destination.label}
            </Button>
          </Card>
        );
      })}
      {!drafts.length && (
        <Card>
          <T variant="small" style={{ color: t.muted }}>
            Gerade wartet kein Entwurf. Deine fertigen Einträge findest du unter
            „Gedanken“.
          </T>
        </Card>
      )}
    </View>
  );
}
