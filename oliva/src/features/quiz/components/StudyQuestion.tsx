import { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Button, Card, T, Tag } from "../../../components/ui";
import { useTheme } from "../../../design-system/theme";
import { useApp } from "../../../state/store";
import { referenceLabel } from "../../bible/repository";
import { answerKey, answerStamp } from "../model";
import type { NtAnswer } from "../state-schema";
import type { NtQuestion } from "../schema";
import { AnswerOptions } from "./AnswerOptions";

export function StudyQuestion({
  question,
  saved,
  onLocalEdit,
}: {
  question: NtQuestion;
  saved: NtAnswer | null;
  onLocalEdit?: () => void;
}) {
  const t = useTheme(),
    busy = useApp((s) => s.busy),
    save = useApp((s) => s.saveNtResponse);
  const [selected, setSelected] = useState<number | null>(
      saved?.choice ?? null,
    ),
    [editing, setEditing] = useState(!saved),
    [expected, setExpected] = useState(() => answerStamp(saved)),
    [error, setError] = useState<string | null>(null),
    [reloaded, setReloaded] = useState(false);
  const focused = useRef(false),
    generation = useRef(0),
    mounted = useRef(true),
    savedRef = useRef(saved),
    selectedRef = useRef(selected),
    draftRevision = useRef(0),
    inFlight = useRef(false),
    ownSuccess = useRef<{
      choice: number;
      draftRevision: number;
      stamp: string;
    } | null>(null);
  savedRef.current = saved;
  const reconcileOwnSuccess = useCallback(() => {
    const own = ownSuccess.current;
    if (!mounted.current || !focused.current || !own) return;
    // A different local edit is never dismissed by an earlier pending action.
    if (
      draftRevision.current !== own.draftRevision ||
      selectedRef.current !== own.choice
    ) {
      ownSuccess.current = null;
      return;
    }
    const current =
      useApp.getState().data.ntStudy.answers[answerKey(question)] ?? null;
    if (answerStamp(current) !== own.stamp) {
      ownSuccess.current = null;
      return;
    }
    // Let React receive the durable record before leaving the editable state.
    if (answerStamp(savedRef.current) !== own.stamp) return;
    ownSuccess.current = null;
    setExpected(own.stamp);
    setEditing(false);
    setError(null);
    setReloaded(false);
  }, [question.id, question.hash]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      ownSuccess.current = null;
    };
  }, []);
  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      generation.current++;
      reconcileOwnSuccess();
      return () => {
        focused.current = false;
        generation.current++;
      };
    }, [reconcileOwnSuccess]),
  );
  useEffect(() => {
    reconcileOwnSuccess();
  }, [saved, reconcileOwnSuccess]);
  useEffect(() => {
    if (!editing) {
      selectedRef.current = saved?.choice ?? null;
      setSelected(saved?.choice ?? null);
      setExpected(answerStamp(saved));
      if (!saved) setEditing(true);
    }
  }, [saved, editing]);
  async function check() {
    if (!focused.current || busy || inFlight.current || selected === null)
      return;
    const turn = generation.current;
    const choice = selected,
      revision = draftRevision.current;
    inFlight.current = true;
    ownSuccess.current = null;
    setError(null);
    setReloaded(false);
    const ok = await save(question.id, question.hash, choice, expected);
    inFlight.current = false;
    if (!mounted.current) return;
    if (ok) {
      const committed =
        useApp.getState().data.ntStudy.answers[answerKey(question)] ?? null;
      const stamp = answerStamp(committed);
      if (committed?.choice === choice && stamp) {
        // This receipt comes only from our successful action, never from a
        // foreign answer merely appearing while a local selection is open.
        ownSuccess.current = { choice, draftRevision: revision, stamp };
        reconcileOwnSuccess();
      }
    } else if (focused.current && generation.current === turn)
      setError(
        useApp.getState().error ??
          "Deine Antwort konnte noch nicht gespeichert werden. Deine Auswahl bleibt hier erhalten.",
      );
  }
  async function reload() {
    if (!focused.current || busy) return;
    const turn = generation.current;
    const current = await useApp.getState().refresh();
    if (!focused.current || generation.current !== turn) return;
    if (current) {
      setReloaded(true);
      setError(
        "Der aktuelle Stand wurde geladen. Deine noch nicht gespeicherte Auswahl bleibt hier erhalten.",
      );
    } else
      setError(
        useApp.getState().error ??
          "Der aktuelle Stand konnte nicht geladen werden.",
      );
  }
  return (
    <View style={{ gap: 18 }}>
      <AnswerOptions
        options={question.options}
        selected={selected}
        disabled={busy || !editing}
        onSelect={(choice) => {
          if (focused.current && !busy) {
            draftRevision.current++;
            onLocalEdit?.();
            selectedRef.current = choice;
            ownSuccess.current = null;
            setSelected(choice);
            setError(null);
          }
        }}
      />
      {editing ? (
        <>
          <Button
            disabled={selected === null || busy}
            icon="check"
            onPress={() => void check()}
          >
            Antwort prüfen
          </Button>
          <T variant="small" style={{ color: t.muted }}>
            Erst „Antwort prüfen“ speichert deine Auswahl und zeigt die
            Erklärung.
          </T>
        </>
      ) : saved ? (
        <Card style={{ backgroundColor: t.soft, borderWidth: 0, gap: 13 }}>
          <Tag icon="book">
            {saved.choice === question.correctIndex
              ? "Das passt zum Text."
              : "Schauen wir noch einmal in den Text."}
          </Tag>
          <View accessibilityLiveRegion="polite" style={{ gap: 8 }}>
            <T variant="small" style={{ fontWeight: "600", color: t.muted }}>
              ANTWORT AUS DER QUELLE
            </T>
            <T style={{ fontSize: 15, fontWeight: "600" }}>
              {question.options[question.correctIndex]}
            </T>
            <T style={{ fontSize: 14 }}>{question.explanation}</T>
          </View>
          <T variant="small" style={{ color: t.muted }}>
            Redaktionelle FaithPath-Erklärung · kein Bibelzitat
          </T>
          {question.referenceRanges.map((ref, index) => (
            <Button
              key={index}
              kind="secondary"
              icon="book"
              onPress={() => {
                if (focused.current && !busy)
                  router.push({
                    pathname: "/lesen/[book]",
                    params: { ...ref, mode: "read" },
                  });
              }}
            >
              Zur Bibelstelle: {referenceLabel(ref)}
            </Button>
          ))}
          <T variant="small" style={{ color: t.muted }}>
            Deine Antwort ist auf diesem Gerät gespeichert. Du kannst sie in
            Ruhe überdenken.
          </T>
          <Button
            kind="ghost"
            icon="pen"
            disabled={busy}
            onPress={() => {
              if (!focused.current) return;
              draftRevision.current++;
              onLocalEdit?.();
              selectedRef.current = saved.choice;
              ownSuccess.current = null;
              setSelected(saved.choice);
              setExpected(answerStamp(saved));
              setEditing(true);
              setError(null);
            }}
          >
            Antwort ändern
          </Button>
        </Card>
      ) : null}
      {error && (
        <Card style={{ gap: 12, backgroundColor: t.soft, borderWidth: 0 }}>
          <T accessibilityRole="alert">{error}</T>
          {!reloaded ? (
            <Button
              kind="secondary"
              disabled={busy}
              onPress={() => void reload()}
            >
              Aktuellen Stand neu laden
            </Button>
          ) : (
            <>
              <T variant="small" style={{ color: t.muted }}>
                Deine Auswahl bleibt bis zu deiner Entscheidung sichtbar.
                „Gespeicherten Stand übernehmen“ ersetzt sie durch den aktuellen
                gespeicherten Stand.
              </T>
              <Button
                kind="secondary"
                disabled={busy}
                onPress={() => {
                  if (!focused.current) return;
                  const current =
                    useApp.getState().data.ntStudy.answers[
                      answerKey(question)
                    ] ?? null;
                  draftRevision.current++;
                  onLocalEdit?.();
                  selectedRef.current = current?.choice ?? null;
                  ownSuccess.current = null;
                  setSelected(current?.choice ?? null);
                  setExpected(answerStamp(current));
                  setEditing(!current);
                  setError(null);
                  setReloaded(false);
                }}
              >
                Gespeicherten Stand übernehmen
              </Button>
            </>
          )}
        </Card>
      )}
    </View>
  );
}
