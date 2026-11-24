import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { T } from "../../components/ui";
import { useTheme } from "../../design-system/theme";

const sections = [
  { id: "wege", label: "Wege" },
  { id: "themen", label: "Themen" },
  { id: "geschichten", label: "Geschichten" },
] as const;

export type DiscoverSection = (typeof sections)[number]["id"];

export function DiscoverHeader({ current }: { current: DiscoverSection }) {
  const theme = useTheme();
  return <View style={{ gap: 13, marginBottom: 16 }}>
    <T variant="title" accessibilityRole="header" aria-level={1}>Entdecken</T>
    <View role="group" accessibilityLabel="Inhalte entdecken" style={{
      flexDirection: "row", flexWrap: "wrap", gap: 4, backgroundColor: theme.soft, padding: 4, borderRadius: 15,
    }}>
      {sections.map(({ id, label }) => (
        <Pressable key={id} accessibilityRole="button" accessibilityState={{ selected: current === id }}
          aria-pressed={current === id} onPress={() => router.setParams({ bereich: id })}
          style={({ pressed }) => ({
            flexGrow: 1, minHeight: 44, borderRadius: 11, borderWidth: 1,
            borderColor: current === id ? theme.primary : "transparent",
            paddingHorizontal: 9, paddingVertical: 8, alignItems: "center", justifyContent: "center",
            backgroundColor: current === id ? theme.surface : "transparent", opacity: pressed ? 0.75 : 1,
          })}>
          <T style={{ fontSize: 13, lineHeight: 20, color: current === id ? theme.text : theme.muted }}>{label}</T>
        </Pressable>
      ))}
    </View>
  </View>;
}
