import { View, useWindowDimensions, Pressable } from "react-native";
import { router } from "expo-router";
import { Shell } from "../src/components/Shell";
import {
  T,
  Button,
  Card,
  Tag,
  Progress,
} from "../src/components/ui";
import { Icon } from "../src/components/Icon";
import { PathCard } from "../src/components/PathCard";
import { useTheme } from "../src/design-system/theme";
import { useApp } from "../src/state/store";
import { PATHS, pathById } from "../src/features/paths/catalog";
import {
  bookByCode,
  getPassage,
  referenceLabel,
} from "../src/features/bible/repository";
import { countBookRead } from "../src/state/model";
import { dailyVerse } from "../src/features/bible/daily";
import { CaptureInput } from "../src/features/personal/CaptureInput";
import { dailySource } from "../src/features/personal/capture-model";
import { useVolatileDrafts } from "../src/features/personal/volatile-drafts";
import { InvitationHome } from "../src/features/invitations/InvitationHome";
import { JourneyIntro } from "../src/features/journey/JourneyIntro";
import { TodayEntry } from "../src/features/journey/TodayEntry";
export default function Home() {
  const showIntro = useApp((state) => state.freshProfile && !state.data.onboarded && state.data.revision === 0);
  return showIntro ? <JourneyIntro /> : <Today />;
}

