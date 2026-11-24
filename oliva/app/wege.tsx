import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View, useWindowDimensions } from "react-native";
import { Shell } from "../src/components/Shell";
import { Button, T, Card } from "../src/components/ui";
import { PathCard } from "../src/components/PathCard";
import { PathListItem } from "../src/features/paths/PathListItem";
import { PathCategorySelect } from "../src/features/paths/PathCategorySelect";
import { PATHS } from "../src/features/paths/catalog";
import { useTheme } from "../src/design-system/theme";
import { DiscoverHeader } from "../src/features/discover/DiscoverHeader";
import { TopicLibrary } from "../src/features/topics/TopicLibrary";
import { StoryLibrary } from "../src/features/stories/StoryLibrary";

export default function Discover() {
  const { bereich } = useLocalSearchParams<{ bereich?: string }>();
  if (bereich === "geschichten") return <StoryLibrary sectionHeader={<DiscoverHeader current="geschichten" />} />;
  if (bereich === "themen") return <Shell header="compact"><DiscoverHeader current="themen" /><TopicLibrary embedded /></Shell>;
  return <Paths />;
}

const featuredPath = PATHS.find((path) => path.id === "jesus")!;

function Paths() {
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
    <Shell header="compact">
      <DiscoverHeader current="wege" />
      <T
        style={{
          color: t.muted,
          maxWidth: 650,
          fontSize: 14,
          lineHeight: 24,
          marginBottom: 16,
        }}
      >
        Ein Weg führt dich durch kurze Bibelabschnitte – mit Erklärungen und
        freiwilligen Gedanken. Du brauchst kein Vorwissen.
      </T>
      <PathCategorySelect value={filter} options={categories} onChange={setFilter} />
      <View style={{ alignItems: "flex-start", marginVertical: 8 }}>
        <Button kind="ghost" icon={null} onPress={() => router.push("/vorhaben")}>Deine persönlichen Vorhaben</Button>
      </View>
      {width < 600 && filter === "Alle Wege" && <PathListItem path={featuredPath} featured />}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: width < 600 ? 0 : 18 }}>
        {PATHS.filter(
          (p) => filter === "Alle Wege" ? width >= 600 || p.id !== featuredPath.id : p.category === filter,
        ).map((path) => (
          width < 600 ? <PathListItem key={path.id} path={path} /> : <PathCard
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
      <View style={{ borderTopWidth: 1, borderTopColor: t.line, marginTop: 28, paddingTop: 20, gap: 16 }}>
        <View style={{ gap: 6 }}>
          <T style={{ fontSize: 13 }}>Lesen → Verstehen → Nachdenken</T>
          <T style={{ fontSize: 12, lineHeight: 19, color: t.muted }}>
            Etwa 5 Minuten pro Schritt. Reflexion und Gebet sind immer freiwillig.
            Pausen sind willkommen.
          </T>
        </View>
        <Card style={{ gap: 10 }}>
          <T variant="heading">Ein Gedanke darf Alltag werden.</T>
          <T style={{ fontSize: 12, color: t.muted }}>
            Ein geführter Weg begleitet dich beim Lesen. Mit einem persönlichen
            Vorhaben hältst du deine eigenen kleinen Versuche und späteren
            Rückblicke fest.
          </T>
        </Card>
      </View>
    </Shell>
  );
}
