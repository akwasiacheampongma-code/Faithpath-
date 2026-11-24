import { useMemo, useRef, useState, type ComponentRef } from "react";
import { View, Pressable, ScrollView, useWindowDimensions, type Text } from "react-native";
import { router } from "expo-router";
import { Shell } from "../src/components/Shell";
import { T, Card, Button } from "../src/components/ui";
import { OliveTree } from "../src/components/Artwork";
import { STAGES } from "../src/features/garden/model";
import { GardenIntro } from "../src/features/garden/GardenIntro";
import { focusReaderControl } from "../src/features/bible/flow/focus";
import { TreeStill } from "../src/features/garden/TreeStill";
import { useApp } from "../src/state/store";
import { useTheme } from "../src/design-system/theme";
import { CaptureInput } from "../src/features/personal/CaptureInput";
import { EXPERIENCE_QUESTION } from "../src/features/personal/capture-model";
import { personalTreeHistory, personalTreeLinks } from "../src/features/garden/personal-history";
import { PersonalTreeJourney, PersonalTreePins } from "../src/features/garden/PersonalTreeJourney";
import { LegacyGardenHistory } from "../src/features/imports/LegacyGardenHistory";
import { a51Stage, treeLayout } from "../src/features/garden/a51/stages";
export default function Garden() {
  const treeTitle = useRef<ComponentRef<typeof Text>>(null);
  const gardenScroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const t = useTheme(),
    { width, fontScale } = useWindowDimensions(),
    data = useApp((s) => s.data),
    [preview, setPreview] = useState<number | null>(null),
    [gallery, setGallery] = useState(false),
    [loadedStage, setLoadedStage] = useState<number | null>(null),
    stage = preview ?? data.growthStage,
    treeSize = Math.min(width - 90, stage === 0 && width < 600 ? 198 : 380),
    treeHeight = Math.max(120, treeLayout(a51Stage(stage), treeSize).height),
    history = useMemo(() => personalTreeHistory(data), [data.goals, data.notes, data.growthStage]),
    links = preview === null && loadedStage === data.growthStage ? personalTreeLinks(history, treeSize, fontScale, treeHeight) : [];
  function showTree() {
    requestAnimationFrame(() => {
      gardenScroll.current?.scrollTo({ y: 0, animated: false });
      focusReaderControl(treeTitle.current);
    });
  }

  return (
    <Shell scrollRef={gardenScroll}>
      <T
        variant="title"
        accessibilityRole="header"
        style={{ fontSize: 34, lineHeight: 40, marginBottom: 6 }}
      >
        Mein Garten.
      </T>
      <GardenIntro onDismiss={showTree} />
        <Card
          style={{
            alignItems: "center",
            paddingVertical: 16,
            paddingHorizontal: 12,
            backgroundColor: t.soft,
            borderWidth: 0,
            gap: 10,
          }}
        >
          <T ref={treeTitle} tabIndex={-1} variant="label" style={{ color: t.gold, fontSize: 9 }}>
            {preview === null
              ? "DEIN BAUM HEUTE"
              : "VORSCHAU · KEIN EIGENER FORTSCHRITT"}
          </T>
          <View style={{ width: treeSize }}>
            <OliveTree stage={stage} size={treeSize} onReady={setLoadedStage} />
            <PersonalTreePins links={links} />
          </View>
          <T variant="title" style={{ fontSize: 30, lineHeight: 36, textAlign: "center" }}>{STAGES[stage]?.name}</T>
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
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: gallery }}
            aria-controls={gallery ? "garden-stage-picker" : undefined}
            onPress={() => setGallery(!gallery)}
            style={{ minHeight: 48, justifyContent: "center", paddingHorizontal: 12 }}
          >
            <T style={{ color: t.primary, textAlign: "center" }}>
              {gallery ? "Vorschau schließen" : "Alle sieben Baumstadien ansehen"}
            </T>
          </Pressable>
          {gallery && (
            <View nativeID="garden-stage-picker" role="group" accessibilityLabel="Baumstadien"
              style={{ width: "100%", gap: 12 }}>
              <T style={{ fontSize: 12, color: t.muted, textAlign: "center" }}>
                Sieben Bilder einer Geschichte. Jedes hat seinen eigenen Wert.
              </T>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 10,
                  justifyContent: "center",
                }}
              >
                {STAGES.map((s, i) => (
                  <Pressable
                    key={i}
                    accessibilityRole="button"
                    accessibilityLabel={`Baumstadium ${i + 1} ansehen: ${s.name}`}
                    accessibilityState={{ selected: i === stage }}
                    aria-pressed={i === stage}
                    onPress={() => {
                      setPreview(i);
                      setGallery(false);
                      showTree();
                    }}
                    style={{
                      width: Math.min(145, (width - 110) / 2),
                      alignItems: "center",
                      padding: 12,
                      gap: 8,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: i === stage ? t.gold : t.line,
                      backgroundColor: t.surface,
                    }}
                  >
                    <TreeStill
                      stage={i}
                      size={Math.min(112, (width - 160) / 2)}
                    />
                    <T
                      style={{
                        fontSize: 11,
                        textAlign: "center",
                        lineHeight: 17,
                      }}
                    >
                      {s.name}
                    </T>
                    {i === data.growthStage && (
                      <T style={{ fontSize: 9, color: t.gold }}>
                        Dein Baum heute
                      </T>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </Card>
      <LegacyGardenHistory />
      <PersonalTreeJourney model={history} links={links} />
      <View style={{ marginTop: 24, alignItems: "flex-start" }}>
        <Button
          kind="ghost"
          icon="leaf"
          style={{ paddingHorizontal: 0 }}
          onPress={() => router.push("/vorhaben")}
        >
          Deine persönlichen Vorhaben
        </Button>
      </View>
      <View style={{ marginTop: 22, paddingTop: 18, borderTopWidth: 1, borderColor: t.line, gap: 10 }}>
        <T variant="heading">Ein kleiner Moment im Alltag</T>
        <T style={{ fontSize: 13, color: t.muted }}>
          Wenn du möchtest, halte eine Erfahrung oder einen kleinen Schritt fest.
        </T>
        <CaptureInput
          source={{ type: "experience", question: EXPERIENCE_QUESTION }}
          label="Eine freiwillig gelebte Erfahrung"
          placeholder="Was hast du erlebt?"
        />
      </View>
      <View style={{ marginTop: 16, alignItems: "flex-start" }}>
        <Button kind="ghost" style={{ paddingHorizontal: 0 }} onPress={() => router.replace("/wege")}>
          Einen neuen Gedanken entdecken
        </Button>
      </View>
      <View style={{ marginTop: 26, paddingTop: 18, borderTopWidth: 1, borderColor: t.line, gap: 8 }}>
        <T variant="heading" style={{ fontSize: 24, lineHeight: 29 }}>Was die Bilder bedeuten</T>
        <T variant="small" style={{ color: t.muted }}>
          Samen stehen für den Anfang, Wurzeln für das Fundament und der Stamm für Beständigkeit.
          Zweige erinnern an neue Erkenntnisse, Blätter an vertraute Texte und Früchte an gelebte Werte.
        </T>
        <T variant="small" style={{ color: t.muted }}>
          Dein Baum bewahrt Erinnerungen. Gottes Liebe gilt dir auch in jeder Pause.
        </T>
      </View>
    </Shell>
  );
}
