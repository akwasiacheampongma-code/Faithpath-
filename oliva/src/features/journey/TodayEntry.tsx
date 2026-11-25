import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Image, Pressable, View, useWindowDimensions } from "react-native";
import { Icon } from "../../components/Icon";
import { Button, Card, T } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { useApp } from "../../state/store";
import { referenceLabel } from "../bible/repository";
import { TreeStill } from "../garden/TreeStill";
import { STAGES } from "../garden/model";
import { homeReading } from "./home-reading";

const landscapes = {
  AT: {
    small: require("../../../assets/images/garden-640.webp"),
    large: require("../../../assets/images/garden-1280.webp"),
    caption: "Garten Eden · künstlerische Interpretation",
  },
  NT: {
    small: require("../../../assets/images/galilee-640.webp"),
    large: require("../../../assets/images/galilee-1280.webp"),
    caption: "Galiläa · künstlerische Interpretation",
  },
} as const;

export function TodayEntry() {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const data = useApp((state) => state.data);
  const { resume, reference, position, testament } = homeReading(data);
  const landscape = landscapes[testament];
  const label = referenceLabel(reference);
  const action = resume ? "Weiterlesen" : "Jetzt lesen";

  return <View style={{ gap: 10 }}>
    <T testID="home-greeting" variant="title" accessibilityRole="header" aria-level={1}
      style={{ fontSize: width < 600 ? 34 : 44, lineHeight: width < 600 ? 39 : 49 }}>
      {resume ? "Schön, dass du wieder da bist" : "Schön, dass du da bist"}{data.name ? `, ${data.name}` : ""}.
    </T>
    <View testID="home-reading-entry" style={{ borderRadius: 18, overflow: "hidden", backgroundColor: "#334c38" }}>
      <Image testID={`home-landscape-${testament.toLowerCase()}`}
        source={width < 600 ? landscape.small : landscape.large}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} resizeMode="cover" accessible={false} />
      <LinearGradient colors={["rgba(19,38,26,.92)", "rgba(24,46,31,.72)", "rgba(30,49,31,.42)"]}
        locations={[0, 0.65, 1]} start={{ x: 0, y: 0.4 }} end={{ x: 1, y: 0.6 }} pointerEvents="none"
        style={{ position: "absolute", inset: 0 }} />
      <Pressable testID="home-primary-action" accessibilityRole="button"
        accessibilityLabel={action}
        accessibilityHint={position ? `${label} · Zuletzt bei Vers ${position.verse}` : label}
        onPress={() => router.push({ pathname: "/lesen/[book]", params: { ...reference, mode: position?.mode } })}
        style={({ pressed }) => ({
          flexDirection: "row", alignItems: "center", minHeight: 82, paddingHorizontal: 15, paddingVertical: 12,
          gap: 13, opacity: pressed ? 0.8 : 1,
        })}>
        <View style={{ backgroundColor: "rgba(17,37,25,.75)", padding: 10, borderRadius: 11 }}>
          <Icon name="book" size={21} color="#f6f1dc" />
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
          <T style={{ color: "#fffdf2", fontWeight: "600" }}>{action}</T>
          <T variant="heading" style={{ fontSize: 25, lineHeight: 28, color: "#fffdf2" }}>
            {label}{position && !reference.from && !reference.to ? `,${position.verse}` : ""}
          </T>
          {position && (reference.from || reference.to) && (
            <T variant="small" style={{ color: "#fffdf2" }}>Zuletzt bei Vers {position.verse}</T>
          )}
        </View>
        <Icon name="chevron" size={18} color="#f6f1dc" />
      </Pressable>
    </View>
    <T variant="small" style={{ color: t.muted, fontSize: 10, lineHeight: 14, alignSelf: "flex-end" }}>{landscape.caption}</T>
  </View>;
}

export function TodayGarden() {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const stage = useApp((state) => state.data.growthStage);

  return <Card testID="home-garden-entry" style={{
    padding: 14, flexDirection: "row", gap: 8, alignItems: "center", borderWidth: 0, backgroundColor: t.soft,
  }}>
    <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
      <T variant="heading" accessibilityRole="header" aria-level={2} style={{ fontSize: 27, lineHeight: 29 }}>Dein Glaubensweg</T>
      <T variant="small" style={{ color: t.muted }}>Dein Olivenbaum erinnert dich an das, was du entdeckst.</T>
      <Button kind="ghost" foregroundColor={t.primary}
        style={{ alignSelf: "flex-start", maxWidth: "100%", paddingHorizontal: 0, gap: 5 }}
        onPress={() => router.push("/garten")}>Meinen Garten ansehen</Button>
    </View>
    <View testID="home-personal-tree" accessible accessibilityRole="image"
      accessibilityLabel={`Dein Olivenbaum · ${STAGES[stage]?.name ?? STAGES[0]!.name}`}>
      <TreeStill stage={stage} size={Math.min(112, Math.round(width * 0.26))} compact />
    </View>
  </Card>;
}
