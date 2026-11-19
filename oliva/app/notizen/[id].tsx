import { useEffect, useRef, useState } from "react";
import { AppState, Keyboard, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, T } from "../../src/components/ui";
import { tokens, useTheme } from "../../src/design-system/theme";
import { useApp } from "../../src/state/store";
import { changeNotebookText, flushNotebookNote } from "../../src/features/notebook/autosave";
import { NotebookFrame } from "../../src/features/notebook/NotebookFrame";
import { usePendingNotes } from "../../src/features/notebook/pending";
import { NOTE_TEXT_LIMIT, notebookId, notebookStamp, noteMatches, type NoteAction, type NotebookContent } from "../../src/features/notebook/model";
import { initialNotebookLink, linkDetails, type NotebookEntryParams } from "../../src/features/notebook/links";
import { LinkPicker } from "../../src/features/notebook/LinkPicker";
import { noteAccessActivity } from "../../src/features/security/access";

export default function NotebookPage() {
  const args = useLocalSearchParams<NotebookEntryParams>();
  if (!notebookId.safeParse(args.id).success)
    return <NotebookFrame title="Notiz" backLabel="Notizen" back={() => router.replace("/notizen")}>
      <T>Diese Notiz ist hier nicht verfügbar.</T>
    </NotebookFrame>;
  return <NotebookEditor key={args.id} args={args} />;
}

