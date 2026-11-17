import { useMemo, useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useApp } from "../../state/store";
import { T, Tag, Card, Button } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { legacyPathHistory, type LegacyLocation } from "./legacy-history";
import { archiveFocusParams } from "./archive-focus";
import { LegacyMomentCard } from "./LegacyMomentCard";
import type { Goal } from "../personal/schema";
export function LegacyHistory({ goal }: { goal: Goal }) {
  const t = useTheme(), [limit, setLimit] = useState(5),
    receipt = useApp((s) => s.data.imports.find((i) => i.id === goal.origin?.importId));
  const history = useMemo(() => receipt ? legacyPathHistory(receipt, { origin: goal.origin }) : null, [receipt, goal.origin]);
  if (!receipt || !goal.origin) return null;
  const openOriginal = (location?: LegacyLocation) => router.push({
    pathname: "/importarchiv/[id]", params: { id: receipt.id,
      ...(location ? archiveFocusParams(receipt.sourceHash, location) : {}) },
  });
  return <View style={{ gap: 12 }} testID="legacy-personal-history">
    <T variant="heading">Deine FaithPath-Geschichte</T>
    <Card style={{ gap: 12 }}>
      <Tag icon="bookmark">Historischer Import · kein neuer Nachweis</Tag>
      <T variant="small" style={{ color: t.muted }}>
        Frühere Rückblicke und Meilensteine behalten ihre eigenen Worte und Quellenangaben.
        Sie erzeugen keine heutige Bestätigung und keinen zusätzlichen Fortschritt.
      </T>
      {history?.status === "ok" && <T variant="small">Ursprüngliches Vorhaben: {history.originalTitle}{history.originalArchived ? " · damals ruhend" : ""}</T>}
      {goal.origin.category && <T variant="small">Frühere Kategorie: {goal.origin.category}</T>}
      {goal.origin.referenceLabel && <T variant="small">Originalbezug: {goal.origin.referenceLabel}</T>}
      {history?.status === "unavailable" && <T variant="small" style={{ color: t.muted }}>{history.reason}</T>}
      <Button kind="secondary" icon="book" onPress={() => openOriginal()}>Vollständige Originalquelle ansehen</Button>
    </Card>
    {history?.status === "ok" && <>
      {history.moments.slice(0, limit).map((moment) => {
        const review = moment.reviewKey ? history.moments.find((item) => item.key === moment.reviewKey) : undefined;
        return <LegacyMomentCard key={moment.key} moment={moment} review={review} onOpen={openOriginal} />;
      })}
      {history.moments.length > limit && <Button kind="ghost" icon={null} onPress={() => setLimit((n) => n + 5)}>Weitere historische Momente</Button>}
      {history.moments.length === 0 && <T variant="small" style={{ color: t.muted }}>In dieser Originalquelle sind keine zugehörigen Rückblicke oder Meilensteine überliefert.</T>}
    </>}
  </View>;
}
