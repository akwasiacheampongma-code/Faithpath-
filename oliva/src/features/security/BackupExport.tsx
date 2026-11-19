import { useRef, useState } from "react";
import { Button, Card, T } from "../../components/ui";
import { useApp } from "../../state/store";
import { exportBytes, exportText } from "../../services/storage";
import { captureAccess } from "./access";
import { protectBackup } from "./backup";
import { checkNewPassword, PASSWORD_MIN_LENGTH } from "./crypto-contract";
import { SecretField } from "./PasswordFields";
import { resumeNotebookEdits } from "../notebook/autosave";

export function BackupExport({ label = "Sicherung erstellen", disabled = false }: { label?: string; disabled?: boolean }) {
  const [step, setStep] = useState<"choose" | "encrypted" | "plain" | null>(null);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [working, setWorking] = useState(false);
  const inProgress = useRef(false);

  function choose(next: typeof step) {
    setStep(next);
    setPassword("");
    setConfirmation("");
    setMessage("");
  }

  async function save(encrypted: boolean) {
    if (inProgress.current) return;
    const allowed = captureAccess();
    if (!allowed()) return;
    inProgress.current = true;
    setWorking(true);
    setMessage("");
    try {
      if (encrypted) checkNewPassword(password, confirmation);
      await resumeNotebookEdits();
      const data = await useApp.getState().waitForWrites();
      if (!allowed()) return;
      const filename = `oliva-sicherung-${new Date().toISOString().slice(0, 10)}`;
      const json = JSON.stringify(data, null, 2);
      if (encrypted) {
        setPassword("");
        setConfirmation("");
        const bytes = await protectBackup(json, password);
        if (!allowed()) return;
        await exportBytes(bytes, filename + ".oliva");
      } else {
        await exportText(json, filename + ".json");
      }
      if (allowed()) {
        choose(null);
        setMessage("Sicherung zum Speichern oder Teilen übergeben.");
      }
    } catch (error) {
      if (allowed()) setMessage((error as Error).message);
    } finally {
      inProgress.current = false;
      setWorking(false);
    }
  }

  return <>
    {step === null ? <Button disabled={disabled} icon="download" onPress={() => choose("choose")}>{label}</Button> :
      <Card style={{ gap: 14 }}>
        {step === "choose" && <>
          <Button onPress={() => choose("encrypted")}>Sicherung mit Passwort schützen</Button>
          <Button kind="secondary" icon={null} onPress={() => choose("plain")}>Unverschlüsselte Sicherung</Button>
        </>}
        {step === "encrypted" && <>
          <SecretField label="Passwort für die Sicherung" value={password} onChange={setPassword} />
          <SecretField label="Passwort für die Sicherung bestätigen" value={confirmation} onChange={setConfirmation} />
          <T variant="small">Dieses Passwort schützt die verschlüsselte Datei. Wähle mindestens {PASSWORD_MIN_LENGTH} Zeichen und bewahre es getrennt von der Datei auf. Ohne das Passwort lässt sich die Datei nicht wiederherstellen.</T>
          <Button disabled={working || disabled || !password || !confirmation} icon="download" onPress={() => void save(true)}>Verschlüsselte Sicherung exportieren</Button>
        </>}
        {step === "plain" && <>
          <T accessibilityRole="alert">Die Datei enthält deine persönlichen Texte und die vollständigen Originalarchive im Klartext. Jede Person mit Zugriff auf die Datei kann sie lesen. Speichere oder teile sie nur an einem Ort, dem du vertraust.</T>
          <Button disabled={working || disabled} icon="download" onPress={() => void save(false)}>Unverschlüsselt exportieren</Button>
        </>}
        {working && <T accessibilityRole="alert" variant="small">Die Sicherung wird vorbereitet …</T>}
        <Button kind="ghost" icon="close" disabled={working} onPress={() => choose(null)}>Abbrechen</Button>
      </Card>}
    {message && <T accessibilityRole="alert" variant="small">{message}</T>}
  </>;
}
