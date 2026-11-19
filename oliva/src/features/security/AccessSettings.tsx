import { useState } from "react";
import { View } from "react-native";
import { Button, Card, T } from "../../components/ui";
import { changeAppPassword, disableAppProtection, lockAllWindows, setAppTimeout, useAccess } from "./access";
import { idleMinutesChoices } from "./access-record";
import { PasswordPair, SecretField } from "./PasswordFields";
import { ProtectionSetup } from "./ProtectionSetup";

export function AccessSettings() {
  const record = useAccess((state) => state.record);
  const busy = useAccess((state) => state.busy);
  const [form, setForm] = useState<"enable" | "change" | "disable" | null>(null);
  const [previous, setPrevious] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");

  function show(next: typeof form) {
    setPrevious("");
    setPassword("");
    setConfirmation("");
    setMessage("");
    setForm(next);
  }

  async function submit() {
    try {
      if (form === "change") await changeAppPassword(previous, password, confirmation);
      else if (form === "disable") await disableAppProtection(previous);
      else return;
      show(null);
      setMessage(form === "change" ? "Das neue App-Passwort ist gespeichert." : "Der App-Passwortschutz ist ausgeschaltet.");
    } catch (error) {
      setPrevious("");
      setMessage((error as Error).message);
    }
  }

  return <Card style={{ gap: 14 }}>
    <T variant="heading" accessibilityRole="header">App-Passwortschutz</T>
    <T variant="small">Ein App-Passwort schützt deine Ansichten vor neugierigen Blicken. Die lokale Datenbank bleibt dabei lesbar, wenn jemand direkt auf das Browserprofil oder die Gerätedateien zugreifen kann.</T>
    {record ? <>
      <Button kind="secondary" icon={null} disabled={busy} onPress={() => void lockAllWindows().catch((error) => setMessage((error as Error).message))}>Jetzt sperren</Button>
      <T variant="small">Dieses Fenster sperrt sich automatisch, wenn du es so lange nicht nutzt.</T>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {idleMinutesChoices.map((minutes) => <Button key={minutes} icon={null} kind="secondary"
          selected={record.idleMinutes === minutes} disabled={busy}
          onPress={() => void setAppTimeout(minutes).catch((error) => setMessage((error as Error).message))}>
          {minutes} {minutes === 1 ? "Minute" : "Minuten"}
        </Button>)}
      </View>
      <Button kind="secondary" icon={null} disabled={busy} onPress={() => show("change")}>App-Passwort ändern</Button>
      <Button kind="ghost" icon={null} disabled={busy} onPress={() => show("disable")}>App-Passwortschutz ausschalten</Button>
    </> : form !== "enable" && <Button kind="secondary" icon={null} disabled={busy} onPress={() => show("enable")}>OLIVA mit Passwort schützen</Button>}
    {form === "enable" && !record && <ProtectionSetup close={() => show(null)} />}
    {record && (form === "change" || form === "disable") && <Card style={{ gap: 14 }}>
      <SecretField label="Bisheriges App-Passwort" value={previous} onChange={setPrevious} autoFocus />
      {form === "change" && <PasswordPair password={password} confirmation={confirmation} setPassword={setPassword} setConfirmation={setConfirmation} />}
      <Button disabled={busy || !previous || (form === "change" && (!password || !confirmation))} onPress={() => void submit()}>
        {form === "change" ? "App-Passwort speichern" : "Ausschalten bestätigen"}
      </Button>
      <Button kind="ghost" icon="close" disabled={busy} onPress={() => show(null)}>Abbrechen</Button>
    </Card>}
    {message && <T accessibilityRole="alert">{message}</T>}
  </Card>;
}
