import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Shell } from "../src/components/Shell";
import { Button, Field, IconButton, T } from "../src/components/ui";
import { useTheme } from "../src/design-system/theme";
import { getPassage, referenceLabel } from "../src/features/bible/repository";
import { highlightBackground } from "../src/features/bible/highlights";
import { resumeNotebookEdits } from "../src/features/notebook/autosave";
import { NoteListRow } from "../src/features/notebook/NoteListRow";
import { usePendingNotes } from "../src/features/notebook/pending";
import { CollectionEntry } from "../src/features/personal/CollectionEntry";
import { CollectionSections, type CollectionSection } from "../src/features/personal/CollectionSections";
import {
  collectionRows,
  collectionSections,
  normalizeCollectionText,
} from "../src/features/personal/collection-model";
import { DraftLinks } from "../src/features/personal/DraftLinks";
import { newId } from "../src/features/personal/schema";
import { useVolatileDrafts } from "../src/features/personal/volatile-drafts";
import { useApp } from "../src/state/store";

export default function Collection() {
  const { tab, note, view, draft } = useLocalSearchParams<{ tab?: string; note?: string; view?: string; draft?: string }>();
  if (note || draft) {
    return <CollectionEntry key={JSON.stringify([note, draft, view])} noteId={note} draftId={draft} rediscovered={view === "read"} />;
  }
  const section = collectionSections.find((name) => name === tab) ?? "Gedanken";
  return <CollectionOverview initialSection={section} />;
}

function CollectionOverview({ initialSection }: { initialSection: CollectionSection }) {
  const theme = useTheme();
  const empty = useApp((state) => !state.data.notes.length && !state.data.notebook?.some((note) => !note.deletedAt));
  const compose = () => router.push({ pathname: "/notizen/[id]", params: { id: newId("notiz"), neu: "1" } });
  const [section, setSection] = useState(initialSection);
  const [query, setQuery] = useState("");
  useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);

  return <Shell header="compact">
    <View style={{ gap: 14, width: "100%", maxWidth: 600, alignSelf: "center" }}>
      <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 12, justifyContent: "space-between" }}>
        <T variant="title" accessibilityRole="header" style={{ flex: 1, minWidth: 128, fontSize: 34, lineHeight: 40 }}>Deine Sammlung.</T>
        {empty ? <Button kind="secondary" icon="pen" onPress={compose}
          style={{ maxWidth: "100%", paddingHorizontal: 10 }}>Neue Notiz</Button> :
          <View style={{ borderRadius: 24, backgroundColor: theme.soft }}>
            <IconButton name="pen" label="Neue Notiz" onPress={compose} />
          </View>}
      </View>
      <Field label="Deine Sammlung durchsuchen" placeholder="Titel, Text oder Bibelstelle" value={query} onChangeText={setQuery} />
      <CollectionSections sections={collectionSections} current={section} onChange={setSection} />
      {section === "Gedanken" || section === "Entwürfe"
        ? <WrittenEntries draftsOnly={section === "Entwürfe"} query={query} />
        : <SavedVerses bookmarks={section === "Lesezeichen"} query={query} />}
    </View>
  </Shell>;
}

function WrittenEntries({ draftsOnly, query }: { draftsOnly: boolean; query: string }) {
  const data = useApp((state) => state.data);
  const held = useVolatileDrafts((state) => state.items);
  const pending = usePendingNotes((state) => state.edits);
  const rows = useMemo(() => collectionRows(data.notes, data.notebook ?? [], pending,
    data.drafts, Object.values(held).map(({ draft, reason }) => ({ draft, pending: reason === "error" })), query),
    [data.notes, data.notebook, data.drafts, pending, held, query]);
  const notes = draftsOnly ? rows.filter((entry) => entry.type === "notebook" && entry.pending) : rows;

  return <View style={{ gap: 10 }}>
    {!!Object.keys(pending).length && <View style={{ alignItems: "flex-start", gap: 3 }}>
      <T variant="small" accessibilityLiveRegion="polite">Eine Eingabe wartet noch auf das Speichern.</T>
      <Button kind="ghost" icon={null} onPress={() => void resumeNotebookEdits()}>Erneut versuchen</Button>
    </View>}
    {!!notes.length && <View>
      {notes.map((entry, index) => {
        const legacy = entry.type === "legacy";
        return <View key={`${entry.type}:${entry.id}`}>
          {entry.pinned && index === 0 && <T variant="label" accessibilityRole="header" style={{ marginTop: 6 }}>Angeheftet</T>}
          <NoteListRow text={entry.text} updatedAt={entry.updatedAt} context={entry.context} pending={entry.pending}
            legacy={legacy} testID={`collection-${legacy ? "note" : "notebook"}-${entry.id}`}
            onOpen={() => router.push(legacy
              ? { pathname: "/sammlung", params: { note: entry.id } }
              : { pathname: "/notizen/[id]", params: { id: entry.id } })} />
        </View>;
      })}
    </View>}
    {draftsOnly ? <DraftLinks query={query} hasOtherDrafts={notes.length > 0} /> : <>
      {!notes.length && <Empty text={query.trim() ? "Keine passenden Einträge." : "Hier ist Platz für deine Gedanken."} />}
      <View style={{ alignItems: "flex-start" }}>
        <Button kind="ghost" icon={null} onPress={() => router.push({ pathname: "/notizen", params: { ansicht: "geloescht" } })}>
          Zuletzt gelöscht
        </Button>
      </View>
    </>}
  </View>;
}

function SavedVerses({ bookmarks, query }: { bookmarks: boolean; query: string }) {
  const theme = useTheme();
  const data = useApp((state) => state.data);
  const busy = useApp((state) => state.busy);
  const needle = normalizeCollectionText(query);
  const saved = bookmarks ? data.bookmarks : Object.keys(data.highlights);
  const rows = saved.flatMap((key) => {
    const [book, chapter, verse] = key.split(":");
    if (!book) return [];
    const ref = { book, chapter: Number(chapter), from: Number(verse), to: Number(verse) };
    const label = referenceLabel(ref);
    const text = getPassage(ref)[0]?.text ?? "";
    return normalizeCollectionText(`${label} ${text}`).includes(needle) ? [{ key, ref, label, text }] : [];
  });
  if (!rows.length) {
    return <Empty text={needle ? "Keine passenden Verse." : bookmarks ? "Deine Lesezeichen findest du hier wieder." : "Deine Markierungen findest du hier wieder."} />;
  }
  return <View>
    {rows.map(({ key, ref, label, text }) => (
      <View key={key} style={{ paddingVertical: 10, borderBottomWidth: 1, borderColor: theme.line, gap: 5 }}>
        <T style={{ fontWeight: "700" }}>{label}</T>
        <T numberOfLines={2} variant="small" style={bookmarks ? undefined : { backgroundColor: highlightBackground(data.highlights[key], theme.dark) }}>{text}</T>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <Button icon="book" kind="ghost" onPress={() => router.push({
            pathname: "/lesen/[book]", params: { book: ref.book, chapter: ref.chapter, verse: ref.from },
          })}>Im Kapitel öffnen</Button>
          <Button icon="close" kind="ghost" disabled={busy} onPress={() => void useApp.getState().mutate((profile) => {
            if (bookmarks) profile.bookmarks = profile.bookmarks.filter((entry) => entry !== key);
            else delete profile.highlights[key];
          })}>Entfernen</Button>
        </View>
      </View>
    ))}
  </View>;
}

function Empty({ text }: { text: string }) {
  return <T variant="small" style={{ paddingVertical: 14 }}>{text}</T>;
}
