import { useCallback, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Platform, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { T, Button, Card } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { useApp } from "../../state/store";
import { AnswerOptions } from "../quiz/components/AnswerOptions";
import { getPassage } from "../bible/repository";
import { storyAnswerKey, storyAnswerStamp } from "./model";
import type { StoryQuestion } from "./schema";
import type { StoryAnswer } from "./state-schema";

export function StoryQuestionPanel({ question, saved, readEvidence }: {
  question: StoryQuestion; saved: StoryAnswer | null; readEvidence: () => void;
}) {
  const t = useTheme(), busy = useApp((s) => s.busy);
  const [choice, setChoice] = useState(saved?.choice ?? null),
    [editing, setEditing] = useState(!saved), [expected, setExpected] = useState(storyAnswerStamp(saved)),
    [error, setError] = useState(""), [evidence, setEvidence] = useState(false), [canAccept, setCanAccept] = useState(false);
  const alive = useRef(true), focused = useRef(false), turn = useRef(0), revision = useRef(0), working = useRef(false);
  const heading = useRef<React.ComponentRef<typeof Text>>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (!focused.current) return;
      if (Platform.OS === "web") (heading.current as unknown as HTMLElement | null)?.focus?.({ preventScroll: true });
      else AccessibilityInfo.announceForAccessibility(question.prompt);
    });
    return () => cancelAnimationFrame(frame);
  }, [question.id, question.hash]);
  const pending = useRef<{ choice: number; revision: number; stamp: string | null } | null>(null);
  const currentSaved = useRef(saved); currentSaved.current = saved;
  const reconcile = useCallback(() => {
    const own = pending.current;
    if (!own || !focused.current || own.revision !== revision.current) return;
    const current = useApp.getState().data.storyStudy.answers[storyAnswerKey(question)] ?? null;
    if (storyAnswerStamp(current) !== own.stamp || storyAnswerStamp(currentSaved.current) !== own.stamp) return;
    pending.current = null; setExpected(own.stamp); setChoice(own.choice); setEditing(false); setError("");
  }, [question.id, question.hash]);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useFocusEffect(useCallback(() => {
    focused.current = true; turn.current++; reconcile();
    return () => { focused.current = false; turn.current++; };
  }, [reconcile]));
  useEffect(() => { reconcile(); if (!editing) {
    setChoice(saved?.choice ?? null); setExpected(storyAnswerStamp(saved)); if (!saved) setEditing(true);
  } }, [saved, editing, reconcile]);
  async function check() {
    if (choice === null || busy || working.current || !focused.current) return;
    const generation = turn.current, edit = revision.current, selected = choice;
    working.current = true; setError(""); pending.current = null;
    const ok = await useApp.getState().saveStoryResponse(question.unitId, question.id, question.hash, selected, expected);
    working.current = false;
    if (!alive.current) return;
    if (ok) {
      const current = useApp.getState().data.storyStudy.answers[storyAnswerKey(question)] ?? null;
      pending.current = { choice: selected, revision: edit, stamp: storyAnswerStamp(current) }; reconcile();
    } else if (focused.current && turn.current === generation)
      setError(useApp.getState().error ?? "Deine Auswahl ist hier erhalten, aber noch nicht gespeichert.");
  }
  return <Card style={{ gap: 17, padding: 21, borderRadius: 22 }}>
    <T ref={heading} tabIndex={-1} testID="story-question-heading" accessibilityRole="header" aria-level={2} variant="heading" style={{ fontSize: 29, lineHeight: 35 }}>{question.prompt}</T>
    <AnswerOptions options={question.options} selected={choice} disabled={busy || !editing}
      onSelect={(value) => { revision.current++; pending.current = null; setChoice(value); }} />
    {editing ? <Button disabled={busy || choice === null} onPress={() => void check()}>Antwort ansehen</Button> :
      <View style={{ gap: 12 }}>
        <T accessibilityRole="alert" style={{ fontSize: 14, fontWeight: "600" }}>{saved?.choice === question.correctIndex ? "Ja, das steht im Text." : "Schau noch einmal in den Text."}</T>
        <T style={{ color: t.primary, fontSize: 14 }}>{question.options[question.correctIndex]}</T>
        {question.explanation && <View style={{ gap: 5 }}><T variant="small" style={{ color: t.muted }}>{question.explanation}</T>
          <T variant="small" style={{ color: t.muted, fontSize: 10 }}>Originaler FaithPath-Hinweis · kein Bibelzitat</T></View>}
        <T variant="small" style={{ color: t.muted }}>{question.referenceLabel}</T>
        <Button kind="ghost" icon="book" onPress={() => setEvidence(!evidence)}>{evidence ? "Textstelle schließen" : "Die Textstelle ansehen"}</Button>
        {evidence && <View style={{ gap: 9, borderLeftWidth: 2, borderColor: t.gold, paddingLeft: 14 }}>
          {question.references.flatMap((ref, i) => getPassage(ref).map((verse) =>
            <T key={i + ":" + verse.n} selectable style={{ fontFamily: "Cormorant", fontSize: 23, lineHeight: 32 }}>{verse.n} {verse.text}</T>))}
          <T variant="small" style={{ color: t.muted }}>Bibeltext · Lutherbibel 1912</T>
          <Button kind="ghost" icon="book" onPress={readEvidence}>Im Reader nachlesen</Button>
        </View>}
        <Button kind="ghost" icon="pen" disabled={busy} onPress={() => { revision.current++; setExpected(storyAnswerStamp(saved)); setEditing(true); }}>Antwort ändern</Button>
      </View>}
    {!!error && <View style={{ gap: 10 }}>
      <T accessibilityRole="alert" style={{ fontSize: 12, color: t.danger }}>{error}</T>
      <Button kind="secondary" disabled={busy} onPress={() => { void useApp.getState().refresh().then((result) => {
        if (alive.current && focused.current && result) { setCanAccept(true); setError("Aktueller Stand geladen. Deine lokale Auswahl bleibt erhalten, bis du den gespeicherten Stand übernimmst."); }
      }); }}>Aktuellen Stand laden</Button>
      {canAccept && <Button kind="secondary" disabled={busy} onPress={() => {
        const current = useApp.getState().data.storyStudy.answers[storyAnswerKey(question)] ?? null;
        revision.current++; pending.current = null; setExpected(storyAnswerStamp(current)); setChoice(current?.choice ?? null);
        setEditing(!current); setCanAccept(false); setError("");
      }}>Gespeicherten Stand übernehmen</Button>}
    </View>}
  </Card>;
}
