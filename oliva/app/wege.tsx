import { router } from "expo-router";
import { useState } from "react";
import { View, useWindowDimensions, Pressable } from "react-native";
import { Shell } from "../src/components/Shell";
import { T, Card, Tag, Button } from "../src/components/ui";
import { PathCard } from "../src/components/PathCard";
import { PATHS } from "../src/features/paths/catalog";
import { useTheme } from "../src/design-system/theme";
export default function Paths() {
  const t = useTheme(),
    { width } = useWindowDimensions(),
    [filter, setFilter] = useState("Alle Wege");
  const categories = [
    "Alle Wege",
    "Für deinen Anfang",
    "Bibel verstehen",
    "Glaube im Alltag",
    "Für deine Lebenssituation",
  ];
  return (
    <Shell>
      <Tag icon="path">Kleine Reisen. Neue Perspektiven.</Tag>
      <T
        variant="title"
        accessibilityRole="header"
        style={{ marginTop: 14, marginBottom: 10, fontSize: 44 }}
      >
        Du brauchst kein Vorwissen.
      </T>
      <T
        style={{
          color: t.muted,
          maxWidth: 650,
          fontSize: 14,
          lineHeight: 24,
          marginBottom: 26,
        }}
      >
        Ein Weg ist eine kleine, geführte Reise durch ein Thema der Bibel. Du
        liest kurze Abschnitte, bekommst verständliche Erklärungen und kannst
        über das Gelernte nachdenken.
      </T>
      <Card
        style={{
          backgroundColor: t.soft,
          borderWidth: 0,
          marginBottom: 28,
          padding: 21,
        }}
      >
        <T style={{ fontSize: 13 }}>Lesen → Verstehen → Nachdenken</T>
        <T style={{ fontSize: 11, color: t.muted, marginTop: 6 }}>
          Etwa 5 Minuten pro Schritt. Reflexion und Gebet sind immer freiwillig.
          Pausen sind willkommen.
        </T>
      </Card>
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        {categories.map((c) => (
          <Pressable
            key={c}
            accessibilityRole="button"
            accessibilityState={{ selected: c === filter }}
            onPress={() => setFilter(c)}
            style={{
              minHeight: 44,
              justifyContent: "center",
              paddingHorizontal: 15,
              paddingVertical: 9,
              borderRadius: 24,
              backgroundColor: c === filter ? t.primary : t.soft,
            }}
          >
            <T
              style={{
                fontSize: 11,
                color: c === filter ? t.onPrimary : t.text,
              }}
            >
              {c}
            </T>
          </Pressable>
        ))}
      </View>
      <Card style={{ gap: 12, marginBottom: 24 }}>
        <T variant="heading">Ein Gedanke darf Alltag werden.</T>
        <T style={{ fontSize: 12, color: t.muted }}>
          Ein geführter Weg begleitet dich beim Lesen. Mit einem persönlichen
          Vorhaben hältst du deine eigenen kleinen Versuche und späteren
          Rückblicke fest.
        </T>
        <Button
          kind="secondary"
          icon="leaf"
          onPress={() => router.push("/vorhaben")}
        >
          Deine persönlichen Vorhaben
        </Button>
      </Card>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 18 }}>
        {PATHS.filter(
          (p) => filter === "Alle Wege" || p.category === filter,
        ).map((path) => (
          <PathCard
            key={path.id}
            path={path}
            style={{
              minWidth: width < 600 ? "100%" : 240,
              maxWidth: width < 600 ? undefined : width >= 1100 ? "32%" : "48%",
              flexBasis: width < 600 ? "100%" : width >= 1100 ? "30%" : "45%",
            }}
          />
        ))}
      </View>
    </Shell>
  );
}
