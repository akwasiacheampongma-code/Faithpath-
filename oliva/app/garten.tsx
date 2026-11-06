import { useState } from "react";
import { View, Pressable, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { Shell } from "../src/components/Shell";
import { T, Card, Button, Tag } from "../src/components/ui";
import { OliveTree } from "../src/components/Artwork";
import { Icon } from "../src/components/Icon";
import { STAGES } from "../src/features/garden/model";
import { useApp } from "../src/state/store";
import { useTheme } from "../src/design-system/theme";
import { CaptureInput } from "../src/features/personal/CaptureInput";
import { EXPERIENCE_QUESTION } from "../src/features/personal/capture-model";
export default function Garden() {
  const t = useTheme(),
    { width } = useWindowDimensions(),
    data = useApp((s) => s.data),
    [preview, setPreview] = useState<number | null>(null),
    stage = preview ?? data.growthStage;
  return (
    <Shell>
      <Tag icon="leaf">Dein persönlicher Garten</Tag>
      <T
        variant="title"
        accessibilityRole="header"
        style={{ fontSize: 44, marginTop: 14, marginBottom: 10 }}
      >
        Wachsen braucht Zeit.
      </T>
      <T
        style={{
          color: t.muted,
          fontSize: 13,
          maxWidth: 620,
          marginBottom: 28,
        }}
      >
        Dein Olivenbaum erinnert an gelesene Worte, neue Erkenntnisse und
        freiwillig festgehaltene Erfahrungen. Er misst weder deinen Glauben noch
        Gottes Liebe.
      </T>
      <View
        style={{
          flexDirection: width >= 1180 ? "row" : "column",
          gap: 24,
          alignItems: "stretch",
        }}
      >
        <Card
          style={{
            flex: 1,
            alignItems: "center",
            padding: 26,
            backgroundColor: t.soft,
            borderWidth: 0,
            gap: 10,
          }}
        >
          <T variant="label" style={{ color: t.gold, fontSize: 9 }}>
            {preview === null
              ? "DEIN BAUM HEUTE"
              : "VORSCHAU · KEIN EIGENER FORTSCHRITT"}
          </T>
          <OliveTree stage={stage} size={Math.min(width - 90, 380)} />
          <T variant="title">{STAGES[stage]?.name}</T>
          <T
            style={{
              textAlign: "center",
              fontSize: 13,
              color: t.muted,
              maxWidth: 370,
            }}
          >
            {STAGES[stage]?.meaning}
          </T>
          {preview !== null && (
            <Button kind="ghost" onPress={() => setPreview(null)}>
              Zurück zu deinem Baum
            </Button>
          )}
          <View
            style={{
              flexDirection: "row",
              gap: 7,
              marginVertical: 8,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {STAGES.map((s, i) => (
              <Pressable
                key={i}
                accessibilityRole="button"
                accessibilityLabel={`Stadium ${i + 1} ansehen: ${s.name}`}
                accessibilityState={{ selected: i === stage }}
                onPress={() => setPreview(i)}
                style={{
                  width: 34,
                  height: 44,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    width: i === stage ? 25 : 8,
                    height: 8,
                    borderRadius: 5,
                    backgroundColor: i === stage ? t.gold : t.line,
                  }}
                />
              </Pressable>
            ))}
          </View>
          <T style={{ fontSize: 10, color: t.muted, textAlign: "center" }}>
            Du kannst die sieben Bilder ansehen, ohne deinen Fortschritt zu
            verändern.
          </T>
        </Card>
        <View style={{ width: width >= 1180 ? 310 : "100%", gap: 18 }}>
          <Card style={{ gap: 15 }}>
            <T variant="heading">Was die Bilder bedeuten</T>
            {[
              ["Samen", "Ein Anfang ist schon wertvoll."],
              ["Wurzeln", "Ein Fundament zum Weiterdenken."],
              ["Stamm", "Beständigkeit in deinem Tempo."],
              ["Zweige", "Neue Zusammenhänge entdecken."],
              ["Blätter", "Mit den Texten vertrauter werden."],
              ["Früchte", "Freiwillig gelebte Werte."],
            ].map(([title, text]) => (
              <View key={title} style={{ gap: 2 }}>
                <T style={{ fontSize: 12, fontWeight: "600" }}>{title}</T>
                <T style={{ fontSize: 11, color: t.muted }}>{text}</T>
              </View>
            ))}
          </Card>
          <Card style={{ backgroundColor: t.goldSoft, borderWidth: 0, gap: 8 }}>
            <Icon name="heart" color={t.gold} />
            <T variant="heading" style={{ fontSize: 25 }}>
              Du musst nichts verdienen.
            </T>
            <T style={{ fontSize: 12, lineHeight: 21 }}>
              Dein Baum verliert in einer Pause keine Blätter. Es gibt keine
              Rangliste und keine verlorene Serie. Gottes Liebe ist kein
              Aktivitätsbonus.
            </T>
          </Card>
        </View>
      </View>
      <Card style={{ marginTop: 24, gap: 13 }}>
        <T variant="heading">Was möchtest du im Alltag ausprobieren?</T>
        <T style={{ fontSize: 12, color: t.muted }}>
          Deine persönlichen Vorhaben verbinden kleine, selbst gewählte Schritte
          mit freiwilligen Rückblicken. Sie dürfen sich verändern und auch eine
          Pause machen.
        </T>
        <Button
          kind="secondary"
          icon="leaf"
          onPress={() => router.push("/vorhaben")}
        >
          Deine persönlichen Vorhaben
        </Button>
      </Card>
      <Card style={{ marginTop: 24, gap: 15 }}>
        <T variant="heading">Ein kleiner Moment im Alltag</T>
        <T style={{ fontSize: 13, color: t.muted }}>
          Hast du etwas bewusst ausprobiert – zugehört, geholfen oder Frieden
          gesucht? Wenn du möchtest, halte deine Erfahrung fest. Die App
          entscheidet nicht, ob sie „gut genug“ war.
        </T>
        <CaptureInput
          source={{ type: "experience", question: EXPERIENCE_QUESTION }}
          label="Eine freiwillig gelebte Erfahrung"
          placeholder="Was hast du erlebt?"
        />
      </Card>
      <View style={{ marginTop: 25, alignItems: "flex-start" }}>
        <Button kind="ghost" onPress={() => router.replace("/wege")}>
          Einen neuen Gedanken entdecken
        </Button>
      </View>
    </Shell>
  );
}
