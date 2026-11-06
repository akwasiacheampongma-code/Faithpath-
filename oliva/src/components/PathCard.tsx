import { View, Image, Pressable } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { T, Progress } from "./ui";
import { Icon } from "./Icon";
import { useTheme } from "../design-system/theme";
import { useApp } from "../state/store";
import type { LearningPath } from "../features/paths/catalog";
export const artSources = {
  galilee: require("../../assets/images/galilee-640.webp"),
  storm: require("../../assets/images/storm-640.webp"),
  garden: require("../../assets/images/garden-640.webp"),
};
export function PathCard({
  path,
  style,
}: {
  path: LearningPath;
  style?: React.ComponentProps<typeof View>["style"];
}) {
  const t = useTheme(),
    completed = useApp(
      (s) =>
        s.data.completedSteps.filter((k) => k.startsWith(path.id + ":")).length,
    );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${path.title}, ${path.minutes} Minuten, ${completed} von ${path.steps.length} Schritten`}
      onPress={() =>
        router.push({ pathname: "/weg/[id]", params: { id: path.id } })
      }
      style={({ pressed }) => [
        {
          flex: 1,
          minWidth: 190,
          borderRadius: 17,
          borderWidth: 1,
          borderColor: t.line,
          backgroundColor: t.surface,
          overflow: "hidden",
          opacity: pressed ? 0.9 : 1,
        },
        style,
      ]}
    >
      <View style={{ height: 146 }}>
        <Image
          source={artSources[path.art]}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
          accessible={false}
        />
        <LinearGradient
          colors={["transparent", "rgba(19,35,24,.5)"]}
          style={{ position: "absolute", inset: 0 }}
        />
        <View
          style={{
            position: "absolute",
            left: 15,
            bottom: 13,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Icon name="clock" color="#fff" size={12} />
          <T variant="small" style={{ color: "#fff", fontSize: 10 }}>
            {path.minutes} Min. · {path.steps.length} kleine Schritte
          </T>
        </View>
      </View>
      <View style={{ padding: 18, gap: 8 }}>
        <T variant="label" style={{ color: t.gold, fontSize: 8 }}>
          {path.category.toUpperCase()}
        </T>
        <T variant="heading" style={{ fontSize: 25, lineHeight: 28 }}>
          {path.title}
        </T>
        <T
          variant="small"
          style={{ color: t.muted, fontSize: 11, lineHeight: 18 }}
        >
          {path.subtitle}
        </T>
        <View style={{ marginTop: 6 }}>
          {completed > 0 ? (
            <Progress
              value={completed / path.steps.length}
              label={`${completed} Schritte abgeschlossen`}
            />
          ) : (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <T variant="small" style={{ fontSize: 11, color: t.primary }}>
                Weg entdecken
              </T>
              <Icon name="arrow" size={14} color={t.primary} />
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
