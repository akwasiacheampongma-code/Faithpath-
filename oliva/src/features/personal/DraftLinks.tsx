import { router, type Href } from "expo-router";
import { View } from "react-native";
import { useState } from "react";
import { useApp } from "../../state/store";
import { T, Card, Button, Tag } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { referenceLabel } from "../bible/repository";
import { captureBibleDestination } from "./capture-presentation";
import type { Draft } from "./schema";
import { useVolatileDrafts, volatileExport } from "./volatile-drafts";
import { exportText } from "../../services/storage";
import { normalizeCollectionText } from "./collection-model";
export function draftDestination(draft: Draft): { label: string; href: Href } {
  switch (draft.type) {
    case "capture": {
      const s = draft.values.source;
      switch (s.type) {
        case "story":
          return {
            label: "Reflexion: " + s.title,
            href: { pathname: "/geschichte/[id]", params: { id: s.unitId, stage: "gedanken", draft: draft.id } },
          };
        case "daily":
          return { label: "Deine Tagesreflexion", href: "/" };
        case "experience":
          return { label: "Deine Erfahrung im Garten", href: "/garten" };
        case "verse":
        case "passage":
          return {
            label: `Notiz zu ${referenceLabel(s.ref)}`,
            href: captureBibleDestination(s, draft.id),
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
      return { label: "Deine Journalworte", href: { pathname: "/sammlung", params: { draft: draft.id } } };
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
    case "review-edit":
      return {
        label:
          draft.type === "step"
            ? "Dein eigener Schritt"
            : draft.type === "review-edit"
              ? `Rückblickbearbeitung: ${draft.values.source.title}`
              : "Dein Rückblick",
        href: {
          pathname: "/vorhaben/[id]",
          params: { id: draft.values.goalId },
        },
      };
  }
}
export function DraftLinks({ query = "", hasOtherDrafts = false }: { query?: string; hasOtherDrafts?: boolean }) {
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
  const needle = normalizeCollectionText(query);
  const visible = drafts.flatMap((draft) => {
    const destination = draftDestination(draft);
    const preview = "text" in draft.values ? draft.values.text : "why" in draft.values ? draft.values.why : "";
    return normalizeCollectionText(`${destination.label} ${preview}`).includes(needle) ? [{ draft, destination, preview }] : [];
  });
  return (
    <View style={{ gap: 12 }}>
      {Object.keys(held).length > 0 && (
        <>
          <T variant="small" style={{ color: t.danger }}>
            Einige Worte sind nur in dieser Sitzung erhalten. Schließe die App
            erst, wenn du sie erfolgreich gesichert, exportiert oder kopiert
            hast. Eine exportierte Sitzungskopie enthält diese Texte im Klartext.
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
      {visible.map(({ draft: d, destination, preview }) => {
        return (
          <View key={d.id} style={{ gap: 5, paddingVertical: 8, alignItems: "flex-start", borderBottomWidth: 1, borderColor: t.line }}>
            <Tag icon="pen">
              {held[d.key]
                ? held[d.key]?.reason === "error"
                  ? "Nur in dieser Sitzung erhalten"
                  : "Wird noch gesichert"
                : "Gesicherter Entwurf"}
            </Tag>
            {!!preview && <T variant="small" numberOfLines={2}>{preview}</T>}
            <Button
              kind="ghost"
              icon="pen"
              onPress={() => router.push(destination.href)}
            >
              Entwurf fortsetzen: {destination.label}
            </Button>
          </View>
        );
      })}
      {!visible.length && !hasOtherDrafts && (
        <Card>
          <T variant="small" style={{ color: t.muted }}>
            {needle ? "Kein passender Entwurf gefunden." : "Hier wartet gerade kein Entwurf."}
          </T>
        </Card>
      )}
    </View>
  );
}
