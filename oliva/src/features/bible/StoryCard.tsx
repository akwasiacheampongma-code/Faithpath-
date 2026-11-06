import { Image, View, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { T, Card, Tag, Button } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { SCENES, type Scene } from "./scenes";
import { referenceLabel } from "./repository";
const art = {
  noah: {
    card: require("../../../assets/images/noah-640.webp"),
    story: require("../../../assets/images/noah-1024.webp"),
    hero: require("../../../assets/images/noah-1280.webp"),
  },
  abraham: {
    card: require("../../../assets/images/abraham-640.webp"),
    story: require("../../../assets/images/abraham-1024.webp"),
    hero: require("../../../assets/images/abraham-1280.webp"),
  },
  nativity: {
    card: require("../../../assets/images/nativity-640.webp"),
    story: require("../../../assets/images/nativity-1024.webp"),
    hero: require("../../../assets/images/nativity-1280.webp"),
  },
  "easter-dawn": {
    card: require("../../../assets/images/easter-dawn-640.webp"),
    story: require("../../../assets/images/easter-dawn-1024.webp"),
    hero: require("../../../assets/images/easter-dawn-1280.webp"),
  },
};
export function StoryCard({
  scene,
  context = false,
}: {
  scene: Scene;
  context?: boolean;
}) {
  const t = useTheme(),
    { width } = useWindowDimensions(),
    image = context
      ? width > 800
        ? art[scene.id].hero
        : art[scene.id].story
      : art[scene.id].card;
  return (
    <Card
      style={{ padding: 0, overflow: "hidden", width: "100%", maxWidth: 780 }}
    >
      <View
        style={{
          width: "100%",
          ...(context ? { aspectRatio: 3 / 2 } : { height: 180 }),
        }}
      >
        <Image
          source={image}
          resizeMode="cover"
          style={{ width: "100%", height: "100%" }}
          accessibilityLabel={
            "Künstlerische Interpretation: " +
            (scene.id === "easter-dawn"
              ? "drei Frauen vor einem geöffneten Felsgrab im Morgenlicht."
              : scene.title) +
            " " +
            scene.interpretation
          }
        />
      </View>
      <View style={{ padding: 22, gap: 13 }}>
        <Tag icon="book">
          {referenceLabel(scene.ref)} · etwa {scene.minutes} Min.
        </Tag>
        <T variant="heading">{scene.title}</T>
        {context ? (
          <>
            <T variant="label" style={{ fontSize: 9, color: t.muted }}>
              KI-UNTERSTÜTZTER ENTWURF · KEIN BIBELTEXT
            </T>
            <T style={{ fontSize: 14, lineHeight: 25 }}>{scene.summary}</T>
            <T variant="small" style={{ color: t.muted }}>
              {scene.id === "easter-dawn"
                ? "Einordnung zu den Versen 1–8. Sie ist keine Zusammenfassung des gesamten Kapitels und ersetzt den Bibeltext nicht."
                : "Einordnung nur zu " +
                  referenceLabel(scene.ref) +
                  ". Sie ersetzt den Bibeltext nicht."}
            </T>
            <View
              style={{
                padding: 14,
                backgroundColor: t.soft,
                borderRadius: 12,
                gap: 7,
              }}
            >
              <T style={{ fontSize: 13, fontWeight: "600" }}>{scene.word[0]}</T>
              <T variant="small">{scene.word[1]}</T>
            </View>
          </>
        ) : (
          <>
            <T style={{ fontSize: 13, color: t.muted }}>{scene.intro}</T>
            <Button
              icon="book"
              onPress={() =>
                router.push({
                  pathname: "/lesen/[book]",
                  params: {
                    book: scene.ref.book,
                    chapter: scene.ref.chapter,
                    from: scene.ref.from,
                    to: scene.ref.to,
                    mode: "deep",
                  },
                })
              }
            >
              {scene.action}
            </Button>
          </>
        )}
        <T
          variant="small"
          style={{ fontSize: 10, lineHeight: 17, color: t.muted }}
        >
          KI-Illustration · künstlerische Interpretation, keine historische
          Aufnahme. {scene.interpretation} Unabhängige Fachfreigabe steht aus.
        </T>
      </View>
    </Card>
  );
}
export function StoryLibrary() {
  const { width } = useWindowDimensions(),
    t = useTheme();
  return (
    <View style={{ gap: 18, width: "100%" }}>
      <T variant="heading">Eine Geschichte darf ein Anfang sein.</T>
      <T style={{ fontSize: 13, color: t.muted }}>
        Kurze Abschnitte mit verständlicher Einordnung. Du brauchst kein
        Vorwissen und kannst direkt im Bibeltext weiterlesen.
      </T>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 18 }}>
        {SCENES.map((scene) => (
          <View
            key={scene.id}
            style={{
              width: width >= 850 ? "47%" : "100%",
              flexGrow: 1,
              maxWidth: 780,
            }}
          >
            <StoryCard scene={scene} />
          </View>
        ))}
      </View>
    </View>
  );
}