function NotebookEditor({ args }: { args: NotebookEntryParams }) {
  const { id } = args;
  const t = useTheme();
  const entry = useApp((state) => state.data.notebook?.find((note) => note.id === id));
  const recentPassage = useApp((state) => state.data.reading);
  const pending = usePendingNotes((state) => state.edits[id]);
  const initialLink = initialNotebookLink(args);
  const originalContext = args.quelle && initialLink ? linkDetails(initialLink) : null;
  const link = pending ? pending.link : entry ? entry.link : initialLink;
  const text = pending?.text ?? entry?.text ?? "";
  const [menu, setMenu] = useState(false);
  const [picker, setPicker] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const latest = useRef(0);
  const mounted = useRef(false);
  const leaving = useRef(false);
  useEffect(() => {
    mounted.current = true;
    const change = AppState.addEventListener("change", (state) => {
      if (state !== "active" && usePendingNotes.getState().edits[id]) void flushNotebookNote(id);
    });
    return () => { mounted.current = false; change.remove(); };
  }, [id]);

  const finish = (task: ReturnType<typeof flushNotebookNote>) => {
    const update = ++latest.current;
    setError("");
    void task.then((result) => {
      if (update !== latest.current || !mounted.current || leaving.current) return;
      if (result.error) setError(result.error);
      else if (result.copied && result.note && result.note.id !== id)
        router.replace({ pathname: "/notizen/[id]", params: { id: result.note.id, kopie: "1" } });
    });
  };
  function edit(content: NotebookContent) {
    noteAccessActivity();
    finish(changeNotebookText(id, entry, content));
  }
  function back() {
    if (leaving.current) return;
    leaving.current = true;
    Keyboard.dismiss();
    if (pending) void flushNotebookNote(id);
    if (router.canGoBack()) router.back();
    else router.replace(originalContext?.href ?? "/notizen");
  }
  async function action(command: NoteAction) {
    if (!entry || working) return;
    setWorking(true);
    setError("");
    try {
      const result = await flushNotebookNote(id);
      if (result.error) { setError(result.error); return; }
      const saved = result.note ?? useApp.getState().data.notebook?.find((note) => note.id === id);
      if (!saved || !await useApp.getState().changeNotebookNote(saved.id, notebookStamp(saved), command)) {
        setError(useApp.getState().error ?? "Die Notiz konnte gerade nicht geändert werden.");
        return;
      }
      setMenu(false);
      if (command === "delete") back();
    } finally { setWorking(false); }
  }
  const missing = (!entry && !pending && args.neu !== "1") || (entry?.deletedAt && !pending);
  if (missing) return <NotebookFrame title="Notiz" backLabel="Notizen" back={back}>
    <T>{entry?.deletedAt ? "Diese Notiz liegt unter „Zuletzt gelöscht“." : "Diese Notiz ist hier nicht verfügbar."}</T>
    {entry?.deletedAt && <Button kind="secondary" onPress={() => router.replace({ pathname: "/notizen", params: { ansicht: "geloescht" } })}>Zuletzt gelöscht öffnen</Button>}
  </NotebookFrame>;
  const attached = link ? linkDetails(link) : null;
  const matchesOriginalContext = originalContext && noteMatches({ text: "", link }, { text: "", link: initialLink });
  const backLabel = originalContext ? initialLink?.kind === "bible" ? "Bibeltext" : "Reflexion" : "Notizen";
  return <NotebookFrame title={args.neu === "1" && !entry ? "Neue Notiz" : "Notiz"} backLabel={backLabel} back={back}
    action={<Button kind="ghost" icon={null} disabled={working} onPress={() => {
      Keyboard.dismiss(); setMenu(!menu); setPicker(false); setConfirm(false);
    }}>{menu ? "Optionen schließen" : "Optionen"}</Button>}>
    {args.kopie === "1" && <T accessibilityRole="alert" style={{ color: t.primary }}>
      Diese Fassung wurde wegen einer Änderung im anderen Fenster als eigene Notiz gespeichert. Die andere Fassung bleibt erhalten.
    </T>}
    {menu && <View style={{ gap: 8, padding: 12, backgroundColor: t.soft, borderRadius: 14 }}>
      <Button kind="secondary" icon={null} onPress={() => setPicker(!picker)}>{link ? "Verknüpfung ändern" : "Verknüpfung hinzufügen"}</Button>
      {link && <Button kind="ghost" icon={null} onPress={() => { edit({ text, link: null }); setMenu(false); }}>Verknüpfung entfernen</Button>}
      {entry && <>
        <Button kind="ghost" icon={null} disabled={working} onPress={() => void action(entry.pinned ? "unpin" : "pin")}>
          {entry.pinned ? "Anheftung lösen" : "Notiz anheften"}
        </Button>
        {confirm ? <>
          <T accessibilityRole="alert">Die Notiz kann unter „Zuletzt gelöscht“ wiederhergestellt werden.</T>
          <Button disabled={working} onPress={() => void action("delete")}>Löschen bestätigen</Button>
          <Button kind="ghost" onPress={() => setConfirm(false)}>Abbrechen</Button>
        </> : <Button kind="ghost" icon={null} onPress={() => setConfirm(true)}>Notiz löschen</Button>}
      </>}
    </View>}
    {picker && <LinkPicker current={link?.kind === "bible" ? link.ref : recentPassage}
      close={() => setPicker(false)} select={(next) => {
        edit({ text, link: next }); setPicker(false); setMenu(false);
      }} />}
    {attached && <View style={{ alignItems: "flex-start", borderBottomWidth: 1, borderColor: t.line, paddingBottom: 4 }}>
      <Button kind="ghost" icon={null} onPress={() => {
        if (matchesOriginalContext) { back(); return; }
        if (pending) void flushNotebookNote(id);
        Keyboard.dismiss();
        router.push(attached.href);
      }}>{attached.label} →</Button>
    </View>}
    <TextInput accessibilityLabel="Notiztext" multiline autoFocus={args.neu === "1"} editable={!working}
      value={text} onChangeText={(value) => edit({ text: value, link })}
      placeholder="Hier ist Platz für deine Gedanken." placeholderTextColor={t.muted}
      maxLength={NOTE_TEXT_LIMIT}
      selectionColor={t.primary}
      style={{ padding: 0, paddingBottom: 12, minHeight: 250, textAlignVertical: "top", color: t.text,
        fontFamily: tokens.font.body, fontSize: 19, lineHeight: 30 }} />
    {text.length >= NOTE_TEXT_LIMIT && <T variant="small" accessibilityLiveRegion="polite">
      Diese Notiz hat ihre maximale Länge erreicht.
    </T>}
    <T variant="small" accessibilityLiveRegion="polite" style={{ color: error ? t.danger : t.muted }}>
      {error ? "Deine Worte warten noch auf das Speichern." : pending ? "Wird gespeichert …" : entry ? "Auf diesem Gerät gespeichert" : "Die erste Zeile wird zum Titel."}
    </T>
    {error && <View style={{ alignItems: "flex-start", gap: 4 }}>
      <T variant="small" accessibilityRole="alert">{error}</T>
      {pending && <Button kind="secondary" onPress={() => finish(flushNotebookNote(id))}>Erneut speichern</Button>}
    </View>}
  </NotebookFrame>;
}
