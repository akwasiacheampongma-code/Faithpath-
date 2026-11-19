import { useRef, useState } from "react";
import { View } from "react-native";
import { Button, Card, Field, T } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { useApp } from "../../state/store";
import { parseBackup, type AppData } from "../../state/model";
import { pickBackupBytes } from "../../services/pick-backup";
import { MAX_BACKUP_BYTES } from "../imports/schema";
import { captureAccess } from "./access";
import { inspectBackupFile, MAX_PASSWORD_BACKUP_BYTES, openProtectedBackup } from "./backup";
import type { Bytes } from "./crypto-contract";
import { SecretField } from "./PasswordFields";

function RestoreForm() {
  const t = useTheme();
  const busy = useApp((state) => state.busy);
  const [paste, setPaste] = useState("");
  const [encrypted, setEncrypted] = useState<Bytes | null>(null);
  const [password, setPassword] = useState("");
  const [preview, setPreview] = useState<{ data: AppData; revision: number } | null>(null);
  const [message, setMessage] = useState("");
  const [working, setWorking] = useState(false);
  const inProgress = useRef(false);

  function prepare(text: string) {
    setPreview({ data: parseBackup(text), revision: useApp.getState().data.revision });
    setMessage("Sicherung geprüft. Bitte prüfe die Übersicht vor der Wiederherstellung.");
  }

  function clear() {
    setPaste("");
    setPassword("");
    setEncrypted(null);
    setPreview(null);
    setMessage("");
  }

  async function run(action: (allowed: () => boolean) => Promise<void>) {
    if (inProgress.current) return;
    const allowed = captureAccess();
    if (!allowed()) return;
    inProgress.current = true;
    setWorking(true);
    setMessage("");
    try { await action(allowed); }
    catch (error) { if (allowed()) setMessage((error as Error).message); }
    finally { inProgress.current = false; setWorking(false); }
  }

  function chooseFile() {
    void run(async (allowed) => {
      clear();
      const bytes = await pickBackupBytes(MAX_PASSWORD_BACKUP_BYTES);
      if (!bytes || !allowed()) return;
      const result = inspectBackupFile(bytes);
      if (result.kind === "encrypted") setEncrypted(result.bytes);
      else prepare(result.text);
    });
  }

  function decrypt() {
    if (!encrypted || !password) return;
    void run(async (allowed) => {
      setPassword("");
      const text = await openProtectedBackup(encrypted, password);
      if (!allowed()) return;
      prepare(text);
      setEncrypted(null);
    });
  }

  function apply() {
    if (!preview) return;
    void run(async (allowed) => {
      if (!allowed()) return;
      const current = useApp.getState();
      if (current.data.revision !== preview.revision) {
        setPreview(null);
        throw new Error("Der lokale Stand hat sich verändert. Prüfe die Sicherung bitte erneut.");
      }
      if (!await current.restore(preview.data))
        throw new Error(useApp.getState().error ?? "Die Sicherung konnte nicht wiederhergestellt werden.");
      if (allowed()) {
        clear();
        setMessage("Die Sicherung wurde wiederhergestellt.");
      }
    });
  }

  const blocked = working || busy;
  return <View style={{ gap: 14 }}>
    <T variant="small">Wähle eine OLIVA-Sicherungsdatei. Alte JSON-Sicherungen kannst du auch einfügen. Für FaithPath nutze „FaithPath-Daten mitnehmen“.</T>
    <Button kind="secondary" icon="download" disabled={blocked} onPress={chooseFile}>OLIVA-Sicherungsdatei auswählen</Button>
    {encrypted ? <Card style={{ gap: 12 }}>
      <SecretField label="Passwort der Sicherungsdatei" value={password} onChange={setPassword} autoFocus onSubmit={blocked ? undefined : decrypt} />
      <Button disabled={blocked || !password} onPress={decrypt}>Sicherung entschlüsseln und prüfen</Button>
      <Button disabled={blocked} kind="ghost" icon="close" onPress={clear}>Abbrechen</Button>
    </Card> : <>
      <Field label="Inhalt deiner OLIVA-Sicherung" multiline value={paste} maxLength={MAX_BACKUP_BYTES}
        onChangeText={(value) => { setPaste(value); setPreview(null); setMessage(""); }} placeholder={'{"version":11, …}'} />
      <Button kind="secondary" disabled={!paste.trim() || blocked} icon="check" onPress={() => {
        setPreview(null);
        try { prepare(paste); } catch (error) { setMessage((error as Error).message); }
      }}>Sicherung prüfen</Button>
    </>}
    {preview && <Card style={{ backgroundColor: t.goldSoft, gap: 12 }}>
      <T style={{ fontWeight: "600" }}>Vorhandene lokale Daten werden ersetzt.</T>
      <T variant="small">Diese Sicherung enthält {preview.data.notes.length} Einträge, {preview.data.readChapters.length} gelesene Kapitel und {preview.data.bookmarks.length} Lesezeichen, {preview.data.goals.length} Vorhaben und {preview.data.drafts.length} Entwürfe. Exportiere den aktuellen Stand vor der Wiederherstellung.</T>
      <Button disabled={blocked} icon="check" onPress={apply}>Daten durch diese Sicherung ersetzen</Button>
      <Button disabled={blocked} kind="ghost" icon="close" onPress={clear}>Abbrechen</Button>
    </Card>}
    {working && <T variant="small" accessibilityRole="alert">Die Sicherung wird verarbeitet …</T>}
    {message && <T variant="small" accessibilityRole="alert">{message}</T>}
  </View>;
}

export function BackupRestore() {
  const [expanded, setExpanded] = useState(false);
  return <>
    <Button kind="secondary" icon="back" onPress={() => setExpanded(!expanded)}>Sicherung wiederherstellen</Button>
    {expanded && <RestoreForm />}
  </>;
}
