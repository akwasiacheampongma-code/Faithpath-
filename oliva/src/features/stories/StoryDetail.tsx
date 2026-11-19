import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Shell } from "../../components/Shell";
import { T, Button, Tag } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { useApp } from "../../state/store";
import { referenceLabel, type Reference } from "../bible/repository";
import { CaptureInput } from "../personal/CaptureInput";
import { contextualNotebookHref } from "../notebook/links";
import { resolveCaptureDraft } from "../personal/resolve-capture-draft";
import { useVolatileDrafts } from "../personal/volatile-drafts";
import { captureKey } from "../personal/capture-schema-current";
import { storyById } from "./index";
import { storyCapture, storyProgress, storyAnswerKey } from "./model";
import { storyStageSchema, type StoryStage } from "./state-schema";
import { type StoryCaptureSource, type StoryQuestion } from "./schema";
import { StoryHero } from "./StoryArt";
import { StoryQuestionPanel } from "./StoryQuestionPanel";

export function StoryDetail({ params }: { params: { id: string; stage?: string; index?: string; draft?: string } }) {
  const t = useTheme(), data = useApp((s) => s.data), busy = useApp((s) => s.busy), unit = storyById(params.id);
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const [questions, setQuestions] = useState<StoryQuestion[] | null>(null), [error, setError] = useState(""), [attempt, setAttempt] = useState(0),
    [restored, setRestored] = useState<StoryCaptureSource | null>(null), [draftError, setDraftError] = useState("");
  const held = useVolatileDrafts((s) => s.items), settled = useVolatileDrafts((s) => s.settled);
  const stage: StoryStage = storyStageSchema.safeParse(params.stage).success ? params.stage as StoryStage : "lesen";
  const savedPosition = unit && data.storyStudy.position?.unitId === unit.id && data.storyStudy.position.setHash === unit.questionSetHash ? data.storyStudy.position : null;
  const incoming = Number(params.index ?? savedPosition?.index ?? 0);
  const index = unit && Number.isInteger(incoming) && incoming >= 0 && incoming < unit.questions.length ? incoming : 0;
  useEffect(() => { scroll.current?.scrollTo({ y: 0, animated: false }); }, [stage, index]);
  useEffect(() => {
    if (!params.draft || !unit) return;
    try {
      const draft = resolveCaptureDraft({
        draftId: params.draft, durable: data.drafts, held, settled,
        acceptSource: (source) => source.type === "story",
        validateRoute: (source) => source.type === "story" && source.unitId === unit.id,
      });
      setRestored(draft.values.source as StoryCaptureSource); setDraftError("");
      router.setParams({ draft: undefined, stage: "gedanken" });
    } catch (e) {
      setDraftError((e as Error).message); router.setParams({ draft: undefined });
    }
  }, [params.draft, unit?.id, data.drafts, held, settled]);
  useEffect(() => {
    if (stage !== "verstehen" || !unit) return;
    let active = true;
    setError("");
    void import("./catalog").then(({ storyQuestions }) => {
      const next = storyQuestions(unit.id);
      if (active) setQuestions(next);
    }).catch(() => { if (active) setError("Die Originalfragen konnten nicht geladen werden. Dein bisheriger Stand bleibt erhalten."); });
    return () => { active = false; };
  }, [unit?.id, stage, attempt]);
  const source = useMemo(() => restored ?? (unit ? storyCapture(unit) : null), [restored, unit]);
  if (!unit) return <Shell><T variant="title">Dieser Abschnitt ist nicht vorhanden.</T><Button onPress={() => router.replace("/geschichten")}>Zur Geschichtenbibliothek</Button></Shell>;
  const progress = storyProgress(data, unit), question = questions?.[index] ?? null;
  async function go(next: StoryStage, nextIndex = index, seenIndex?: number) {
    const ok = await useApp.getState().rememberStoryStep({ unitId: unit!.id, index: nextIndex, stage: next, setHash: unit!.questionSetHash }, seenIndex);
    if (ok) router.setParams({ stage: next, index: String(nextIndex) });
  }
  function read(ref: Reference) {
    router.push({ pathname: "/lesen/[book]", params: { book: ref.book, chapter: ref.chapter, from: ref.from, to: ref.to,
      story: unit!.id, storyStage: stage, storyIndex: index, mode: "read" } });
  }
  return <Shell scrollRef={scroll}>
    <View style={{ maxWidth: 720, width: "100%", alignSelf: "center", paddingTop: 10, gap: 0 }}>
      <View style={{ alignItems: "flex-start", marginBottom: 16 }}>
        <Button kind="ghost" icon="back" onPress={() => router.canGoBack() ? router.back() : router.replace("/geschichten")}>Zurück</Button>
      </View>
      <T variant="label" style={{ color: t.gold, fontSize: 10 }}>{unit.kind === "Psalm" ? "PSALMEN · GEBET & POESIE" : unit.kind === "Briefabschnitt" ? "BRIEFE · GEDANKEN ZUM GLAUBEN" : "EINEN ABSCHNITT ENTDECKEN"}</T>
      <T variant="title" accessibilityRole="header" aria-level={1} style={{ fontSize: 43, lineHeight: 47, marginTop: 12 }}>{unit.title}</T>
      <T variant="small" style={{ color: t.muted, marginTop: 14 }}>{unit.referenceLabel} · {unit.questions.length} Originalfragen</T>
      <View role="navigation" accessibilityLabel="Schritte dieses Abschnitts" style={{ flexDirection: "row", borderBottomWidth: 1, borderColor: t.line, marginTop: 20, marginBottom: 26 }}>
        {(["lesen", "verstehen", "gedanken"] as const).map((key, i) =>
          <Pressable key={key} accessibilityRole="button" accessibilityState={{ selected: stage === key || stage === "abschluss" && key === "gedanken", disabled: busy }} disabled={busy}
            onPress={() => void go(key)} style={{ flex: 1, minHeight: 50, justifyContent: "center", alignItems: "center", borderBottomWidth: 2, borderColor: stage === key ? t.primary : "transparent" }}>
            <T style={{ fontSize: 12, color: stage === key ? t.primary : t.muted }}>0{i + 1}  {key === "lesen" ? "Lesen" : key === "verstehen" ? "Verstehen" : "Gedanken"}</T>
          </Pressable>)}
      </View>
      {stage === "lesen" && <View style={{ gap: 22 }}>
        <StoryHero unit={unit} />
        <T style={{ fontSize: 14, lineHeight: 25, color: t.muted }}>Lies den Abschnitt in deinem Tempo. Danach kannst du die Originalfragen ansehen und einen eigenen Gedanken festhalten.</T>
        {unit.references.length > 1 && <T variant="small" style={{ color: t.muted }}>Dieser Abschnitt besteht aus zwei getrennten Lesebereichen. Die Verse dazwischen gehören nicht zur ausgewählten Einheit.</T>}
        {unit.references.map((ref, i) => <Button key={i} icon="book" onPress={() => read(ref)}>{unit.references.length > 1 ? "Teil " + (i + 1) + " lesen: " + referenceLabel(ref) : "Im Bibeltext lesen"}</Button>)}
        {progress.read && <T variant="small" style={{ color: t.primary }}>Diesen Abschnitt hast du im Reader als gelesen bestätigt.</T>}
        <Button kind="secondary" disabled={busy} onPress={() => void go("verstehen")}>Weiter zu den Fragen</Button>
        <T variant="small" style={{ color: t.muted }}>Der gemeinsame OLIVA-Reader öffnet sich innerhalb der App. Lesen, Fragen und eigene Gedanken bleiben getrennte Schritte.</T>
      </View>}
      {stage === "verstehen" && <View style={{ gap: 17 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <T variant="label" style={{ color: t.gold, fontSize: 10 }}>FRAGE {index + 1} VON {unit.questions.length}</T>
          <T variant="small" style={{ color: t.muted, fontSize: 10 }}>{progress.seen} angesehen</T>
        </View>
        {!!error && <View style={{ gap: 12 }}><T accessibilityRole="alert">{error}</T><Button kind="secondary" onPress={() => setAttempt(attempt + 1)}>Fragen erneut laden</Button></View>}
        {!question && !error && <T accessibilityRole="progressbar">Die Originalfrage wird geladen …</T>}
        {question && <StoryQuestionPanel key={question.id + ":" + question.hash} question={question}
          saved={data.storyStudy.answers[storyAnswerKey(question)] ?? null} readEvidence={() => read(question.references[0]!)} />}
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10 }}>
          <Button kind="ghost" icon="back" disabled={busy || index === 0} onPress={() => void go("verstehen", index - 1, index)}>Zurück</Button>
          <Button kind="ghost" disabled={busy || !question} onPress={() => void go(index + 1 < unit.questions.length ? "verstehen" : "gedanken", index + 1 < unit.questions.length ? index + 1 : index, index)}>
            {index + 1 === unit.questions.length ? "Zu deinem Gedanken" : data.storyStudy.answers[storyAnswerKey(question ?? unit.questions[index]!)] ? "Nächste Frage" : "Frage überspringen"}
          </Button>
        </View>
        <T variant="small" style={{ color: t.muted }}>Du darfst nachlesen, Antworten ändern oder Fragen überspringen. Fragen allein verändern weder deinen Lesefortschritt noch deinen Olivenbaum.</T>
      </View>}
      {stage === "gedanken" && <View style={{ gap: 20 }}>
        <Tag icon="leaf">Ein Moment für dich</Tag>
        <T variant="heading">Was bleibt bei dir?</T>
        <T style={{ fontFamily: "Cormorant", fontSize: 30, lineHeight: 38 }}>{source?.question ?? unit.reflection}</T>
        <T variant="small" style={{ color: t.muted }}>Original-Reflexionsimpuls · FaithPath/Nachlese. Deine Antwort ist freiwillig.</T>
        <Button kind="secondary" icon="pen" onPress={() => router.push(contextualNotebookHref({ kind: "story-question", storyId: unit.id }))}>
          Gedanken festhalten
        </Button>
        {!!params.draft ? <T>Dein Entwurf wird geprüft …</T> : draftError ? <View style={{ gap: 12 }}>
          <T accessibilityRole="alert">{draftError}</T><Button kind="secondary" onPress={() => router.push("/sammlung?tab=Entw%C3%BCrfe")}>Zur Sammlung</Button>
        </View> : source && <CaptureInput key={captureKey(source)} source={source} label="Dein eigener Gedanke · freiwillig" placeholder="Was möchtest du mitnehmen?" />}
        <Button kind="ghost" disabled={busy} onPress={() => void go("abschluss")}>Diesen Moment abschließen</Button>
      </View>}
      {stage === "abschluss" && <View style={{ gap: 21, paddingVertical: 16 }}>
        <Tag icon="leaf">In deinem Tempo</Tag>
        <T variant="title">Ein Gedanke darf bleiben.</T>
        <T style={{ color: t.muted }}>Du musst nicht alles auf einmal verstehen. Du kannst zu diesem Text zurückkehren, wann immer du möchtest.</T>
        <T variant="small">{progress.seen} von {progress.total} Fragen angesehen · {progress.answered} beantwortet. Kein Glaubensscore.</T>
        <Button onPress={() => router.replace("/geschichten")}>Zur Bibliothek</Button>
        <Button kind="secondary" icon="book" onPress={() => router.push({ pathname: "/buch/[book]", params: { book: unit.references[0]!.book } })}>Das Bibelbuch entdecken</Button>
      </View>}
      <View style={{ marginTop: 32, gap: 10, borderTopWidth: 1, borderColor: t.line, paddingTop: 17 }}>
        <T variant="small" style={{ color: t.muted, fontSize: 10 }}>Originaleinheit {unit.id} · {unit.sourceNamespace}. Fragen und Reflexionsimpuls werden unverändert bewahrt. Nicht jede Frage besitzt einen zusätzlichen Erklärungstext.</T>
        <Button kind="ghost" icon="book" onPress={() => router.push("/geschichten")}>Geschichten und Abschnitte</Button>
      </View>
    </View>
  </Shell>;
}
