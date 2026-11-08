import { useCallback, useRef, useState } from "react";
import { View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Shell } from "../../src/components/Shell";
import { T, Tag, Button, Card, IconButton } from "../../src/components/ui";
import { useTheme } from "../../src/design-system/theme";
import { useApp } from "../../src/state/store";
import { newId, type Draft } from "../../src/features/personal/schema";
import {
  archiveGoal,
  goalSnapshot,
  setStepDone,
  reviewEditDraft,
  reviewHash,
} from "../../src/features/personal/model";
import {
  GoalEditor,
  StepEditor,
  ReviewEditor,
  ReviewEditEditor,
} from "../../src/features/personal/Editors";
import { referenceLabel } from "../../src/features/bible/repository";
import { LegacyHistory } from "../../src/features/imports/LegacyHistory";

export default function GoalDetail() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    data = useApp((s) => s.data),
    mutate = useApp((s) => s.mutate),
    busy = useApp((s) => s.busy),
    t = useTheme(),
    [open, setOpen] = useState(false),
    [undoToken, setUndoToken] = useState<string | null>(null),
    [deletion, setDeletion] = useState<{
      id: string;
      revision: number;
      hash: string;
    } | null>(null);
  const undoRef = useRef<string | null>(null),
    focused = useRef(false),
    focusGeneration = useRef(0);
  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      focusGeneration.current++;
      return () => {
        focused.current = false;
        focusGeneration.current++;
        if (undoRef.current)
          useApp.getState().forgetReviewUndo(undoRef.current);
        undoRef.current = null;
        setUndoToken(null);
        setDeletion(null);
      };
    }, [id]),
  );
  const goal = data.goals.find((g) => g.id === id),
    pending = data.drafts.find((d) =>
      d.type === "goal"
        ? d.values.targetId === id
        : d.type === "step" || d.type === "review" || d.type === "review-edit"
          ? d.values.goalId === id
          : false,
    );
  if (!goal)
    return (
      <Shell>
        <Card style={{ gap: 16 }}>
          <T variant="heading">Dieses Vorhaben ist nicht vorhanden.</T>
          {pending?.type === "review-edit" && (
            <ReviewEditEditor
              key={pending.id}
              draft={pending}
              onDone={() => setOpen(false)}
            />
          )}
          <Button onPress={() => router.dismissTo("/vorhaben")}>
            Zu deinen Vorhaben
          </Button>
        </Card>
      </Shell>
    );
  const stale =
    pending &&
    pending.type !== "journal" &&
    pending.type !== "capture" &&
    pending.values.baseRevision !== goal.revision;
  async function begin(type: "goal" | "step" | "review", stepId?: string) {
    if (!goal) return;
    if (pending) {
      setOpen(true);
      return;
    }
    const at = new Date().toISOString(),
      common = {
        id: newId("draft"),
        key: `${type}:${goal.id}`,
        revision: 0,
        updatedAt: at,
      };
    const draft: Draft =
      type === "goal"
        ? {
            ...common,
            type,
            values: {
              entityId: goal.id,
              targetId: goal.id,
              baseRevision: goal.revision,
              title: goal.title,
              why: goal.why,
              initialStep: "",
              ...(goal.ref ? { ref: goal.ref } : {}),
            },
          }
        : type === "step"
          ? {
              ...common,
              type,
              values: {
                goalId: goal.id,
                stepId: stepId ?? newId("step"),
                editing: !!stepId,
                baseRevision: goal.revision,
                text: goal.steps.find((s) => s.id === stepId)?.text ?? "",
              },
            }
          : {
              ...common,
              type,
              values: {
                goalId: goal.id,
                baseRevision: goal.revision,
                text: "",
                applied: false,
                source: goalSnapshot(goal),
              },
            };
    if (await useApp.getState().saveEditorDraft(draft, null)) setOpen(true);
  }
  async function reconnect() {
    if (
      !pending ||
      pending.type === "journal" ||
      pending.type === "capture" ||
      !goal
    )
      return;
    if (pending.type === "review-edit") {
      const current = goal.reviews.find(
        (r) => r.id === pending.values.reviewId,
      );
      if (!current || reviewHash(current) !== pending.values.baseReviewHash)
        return;
    }
    const updated = {
      ...pending,
      values: { ...pending.values, baseRevision: goal.revision },
      updatedAt: new Date().toISOString(),
    } as Draft;
    if (await useApp.getState().saveEditorDraft(updated, pending))
      setOpen(true);
  }
  async function editReview(reviewId: string) {
    if (!goal || goal.archivedAt) return;
    if (pending) {
      setOpen(true);
      return;
    }
    if (
      await useApp
        .getState()
        .saveEditorDraft(reviewEditDraft(goal, reviewId), null)
    )
      setOpen(true);
  }
  async function removeReview() {
    if (!goal || !deletion) return;
    const requestGeneration = focusGeneration.current;
    const token = await useApp
      .getState()
      .deleteGoalReview(goal.id, deletion.id, deletion.revision, deletion.hash);
    if (!token) return;
    if (!focused.current || requestGeneration !== focusGeneration.current) {
      useApp.getState().forgetReviewUndo(token);
      return;
    }
    if (undoRef.current) useApp.getState().forgetReviewUndo(undoRef.current);
    undoRef.current = token;
    setUndoToken(token);
    setDeletion(null);
  }
  async function undoReview() {
    if (!undoToken || !(await useApp.getState().undoGoalReview(undoToken)))
      return;
    undoRef.current = null;
    setUndoToken(null);
  }
  return (
    <Shell>
      <View
        style={{ maxWidth: 800, width: "100%", alignSelf: "center", gap: 22 }}
      >
        <View style={{ alignItems: "flex-start" }}>
          <IconButton
            name="back"
            label="Zurück zu deinen Vorhaben"
            onPress={() => router.dismissTo("/vorhaben")}
          />
        </View>
        <Tag icon="leaf">
          {goal.archivedAt ? "Dein Archiv" : "Dein persönliches Vorhaben"}
        </Tag>
        <T variant="title" accessibilityRole="header" style={{ fontSize: 42 }}>
          {goal.title}
        </T>
        {goal.why && <T style={{ fontSize: 14, color: t.muted }}>{goal.why}</T>}
        {goal.ref && (
          <Button
            kind="secondary"
            icon="book"
            onPress={() =>
              router.push({
                pathname: "/lesen/[book]",
                params: {
                  book: goal.ref!.book,
                  chapter: goal.ref!.chapter,
                  from: goal.ref!.from,
                  to: goal.ref!.to,
                },
              })
            }
          >
            {referenceLabel(goal.ref)} lesen
          </Button>
        )}
        {goal.archivedAt ? (
          <Card style={{ backgroundColor: t.soft, gap: 13 }}>
            <T>Dieses Vorhaben ruht im Archiv.</T>
            <T style={{ fontSize: 12, color: t.muted }}>
              Deine Schritte und Rückblicke bleiben erhalten. Du kannst es
              jederzeit wieder aufnehmen.
            </T>
            <Button
              disabled={busy}
              icon="back"
              onPress={() =>
                void mutate((d) =>
                  archiveGoal(d, id, false, new Date().toISOString()),
                )
              }
            >
              Vorhaben wieder aufnehmen
            </Button>
          </Card>
        ) : (
          <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
            <Button
              kind="secondary"
              icon="pen"
              disabled={busy}
              onPress={() => void begin("goal")}
            >
              {pending ? "Entwurf fortsetzen" : "Vorhaben bearbeiten"}
            </Button>
            <Button
              kind="secondary"
              icon="pen"
              disabled={busy || !!pending}
              onPress={() => void begin("step")}
            >
              Schritt hinzufügen
            </Button>
            <Button
              kind="secondary"
              icon="heart"
              disabled={busy || !!pending}
              onPress={() => void begin("review")}
            >
              Freiwilligen Rückblick schreiben
            </Button>
          </View>
        )}
        {pending && !open && (
          <Card style={{ gap: 10 }}>
            <T>Dein Entwurf ist noch da.</T>
            <T style={{ fontSize: 11, color: t.muted }}>
              Setze ihn fort oder verwirf ihn im Editor ausdrücklich, bevor du
              andere Änderungen an diesem Vorhaben machst.
            </T>
            <Button
              kind="secondary"
              disabled={
                busy || (!!goal.archivedAt && pending.type !== "review-edit")
              }
              onPress={() => setOpen(true)}
            >
              Diesen Entwurf fortsetzen
            </Button>
          </Card>
        )}
        {pending &&
          open &&
          (!goal.archivedAt || pending.type === "review-edit") && (
            <>
              <Button kind="ghost" icon="close" onPress={() => setOpen(false)}>
                Editor schließen und Entwurf behalten
              </Button>
              {pending.type === "review-edit" ? (
                <ReviewEditEditor
                  key={pending.id}
                  draft={pending}
                  onDone={() => setOpen(false)}
                />
              ) : stale ? (
                <Card style={{ backgroundColor: t.goldSoft, gap: 14 }}>
                  <T variant="heading">
                    Dein Entwurf stammt von einem früheren Stand.
                  </T>
                  <T style={{ fontSize: 12 }}>
                    Das Vorhaben wurde inzwischen verändert. Deine Entwurfsworte
                    bleiben erhalten. Aktueller Titel: „{goal.title}“. Prüfe ihn
                    und die Schritte weiter unten. Mit der nächsten Aktion
                    verbindest du den alten Entwurf ausdrücklich mit diesem
                    Stand; gespeichert wird er erst über den Editor.
                  </T>
                  {pending.type === "goal" && (
                    <T style={{ fontSize: 12 }}>
                      Entwurfstitel: „{pending.values.title}“
                    </T>
                  )}
                  <Button
                    kind="secondary"
                    disabled={busy}
                    onPress={() => void reconnect()}
                  >
                    Entwurf mit aktuellem Stand verbinden
                  </Button>
                </Card>
              ) : pending.type === "goal" ? (
                <GoalEditor
                  key={`${pending.id}:${pending.values.baseRevision}`}
                  draft={pending}
                  onDone={() => setOpen(false)}
                />
              ) : pending.type === "step" ? (
                <StepEditor
                  key={`${pending.id}:${pending.values.baseRevision}`}
                  draft={pending}
                  onDone={() => setOpen(false)}
                />
              ) : pending.type === "review" ? (
                <ReviewEditor
                  key={`${pending.id}:${pending.values.baseRevision}`}
                  draft={pending}
                  onDone={() => setOpen(false)}
                />
              ) : null}
            </>
          )}
        <View style={{ gap: 12 }}>
          <T variant="heading">Deine kleinen Schritte</T>
          <T style={{ fontSize: 11, color: t.muted }}>
            Ein Häkchen hält fest, was du ausprobiert hast. Es ist kein Nachweis
            geistlicher Entwicklung.
          </T>
          {goal.steps.map((step) => (
            <Card key={step.id} style={{ gap: 11 }}>
              <T style={{ fontSize: 14 }}>{step.text}</T>
              <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                <Button
                  kind={step.done ? "primary" : "secondary"}
                  icon={step.done ? "check" : "leaf"}
                  disabled={busy || !!goal.archivedAt || !!pending}
                  onPress={() =>
                    void mutate((d) =>
                      setStepDone(
                        d,
                        id,
                        step.id,
                        !step.done,
                        new Date().toISOString(),
                      ),
                    )
                  }
                >
                  {step.done
                    ? "Ausprobiert · wieder öffnen"
                    : "Als ausprobiert festhalten"}
                </Button>
                <Button
                  kind="ghost"
                  icon="pen"
                  disabled={busy || !!goal.archivedAt || !!pending}
                  onPress={() => void begin("step", step.id)}
                >
                  Schritt bearbeiten
                </Button>
              </View>
              {step.completedAt && (
                <T style={{ fontSize: 10, color: t.muted }}>
                  Selbst festgehalten am{" "}
                  {new Date(step.completedAt).toLocaleDateString("de-DE")}
                </T>
              )}
            </Card>
          ))}
          {!goal.steps.length && (
            <Card>
              <T style={{ fontSize: 12, color: t.muted }}>
                Es braucht keinen fertigen Plan. Du kannst oben einen ersten
                kleinen Schritt ergänzen.
              </T>
            </Card>
          )}
        </View>
        {goal.origin && <LegacyHistory goal={goal} />}
        <View style={{ gap: 14 }}>
          <T variant="heading">Deine Rückblicke</T>
          {undoToken && (
            <Card style={{ gap: 10, backgroundColor: t.goldSoft }}>
              <T>Rückblick gelöscht.</T>
              <Button
                disabled={busy}
                icon="back"
                kind="secondary"
                onPress={() => void undoReview()}
              >
                Rückblick wiederherstellen
              </Button>
              <T style={{ fontSize: 11, color: t.muted }}>
                Rückgängig ist nur in dieser geöffneten Ansicht möglich. Nach
                weiteren Änderungen kann die Wiederherstellung nicht mehr
                passen.
              </T>
            </Card>
          )}
          {goal.reviews.map((review) => (
            <View key={review.id} testID={`review-${review.id}`}>
              <Card style={{ gap: 14 }}>
                <Tag icon="heart">
                  {new Date(review.createdAt).toLocaleDateString("de-DE")} ·
                  dein eigener Rückblick
                </Tag>
                <T
                  style={{
                    fontFamily: "Cormorant",
                    fontSize: 25,
                    lineHeight: 34,
                  }}
                >
                  {review.text}
                </T>
                {review.applied && (
                  <T style={{ fontSize: 11, color: t.muted }}>
                    Du hast selbst bestätigt, etwas im Alltag ausprobiert zu
                    haben.
                  </T>
                )}
                {review.updatedAt && (
                  <T style={{ fontSize: 11, color: t.muted }}>
                    Worte überarbeitet am{" "}
                    {new Date(review.updatedAt).toLocaleDateString("de-DE")}.
                    Der ursprüngliche Zeitpunkt bleibt erhalten.
                  </T>
                )}
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  <Button
                    kind="secondary"
                    icon="pen"
                    disabled={busy || !!goal.archivedAt || !!pending}
                    onPress={() => void editReview(review.id)}
                  >
                    Rückblick bearbeiten
                  </Button>
                  <Button
                    kind="ghost"
                    icon="close"
                    disabled={
                      busy ||
                      !!goal.archivedAt ||
                      (pending?.type === "review-edit" &&
                        pending.values.reviewId === review.id)
                    }
                    onPress={() =>
                      setDeletion({
                        id: review.id,
                        revision: goal.revision,
                        hash: reviewHash(review),
                      })
                    }
                  >
                    Rückblick löschen
                  </Button>
                </View>
                {pending?.type === "review-edit" &&
                  pending.values.reviewId === review.id && (
                    <T style={{ fontSize: 11, color: t.muted }}>
                      Für diesen Rückblick liegt eine Bearbeitung vor. Sichere
                      oder verwirf den Entwurf ausdrücklich, bevor du ihn
                      löschst.
                    </T>
                  )}
                {deletion?.id === review.id && (
                  <Card style={{ gap: 12, backgroundColor: t.goldSoft }}>
                    <T variant="heading">Diesen Rückblick löschen?</T>
                    <T style={{ fontSize: 12 }}>
                      Der Rückblick und sein bewahrter damaliger Vorhabenstand
                      werden hier entfernt. Vorhandene Sicherungen,
                      Rückkehrsicherungen oder unveränderte Originalarchive
                      können weiterhin Kopien enthalten. Andere Rückblicke und
                      dein bisheriger Baum bleiben erhalten.
                    </T>
                    <T style={{ fontSize: 12 }}>
                      Eine Wiederherstellung ist nur in dieser Ansicht und bei
                      unverändertem Datenstand möglich.
                    </T>
                    <Button
                      disabled={busy}
                      kind="secondary"
                      icon="close"
                      onPress={() => void removeReview()}
                    >
                      Rückblick jetzt löschen
                    </Button>
                    <Button
                      kind="ghost"
                      icon={null}
                      onPress={() => setDeletion(null)}
                    >
                      Rückblick behalten
                    </Button>
                  </Card>
                )}
                <View
                  style={{
                    backgroundColor: t.soft,
                    padding: 17,
                    borderRadius: 12,
                    gap: 8,
                  }}
                >
                  <T variant="label" style={{ fontSize: 9 }}>
                    BEWAHRTER STAND BEIM BEGINN DIESES RÜCKBLICKS
                  </T>
                  <T style={{ fontSize: 13, fontWeight: "600" }}>
                    {review.source.title}
                  </T>
                  {!!review.source.why && (
                    <T style={{ fontSize: 12, color: t.muted }}>
                      {review.source.why}
                    </T>
                  )}
                  {review.source.steps.map((s) => (
                    <T key={s.id} style={{ fontSize: 12, color: t.muted }}>
                      {s.done ? "✓" : "○"} {s.text}
                    </T>
                  ))}
                </View>
              </Card>
            </View>
          ))}
          {!goal.reviews.length && (
            <T style={{ fontSize: 12, color: t.muted }}>
              Hier ist später Raum für deine Erfahrungen und offenen Fragen. Ein
              Rückblick ist immer freiwillig.
            </T>
          )}
        </View>
        {!goal.archivedAt && (
          <Card style={{ gap: 10, marginTop: 10 }}>
            <T style={{ fontSize: 12, color: t.muted }}>
              Du darfst Vorhaben ruhen lassen. Im Archiv bleiben alle bisherigen
              Worte und Rückblicke erhalten.
            </T>
            <Button
              kind="ghost"
              icon="bookmark"
              disabled={busy || !!pending}
              onPress={() =>
                void mutate((d) =>
                  archiveGoal(d, id, true, new Date().toISOString()),
                )
              }
            >
              Vorhaben ins Archiv legen
            </Button>
            {pending && (
              <T style={{ fontSize: 11, color: t.muted }}>
                Schließe zuerst deinen Entwurf ab oder verwirf ihn ausdrücklich.
              </T>
            )}
          </Card>
        )}
      </View>
    </Shell>
  );
}
