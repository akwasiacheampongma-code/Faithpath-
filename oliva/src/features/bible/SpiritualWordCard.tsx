import { useState } from "react";
import { Image, View, Pressable } from "react-native";
import { router } from "expo-router";
import { Card, T, Button } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { WORD_REFERENCE, WORD_CONTEXT, WORD_EXCERPT, WORD_OLIVA_CONTEXT } from "./spiritual-word";

/** One static symbol. No book, chapter count, progress or reward inputs. */
export function SpiritualWordCard() {
  const t = useTheme();
  const [attempt, setAttempt] = useState(0), [failed, setFailed] = useState(false);
  return (
    <Card testID="spiritual-word-card" style={{ gap: 14, padding: 20, backgroundColor: t.soft, borderWidth: 0 }}>
      <T variant="label" style={{ color: t.gold, fontSize: 9 }}>GOTTES WORT TRÄGT</T>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <View testID="spiritual-sword-artwork"
          accessibilityRole={failed ? undefined : "image"}
          accessibilityLabel={failed ? undefined : "Ein friedliches Schwert als Symbol für Gottes Wort"}
          style={{ width: 80, height: 120, flexShrink: 0 }}>
          {!failed && <Image
            key={attempt}
            testID="spiritual-sword-image"
            accessible={false}
            aria-hidden={true}
            source={require("../../../assets/spiritual-sword/word-sword-512.png")}
            resizeMode="contain"
            fadeDuration={0}
            onError={() => setFailed(true)}
            style={{ width: 80, height: 120 }}
          />}
          {failed && <View style={{ gap: 4, justifyContent: "center", flex: 1 }}>
            <T variant="small" accessibilityRole="status">Bild gerade nicht verfügbar.</T>
            <Button kind="ghost" icon={null} style={{ paddingHorizontal: 0 }} onPress={() => { setFailed(false); setAttempt(n => n + 1); }}>Bild laden</Button>
          </View>}
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Epheser 6,17 lesen"
          onPress={() => router.push({ pathname: "/lesen/[book]", params: { ...WORD_REFERENCE } })}
          style={{ flex: 1, minWidth: 0, gap: 8, minHeight: 44 }}>
          <T style={{ fontFamily: "Cormorant", fontSize: 22, lineHeight: 27 }}>{WORD_EXCERPT}</T>
          <T variant="small" style={{ color: t.gold }}>Epheser 6,17 ↗</T>
          <T variant="small" style={{ color: t.muted, fontSize: 10 }}>Lutherbibel 1912 · wörtlicher Auszug</T>
        </Pressable>
      </View>
      <View style={{ gap: 5 }}>
        <T variant="label" style={{ fontSize: 8, color: t.muted }}>OLIVA-EINORDNUNG</T>
        <T style={{ fontSize: 13, lineHeight: 21 }}>{WORD_OLIVA_CONTEXT}</T>
        <T variant="small" style={{ color: t.muted }}>Der Zusammenhang spricht von Wahrheit, Frieden und Gebet. Das Symbol richtet sich nicht gegen Menschen.</T>
      </View>
      <Button kind="ghost" icon="book" style={{ alignSelf: "flex-start", paddingHorizontal: 0 }} onPress={() => router.push({ pathname: "/lesen/[book]", params: { ...WORD_CONTEXT } })}>Epheser 6,10–18 lesen</Button>
    </Card>
  );
}
