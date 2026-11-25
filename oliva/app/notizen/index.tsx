import { useState } from "react";
import { View } from "react-native";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { Button, Field, T } from "../../src/components/ui";
import { useTheme } from "../../src/design-system/theme";
import { sameBibleChapter } from "../../src/features/bible/reference-key";
import { editionReferenceLabel } from "../../src/features/bible/repository";
import { resumeNotebookEdits } from "../../src/features/notebook/autosave";
import { bibleNoteFilter, bibleNoteParams, linkDetails, linksChapter, type BibleNoteParams } from "../../src/features/notebook/links";
import { notebookStamp, notebookText, type NotebookNote } from "../../src/features/notebook/model";
import { NotebookFrame } from "../../src/features/notebook/NotebookFrame";
import { NoteListRow } from "../../src/features/notebook/NoteListRow";
import { usePendingNotes } from "../../src/features/notebook/pending";
import { normalizeCollectionText } from "../../src/features/personal/collection-model";
import { newId } from "../../src/features/personal/schema";
import { useApp } from "../../src/state/store";

const visible = (value: string, query: string) => normalizeCollectionText(value).includes(query);

export default function NotebookList() {
  const params = useLocalSearchParams<BibleNoteParams & { ansicht?: string }>();
  const filter = bibleNoteFilter(params);
  const trash = params.ansicht === "geloescht";
  if (!filter && !trash) return <Redirect href="/sammlung" />;
  return <ScopedNotes filter={filter} trash={trash} />;
}

