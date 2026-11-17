import { useMemo, useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Button, Card, Field, T, Tag } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import type { ImportReceipt } from "./schema";
import { legacyArchiveReader, type LegacyLocation, type LegacyMoment } from "./legacy-history";
import { archiveFocusParams } from "./archive-focus";
import { LegacyMomentCard } from "./LegacyMomentCard";

const searchKey = (value: string) => value.toLocaleLowerCase("de-DE").replace(/\s+/gu, "");
const shortTitle = (value: string) => {
  const text = value.trim();
  return !text ? "Früheres Vorhaben · Titel nicht angegeben" : text.length > 110 ? text.slice(0, 110) + "…" : text;
};
export function ArchiveHistory({ receipt, tab, pathId, onPath, onUnassigned }: {
  receipt: ImportReceipt; tab?: string; pathId?: string;
  onPath: (id: string) => void; onUnassigned: () => void;
}) {
  const t = useTheme(), [query, setQuery] = useState(""), [pathLimit, setPathLimit] = useState(8),
    [choosing, setChoosing] = useState(tab === undefined),
    reader = useMemo(() => legacyArchiveReader(receipt), [receipt]);
  const selected = useMemo(() => reader.status === "ok" && tab === "path" && pathId !== undefined
    ? reader.readPath(pathId) : null, [reader, tab, pathId]);
  if (reader.status !== "ok") return <Card><T>{reader.reason}</T></Card>;
  const paths = reader.paths.filter((path) => searchKey(path.title).includes(searchKey(query))),
    openOriginal = (location: LegacyLocation) => router.push({ pathname: "/importarchiv/[id]",
      params: { id: reader.archiveId, ...archiveFocusParams(reader.sourceHash, location) } });
  const selectedPath = reader.paths.find((path) => path.id === pathId),
    showPicker = choosing || !["path", "unassigned"].includes(tab ?? "") || tab === "path" && selected?.status !== "ok";
  return <View style={{ gap: 18 }} testID="archive-readable-history">
    <Card style={{ gap: 13, padding: showPicker ? 24 : 12 }}>
      {showPicker && <Tag icon="bookmark">Deine erhaltene Originalgeschichte</Tag>}
      {showPicker && <T variant="small" style={{ color: t.muted }}>
        Diese Worte bleiben in ihrer ursprünglichen Quelle. Auch ein früheres Vorhaben, das du heute nicht mehr in OLIVA führst, kann hier stehen. Das Ansehen stellt nichts wieder her.
      </T>}
      {tab !== undefined && <Button kind="ghost" icon="leaf" selected={showPicker} onPress={() => setChoosing((value) => !value)}>{showPicker ? "Auswahl schließen" : "Andere frühere Momente wählen"}</Button>}
      {showPicker && reader.paths.length > 0 && <>
        <Field label="Frühere Vorhaben durchsuchen" value={query} onChangeText={(value) => { setQuery(value); setPathLimit(8); }} maxLength={200} />
        {paths.slice(0, pathLimit).map((path) => <Button key={path.id} kind={tab === "path" && pathId === path.id ? "primary" : "secondary"}
          icon="leaf" selected={tab === "path" && pathId === path.id} onPress={() => { setChoosing(false); onPath(path.id); }}>{shortTitle(path.title)}{path.archived ? " · damals ruhend" : ""}</Button>)}
        {paths.length === 0 && <T variant="small">Kein früheres Vorhaben passt zu dieser Suche.</T>}
        {paths.length > pathLimit && <Button kind="ghost" onPress={() => setPathLimit((n) => n + 8)}>Weitere frühere Vorhaben</Button>}
      </>}
      {showPicker && reader.unassigned.length > 0 && <Button kind={tab === "unassigned" ? "primary" : "secondary"} icon="heart"
        selected={tab === "unassigned"} onPress={() => { setChoosing(false); onUnassigned(); }}>Rückblicke ohne eindeutigen Weg</Button>}
      {reader.paths.length === 0 && reader.unassigned.length === 0 && <T variant="small">In dieser Quelle sind keine früheren Rückblicke oder Meilensteine überliefert.</T>}
    </Card>
    {tab === "path" && selected?.status === "ok" && <>
      <T variant="heading" accessibilityRole="header" numberOfLines={3}>{shortTitle(selected.originalTitle)}</T>
      <T variant="small" style={{ color: t.muted }}>Ursprüngliches Vorhaben{selected.originalArchived ? " · damals ruhend" : ""}. Fehlende Zeitangaben bleiben offen.</T>
      {selectedPath && <Button kind="ghost" icon="book" onPress={() => openOriginal({ category: "paths", index: selectedPath.index })}>Ursprüngliches Vorhaben im Archiv ansehen</Button>}
      <Moments key={"path:" + pathId} moments={selected.moments} onOpen={openOriginal} />
    </>}
    {tab === "path" && selected?.status === "unavailable" && <Card><T>{selected.reason}</T></Card>}
    {tab === "unassigned" && <>
      <T variant="heading" accessibilityRole="header">Rückblicke ohne eindeutigen Weg</T>
      <T variant="small" style={{ color: t.muted }}>Zu diesen damaligen Rückblicken ist keine eindeutige Wegezuordnung gespeichert.</T>
      <Moments key="unassigned" moments={reader.unassigned} onOpen={openOriginal} />
    </>}
    {(tab !== undefined && !["path", "unassigned"].includes(tab) || tab === "path" && pathId === undefined) && <Card><T>Diese historische Auswahl ist nicht eindeutig verfügbar. Du kannst oben eine vorhandene Quelle wählen.</T></Card>}
    {tab === undefined && (reader.paths.length > 0 || reader.unassigned.length > 0) && <T variant="small" style={{ color: t.muted }}>Öffne ein früheres Vorhaben oder die Rückblicke ohne eindeutigen Weg. Du brauchst nichts erneut zu bestätigen.</T>}
  </View>;
}
function Moments({ moments, onOpen }: { moments: LegacyMoment[]; onOpen: (location: LegacyLocation) => void }) {
  const [limit, setLimit] = useState(5);
  return <View style={{ gap: 16 }}>
    {moments.slice(0, limit).map((moment) => <LegacyMomentCard key={moment.key} moment={moment}
      review={moment.reviewKey ? moments.find((item) => item.key === moment.reviewKey) : undefined} onOpen={onOpen} />)}
    {moments.length > limit && <Button kind="ghost" onPress={() => setLimit((n) => n + 5)}>Weitere historische Momente</Button>}
    {moments.length === 0 && <T variant="small">Hier sind keine Rückblicke oder Meilensteine überliefert.</T>}
  </View>;
}
