import { useState } from "react";
import { Button, Card, T } from "../../components/ui";
import { confirmAppProtection, prepareAppProtection, useAccess, type PendingAccess } from "./access";
import { PasswordPair, SecretField } from "./PasswordFields";

export function ProtectionSetup({ recovering = false, close }: { recovering?: boolean; close: () => void }) {
  const [recovery, setRecovery] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState<PendingAccess | null>(null);
  const [error, setError] = useState("");
  const busy = useAccess((state) => state.busy);

  async function prepare() {
    setError("");
    try {
      setPending(await prepareAppProtection(password, confirmation, recovering ? recovery : undefined));
      setPassword("");
      setConfirmation("");
      setRecovery("");
    } catch (error) {
      setError((error as Error).message);
    }
  }

  async function confirm() {
    if (!pending) return;
    setError("");
    try {
      await confirmAppProtection(pending, recovery);
      setPending(null);
      setRecovery("");
      close();
    } catch (error) {
      setError((error as Error).message);
    }
  }

  return <Card style={{ gap: 14 }}>
    {pending ? <>
      <T variant="heading" accessibilityRole="header">Wiederherstellungscode aufbewahren</T>
      <T variant="small">Bewahre diesen Code getrennt von deinem App-Passwort auf. Er wird einmal angezeigt. Bestätige ihn, damit du bei einem vergessenen Passwort wieder Zugang hast.</T>
      <T selectable testID="oliva-recovery-code" style={{ fontSize: 18, lineHeight: 27, fontWeight: "600" }}>{pending.recoveryCode}</T>
      <SecretField label="Wiederherstellungscode bestätigen" value={recovery} onChange={setRecovery} maxLength={96} />
      <Button disabled={busy || !recovery} onPress={() => void confirm()}>{recovering ? "Neues App-Passwort speichern" : "Passwortschutz aktivieren"}</Button>
    </> : <>
      {recovering && <>
        <T variant="small">Mit dem Wiederherstellungscode kannst du ein neues App-Passwort wählen. Wenn beide fehlen, kannst du eine frühere Sicherung in einer getrennten Installation verwenden.</T>
        <SecretField label="Wiederherstellungscode" value={recovery} onChange={setRecovery} maxLength={96} autoFocus />
      </>}
      <PasswordPair password={password} confirmation={confirmation} setPassword={setPassword} setConfirmation={setConfirmation} />
      <Button disabled={busy || !password || !confirmation || (recovering && !recovery)} onPress={() => void prepare()}>Weiter zum Wiederherstellungscode</Button>
    </>}
    {error && <T accessibilityRole="alert">{error}</T>}
    <Button kind="ghost" icon="close" disabled={busy} onPress={close}>Abbrechen</Button>
  </Card>;
}
