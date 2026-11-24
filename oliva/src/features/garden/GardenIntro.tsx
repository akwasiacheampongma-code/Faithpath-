import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Button, Card, T } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { claimGardenIntro } from "./garden-intro";

export function GardenIntro({ onDismiss }: { onDismiss: () => void }) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  useFocusEffect(useCallback(() => {
    let visiting = true;
    setVisible(false);
    void claimGardenIntro(() => visiting).then((show) => {
      if (show && visiting) setVisible(true);
    });
    return () => { visiting = false; };
  }, []));

  if (!visible) return <T style={{ color: theme.muted, fontSize: 13, maxWidth: 620, lineHeight: 21, marginBottom: 16 }}>
    Dein Olivenbaum erinnert an Worte und Erfahrungen auf deinem Weg.
  </T>;

  return <Card testID="garden-intro" style={{ backgroundColor: theme.soft, marginBottom: 14, gap: 7 }}>
    <T variant="heading" accessibilityRole="header" aria-level={2} style={{ fontSize: 25, lineHeight: 29 }}>
      Willkommen in deinem Garten
    </T>
    <T style={{ color: theme.muted, fontSize: 14, lineHeight: 21 }}>
      Dein Olivenbaum erinnert dich an Bibelworte und Erfahrungen. Du kannst ihn einfach ansehen und in deinem Tempo weitergehen.
    </T>
    <Button kind="ghost" icon={null} onPress={() => { setVisible(false); onDismiss(); }}
      style={{ alignSelf: "flex-start", paddingHorizontal: 0 }}>Zum Baum</Button>
  </Card>;
}
