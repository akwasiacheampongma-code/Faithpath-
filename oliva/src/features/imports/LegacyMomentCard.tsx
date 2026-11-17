import { View } from "react-native";
import { T, Tag, Card, Button } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import type { LegacyLocation, LegacyMoment } from "./legacy-history";
const statuses: Record<string, string> = {
  thought: "Darüber nachgedacht", changed: "Veränderung wahrgenommen", working: "Weiter unterwegs",
  unchanged: "Noch unverändert", notnow: "Gerade nicht dran",
};
export function LegacyMomentCard({ moment, review, onOpen }: {
  moment: LegacyMoment; review?: LegacyMoment; onOpen: (location: LegacyLocation) => void;
}) {
  const t = useTheme();
  return <Card style={{ gap: 12 }} testID={`legacy-moment-${moment.key}`}>
    <Tag icon={moment.kind === "review" ? "heart" : "leaf"}>
      {moment.kind === "review" ? "FaithPath-Rückblick" : "FaithPath-Meilenstein"} · {moment.date ? new Date(moment.date).toLocaleDateString("de-DE") : "Datum nicht überliefert"}
    </Tag>
    <T>{moment.text.trim() ? moment.text : "Der damalige Wortlaut ist nicht gespeichert."}</T>
    {moment.status && <T variant="small">Damals gewählt: {statuses[moment.status] ?? moment.status}</T>}
    {moment.originallyConfirmed && <T variant="small" style={{ color: t.muted }}>Damals in FaithPath ausdrücklich als Entwicklung festgehalten.</T>}
    {moment.conflictingIdentity && <T variant="small" style={{ color: t.muted }}>Mehrere Originalfassungen mit dieser Kennung bleiben getrennt erhalten.</T>}
    {moment.conflictingAssociation && <T variant="small" style={{ color: t.muted }}>Die ursprünglichen Wegangaben widersprechen sich; die genaue Zuordnung bleibt offen.</T>}
    {moment.kind === "review" && <View style={{ padding: 15, backgroundColor: t.soft, borderRadius: 12, gap: 7 }}>
      <T variant="label" style={{ fontSize: 9 }}>DAMALIGE QUELLANGABE</T>
      {moment.snapshot ? <>
        <T style={{ fontWeight: "600", fontSize: 13 }}>{moment.snapshot.title}</T>
        <T variant="small">{moment.snapshot.text}</T>
        <T variant="small" style={{ color: t.muted }}>Gespeicherter Bezug: {moment.snapshot.key} · {moment.snapshot.at}</T>
      </> : <T variant="small">Kein eindeutig zuordenbarer damaliger Quelltext. Der Originaldatensatz bleibt im Archiv erhalten.</T>}
    </View>}
    <Button kind="ghost" icon="book" onPress={() => onOpen(moment.locations[0]!)}>
      {moment.kind === "review" ? "Originalrückblick im Archiv ansehen" : "Originalmeilenstein im Archiv ansehen"}
    </Button>
    {review && <Button kind="ghost" icon="heart" onPress={() => onOpen(review.locations[0]!)}>Zugehörigen ursprünglichen Rückblick ansehen</Button>}
    {moment.locations.length > 1 && <T variant="small" style={{ color: t.muted }}>Gleicher Originaldatensatz an {moment.locations.length} Stellen der Quelle · einmal angezeigt.</T>}
  </Card>;
}
