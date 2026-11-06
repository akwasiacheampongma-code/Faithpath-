import { useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Shell } from "../../src/components/Shell";
import { T, Tag, Button, Card, IconButton } from "../../src/components/ui";
import { useTheme } from "../../src/design-system/theme";
import { useApp } from "../../src/state/store";
import { newId, type Draft } from "../../src/features/personal/schema";
import {
  archiveGoal,
  goalSnapshot,
  setStepDone,
} from "../../src/features/personal/model";
import {
  GoalEditor,
  StepEditor,
  ReviewEditor,
} from "../../src/features/personal/Editors";
import { referenceLabel } from "../../src/features/bible/repository";

export default function GoalDetail() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    data = useApp((s) => s.data),
    mutate = useApp((s) => s.mutate),
    busy = useApp((s) => s.busy),
    t = useTheme(),
    [open, setOpen] = useState(false);
  const goal = data.goals.find((g) => g.id === id),
    pending = data.drafts.find((d) =>
      d.type === "goal"
        ? d.values.targetId === id
        : d.type === "step" || d.type === "review"
          ? d.values.goalId === id
          : false,
    );
  if (!goal)
    return (
      <Shell>
        <Card style={{ gap: 16 }}>
          <T variant="heading">Dieses Vorhaben ist nicht vorhanden.</T>
          <Button onPress={() => router.dismissTo("/vorhaben")}>
            Zu deinen Vorhaben
          </Button>
        </Card>
      </Shell>
    );
  const stale =
    pending &&
    pending.type !== "journal" &&
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
    if (!pending || pending.type === "journal" || !goal) return;
    const updated = {
      ...pending,
      values: { ...pending.values, baseRevision: goal.revision },
      updatedAt: new Date().toISOString(),
    } as Draft;
    if (await useApp.getState().saveEditorDraft(updated, pending))
      setOpen(true);
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
              disabled={busy || !!goal.archivedAt}
              onPress={() => setOpen(true)}
            >
              Diesen Entwurf fortsetzen
            </Button>
          </Card>
        )}
        {pending && open && !goal.archivedAt && (
          <>
            <Button kind="ghost" icon="close" onPress={() => setOpen(false)}>
              Editor schließen und Entwurf behalten
            </Button>
            {stale ? (
              <Card style={{ backgroundColor: t.goldSoft, gap: 14 }}>
                <T variant="heading">
                  Dein Entwurf stammt von einem früheren Stand.
                </T>
                <T style={{ fontSize: 12 }}>
                  Das Vorhaben wurde inzwischen verändert. Deine Entwurfsworte
                  bleiben erhalten. Aktueller Titel: „{goal.title}“. Prüfe ihn
                  und die Schritte weiter unten. Mit der nächsten Aktion
                  verbindest du den alten Entwurf ausdrücklich mit diesem Stand;
                  gespeichert wird er erst über den Editor.
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
        <View style={{ gap: 14 }}>
          <T variant="heading">Deine Rückblicke</T>
          {goal.reviews.map((review) => (
            <Card key={review.id} style={{ gap: 14 }}>
              <Tag icon="heart">
                {new Date(review.createdAt).toLocaleDateString("de-DE")} · dein
                eigener Rückblick
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
