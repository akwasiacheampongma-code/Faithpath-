import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "../../components/Icon";
import { Pressable, Image, View, useWindowDimensions } from "react-native";
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
  const { width, height } = useWindowDimensions();
  const data = useApp((state) => state.data);
  const { resume, reference, position, testament } = homeReading(data);
  const landscape = landscapes[testament];
  const label = referenceLabel(reference);
  const short = width <= 340 && height <= 660;
  const treeSize = short ? 82 : Math.min(136, Math.round(width * 0.33));

  const openReading = () => router.push({
    pathname: "/lesen/[book]",
    params: { ...reference, mode: position?.mode },
  });

  return <View style={{ gap: 13, width: "100%" }}>
    <T testID="home-greeting" variant="small" style={{ color: t.muted, fontSize: 14, lineHeight: 19 }}>
      {resume ? "Schön, dass du wieder da bist" : "Schön, dass du da bist"}{data.name ? `, ${data.name}` : ""}.
    </T>
    <View testID="home-reading-entry" style={{ borderRadius: 22, overflow: "hidden", backgroundColor: "#334c38" }}>
      <Image testID={`home-landscape-${testament.toLowerCase()}`}
        source={width < 600 ? landscape.small : landscape.large}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} resizeMode="cover" accessible={false} />
      <LinearGradient colors={["rgba(19,38,26,.94)", "rgba(24,46,31,.74)", "rgba(30,49,31,.68)"]}
        locations={[0, 0.6, 1]} start={{ x: 0, y: 0.4 }} end={{ x: 1, y: 0.6 }} pointerEvents="none"
        style={{ position: "absolute", inset: 0 }} />
      {resume ? <Pressable testID="home-primary-action" accessibilityRole="button"
        accessibilityLabel="In der Bibel weiterlesen"
        accessibilityHint={position ? `${label} · Zuletzt bei Vers ${position.verse}` : label}
        onPress={openReading} style={({ pressed }) => ({
          paddingHorizontal: short ? 14 : 17, paddingVertical: short ? 12 : 15, gap: 7,
          minHeight: short ? 110 : 125, justifyContent: "center", opacity: pressed ? 0.85 : 1,
        })}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 13 }}>
          <View style={{ backgroundColor: "rgba(17,37,25,.75)", padding: 10, borderRadius: 12 }}>
            <Icon name="book" size={22} color="#f6f1dc" />
          </View>
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <T variant="label" style={{ color: "#f6f1dc" }}>Weiterlesen</T>
            <T variant="heading" style={{ fontSize: 27, lineHeight: 30, color: "#fffdf2" }}>{label}</T>
            {position && <T variant="small" style={{ color: "#fffdf2" }}>Zuletzt bei Vers {position.verse}</T>}
          </View>
          <Icon name="chevron" size={18} color="#f6f1dc" />
        </View>
        <T variant="small" style={{ color: "#fffdf2", fontSize: 10, lineHeight: 14 }}>{landscape.caption}</T>
      </Pressable> : (
        <View style={{ paddingHorizontal: short ? 15 : 18, paddingTop: short ? 12 : 17, paddingBottom: 11, gap: short ? 7 : 10 }}>
          <T variant="hero" accessibilityRole="header" aria-level={1} style={{
            color: "#fffdf2", maxWidth: 590, fontSize: short ? 31 : width < 600 ? 36 : 44,
            lineHeight: short ? 32 : width < 600 ? 37 : 47,
          }}>Lass deinen Glaubensweg wachsen.</T>
          <T style={{ color: "#fffdf2", fontSize: 14, lineHeight: short ? 19 : 21, maxWidth: 430 }}>
            Lies Gottes Wort. Entdecke, was es für dein Leben bedeutet. Halte deine Gedanken fest und sieh, wie dein persönlicher Weg wächst.
          </T>
          <Button testID="home-primary-action" kind="secondary" icon={null} foregroundColor="#263c30"
            style={{ backgroundColor: "#f6f1dc", borderWidth: 0, alignSelf: width < 600 ? "stretch" : "flex-start" }}
            onPress={openReading}>
            Jetzt Bibel lesen
          </Button>
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", columnGap: 8, rowGap: 2 }}>
            <T variant="small" style={{ color: "#fffdf2", fontSize: 11, lineHeight: 15 }}>{label}</T>
            <T variant="small" style={{ color: "#fffdf2", fontSize: 10, lineHeight: 14, marginLeft: "auto" }}>
              {landscape.caption}
            </T>
          </View>
        </View>
      )}
    </View>
    <Card testID="home-garden-entry" style={{
      padding: short ? 10 : 14, flexDirection: "row", gap: 8, alignItems: short ? "flex-start" : "center",
      borderWidth: 0, backgroundColor: t.soft,
    }}>
      <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
        <T variant="heading" accessibilityRole="header" aria-level={2} style={{ fontSize: 27, lineHeight: 27 }}>Dein Glaubensweg</T>
        <T variant="small" style={{ color: t.muted, maxWidth: 285 }}>Dein Olivenbaum erinnert dich an das, was du entdeckst.</T>
        <Button kind="ghost" foregroundColor={t.primary} style={{ alignSelf: "flex-start", maxWidth: "100%", paddingHorizontal: 0, gap: 5 }}
          onPress={() => router.push("/garten")}>Meinen Garten ansehen</Button>
      </View>
      <View testID="home-personal-tree" accessible accessibilityRole="image"
        accessibilityLabel={`Dein Olivenbaum · ${STAGES[data.growthStage]?.name ?? STAGES[0]!.name}`}>
        <TreeStill stage={data.growthStage} size={treeSize} compact />
      </View>
    </Card>
    <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: 14 }}>
      <Button kind="ghost" foregroundColor={t.primary} style={{ paddingHorizontal: 6, gap: 5, maxWidth: "100%" }}
        onPress={() => router.push("/wege")}>Einen Weg entdecken</Button>
      <Button kind="ghost" foregroundColor={t.primary} style={{ paddingHorizontal: 6, gap: 5, maxWidth: "100%" }}
        onPress={() => router.push("/sammlung")}>Meine Notizen</Button>
    </View>
  </View>;
}
