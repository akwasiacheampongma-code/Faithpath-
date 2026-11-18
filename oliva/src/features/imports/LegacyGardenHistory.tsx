import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Button, T } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { useApp } from "../../state/store";
export function LegacyGardenHistory() {
  const t = useTheme(), imports = useApp((s) => s.data.imports), [limit, setLimit] = useState(3);
  if (imports.length === 0) return null;
  return <View style={{ marginTop: 20, paddingTop: 14, borderTopWidth: 1, borderColor: t.line, gap: 6 }} testID="garden-original-history">
    <T variant="heading" accessibilityRole="header" style={{ fontSize: 25, lineHeight: 30 }}>Frühere FaithPath-Momente</T>
    {imports.slice(0, limit).map((receipt, index) => <Button key={receipt.id} kind="ghost" icon="heart" style={{ alignSelf: "flex-start", paddingHorizontal: 0 }}
      onPress={() => router.push({ pathname: "/importarchiv/[id]", params: { id: receipt.id, view: "history" } })}>
      {imports.length === 1 ? "Frühere FaithPath-Momente ansehen" : `Originalquelle ${index + 1} · übernommen am ${new Date(receipt.importedAt).toLocaleString("de-DE")}`}
    </Button>)}
    {imports.length > limit && <Button kind="ghost" onPress={() => setLimit((n) => n + 3)}>Weitere Originalquellen</Button>}
    {imports.length > 1 && <T variant="small" style={{ color: t.muted }}>Jede Datei behält ihre eigene Fassung. Das angezeigte Datum ist die Übernahme nach OLIVA.</T>}
  </View>;
}
