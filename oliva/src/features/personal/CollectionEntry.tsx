import { useState } from "react";
import { Keyboard, View } from "react-native";
import { router } from "expo-router";
import { Button, T } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import type { Note } from "../../state/model";
import { useApp } from "../../state/store";
import { referenceLabel } from "../bible/repository";
import { NotebookFrame } from "../notebook/NotebookFrame";
import { NoteTextInput } from "../notebook/NoteTextInput";
import { CaptureContext } from "./CaptureContext";
import { captureBibleDestination } from "./capture-presentation";
import { DraftStatus } from "./DraftStatus";
import { EditorFooter, useEditorActions } from "./Editors";
import { journalDraft } from "./model";
import type { DraftOf } from "./schema";
import { useVolatileDrafts } from "./volatile-drafts";

function closeEntry(tab?: "Entwürfe") {
  Keyboard.dismiss();
  if (router.canGoBack()) router.back();
  else if (tab) router.replace({ pathname: "/sammlung", params: { tab } });
  else router.replace("/sammlung");
}

const journalKinds = { note: "Gedanke", reflection: "Reflexion", action: "Erfahrung" } as const;

function Details({ note }: { note: Note }) {
  const theme = useTheme();
  const goals = useApp((state) => state.data.goals);
  const ref = note.ref;
  const origin = note.origin;
  return <View style={{ gap: 10, alignItems: "flex-start" }}>
    {ref && <Button kind="ghost" icon="book" onPress={() => router.push(note.captureSource?.type === "passage"
      ? captureBibleDestination(note.captureSource)
      : { pathname: "/lesen/[book]", params: { book: ref.book, chapter: ref.chapter, verse: ref.from,
        ...(ref.from !== undefined && ref.to !== undefined && ref.to > ref.from ? { from: ref.from, to: ref.to } : {}) } })}>
      {referenceLabel(ref)}
    </Button>}
    {note.captureSource && <CaptureContext source={note.captureSource} />}
    {origin && <>
      <T variant="small" style={{ color: theme.muted }}>Aus FaithPath · {origin.referenceLabel ?? "eigene Worte"}</T>
      {goals.filter((goal) => note.goalIds?.includes(goal.id)).map((goal) =>
        <Button key={goal.id} kind="ghost" icon="path" onPress={() => router.push({ pathname: "/vorhaben/[id]", params: { id: goal.id } })}>{goal.title}</Button>)}
      <Button kind="ghost" icon="info" onPress={() => router.push({ pathname: "/importarchiv/[id]", params: { id: origin.importId } })}>
        Originalquelle dieses Gedankens
      </Button>
    </>}
  </View>;
}

export function CollectionEntry({ noteId, draftId, rediscovered }: { noteId?: string; draftId?: string; rediscovered: boolean }) {
  const data = useApp((state) => state.data);
  const held = useVolatileDrafts((state) => state.items);
  const drafts = [...Object.values(held).map(({ draft }) => draft), ...data.drafts];
  const saved = drafts.find((draft): draft is DraftOf<"journal"> => draft.type === "journal" &&
    (draftId ? draft.id === draftId : !!noteId && draft.values.targetId === noteId));
  const note = data.notes.find((entry) => entry.id === (noteId ?? saved?.values.targetId));
  const [reading, setReading] = useState(rediscovered);
  const [deleted, setDeleted] = useState<Note | null>(null);
  const busy = useApp((state) => state.busy);
  const theme = useTheme();
  const back = () => closeEntry(draftId ? "Entwürfe" : undefined);

  async function undo() {
    if (!deleted) return;
    if (await useApp.getState().mutate((profile) => {
      if (!profile.notes.some((entry) => entry.id === deleted.id)) profile.notes.unshift(deleted);
    })) setDeleted(null);
  }
  if (deleted) return <NotebookFrame title="Eintrag gelöscht" backLabel="Sammlung" back={back}>
    <Button kind="secondary" disabled={busy} onPress={() => void undo()}>Rückgängig machen</Button>
  </NotebookFrame>;
  if ((!note && !saved) || (draftId && !saved)) return <NotebookFrame title="Sammlung" backLabel="Sammlung" back={back}>
    <T>Dieser Eintrag ist hier nicht verfügbar.</T>
  </NotebookFrame>;
  if (reading && note) return <NotebookFrame title="Dein Gedanke" backLabel="Sammlung" back={back}>
    <View testID={`collection-note-${note.id}`} style={{ gap: 16 }}>
      <T variant="small" style={{ color: theme.muted }}>Dein wiederentdeckter Gedanke</T>
      <T style={{ fontSize: 19, lineHeight: 30 }}>{note.text}</T>
      <Details note={note} />
      <Button kind="secondary" icon="pen" onPress={() => setReading(false)}>Bearbeiten</Button>
    </View>
  </NotebookFrame>;
  return <WritingEntry note={note} existingDraft={saved} onClose={back} onDeleted={setDeleted} />;
}

