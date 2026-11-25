import { useState } from "react";
import { Image, View, type ImageSourcePropType } from "react-native";
import { StoryArtwork } from "../bible/StoryArtwork";
import { SCENES } from "../bible/scenes";
import { getPassage, referenceLabel } from "../bible/repository";
import { useTheme } from "../../design-system/theme";
import { T, Button } from "../../components/ui";
import { projectStoryIllustrations, type StoryIllustration, type StoryUnit } from "./index";
import { projectStoryAssets } from "./project-story-assets";
const thumbnails: Record<string, ImageSourcePropType> = {
  noah: require("../../../assets/images/noah-640.webp"),
  abraham: require("../../../assets/images/abraham-640.webp"),
  nativity: require("../../../assets/images/nativity-640.webp"),
  "david-before-goliath": require("../../../assets/images/david-before-goliath-640.webp"),
  "easter-dawn": require("../../../assets/images/easter-dawn-640.webp"),
  storm: require("../../../assets/images/storm-640.webp"),
};
export function StoryThumbnail({ unit }: { unit: StoryUnit }) {
  const t = useTheme(), [failed, setFailed] = useState(false);
  const source = projectStoryAssets[unit.id]?.list ?? (unit.image ? thumbnails[unit.image] : undefined);
  if (source && !failed)
    return <Image accessible={false} source={source} onError={() => setFailed(true)}
      style={{ width: 64, height: 76, borderRadius: 12 }} resizeMode="cover" />;
  return <View accessible={false} style={{ width: 64, height: 76, borderRadius: 12, backgroundColor: t.goldSoft, alignItems: "center", justifyContent: "center" }}>
    <T style={{ fontFamily: "Cormorant", fontSize: 32, color: t.gold }}>{unit.references[0]!.chapter}</T>
    <T style={{ fontSize: 8, color: t.gold, letterSpacing: 1 }}>{unit.references[0]!.book}</T>
  </View>;
}
function StormArt() {
  const t = useTheme(), [attempt, setAttempt] = useState(0);
  return <View style={{ aspectRatio: 3 / 2, backgroundColor: t.soft, justifyContent: "center", borderRadius: 20, overflow: "hidden" }}>
    {attempt < 2 ? <Image accessibilityLabel="Künstlerische Interpretation: ein Boot im Sturm auf dem See."
      source={attempt === 0 ? require("../../../assets/images/storm-1280.webp") : thumbnails.storm!}
      resizeMode="contain" style={{ width: "100%", height: "100%" }} onError={() => setAttempt(attempt + 1)} /> :
      <View style={{ padding: 20, gap: 12 }}><T>Das Bild ist gerade nicht verfügbar. Der Bibeltext bleibt lesbar.</T>
        <Button kind="secondary" onPress={() => setAttempt(0)}>Bild erneut laden</Button></View>}
  </View>;
}
function ProjectStoryHero({ unit, artwork, source }: {
  unit: StoryUnit;
  artwork: StoryIllustration;
  source: ImageSourcePropType;
}) {
  const t = useTheme();
  const [failed, setFailed] = useState(false);
  if (failed) return <StoryPlaceholder unit={unit} />;

  return (
    <View style={{ gap: 9 }}>
      <View style={{ aspectRatio: 1024 / 683, borderRadius: 24, overflow: "hidden", backgroundColor: t.soft }}>
        <Image accessible accessibilityRole="image" accessibilityLabel={artwork.alt}
          testID="story-project-illustration" source={source} resizeMode="contain"
          style={{ width: "100%", height: "100%" }} onError={() => setFailed(true)} />
      </View>
      <T variant="small" style={{ color: t.muted, fontSize: 11, lineHeight: 18 }}>
        KI-Illustration · künstlerische Interpretation. Gezeigter Abschnitt {artwork.passage}.
      </T>
    </View>
  );
}

export function StoryHero({ unit }: { unit: StoryUnit }) {
  const t = useTheme(), scene = SCENES.find((s) => s.id === unit.image);
  const artwork = projectStoryIllustrations[unit.id];
  const source = projectStoryAssets[unit.id]?.detail;
  if (artwork && source) return <ProjectStoryHero key={unit.id} unit={unit} artwork={artwork} source={source} />;
  if (scene || unit.image === "storm") return <View style={{ gap: 9 }}>
    <View style={{ borderRadius: 24, overflow: "hidden" }}>
      {scene ? <StoryArtwork scene={scene} context /> : <StormArt />}
    </View>
    <T variant="small" style={{ color: t.muted, fontSize: 10, lineHeight: 17 }}>
      KI-Illustration · künstlerische Interpretation. Fachfreigabe steht aus.
      {unit.id === "NS-0006" ? " Gezeigter Moment: 1. Mose 8,6–12." :
        unit.id === "NS-0052" ? " Gezeigter Moment: 1. Samuel 17,38–45." : ""}
    </T>
  </View>;
  return <StoryPlaceholder unit={unit} />;
}

function StoryPlaceholder({ unit }: { unit: StoryUnit }) {
  const t = useTheme();
  const first = getPassage(unit.references[0]!)[0];
  return <View testID="story-typographic-hero" style={{ backgroundColor: t.soft, borderWidth: 1, borderColor: t.line, borderRadius: 26, padding: 27, gap: 24, overflow: "hidden" }}>
    <T variant="label" style={{ color: t.gold, fontSize: 10 }}>{unit.kind === "Psalm" ? "EIN PSALM FÜR DEINEN WEG" : unit.kind === "Briefabschnitt" ? "WORTE ZUM WEITERDENKEN" : "EIN ABSCHNITT DER BIBEL"}</T>
    <T style={{ fontFamily: "Cormorant", fontSize: 34, lineHeight: 40 }}>{first?.text}</T>
    <T variant="small" style={{ color: t.muted, fontSize: 10 }}>{referenceLabel({ ...unit.references[0]!, to: first?.n })} · Lutherbibel 1912</T>
  </View>;
}
