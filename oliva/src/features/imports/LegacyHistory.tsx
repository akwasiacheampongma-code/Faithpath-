import { useMemo, useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useApp } from "../../state/store";
import { T, Tag, Card, Button } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { archiveData } from "./model";
import { iso } from "./source";
import { canonicalJson } from "../../lib/hash";
import type { Goal } from "../personal/schema";
const statuses: Record<string, string> = {
  thought: "Darüber nachgedacht",
  changed: "Veränderung wahrgenommen",
  working: "Weiter unterwegs",
  unchanged: "Noch unverändert",
  notnow: "Gerade nicht dran",
};
export function LegacyHistory({ goal }: { goal: Goal }) {
  const t = useTheme(),
    [limit, setLimit] = useState(5),
    receipt = useApp((s) =>
      s.data.imports.find((i) => i.id === goal.origin?.importId),
    );
  const history = useMemo(() => {
    if (!receipt || !goal.origin) return null;
    try {
      const data = archiveData(receipt),
        path = data.paths.find((p) => String(p.id) === goal.origin!.sourceId);
      if (!path) return null;
      const records = [
        ...path.reviews,
        ...data.reviews.filter(
          (r) =>
            String(r.pathId) === String(path.id) ||
            r.sourceKey === `path:${path.id}`,
        ),
      ];
      const seen = new Set<string>();
      const reviews = records.filter((r) => {
        const key = String(r.id) + canonicalJson(r);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      return { reviews, milestones: path.milestones };
    } catch {
      return null;
    }
  }, [receipt, goal.origin]);
  if (!receipt || !goal.origin) return null;
  return (
    <View style={{ gap: 12 }}>
      <T variant="heading">Deine FaithPath-Geschichte</T>
      <Card style={{ gap: 12 }}>
        <Tag icon="bookmark">Historischer Import · kein neuer Nachweis</Tag>
        <T variant="small" style={{ color: t.muted }}>
          Dieser Weg stammt aus FaithPath. Frühere Rückblicke behalten ihre
          eigenen Worte und Quellenangaben. Fehlende frühere Stände werden nicht
          aus heutigen Schritten ergänzt.
        </T>
        {goal.origin.category && (
          <T variant="small">Frühere Kategorie: {goal.origin.category}</T>
        )}
        {goal.origin.referenceLabel && (
          <T variant="small">Originalbezug: {goal.origin.referenceLabel}</T>
        )}
        <Button
          kind="secondary"
          icon="book"
          onPress={() =>
            router.push({
              pathname: "/importarchiv/[id]",
              params: { id: receipt.id },
            })
          }
        >
          Vollständige Originalquelle ansehen
        </Button>
      </Card>
      {history?.reviews.slice(0, limit).map((r, index) => {
        const raw = r.sourceSnapshot,
          s =
            raw && typeof raw === "object" && !Array.isArray(raw)
              ? (raw as Record<string, unknown>)
              : null;
        const known =
          !!s &&
          s.key === r.sourceKey &&
          typeof s.title === "string" &&
          typeof s.text === "string" &&
          iso(s.at) !== null;
        return (
          <Card key={index} style={{ gap: 10 }}>
            <Tag icon="heart">
              FaithPath-Rückblick ·{" "}
              {iso(r.date)
                ? new Date(r.date!).toLocaleDateString("de-DE")
                : "Datum unbekannt"}
            </Tag>
            <T>{r.text}</T>
            {typeof r.status === "string" && (
              <T variant="small">
                Damals gewählt: {statuses[r.status] ?? r.status}
              </T>
            )}
            <View
              style={{
                padding: 15,
                backgroundColor: t.soft,
                borderRadius: 12,
                gap: 7,
              }}
            >
              <T variant="label" style={{ fontSize: 9 }}>
                DAMALIGE QUELLANGABE
              </T>
              {known ? (
                <>
                  <T style={{ fontWeight: "600", fontSize: 13 }}>
                    {s!.title as string}
                  </T>
                  <T variant="small">{s!.text as string}</T>
                  <T variant="small" style={{ color: t.muted }}>
                    Gespeicherter Bezug: {String(s!.key)} · {String(s!.at)}
                  </T>
                </>
              ) : (
                <T variant="small">
                  Kein eindeutig zuordenbarer damaliger Quelltext. Der
                  Originaldatensatz bleibt im Archiv erhalten.
                </T>
              )}
            </View>
          </Card>
        );
      })}
      {!!history && history.reviews.length > limit && (
        <Button kind="ghost" icon={null} onPress={() => setLimit(limit + 5)}>
          Weitere frühere Rückblicke
        </Button>
      )}
      {!!history?.milestones.length && (
        <T variant="small">
          {history.milestones.length} frühere Meilensteine bleiben in der
          vollständigen Originalquelle einsehbar.
        </T>
      )}
    </View>
  );
}