function Today() {
  const t = useTheme(),
    { width } = useWindowDimensions(),
    columns = width >= 1180,
    data = useApp((s) => s.data),
    volatileKeys = useVolatileDrafts((s) =>
      JSON.stringify(Object.keys(s.items)),
    );
  const draftCount = new Set([
    ...data.drafts.map((d) => d.key),
    ...(JSON.parse(volatileKeys) as string[]),
  ]).size;
  const active = pathById(data.activePath ?? ""),
    book = bookByCode(data.reading.book),
    read = countBookRead(data, data.reading.book);
  const { ref: verseRef, text: verse } = dailyVerse();
  return (
    <Shell wide header="compact">
      <View
        style={{
          flexDirection: columns ? "row" : "column",
          gap: 24,
          alignItems: "flex-start",
        }}
      >
        <View
          style={{
            flex: 1,
            width: columns ? undefined : "100%",
            minWidth: 0,
            gap: 19,
          }}
        >
          <TodayEntry />
          <Card
            style={{
              borderWidth: 0,
              backgroundColor: t.soft,
              padding: 25,
              gap: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <T variant="label" style={{ fontSize: 9, color: t.gold }}>
                EIN WORT FÜR DEINEN TAG
              </T>
              <Icon name="sun" color={t.gold} size={17} />
            </View>
            <T
              style={{
                fontFamily: "Cormorant",
                fontSize: width < 600 ? 25 : 28,
                lineHeight: width < 600 ? 32 : 35,
              }}
            >
              {verse}
            </T>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <T variant="small" style={{ fontSize: 10, color: t.muted }}>
                {referenceLabel(verseRef)} · Luther 1912
              </T>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: "/lesen/[book]",
                    params: {
                      book: verseRef.book,
                      chapter: verseRef.chapter,
                      from: verseRef.from,
                      to: verseRef.to,
                      mode: "deep",
                    },
                  })
                }
                style={{ minHeight: 44, justifyContent: "center" }}
              >
                <T variant="small" style={{ fontSize: 10, color: t.primary }}>
                  Im Kontext lesen →
                </T>
              </Pressable>
            </View>
          </Card>
          <View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <T variant="heading" accessibilityRole="header" style={{ flex: 1, minWidth: 0 }}>
                {
                active ? active.kind === "life-topic" ? "Dein aktuelles Thema" : "Dein aktueller Weg" : "Ein Weg, der zu dir passt"
                }
              </T>
              <Pressable accessibilityRole="button" onPress={() => router.replace(active?.kind === "life-topic" ? "/themen" : "/wege")}
                style={{ minHeight: 44, justifyContent: "center", maxWidth: "100%" }}>
                <T style={{ fontSize: 12, color: t.primary }}>{active?.kind === "life-topic" ? "Alle Themen" : "Alle Wege"} →</T>
              </Pressable>
            </View>
            {!active && (
              <T
                style={{
                  fontSize: 12,
                  lineHeight: 20,
                  color: t.muted,
                  marginTop: -9,
                  marginBottom: 18,
                }}
              >
                Ein Weg ist eine kurze, geführte Reise durch ein Thema der
                Bibel. Lesen, verstehen und nachdenken – ganz ohne Vorwissen.
              </T>
            )}
            {active ? (
              <Card style={{ gap: 13 }}>
                <Tag icon="path">In deinem Tempo</Tag>
                <T variant="heading">{active.title}</T>
                <Progress
                  value={
                    data.completedSteps.filter((k) =>
                      k.startsWith(active.id + ":"),
                    ).length / active.steps.length
                  }
                  label="Wegfortschritt"
                />
                <Button
                  kind="secondary"
                  onPress={() =>
                    router.push({
                      pathname: "/weg/[id]",
                      params: { id: active.id },
                    })
                  }
                >
                  {active.kind === "life-topic" ? "Dein Thema fortsetzen" : "Deinen Weg fortsetzen"}
                </Button>
              </Card>
            ) : (
              <View
                style={{
                  flexDirection: width >= 720 ? "row" : "column",
                  gap: 14,
                }}
              >
                {[PATHS[0]!, PATHS[3]!, PATHS[5]!].map((path) => (
                  <PathCard key={path.id} path={path} />
                ))}
              </View>
            )}
          </View>
          <Card style={{ gap: 14 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Icon name="pen" color={t.gold} size={18} />
              <T variant="heading" style={{ fontSize: 25 }}>
                Ein Gedanke darf bleiben.
              </T>
            </View>
            <T style={{ color: t.muted, fontSize: 12 }}>
              Wofür möchtest du heute einen Moment dankbar sein?
            </T>
            <CaptureInput
              source={dailySource()}
              label="Deine freiwillige Tagesreflexion"
              placeholder="Hier ist Platz für deine Worte …"
            />
          </Card>
          <InvitationHome />
          {draftCount > 0 && (
            <Card style={{ gap: 12 }}>
              <T variant="heading">Deine angefangenen Worte.</T>
              <T variant="small" style={{ color: t.muted }}>
                {draftCount}{" "}
                {draftCount === 1 ? "Entwurf wartet" : "Entwürfe warten"} auf
                dich. Du kannst jederzeit in Ruhe weitermachen.
              </T>
              <Button
                kind="secondary"
                icon="pen"
                onPress={() => router.push("/sammlung?tab=Entwürfe")}
              >
                Deine Entwürfe ansehen
              </Button>
            </Card>
          )}
        </View>
        <View style={{ width: columns ? 264 : "100%", gap: 20 }}>
          <Card testID="home-current-book" style={{ padding: 21, gap: 10 }}>
            <T variant="label" style={{ color: t.muted, fontSize: 8 }}>
              DEIN AKTUELLES BUCH
            </T>
            <View style={{ gap: 9 }}>
              <Icon name="book" size={25} color={t.primary} />
              <T variant="heading" style={{ fontSize: 28 }}>{book?.name}</T>
              <T style={{ color: t.muted, fontSize: 12 }}>{book?.description}</T>
              <T variant="small" style={{ color: t.muted }}>{read} von {book?.chapters} Kapiteln gelesen</T>
              <Progress value={read / (book?.chapters ?? 1)} label="Lesefortschritt im aktuellen Buch" />
            </View>
            <Button
              kind="ghost"
              onPress={() =>
                router.push({
                  pathname: "/lesen/[book]",
                  params: {
                    book: data.reading.book,
                    chapter: data.reading.chapter,
                    from: data.reading.from,
                    to: data.reading.to,
                    mode: data.readingPosition?.mode,
                  },
                })
              }
            >
              {referenceLabel(data.reading)} lesen
            </Button>
            <Button
              kind="secondary"
              icon="arrow"
              style={{ paddingHorizontal: 8 }}
              onPress={() =>
                router.push({
                  pathname: "/buch/[book]",
                  params: { book: data.reading.book },
                })
              }
            >
              Kapitelübersicht öffnen
            </Button>
          </Card>
          <View style={{ padding: 16, gap: 9, alignItems: "center" }}>
            <Icon name="heart" size={17} color={t.gold} />
            <T
              style={{
                fontFamily: "Cormorant",
                fontSize: 21,
                lineHeight: 27,
                textAlign: "center",
                color: t.muted,
              }}
            >
              „Du musst nicht den ganzen Weg sehen. Nur den nächsten Schritt.“
            </T>
            <T style={{ fontSize: 8, color: t.muted }}>
              Ein Gedanke von OLIVA · kein Bibelzitat
            </T>
          </View>
        </View>
      </View>
      <T
        style={{
          marginTop: 32,
          fontSize: 9,
          textAlign: "center",
          color: t.muted,
        }}
      >
        OLIVA · Dein Glaube. Dein Tempo. Dein Weg.
      </T>
    </Shell>
  );
}
