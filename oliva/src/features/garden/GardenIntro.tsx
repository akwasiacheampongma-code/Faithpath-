import { useCallback, useState } from "react";
import { View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Button, Card, T } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { completeGardenIntro, isGardenIntroComplete } from "./garden-intro";

const growth = "Dein Baum wächst, wenn du einen Bibelabschnitt als gelesen markierst, Wegschritte abschließt und später Reflexionen oder gelebte Erfahrungen festhältst.";

export function GardenIntro({ onDismiss }: { onDismiss: () => void }) {
  const theme = useTheme();
  const [welcome, setWelcome] = useState(false);
  const [help, setHelp] = useState(false);

  useFocusEffect(useCallback(() => {
    let visiting = true;
    void isGardenIntroComplete().then((complete) => {
      if (visiting) setWelcome(!complete);
    });
    return () => { visiting = false; };
  }, []));

  if (welcome) return <Card testID="garden-intro" style={{ backgroundColor: theme.soft, marginBottom: 14, gap: 8 }}>
    <T variant="heading" accessibilityRole="header" aria-level={2} style={{ fontSize: 25, lineHeight: 29 }}>
      Willkommen in deinem Garten
    </T>
    <T style={{ color: theme.muted }}>Dein Olivenbaum erinnert an Worte und Erfahrungen auf deinem Weg.</T>
    <T testID="garden-growth-explanation" style={{ color: theme.muted }}>{growth}</T>
    <Button kind="ghost" icon={null} onPress={() => {
      void completeGardenIntro();
      setWelcome(false);
      onDismiss();
    }} style={{ alignSelf: "flex-start", paddingHorizontal: 0 }}>Zum Baum</Button>
  </Card>;

  return <View style={{ marginBottom: 12, gap: 6 }}>
    <Button kind="ghost" icon="info" selected={help} onPress={() => setHelp(!help)}
      style={{ alignSelf: "flex-start", maxWidth: "100%", paddingHorizontal: 0 }}>Wie wächst mein Baum?</Button>
    {help && <T testID="garden-growth-explanation" accessibilityLiveRegion="polite" style={{ color: theme.muted, maxWidth: 620 }}>
      {growth}
    </T>}
  </View>;
}
