import { useState } from "react";
import { router } from "expo-router";
import { Button, Card, T, Tag } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { useApp } from "../../state/store";
export function LegacyGardenHistory() {
  const t = useTheme(), imports = useApp((s) => s.data.imports), [limit, setLimit] = useState(3);
  if (imports.length === 0) return null;
  return <Card style={{ marginTop: 24, gap: 14 }} testID="garden-original-history">
    <Tag icon="bookmark">Aus FaithPath mitgebracht</Tag>
    <T variant="heading">Deine früheren Momente.</T>
    <T variant="small" style={{ color: t.muted }}>Frühere Rückblicke und Meilensteine bleiben in ihren Originalquellen. Du kannst sie bewusst öffnen. Sie verändern deinen heutigen Baum nicht.</T>
    {imports.slice(0, limit).map((receipt, index) => <Button key={receipt.id} kind="secondary" icon="heart"
      onPress={() => router.push({ pathname: "/importarchiv/[id]", params: { id: receipt.id, view: "history" } })}>
      {imports.length === 1 ? "Frühere FaithPath-Momente ansehen" : `Originalquelle ${index + 1} · übernommen am ${new Date(receipt.importedAt).toLocaleString("de-DE")}`}
    </Button>)}
    {imports.length > limit && <Button kind="ghost" onPress={() => setLimit((n) => n + 3)}>Weitere Originalquellen</Button>}
    {imports.length > 1 && <T variant="small" style={{ color: t.muted }}>Jede Datei behält ihre eigene Fassung. Das angezeigte Datum ist die Übernahme nach OLIVA.</T>}
  </Card>;
}
