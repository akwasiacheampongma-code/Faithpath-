import { useState } from "react";
import { View } from "react-native";
import { Button, Field, T } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { BOOKS, bookByCode, validReference, type Reference } from "../bible/repository";
import { normalizeBookSearch } from "../bible/book-search";
import { ALL_PATHS } from "../paths/catalog";
import { DAILY_QUESTION } from "../personal/capture-model";
import { normalizeStorySearch, STORIES } from "../stories/index";
import type { NotebookLink } from "./model";

const groups = ["Bibelstelle", "Weg", "Geschichte", "Reflexionsfrage"] as const;
type Group = (typeof groups)[number];

function BibleLink({ current, select }: { current: Reference; select: (link: NotebookLink) => void }) {
  const [book, setBook] = useState(current.book);
  const [chapter, setChapter] = useState(String(current.chapter));
  const [verses, setVerses] = useState("");
  const [query, setQuery] = useState("");
  const [selecting, setSelecting] = useState(false);
  const [error, setError] = useState("");
  const found = BOOKS.filter((item) => normalizeBookSearch(item.name + item.code).includes(normalizeBookSearch(query)));
  return <>
    {selecting ? <>
      <Field label="Bibelbuch suchen" autoFocus value={query} onChangeText={setQuery} />
      {found.slice(0, 8).map((item) => <Button key={item.code} kind="ghost" icon={null} onPress={() => {
        setBook(item.code); setChapter("1"); setSelecting(false); setError("");
      }}>{item.name}</Button>)}
      {!found.length && <T variant="small">Kein passendes Bibelbuch.</T>}
      {found.length > 8 && <T variant="small">Verfeinere die Suche, um ein Buch auszuwählen.</T>}
    </> : <>
      <Button kind="secondary" icon={null} onPress={() => { setSelecting(true); setQuery(""); }}>{bookByCode(book)?.name ?? "Bibelbuch"} ändern</Button>
      <Field label="Kapitel" value={chapter} onChangeText={setChapter} keyboardType="number-pad" maxLength={3} />
      <Field label="Vers oder Versbereich (freiwillig)" value={verses} onChangeText={setVerses} placeholder="Zum Beispiel 16 oder 16–18" maxLength={12} />
      {error && <T accessibilityRole="alert">{error}</T>}
      <Button onPress={() => {
        const value = verses.trim();
        const match = value.match(/^(\d+)(?:\s*[-–]\s*(\d+))?$/);
        const ref = { book, chapter: Number(chapter),
          ...(match ? { from: Number(match[1]), to: Number(match[2] ?? match[1]) } : {}) };
        if ((value && !match) || !/^\d+$/.test(chapter.trim()) || !validReference(ref)) {
          setError("Prüfe Kapitel und Versbereich."); return;
        }
        select({ kind: "bible", ref });
      }}>Bibelstelle verknüpfen</Button>
    </>}
  </>;
}

type Choice = { label: string; context?: string; link: NotebookLink };
const pathChoices: Choice[] = ALL_PATHS.map((path) => ({ label: path.title, link: { kind: "path", pathId: path.id } }));
const storyChoices: Choice[] = STORIES.map((story) => ({ label: story.title, context: story.referenceLabel, link: { kind: "story", storyId: story.id } }));
const questionChoices: Choice[] = [
  { label: DAILY_QUESTION, context: "Tagesreflexion", link: { kind: "daily-question" } },
  ...ALL_PATHS.flatMap((path) => path.steps.flatMap((step, index): Choice[] => step.question ? [{
    label: step.question, context: path.title, link: { kind: "path-question", pathId: path.id, step: index },
  }] : [])),
  ...STORIES.filter((story) => !!story.reflection).map((story): Choice => ({
    label: story.reflection, context: story.title, link: { kind: "story-question", storyId: story.id },
  })),
];

export function LinkPicker({ current, select, close }: {
  current: Reference; select: (link: NotebookLink) => void; close: () => void;
}) {
  const theme = useTheme();
  const [group, setGroup] = useState<Group>("Bibelstelle");
  const [query, setQuery] = useState("");
  const search = normalizeStorySearch(query);
  const list = group === "Weg" ? pathChoices : group === "Geschichte" ? storyChoices : questionChoices;
  const matches = group === "Bibelstelle" ? [] : list.filter((choice) =>
    normalizeStorySearch(`${choice.label} ${choice.context ?? ""}`).includes(search));
  return <View style={{ gap: 10, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface }}>
    <T accessibilityRole="header" variant="heading">Verknüpfung</T>
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
      {groups.map((item) => <Button key={item} selected={group === item} kind={group === item ? "secondary" : "ghost"} icon={null}
        style={{ minHeight: 44 }}
        onPress={() => { setGroup(item); setQuery(""); }}>{item}</Button>)}
    </View>
    {group === "Bibelstelle" ? <BibleLink current={current} select={select} /> : <>
      <Field label={`${group} suchen`} value={query} onChangeText={setQuery} />
      {matches.slice(0, 8).map((choice, index) => <Button key={index} kind="ghost" icon={null}
        onPress={() => select(choice.link)}>{choice.context ? `${choice.label} · ${choice.context}` : choice.label}</Button>)}
      {!matches.length && <T variant="small">Keine passenden Einträge gefunden.</T>}
      {matches.length > 8 && <T variant="small">Verfeinere die Suche, um die passende Stelle zu finden.</T>}
    </>}
    <Button kind="ghost" icon={null} onPress={close}>Schließen</Button>
  </View>;
}
