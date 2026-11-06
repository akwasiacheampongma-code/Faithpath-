import { View, Image } from "react-native";
import { router } from "expo-router";
import { Shell } from "../src/components/Shell";
import { T, Button, IconButton, Tag, Card } from "../src/components/ui";
import { Icon } from "../src/components/Icon";
import { useTheme } from "../src/design-system/theme";
import { useApp } from "../src/state/store";
export default function Start() {
  const t = useTheme(),
    mutate = useApp((s) => s.mutate),
    busy = useApp((s) => s.busy);
  async function start() {
    if (
      await mutate((d) => {
        d.onboarded = true;
        d.activePath = "jesus";
      })
    )
      router.replace({
        pathname: "/lesen/[book]",
        params: {
          book: "MRK",
          chapter: 4,
          from: 35,
          to: 41,
          path: "jesus",
          step: 0,
        },
      });
  }
  return (
    <Shell>
      <View
        style={{ maxWidth: 700, width: "100%", alignSelf: "center", gap: 21 }}
      >
        <View style={{ alignItems: "flex-start" }}>
          <IconButton
            name="back"
            label="Zurück zu Heute"
            onPress={() => router.replace("/")}
          />
        </View>
        <Image
          source={require("../assets/images/storm-1280.webp")}
          style={{ width: "100%", height: 230, borderRadius: 22 }}
          resizeMode="cover"
          accessibilityLabel="Künstlerische Interpretation einer Bootsfahrt auf dem See von Galiläa"
        />
        <Tag icon="clock">Dein erster Moment · etwa 3 Minuten</Tag>
        <T
          variant="hero"
          accessibilityRole="header"
          style={{ fontSize: 44, lineHeight: 47 }}
        >
          Du darfst mit Fragen anfangen.
        </T>
        <T style={{ color: t.muted }}>
          Lerne Jesus in einer kurzen Geschichte kennen: Seine Freunde geraten
          in einen Sturm – und sprechen ihre Angst offen aus.
        </T>
        <View style={{ gap: 14 }}>
          {[
            [
              "book",
              "Lies eine echte Bibelstelle.",
              "Sieben Verse, die du in Ruhe entdecken kannst.",
            ],
            [
              "path",
              "Verstehe, was dahintersteckt.",
              "Ein Weg ist eine kurze, geführte Reise: lesen, verstehen und nachdenken.",
            ],
            [
              "leaf",
              "Komm jederzeit zurück.",
              "Dein Baum erinnert an Entdeckungen. Das Buchschwert zeigt gelesene Kapitel – keinen Wert deines Glaubens.",
            ],
          ].map(([icon, title, text]) => (
            <View
              key={title}
              style={{
                flexDirection: "row",
                gap: 15,
                alignItems: "flex-start",
              }}
            >
              <View
                style={{
                  padding: 10,
                  backgroundColor: t.soft,
                  borderRadius: 12,
                }}
              >
                <Icon name={icon as "book"} color={t.primary} />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <T style={{ fontSize: 13, fontWeight: "600" }}>{title}</T>
                <T style={{ fontSize: 12, color: t.muted, lineHeight: 20 }}>
                  {text}
                </T>
              </View>
            </View>
          ))}
        </View>
        <Button disabled={busy} onPress={() => void start()}>
          Geschichte lesen
        </Button>
        <T
          variant="small"
          style={{ color: t.muted, textAlign: "center", fontSize: 10 }}
        >
          Ohne Konto. Ohne Verpflichtung. Deine Gedanken bleiben auf diesem
          Gerät.
        </T>
      </View>
    </Shell>
  );
}
