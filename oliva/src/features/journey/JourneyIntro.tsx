import { useEffect, useRef, useState } from "react";
import { Image, Text, useWindowDimensions, View } from "react-native";
import { Shell } from "../../components/Shell";
import { Button, Card, T } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { useApp } from "../../state/store";
import { focusReaderControl } from "../bible/flow/focus";
import { TreeStill } from "../garden/TreeStill";

const steps = [
  { title: "Gottes Wort entdecken", text: "Lies in der Bibel und finde Worte, die dich durch deinen Alltag begleiten." },
  { title: "Deine Gedanken festhalten", text: "Nimm dir Zeit für Fragen, Gebete und das, was dich persönlich bewegt." },
  { title: "Deinen Weg wachsen sehen", text: "Dein Olivenbaum begleitet dich. Deine Gedanken und Erfahrungen bleiben Teil deiner Geschichte." },
] as const;

export function JourneyIntro({ onClose }: { onClose?: () => void }) {
  const [step, setStep] = useState(0);
  const heading = useRef<React.ComponentRef<typeof Text>>(null);
  const moved = useRef(false);
  const { width } = useWindowDimensions();
  const busy = useApp((state) => state.busy);
  const t = useTheme();
  const current = steps[step]!;
  const last = step === steps.length - 1;

  useEffect(() => {
    if (!moved.current) return;
    const frame = requestAnimationFrame(() => focusReaderControl(heading.current));
    return () => cancelAnimationFrame(frame);
  }, [step]);

  function move(next: number) {
    moved.current = true;
    setStep(next);
  }

  async function finish() {
    if (await useApp.getState().finishIntro()) onClose?.();
  }

  const words = <View style={{ gap: 10 }}>
    <T ref={heading} tabIndex={-1} variant="title" accessibilityRole="header" aria-level={1}>
      {current.title}
    </T>
    <T style={{ maxWidth: 430, color: t.muted }}>{current.text}</T>
  </View>;

  return <Shell header="intro">
    <View testID="journey-intro" style={{ alignSelf: "center", width: "100%", maxWidth: 520, gap: 16 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <T accessibilityLiveRegion="polite" variant="small" style={{ color: t.gold, fontWeight: "700" }}>
          Schritt {step + 1} von {steps.length}
        </T>
        <Button kind="ghost" icon={null} disabled={busy} onPress={() => void finish()}>Überspringen</Button>
      </View>
      {step === 0 && <View style={{ gap: 5 }}>
        <Image source={require("../../../assets/images/storm-1280.webp")} resizeMode="cover"
          accessibilityLabel="Boot auf dem See von Galiläa im Sturm" accessible
          style={{ width: "100%", height: width <= 340 ? 128 : 170, borderRadius: 20 }} />
        <T variant="small" style={{ color: t.muted, alignSelf: "flex-end" }}>Künstlerische Interpretation</T>
      </View>}
      {last && <View style={{ alignItems: "center", backgroundColor: t.soft, borderRadius: 20 }}>
        <TreeStill stage={0} size={168} compact />
      </View>}
      {step === 1 ? <Card style={{ backgroundColor: t.soft, borderLeftWidth: 3, borderLeftColor: t.gold }}>{words}</Card> : words}
      <Button disabled={busy} onPress={() => last ? void finish() : move(step + 1)}>
        {last ? "OLIVA entdecken" : "Weiter"}
      </Button>
      {step > 0 && <Button kind="ghost" icon="back" style={{ alignSelf: "flex-start" }} onPress={() => move(step - 1)}>
        Zurück
      </Button>}
    </View>
  </Shell>;
}
