import { useState } from "react";
import { View } from "react-native";
import { useApp } from "../../state/store";
import { T, Field, Button } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { referenceLabel } from "../bible/repository";
import {
  captureDraft,
  captureSourceCurrent,
  dailySource,
} from "./capture-model";
import { captureKey, type CaptureSource } from "./capture-schema";
import { EditorFooter, useEditorActions } from "./Editors";

export function CaptureInput({
  source,
  label,
  placeholder,
  onSaved,
  children,
}: {
  source: CaptureSource;
  label: string;
  placeholder?: string;
  onSaved?: () => void;
  children?: React.ReactNode;
}) {
  const [cycle, setCycle] = useState(0),
    [saved, setSaved] = useState(false);
  return (
    <CaptureSession
      key={captureKey(source) + ":" + cycle}
      source={source}
      label={label}
      placeholder={placeholder}
      saved={saved}
      onChanged={() => setSaved(false)}
      onDone={(result) => {
        setCycle((c) => c + 1);
        setSaved(result !== undefined);
        if (result !== undefined) onSaved?.();
      }}
    >
      {children}
    </CaptureSession>
  );
}
function CaptureSession({
  source,
  label,
  placeholder,
  onDone,
  onChanged,
  saved,
  children,
}: {
  source: CaptureSource;
  label: string;
  placeholder?: string;
  onDone: (result?: string) => void;
  onChanged: () => void;
  saved: boolean;
  children?: React.ReactNode;
}) {
  const t = useTheme(),
    [initial] = useState(() => {
      const pending = useApp
        .getState()
        .data.drafts.find((d) => d.key === captureKey(source));
      return pending?.type === "capture" ? pending : captureDraft(source);
    });
  const e = useEditorActions<"capture">(initial, onDone),
    v = e.values,
    stale = !captureSourceCurrent(v.source);
  const persisted = useApp((s) =>
    s.data.drafts.some((d) => d.id === initial.id),
  );
  const guided = v.source.type === "guided",
    done = useApp(
      (s) =>
        v.source.type === "guided" &&
        s.data.completedSteps.includes(`${v.source.pathId}:${v.source.step}`),
    );
  const hasDraft = persisted || !!v.text;
  return (
    <View style={{ gap: 12 }}>
      {initial.revision > 0 && (
        <T variant="small" style={{ color: t.muted }}>
          Dein angefangener Entwurf ist wieder da.
        </T>
      )}
      {v.source.type === "daily" && v.source.date !== dailySource().date && (
        <T variant="small" style={{ color: t.muted }}>
          Entwurf vom {v.source.date} · {v.source.question}
        </T>
      )}
      {v.source.type === "verse" && (
        <T variant="small" style={{ color: t.muted }}>
          Dein Bibelbezug: {referenceLabel(v.source.ref)} · Luther 1912
        </T>
      )}
      <Field
        label={label}
        placeholder={placeholder}
        value={v.text}
        multiline
        maxLength={10000}
        editable={!e.working}
        onChangeText={(text) => {
          onChanged();
          e.change({ ...v, text });
        }}
      />
      {children}
      {stale && (
        <View style={{ gap: 10 }}>
          <T
            accessibilityRole="alert"
            style={{ fontSize: 12, color: t.danger }}
          >
            Die Einordnung wurde seit deinem Entwurfsbeginn verändert. Deine
            ursprüngliche Frage und Worte bleiben erhalten. Bewahre sie zuerst
            als Reflexion; danach kannst du den aktuellen Abschnitt neu ansehen.
          </T>
          <Button
            kind="secondary"
            disabled={e.working || !v.text.trim()}
            onPress={e.preserve}
          >
            Nur Reflexion bewahren
          </Button>
        </View>
      )}
      {hasDraft || guided ? (
        <EditorFooter
          status={hasDraft ? e.status : undefined}
          canDiscard={hasDraft}
          working={e.working}
          canSave={!stale && (!!v.text.trim() || (guided && !done))}
          label={
            guided && !done
              ? v.text.trim()
                ? "Reflexion speichern & Schritt abschließen"
                : "Ohne Reflexion abschließen"
              : v.source.type === "experience"
                ? "Erfahrung festhalten"
                : v.source.type === "verse"
                  ? "Notiz speichern"
                  : v.source.type === "guided"
                    ? "Reflexion speichern"
                    : "Festhalten"
          }
          onSave={e.save}
          onDiscard={e.discard}
        />
      ) : (
        <T variant="small" style={{ fontSize: 11, color: t.muted }}>
          Deine Worte werden beim Schreiben als Entwurf lokal gesichert. Erst „
          {v.source.type === "experience"
            ? "Erfahrung festhalten"
            : v.source.type === "verse"
              ? "Notiz speichern"
              : "Festhalten"}
          “ legt einen Eintrag in deiner Sammlung an.
        </T>
      )}
      {saved && !hasDraft && (
        <T accessibilityRole="alert" style={{ fontSize: 11 }}>
          {v.source.type === "verse"
            ? "Deine Notiz wurde auf diesem Gerät gespeichert."
            : v.source.type === "experience"
              ? "Deine Erfahrung wurde lokal in der Sammlung gespeichert."
              : "Dein Gedanke wurde lokal gespeichert."}
        </T>
      )}
    </View>
  );
}
