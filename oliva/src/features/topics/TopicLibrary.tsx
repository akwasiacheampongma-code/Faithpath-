import { useState } from "react";
import { View, Pressable, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { T, Tag, Field, Button, Progress } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { useTheme } from "../../design-system/theme";
import { useApp } from "../../state/store";
import { filterTopics, TOPIC_CATEGORIES } from "../../features/topics/catalog";

export function TopicLibrary({ embedded = false }: { embedded?: boolean }) {
  const t = useTheme(), { width } = useWindowDimensions(), [query, setQuery] = useState("");
  const completed = useApp((s) => s.data.completedSteps), topics = filterTopics(query);
  return <View style={{ maxWidth: 920, width: "100%", alignSelf: "center", gap: 22 }}>
      {!embedded && <><View style={{ alignItems: "flex-start" }}><Button kind="ghost" icon="back" onPress={() => router.replace("/wege")}>Zu den Wegen</Button></View>
      <Tag icon="leaf">Worte für deinen Alltag</Tag>
      <T accessibilityRole="header" aria-level={1} variant="title" style={{ fontSize: 44, lineHeight: 48 }}>Was beschäftigt dich?</T>
      <T style={{ color: t.muted, maxWidth: 650 }}>Ein Thema verbindet zwei oder drei Bibelabschnitte mit einer Frage aus dem Leben. Du liest, bekommst eine kurze Einordnung und kannst einen eigenen Gedanken festhalten. Du brauchst kein Vorwissen.</T></>}
      {embedded && <T style={{ color: t.muted }}>Ein Thema aus dem Leben und passende Bibelabschnitte zum Nachdenken.</T>}
      <Field label="Ein Thema finden" placeholder="Zum Beispiel Angst, Ruhe oder Vergebung" value={query} onChangeText={setQuery} />
      <T variant="small" accessibilityLiveRegion="polite" style={{ color: t.muted }}>{topics.length} {topics.length === 1 ? "Thema" : "Themen"}</T>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
        {topics.map((topic, index) => {
          const count = completed.filter((key) => key.startsWith(topic.id + ":")).length;
          const feature = !embedded || (!query.trim() && index === 0);
          return <Pressable key={topic.id} accessibilityRole="button" accessibilityLabel={topic.title + ", " + topic.steps.length + " Bibelabschnitte"}
            onPress={() => router.push({ pathname: "/weg/[id]", params: { id: topic.id } })}
            style={({ pressed }) => ({ width: width >= 800 ? "48%" : "100%", minHeight: feature ? 148 : 72, padding: feature ? 19 : 10, borderBottomWidth: 1, borderWidth: feature ? 1 : 0, borderColor: t.line, borderRadius: feature ? 20 : 0, backgroundColor: feature ? t.surface : "transparent", gap: feature ? 8 : 4, opacity: pressed ? 0.75 : 1 })}>
            <T variant="label" style={{ fontSize: 9, color: t.gold }}>{TOPIC_CATEGORIES[topic.category]}</T>
            <T variant="heading" style={{ fontSize: feature ? 28 : 24, lineHeight: feature ? 32 : 27 }}>{topic.title}</T>
            <T variant="small" style={{ color: t.muted, lineHeight: 22 }}>{topic.subtitle}</T>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 15 }}>
              <T variant="small" style={{ color: t.primary }}>{topic.steps.length} Bibelabschnitte · in deinem Tempo</T>
              <Icon name="arrow" size={17} color={t.primary} />
            </View>
            {count > 0 && <Progress value={count / topic.steps.length} label={`${count} von ${topic.steps.length} Abschnitten abgeschlossen`} />}
          </Pressable>;
        })}
      </View>
      {topics.length === 0 && <Button kind="secondary" onPress={() => setQuery("")}>Alle 18 Themen ansehen</Button>}
      <T variant="small" style={{ color: t.muted }}>18 Originalthemen · 45 Bibelstellen, Einordnungen und freiwillige Reflexionsfragen aus der FaithPath-Vorarbeit. Originaltexte und zusätzliche OLIVA-Hinweise sind gekennzeichnet. Deine persönliche Entwicklung ist kein Wettbewerb.</T>
    </View>;
}
