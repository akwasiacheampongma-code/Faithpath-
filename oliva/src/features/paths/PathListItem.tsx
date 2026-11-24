import { Image, Pressable, View } from "react-native";
import { router } from "expo-router";
import { artSources } from "../../components/PathCard";
import { Icon } from "../../components/Icon";
import { T, Progress } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { useApp } from "../../state/store";
import type { LearningPath } from "./catalog";

/** Compact overview only; the shared Today card and all path content stay intact. */
export function PathListItem({ path, featured = false }: { path: LearningPath; featured?: boolean }) {
  const t = useTheme(),
    completed = useApp((s) => s.data.completedSteps.filter((key) => key.startsWith(path.id + ":")).length);
  return (
    <Pressable
      testID={`path-list-item-${path.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${path.title}, ${path.minutes !== undefined ? path.minutes + " Minuten" : path.steps.length + " Bibelabschnitte"}, ${completed} von ${path.steps.length} Schritten`}
      onPress={() => router.push({ pathname: "/weg/[id]", params: { id: path.id } })}
      style={({ pressed }) => ({
        width: "100%", minHeight: featured ? 120 : 112, paddingVertical: 12, paddingHorizontal: featured ? 12 : 2,
        flexDirection: "row", alignItems: "center", gap: 14,
        borderBottomWidth: 1, borderColor: t.line, borderWidth: featured ? 1 : 0, borderRadius: featured ? 18 : 0,
        backgroundColor: featured ? t.soft : "transparent", opacity: pressed ? 0.75 : 1,
      })}
    >
      <Image source={artSources[path.art]} resizeMode="cover" accessible={false}
        style={{ width: 72, height: 78, borderRadius: 12 }} />
      <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
        <T style={{ color: t.muted, fontSize: 11, lineHeight: 18 }}>{path.category}</T>
        <T variant="heading" style={{ fontSize: 24, lineHeight: 28 }}>{path.title}</T>
        <T style={{ color: t.muted, fontSize: 12, lineHeight: 19 }}>{path.subtitle}</T>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6, marginTop: 3 }}>
          <T style={{ color: t.primary, fontSize: 11, lineHeight: 18 }}>
            {path.minutes !== undefined ? `${path.minutes} Min. · ` : ""}{path.steps.length} kleine Schritte
          </T>
          <Icon name="arrow" size={14} color={t.primary} />
        </View>
        {completed > 0 && <Progress value={completed / path.steps.length} label={`${completed} Schritte abgeschlossen`} />}
      </View>
    </Pressable>
  );
}
