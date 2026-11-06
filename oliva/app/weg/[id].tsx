import { useState } from "react";
import { View, Pressable, Image } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Shell } from "../../src/components/Shell";
import {
  T,
  Button,
  Card,
  Tag,
  Progress,
  Field,
  IconButton,
} from "../../src/components/ui";
import { Icon } from "../../src/components/Icon";
import { artSources } from "../../src/components/PathCard";
import { useTheme } from "../../src/design-system/theme";
import { useApp } from "../../src/state/store";
import { PATHS, pathById } from "../../src/features/paths/catalog";
import { referenceLabel } from "../../src/features/bible/repository";
import { finishStep } from "../../src/state/model";
export default function PathDetail() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    path = pathById(id),
    t = useTheme(),
    data = useApp((s) => s.data),
    mutate = useApp((s) => s.mutate),
    busy = useApp((s) => s.busy);
  const first =
    path?.steps.findIndex(
      (_, i) => !data.completedSteps.includes(`${id}:${i}`),
    ) ?? 0;
  const [selected, setSelected] = useState(Math.max(0, first)),
    [thought, setThought] = useState(""),
    [prayer, setPrayer] = useState(false),
    [justFinished, setJustFinished] = useState(false);
  if (!path)
    return (
      <Shell>
        <Card>
          <T variant="heading">Diesen Weg gibt es noch nicht.</T>
          <Button onPress={() => router.replace("/wege")}>
            Alle Wege ansehen
          </Button>
        </Card>
      </Shell>
    );
  const step = path.steps[selected]!,
    key = `${id}:${selected}`,
    read = data.readSteps.includes(key),
    done = data.completedSteps.includes(key),
    completed = path.steps.filter((_, i) =>
      data.completedSteps.includes(`${id}:${i}`),
    ).length,
    allDone = completed === path.steps.length;
  async function readStep() {
    if (
      await mutate((d) => {
        d.activePath = id;
        d.onboarded = true;
      })
    )
      router.push({
        pathname: "/lesen/[book]",
        params: {
          book: step.ref.book,
          chapter: step.ref.chapter,
          from: step.ref.from,
          to: step.ref.to,
          path: id,
          step: selected,
        },
      });
  }
  async function complete() {
    const now = new Date().toISOString(),
      noteId = `reflection-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    if (
      await mutate((d) => {
        finishStep(d, key);
        d.activePath = id;
        if (thought.trim())
          d.notes.unshift({
            id: noteId,
            text: thought.trim(),
            kind: "reflection",
            ref: step.ref,
            createdAt: now,
            updatedAt: now,
          });
      })
    ) {
      setThought("");
      setJustFinished(true);
    }
  }
  return (
    <Shell>
      <View
        style={{ maxWidth: 780, width: "100%", alignSelf: "center", gap: 23 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
          <IconButton
            name="back"
            label="Zurück zu den Wegen"
            onPress={() => router.replace("/wege")}
          />
          <T style={{ fontSize: 12, color: t.muted }}>Deine geführte Reise</T>
        </View>
        <Image
          source={artSources[path.art]}
          style={{ width: "100%", height: 220, borderRadius: 22 }}
          resizeMode="cover"
          accessibilityLabel="Künstlerische Interpretation als Einstimmung auf diesen Weg"
        />
        <View style={{ gap: 12 }}>
          <Tag icon="clock">
            {path.minutes} Minuten · {path.steps.length} kleine Schritte
          </Tag>
          <T
            variant="hero"
            accessibilityRole="header"
            style={{ fontSize: 44, lineHeight: 47 }}
          >
            {path.title}
          </T>
          <T style={{ color: t.muted, fontSize: 14 }}>{path.intro}</T>
          <T style={{ fontSize: 11, color: t.muted }}>
            Ein Weg führt dich durch kurze Bibeltexte und verständliche
            Einordnungen. Du kannst jederzeit pausieren.
          </T>
        </View>
        <Card style={{ gap: 12, backgroundColor: t.soft, borderWidth: 0 }}>
          <T variant="label" style={{ color: t.gold, fontSize: 9 }}>
            DAS KANNST DU ENTDECKEN
          </T>
          {path.goals.map((goal) => (
            <View
              key={goal}
              style={{ flexDirection: "row", gap: 10, alignItems: "center" }}
            >
              <Icon name="leaf" size={14} color={t.primary} />
              <T style={{ fontSize: 12, flex: 1 }}>{goal}</T>
            </View>
          ))}
          <View style={{ marginTop: 7, gap: 8 }}>
            <Progress
              value={completed / path.steps.length}
              label={`${completed} von ${path.steps.length} Schritten abgeschlossen`}
            />
            <T style={{ fontSize: 10, color: t.muted }}>
              {completed} von {path.steps.length} Schritten · ohne Zeitdruck
            </T>
          </View>
        </Card>
        <View style={{ gap: 10 }}>
          {path.steps.map((s, i) => (
            <Pressable
              key={i}
              accessibilityRole="button"
              accessibilityState={{ selected: i === selected }}
              onPress={() => {
                setSelected(i);
                setThought("");
                setPrayer(false);
                setJustFinished(false);
              }}
              style={{
                minHeight: 63,
                flexDirection: "row",
                alignItems: "center",
                gap: 15,
                padding: 15,
                borderRadius: 13,
                borderWidth: 1,
                borderColor: i === selected ? t.gold : t.line,
                backgroundColor: i === selected ? t.surface : "transparent",
              }}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 16,
                  backgroundColor: data.completedSteps.includes(`${id}:${i}`)
                    ? t.primary
                    : t.soft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {data.completedSteps.includes(`${id}:${i}`) ? (
                  <Icon name="check" color={t.onPrimary} size={15} />
                ) : (
                  <T style={{ fontSize: 11 }}>{i + 1}</T>
                )}
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <T style={{ fontSize: 13 }}>{s.title}</T>
                <T style={{ fontSize: 10, color: t.muted }}>
                  {referenceLabel(s.ref)} · etwa 5 Min.
                </T>
              </View>
              <Icon name="chevron" size={16} color={t.muted} />
            </Pressable>
          ))}
        </View>
        {allDone && (
          <Card style={{ gap: 14, backgroundColor: t.goldSoft }}>
            <Tag icon="leaf">Ein Weg ist entdeckt</Tag>
            <T variant="heading">Nimm mit, was dich berührt.</T>
            <T style={{ fontSize: 13 }}>
              Du hast alle drei Schritte angesehen und abgeschlossen. Fragen
              dürfen offen bleiben. Du kannst diesen Weg jederzeit wieder
              besuchen.
            </T>
            <Button
              onPress={() =>
                router.push({
                  pathname: "/weg/[id]",
                  params: { id: id === "beten" ? "frieden" : "beten" },
                })
              }
            >
              Als Nächstes:{" "}
              {id === "beten" ? "Frieden finden" : "Wie kann ich beten?"}
            </Button>
            <Button kind="ghost" onPress={() => router.replace("/garten")}>
              Deinen Garten ansehen
            </Button>
          </Card>
        )}
        <Card style={{ gap: 17 }}>
          <T variant="label" style={{ color: t.gold, fontSize: 9 }}>
            SCHRITT {selected + 1} ·{" "}
            {read ? "VERSTEHEN & NACHDENKEN" : "MIT EINER GESCHICHTE BEGINNEN"}
          </T>
          <T variant="heading">{step.title}</T>
          {!read ? (
            <>
              <T style={{ fontSize: 13, color: t.muted }}>
                Lies zuerst {referenceLabel(step.ref)}. Bestätige am Ende
                selbst, dass du den Abschnitt gelesen hast. Danach geht es hier
                mit der Einordnung weiter.
              </T>
              <Button disabled={busy} onPress={() => void readStep()}>
                Abschnitt lesen
              </Button>
            </>
          ) : (
            <>
              <T variant="label" style={{ fontSize: 8, color: t.muted }}>
                KI-UNTERSTÜTZTER ENTWURF · KEIN BIBELTEXT
              </T>
              <T style={{ fontSize: 14, lineHeight: 25 }}>{step.explanation}</T>
              {step.word && (
                <View
                  style={{
                    backgroundColor: t.soft,
                    padding: 15,
                    borderRadius: 12,
                    gap: 5,
                  }}
                >
                  <T style={{ fontSize: 12, fontWeight: "600" }}>
                    {step.word[0]}
                  </T>
                  <T style={{ fontSize: 12, color: t.muted }}>{step.word[1]}</T>
                </View>
              )}
              <T variant="heading" style={{ fontSize: 26, marginTop: 3 }}>
                Was bleibt bei dir?
              </T>
              <T style={{ fontSize: 13 }}>{step.question}</T>
              {!done && (
                <Field
                  label="Deine Reflexion (freiwillig)"
                  placeholder="Deine Worte dürfen unvollkommen sein …"
                  multiline
                  maxLength={10000}
                  value={thought}
                  onChangeText={setThought}
                />
              )}
              <Button
                kind="ghost"
                icon={prayer ? "close" : "heart"}
                onPress={() => setPrayer(!prayer)}
              >
                {prayer ? "Gebet ausblenden" : "Ein freiwilliges Gebet"}
              </Button>
              {prayer && (
                <View
                  style={{
                    padding: 18,
                    borderRadius: 12,
                    backgroundColor: t.soft,
                  }}
                >
                  <T
                    style={{
                      fontFamily: "Cormorant",
                      fontSize: 24,
                      lineHeight: 33,
                    }}
                  >
                    {step.prayer}
                  </T>
                  <T style={{ fontSize: 9, color: t.muted, marginTop: 9 }}>
                    Formulierung von OLIVA · kein Bibelzitat
                  </T>
                </View>
              )}
              {!done ? (
                <>
                  <Button
                    disabled={busy}
                    icon="check"
                    onPress={() => void complete()}
                  >
                    {thought.trim()
                      ? "Reflexion speichern & Schritt abschließen"
                      : "Ohne Reflexion abschließen"}
                  </Button>
                  <T
                    style={{
                      fontSize: 10,
                      color: t.muted,
                      textAlign: "center",
                    }}
                  >
                    Der Abschluss hält deinen Lernschritt fest. Er bewertet
                    deinen Glauben nicht.
                  </T>
                </>
              ) : (
                <>
                  <Tag icon="check">Diesen Schritt hast du abgeschlossen</Tag>
                  {selected < path.steps.length - 1 && (
                    <Button
                      onPress={() => {
                        setSelected(selected + 1);
                        setJustFinished(false);
                        setPrayer(false);
                      }}
                    >
                      Zum nächsten Schritt
                    </Button>
                  )}
                </>
              )}
              <Button
                kind="secondary"
                icon="book"
                onPress={() => void readStep()}
              >
                Bibelabschnitt noch einmal lesen
              </Button>
            </>
          )}
        </Card>
        <T style={{ fontSize: 9, color: t.muted, textAlign: "center" }}>
          Einordnungen und Gebete sind redaktionelle Entwürfe. Die theologische
          Freigabe vor einem öffentlichen Release steht aus.
        </T>
      </View>
    </Shell>
  );
}