function WritingEntry({ note, existingDraft, onClose, onDeleted }: {
  note?: Note;
  existingDraft?: DraftOf<"journal">;
  onClose: () => void;
  onDeleted: (note: Note) => void;
}) {
  // Existing keys remain readable. Separate edits use the same draft envelope,
  // so opening another saved thought does not claim a prior draft's slot.
  const [draft] = useState(() => {
    if (existingDraft) return existingDraft;
    const initial = journalDraft(note);
    return note ? { ...initial, key: `journal:${note.id}` } : initial;
  });
  const editor = useEditorActions<"journal">(draft, onClose);
  const error = useApp((state) => state.error);
  const [options, setOptions] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const changed = editor.values.text !== note?.text;
  const canSave = !!editor.values.text.trim() && (changed || !!existingDraft);

  function back() {
    Keyboard.dismiss();
    if (editor.working) return;
    if (note && canSave) editor.save();
    else onClose();
  }

  async function remove() {
    if (!note || editor.working || !await editor.flush()) return;
    const removed = await useApp.getState().mutate((profile) => {
      profile.notes = profile.notes.filter((entry) => entry.id !== note.id);
    });
    if (removed) onDeleted(note);
  }

  const title = note?.kind === "reflection" ? "Reflexion" : note?.kind === "action" ? "Erfahrung" : note?.ref ? "Bibelnotiz" : "Gedanke";
  return <NotebookFrame title={title} backLabel="Sammlung" back={back}
    action={<Button kind="ghost" icon={null} onPress={() => {
      Keyboard.dismiss();
      setOptions(!options);
      setConfirmDelete(false);
    }}>{options ? "Optionen schließen" : "Optionen"}</Button>}>
    {!editor.values.targetId && <View style={{ flexDirection: "row", gap: 7, flexWrap: "wrap" }}>
      {(["note", "reflection", "action"] as const).map((kind) => (
        <Button key={kind} kind={editor.values.kind === kind ? "primary" : "secondary"} icon={null}
          disabled={editor.working} onPress={() => editor.change({ ...editor.values, kind })}>{journalKinds[kind]}</Button>
      ))}
    </View>}
    <NoteTextInput accessibilityLabel="Deine Worte" value={editor.values.text} editable={!editor.working}
      onChangeText={(text) => editor.change({ ...editor.values, text })} />
    {error && <>
      <T accessibilityRole="alert" variant="small">{error}</T>
      <Button kind="ghost" onPress={onClose}>Entwurf behalten und zurück</Button>
    </>}
    {options || !note ? <>
      <EditorFooter status={editor.status} working={editor.working} canSave={canSave} label="Gedanken speichern"
        onSave={editor.save} onDiscard={editor.discard} canDiscard={changed || !!existingDraft} />
      {note && (confirmDelete ? <>
        <T accessibilityRole="alert">Diesen persönlichen Eintrag wirklich löschen?</T>
        <Button kind="secondary" disabled={editor.working} onPress={() => void remove()}>Eintrag jetzt löschen</Button>
        <Button kind="ghost" onPress={() => setConfirmDelete(false)}>Behalten</Button>
      </> : <Button kind="ghost" icon="close" onPress={() => setConfirmDelete(true)}>Löschen</Button>)}
    </> : (changed || !!existingDraft) && <DraftStatus status={editor.status} />}
    {note && <Details note={note} />}
  </NotebookFrame>;
}
