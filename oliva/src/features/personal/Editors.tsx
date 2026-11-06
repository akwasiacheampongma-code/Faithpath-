import { useState, useEffect, useRef } from "react";
import { View, Switch } from "react-native";
import { T, Field, Button, Card, Tag } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { useApp } from "../../state/store";
import { commitDraft, removeDraft } from "./model";
import type { Draft, DraftOf } from "./schema";
import { useDraft } from "./useDraft";
import { DraftStatus } from "./DraftStatus";
import { referenceLabel } from "../bible/repository";

export function EditorFooter({
  status,
  working,
  canSave,
  label,
  onSave,
  onDiscard,
  canDiscard = true,
}: {
  status?: "saved" | "saving" | "error";
  working: boolean;
  canSave: boolean;
  label: string;
  onSave: () => void;
  onDiscard: () => void;
  canDiscard?: boolean;
}) {
  const [confirm, setConfirm] = useState(false);
  return (
    <View style={{ gap: 12 }}>
      {status && <DraftStatus status={status} />}
      <Button icon="check" disabled={!canSave || working} onPress={onSave}>
        {label}
      </Button>
      {canDiscard && (
        <Button
          kind="ghost"
          icon="close"
          disabled={working}
          onPress={() => setConfirm(!confirm)}
        >
          Entwurf verwerfen
        </Button>
      )}
      {confirm && canDiscard && (
        <Card style={{ gap: 10 }}>
          <T style={{ fontSize: 12 }}>
            Diesen Entwurf mit deinen bisherigen Eingaben wirklich verwerfen?
          </T>
          <Button
            kind="secondary"
            icon="close"
            disabled={working}
            onPress={onDiscard}
          >
            Entwurf endgültig verwerfen
          </Button>
          <Button kind="ghost" icon={null} onPress={() => setConfirm(false)}>
            Entwurf behalten
          </Button>
        </Card>
      )}
    </View>
  );
}
export function useEditorActions<T extends Draft["type"]>(
  draft: DraftOf<T>,
  onDone: (result?: string) => void,
) {
  const editor = useDraft<T>(draft),
    notified = useRef(false),
    mutate = useApp((s) => s.mutate),
    busy = useApp((s) => s.busy),
    [working, setWorking] = useState(false);
  function notify(result?: string) {
    if (!notified.current) {
      notified.current = true;
      onDone(result);
    }
  }
  useEffect(() => {
    if (editor.obsolete) {
      editor.close();
      notify();
    }
  }, [editor.obsolete]);
  async function finish(discard = false, completeGuided = true) {
    if (working) return;
    setWorking(true);
    try {
      const saved = await editor.flush(true);
      if (!saved) return;
      let result: string | undefined;
      const ok = await mutate((d) => {
        if (discard) removeDraft(d, saved.key, saved);
        else
          result = commitDraft(d, saved.key, saved, new Date().toISOString(), {
            completeGuided,
          });
      });
      if (ok) {
        editor.close();
        notify(result);
      }
    } finally {
      setWorking(false);
    }
  }
  return {
    ...editor,
    working: working || busy || editor.obsolete,
    save: () => void finish(),
    discard: () => void finish(true),
    preserve: () => void finish(false, false),
  };
}
export function JournalEditor({
  draft,
  onDone,
}: {
  draft: DraftOf<"journal">;
  onDone: () => void;
}) {
  const e = useEditorActions<"journal">(draft, onDone),
    v = e.values,
    labels = { note: "Gedanke", reflection: "Reflexion", action: "Erfahrung" };
  return (
    <Card style={{ gap: 16 }}>
      <T variant="heading">
        {v.targetId ? "Deine Worte bearbeiten" : "Hier ist Platz für dich."}
      </T>
      {!v.targetId && (
        <View style={{ flexDirection: "row", gap: 7, flexWrap: "wrap" }}>
          {(["note", "reflection", "action"] as const).map((kind) => (
            <Button
              key={kind}
              kind={v.kind === kind ? "primary" : "secondary"}
              icon={null}
              disabled={e.working}
              onPress={() => e.change({ ...v, kind })}
            >
              {labels[kind]}
            </Button>
          ))}
        </View>
      )}
      <Field
        label="Deine Worte"
        value={v.text}
        onChangeText={(text) => e.change({ ...v, text })}
        editable={!e.working}
        multiline
        maxLength={10000}
      />
      <EditorFooter
        status={e.status}
        working={e.working}
        canSave={!!v.text.trim()}
        label="Gedanken speichern"
        onSave={e.save}
        onDiscard={e.discard}
      />
    </Card>
  );
}
export function GoalEditor({
  draft,
  onDone,
}: {
  draft: DraftOf<"goal">;
  onDone: (id?: string) => void;
}) {
  const e = useEditorActions<"goal">(draft, onDone),
    v = e.values,
    t = useTheme();
  return (
    <Card style={{ gap: 17 }}>
      <Tag icon="leaf">Dein Vorhaben · dein Tempo</Tag>
      <T variant="heading">
        {v.targetId
          ? "Dein Vorhaben bearbeiten"
          : "Was möchtest du im Alltag ausprobieren?"}
      </T>
      <Field
        label="Name deines Vorhabens"
        value={v.title}
        editable={!e.working}
        maxLength={120}
        placeholder="Zum Beispiel: In Ruhe zuhören"
        onChangeText={(title) => e.change({ ...v, title })}
      />
      <Field
        label="Was bewegt dich? (freiwillig)"
        value={v.why}
        editable={!e.working}
        multiline
        maxLength={3000}
        placeholder="Hier ist Platz für dein Anliegen …"
        onChangeText={(why) => e.change({ ...v, why })}
      />
      {!v.targetId && (
        <Field
          label="Dein erster kleiner Schritt (freiwillig)"
          value={v.initialStep}
          editable={!e.working}
          multiline
          maxLength={1000}
          placeholder="Ein kleiner, frei gewählter Versuch reicht."
          onChangeText={(initialStep) => e.change({ ...v, initialStep })}
        />
      )}
      <T style={{ fontSize: 11, color: t.muted }}>
        Du legst dein Tempo selbst fest. Schritte und Rückblicke bewerten weder
        deinen Glauben noch deinen Wert.
      </T>
      {v.ref && (
        <View style={{ gap: 8 }}>
          <Tag icon="book">{referenceLabel(v.ref)}</Tag>
          <Button
            kind="ghost"
            icon="close"
            disabled={e.working}
            onPress={() => {
              const { ref, ...remaining } = v;
              e.change(remaining);
            }}
          >
            Bibelbezug aus diesem Entwurf entfernen
          </Button>
        </View>
      )}
      <EditorFooter
        status={e.status}
        working={e.working}
        canSave={!!v.title.trim()}
        label={
          v.targetId ? "Änderungen am Vorhaben speichern" : "Vorhaben anlegen"
        }
        onSave={e.save}
        onDiscard={e.discard}
      />
    </Card>
  );
}
export function StepEditor({
  draft,
  onDone,
}: {
  draft: DraftOf<"step">;
  onDone: () => void;
}) {
  const e = useEditorActions<"step">(draft, onDone),
    v = e.values;
  return (
    <Card style={{ gap: 17 }}>
      <T variant="heading">
        {v.editing
          ? "Deinen Schritt bearbeiten"
          : "Ein kleiner nächster Schritt"}
      </T>
      <Field
        label="Dein kleiner Schritt"
        value={v.text}
        onChangeText={(text) => e.change({ ...v, text })}
        editable={!e.working}
        multiline
        maxLength={1000}
        placeholder="Was möchtest du ausprobieren?"
      />
      <EditorFooter
        status={e.status}
        working={e.working}
        canSave={!!v.text.trim()}
        label="Schritt speichern"
        onSave={e.save}
        onDiscard={e.discard}
      />
    </Card>
  );
}
export function ReviewEditor({
  draft,
  onDone,
}: {
  draft: DraftOf<"review">;
  onDone: () => void;
}) {
  const e = useEditorActions<"review">(draft, onDone),
    v = e.values,
    t = useTheme();
  return (
    <Card style={{ gap: 17 }}>
      <T variant="heading">Mit einem freundlichen Blick zurück</T>
      <T style={{ fontSize: 12, color: t.muted }}>
        Was hast du erlebt? Was ist offen geblieben? Dein Rückblick hält auch
        den Stand des Vorhabens fest, mit dem du diesen Entwurf begonnen hast.
      </T>
      <Tag>Damals: {v.source.title}</Tag>
      <Field
        label="Dein freiwilliger Rückblick"
        value={v.text}
        onChangeText={(text) => e.change({ ...v, text })}
        editable={!e.working}
        multiline
        maxLength={10000}
      />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>
        <View style={{ flex: 1 }}>
          <T style={{ fontSize: 12 }}>
            Ich habe etwas bewusst im Alltag ausprobiert.
          </T>
          <T style={{ fontSize: 10, color: t.muted }}>
            Nur deine eigene Einschätzung zählt. Ein offener oder schwieriger
            Versuch darf genauso bleiben.
          </T>
        </View>
        <Switch
          accessibilityLabel="Erfahrung im Alltag selbst bestätigen"
          value={v.applied}
          disabled={e.working}
          onValueChange={(applied) => e.change({ ...v, applied })}
          trackColor={{ false: t.line, true: t.primary }}
        />
      </View>
      <EditorFooter
        status={e.status}
        working={e.working}
        canSave={!!v.text.trim()}
        label="Rückblick festhalten"
        onSave={e.save}
        onDiscard={e.discard}
      />
    </Card>
  );
}
