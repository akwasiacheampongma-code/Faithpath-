import { Image, View, Pressable } from "react-native";
import { router } from "expo-router";
import { Shell } from "../src/components/Shell";
import {
  T,
  Button,
  Card,
  Progress,
} from "../src/components/ui";
import { Icon } from "../src/components/Icon";
import { artSources } from "../src/components/PathCard";
import { useTheme } from "../src/design-system/theme";
import { useApp } from "../src/state/store";
import { PATHS, pathById, type LearningPath } from "../src/features/paths/catalog";
import {
  bookByCode,
  referenceLabel,
} from "../src/features/bible/repository";
import { countBookRead } from "../src/state/model";
import { dailyVerse } from "../src/features/bible/daily";
import { CaptureInput } from "../src/features/personal/CaptureInput";
import { dailySource } from "../src/features/personal/capture-model";
import { useVolatileDrafts } from "../src/features/personal/volatile-drafts";
import { InvitationHome } from "../src/features/invitations/InvitationHome";
import { JourneyIntro } from "../src/features/journey/JourneyIntro";
import { TodayEntry, TodayGarden } from "../src/features/journey/TodayEntry";
export default function Home() {
  const showIntro = useApp((state) => state.freshProfile && !state.data.onboarded && state.data.revision === 0);
  return showIntro ? <JourneyIntro /> : <Today />;
}

const topics = ["faithpath-topic-angst", "faithpath-topic-streit", "faithpath-topic-einsam"]
  .flatMap((id) => {
    const path = pathById(id);
    return path ? [path] : [];
  });

function Today() {
  const t = useTheme();
  const data = useApp((s) => s.data);
  const volatileKeys = useVolatileDrafts((s) => JSON.stringify(Object.keys(s.items)));
  const draftCount = new Set([...data.drafts.map((d) => d.key), ...(JSON.parse(volatileKeys) as string[])]).size;
  const active = pathById(data.activePath ?? "");
  const book = bookByCode(data.reading.book);
  const chaptersRead = countBookRead(data, data.reading.book);
  const { ref: verseRef, text: verse } = dailyVerse();

  return <Shell header="compact">
    <View style={{ width: "100%", maxWidth: 690, alignSelf: "center", gap: 20 }}>
      <TodayEntry />
      <View style={{ gap: 7 }} testID="home-daily-verse">
        <T variant="label" style={{ color: t.gold }}>Wort für heute</T>
        <T variant="heading" style={{ fontSize: 25, lineHeight: 31 }}>{verse}</T>
        <Pressable accessibilityRole="button" accessibilityLabel="Im Kontext lesen"
          onPress={() => router.push({ pathname: "/lesen/[book]", params: { ...verseRef, mode: "deep" } })}
          style={{ minHeight: 44, justifyContent: "center", alignSelf: "flex-start" }}>
          <T variant="small" style={{ color: t.primary, fontWeight: "600" }}>
            {referenceLabel(verseRef)} · Luther 1912 →
          </T>
        </Pressable>
      </View>
      <TodayGarden />
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
          <T variant="heading" accessibilityRole="header" aria-level={2} style={{ flexShrink: 1 }}>
            {active ? active.kind === "life-topic" ? "Dein aktuelles Thema" : "Dein aktueller Weg" : "Ein guter Anfang"}
          </T>
          <Button kind="ghost" icon={null} style={{ paddingHorizontal: 4 }}
            onPress={() => router.push(active?.kind === "life-topic" ? "/themen" : "/wege")}>
            {active?.kind === "life-topic" ? "Alle Themen" : "Alle Wege"}
          </Button>
        </View>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {active ? <TodayPath path={active} active /> : PATHS.slice(0, 3).map((path, index) => (
            <TodayPath key={path.id} path={path} divided={index > 0} />
          ))}
        </Card>
      </View>
      <View style={{ gap: 6 }}>
        <T variant="heading" accessibilityRole="header" aria-level={2}>Was beschäftigt dich?</T>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}>
          {topics.map((topic) => (
            <Button key={topic.id} kind="secondary" icon={null} style={{ paddingHorizontal: 12, maxWidth: "100%" }}
              onPress={() => router.push({ pathname: "/weg/[id]", params: { id: topic.id } })}>{topic.title}</Button>
          ))}
          <Button kind="ghost" icon={null} style={{ paddingHorizontal: 8 }} onPress={() => router.push("/themen")}>Alle Lebensthemen</Button>
        </View>
      </View>
      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Icon name="pen" color={t.gold} size={18} />
          <T variant="heading" style={{ fontSize: 25, flexShrink: 1 }}>Ein Gedanke darf bleiben.</T>
        </View>
        <T style={{ color: t.muted, fontSize: 12 }}>Wofür möchtest du heute einen Moment dankbar sein?</T>
        <CaptureInput source={dailySource()} label="Deine freiwillige Tagesreflexion" placeholder="Hier ist Platz für deine Worte …" />
      </Card>
      <InvitationHome />
      {draftCount > 0 && <Card style={{ gap: 12 }}>
        <T variant="heading">Deine angefangenen Worte.</T>
        <T variant="small" style={{ color: t.muted }}>{draftCount} {draftCount === 1 ? "Entwurf wartet" : "Entwürfe warten"} auf dich.</T>
        <Button kind="secondary" icon="pen" onPress={() => router.push("/sammlung?tab=Entwürfe")}>Deine Entwürfe ansehen</Button>
      </Card>}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Button kind="ghost" icon={null} style={{ paddingHorizontal: 4 }} onPress={() => router.push("/sammlung")}>Meine Notizen</Button>
      </View>
      {book && <Card testID="home-current-book" style={{ padding: 13, gap: 6 }}>
        <T variant="small">{book.name} · {chaptersRead} von {book.chapters} Kapiteln gelesen</T>
        <Progress value={chaptersRead / book.chapters} label="Lesefortschritt im aktuellen Buch" />
        <Button kind="ghost" icon={null} style={{ alignSelf: "flex-start", paddingHorizontal: 0 }} onPress={() => router.push({
          pathname: "/buch/[book]", params: { book: book.code },
        })}>Kapitelübersicht öffnen</Button>
      </Card>}
    </View>
  </Shell>;
}

function TodayPath({ path, active = false, divided = false }: { path: LearningPath; active?: boolean; divided?: boolean }) {
  const t = useTheme();
  const completed = useApp((s) => s.data.completedSteps.filter((step) => step.startsWith(path.id + ":")).length);

  return <Pressable accessibilityRole="button"
    accessibilityLabel={active ? `${path.kind === "life-topic" ? "Dein Thema" : "Deinen Weg"} fortsetzen: ${path.title}` : path.title}
    onPress={() => router.push({ pathname: "/weg/[id]", params: { id: path.id } })}
    style={({ pressed }) => ({
      flexDirection: "row", alignItems: "center", gap: 12, minHeight: 68, padding: 12,
      borderTopWidth: divided ? 1 : 0, borderTopColor: t.line, backgroundColor: pressed ? t.soft : t.surface,
    })}>
    <Image accessible={false} source={artSources[path.art]} style={{ width: 46, height: 46, borderRadius: 9 }} />
    <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
      <T style={{ fontWeight: "600" }}>{path.title}</T>
      <T variant="small" style={{ color: t.muted }}>
        {active ? `${completed} von ${path.steps.length} Schritten` : path.subtitle}
      </T>
      {active && <Progress value={completed / path.steps.length} label="Wegfortschritt" />}
    </View>
    <Icon name="chevron" size={16} color={t.muted} />
  </Pressable>;
}