function ScopedNotes({ filter, trash }: { filter: ReturnType<typeof bibleNoteFilter>; trash: boolean }) {
  const t = useTheme();
  const notebook = useApp((state) => state.data.notebook) ?? [];
  const oldNotes = useApp((state) => state.data.notes);
  const drafts = usePendingNotes((state) => state.edits);
  const [query, setQuery] = useState("");
  const [purge, setPurge] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const needle = normalizeCollectionText(query);
  const matches = notebook.filter((entry) => !!entry.deletedAt === trash &&
    (!filter || trash || linksChapter(entry.link, filter)) &&
    visible(entry.text + " " + (entry.link ? linkDetails(entry.link).label : ""), needle))
    .sort((a, b) => (trash ? (b.deletedAt ?? "").localeCompare(a.deletedAt ?? "") :
      Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt)));
  const held = Object.entries(drafts).filter(([key, entry]) =>
    !trash && !notebook.some((note) => note.id === key || note.id === entry.targetId) &&
    (!filter || linksChapter(entry.link, filter)) && visible(entry.text, needle));
  const archived = filter && !trash ? oldNotes.filter((entry) => !!entry.ref && sameBibleChapter(entry.ref, filter) && visible(entry.text, needle)) : [];
  const pinned = matches.filter((note) => !trash && note.pinned);
  const others = matches.filter((note) => trash || !note.pinned);
  const open = (id: string) => router.push({ pathname: "/notizen/[id]", params: { id } });
  const newNote = () => router.push({ pathname: "/notizen/[id]", params: { id: newId("notiz"), neu: "1", ...bibleNoteParams(filter) } });
  const back = () => {
    if (router.canGoBack()) router.back();
    else if (trash && filter) router.replace({ pathname: "/notizen", params: bibleNoteParams(filter) });
    else if (filter) router.replace(linkDetails({ kind: "bible", ref: filter }).href);
    else router.replace("/sammlung");
  };
  const row = (id: string, note: Pick<NotebookNote, "text" | "updatedAt" | "link">, pending = false) =>
    <NoteListRow key={id} text={note.text} updatedAt={note.updatedAt} pending={pending}
      context={note.link ? linkDetails(note.link).label : undefined} onOpen={() => open(id)} />;
  async function action(entry: NotebookNote, command: "restore" | "purge") {
    if (working) return;
    setWorking(true);
    setError("");
    try {
      if (!await useApp.getState().changeNotebookNote(entry.id, notebookStamp(entry), command))
        setError(useApp.getState().error ?? "Die Notiz konnte gerade nicht geändert werden.");
      else setPurge(null);
    } finally { setWorking(false); }
  }
  return <NotebookFrame title={trash ? "Zuletzt gelöscht" : "Notizen"}
    backLabel={trash && filter ? "Notizen" : !trash && filter ? "Bibeltext" : "Sammlung"}
    back={back}
    action={!trash && <Button kind="ghost" icon="pen" onPress={newNote}>Neue Notiz</Button>}>
    {!trash && <Field label="Notizen suchen" placeholder="Titel, Text oder Bibelstelle" value={query} onChangeText={setQuery} />}
    {filter && !trash && <View style={{ backgroundColor: t.soft, padding: 12, borderRadius: 12, flexDirection: "row", alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
      <T variant="small" style={{ color: t.primary }}>{editionReferenceLabel({ book: filter.book, chapter: filter.chapter, edition: filter.edition })}</T>
      <Button kind="ghost" icon={null} onPress={() => router.replace("/sammlung")}>Alle Notizen</Button>
    </View>}
    {!trash && <View style={{ alignItems: "flex-start" }}>
      <Button kind="ghost" icon={null} onPress={() => {
        setQuery(""); setError(""); setPurge(null);
        router.push({ pathname: "/notizen", params: { ...bibleNoteParams(filter), ansicht: "geloescht" } });
      }}>Zuletzt gelöscht</Button>
    </View>}
    {error && <T accessibilityRole="alert">{error}</T>}
    {!!Object.keys(drafts).length && !trash && <View style={{ gap: 4 }}>
      <T variant="small">Eine Eingabe wartet noch auf das Speichern.</T>
      <Button kind="secondary" icon={null} onPress={() => void resumeNotebookEdits()}>Erneut versuchen</Button>
    </View>}
    {!!held.length && <View>{held.map(([id, item]) => row(id, item, true))}</View>}
    {!!pinned.length && <View>
      <T variant="heading" accessibilityRole="header" style={{ fontSize: 19 }}>Angeheftet</T>
      {pinned.map((entry) => row(entry.id, entry))}
    </View>}
    {!!others.length && <View>{others.map((entry) => trash ? <View key={entry.id}
      style={{ paddingVertical: 14, gap: 8, borderBottomWidth: 1, borderColor: t.line }}>
      <T style={{ fontSize: 17, fontWeight: "700" }}>{notebookText(entry.text).title}</T>
      {!!notebookText(entry.text).preview && <T numberOfLines={3} variant="small">{notebookText(entry.text).preview}</T>}
      <Button kind="secondary" disabled={working} onPress={() => void action(entry, "restore")}>Wiederherstellen</Button>
      {purge === entry.id ? <>
        <T accessibilityRole="alert">Diese Notiz wird aus OLIVA gelöscht. Vorhandene Sicherungen können weiterhin eine Kopie enthalten.</T>
        <Button disabled={working} onPress={() => void action(entry, "purge")}>Endgültiges Löschen bestätigen</Button>
        <Button kind="ghost" onPress={() => setPurge(null)}>Abbrechen</Button>
      </> : <Button kind="ghost" disabled={working} onPress={() => setPurge(entry.id)}>Endgültig löschen</Button>}
    </View> : row(entry.id, entry))}</View>}
    {!!archived.length && <View>
      <T variant="heading" accessibilityRole="header" style={{ fontSize: 19 }}>Aus der Sammlung</T>
      {archived.map((item) => <NoteListRow key={item.id} text={item.text} updatedAt={item.updatedAt}
        onOpen={() => router.push({ pathname: "/sammlung", params: { note: item.id, view: "read" } })} />)}
    </View>}
    {!matches.length && !held.length && !archived.length && <View style={{ paddingVertical: 30 }}>
      <T variant="heading" style={{ color: t.primary }}>{trash ? "Hier ist gerade nichts gelöscht." : needle ? "Keine passenden Notizen." : "Hier ist Platz für deine Gedanken."}</T>
    </View>}
  </NotebookFrame>;
}
