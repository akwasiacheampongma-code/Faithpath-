import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ActivityIndicator, AppState, Platform, ScrollView, View } from "react-native";
import { Button, Card, T } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { useApp } from "../../state/store";
import { checkAccessDeadline, noteAccessActivity, observeWebAccess, synchronizeAccess, unlockApp, useAccess } from "./access";
import { SecretField } from "./PasswordFields";
import { ProtectionSetup } from "./ProtectionSetup";

function Unlock() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [recovering, setRecovering] = useState(false);
  const busy = useAccess((state) => state.busy);

  async function submit() {
    if (!password || busy) return;
    setError("");
    try { await unlockApp(password); }
    catch (error) { setError((error as Error).message); }
    finally { setPassword(""); }
  }

  return <>
    <T variant="title" accessibilityRole="header">OLIVA entsperren</T>
    {recovering ? <ProtectionSetup recovering close={() => setRecovering(false)} /> : <Card style={{ gap: 14 }}>
      <SecretField label="App-Passwort" value={password} onChange={setPassword} autoFocus onSubmit={() => void submit()} />
      <Button disabled={busy || !password} onPress={() => void submit()}>Entsperren</Button>
      {error && <T accessibilityRole="alert">{error}</T>}
      <Button kind="ghost" icon={null} disabled={busy} onPress={() => {
        setPassword(""); setError(""); setRecovering(true);
      }}>App-Passwort vergessen</Button>
    </Card>}
  </>;
}

export function AccessGate({ children }: { children: (writesSettled: Promise<void>) => ReactNode }) {
  const t = useTheme();
  const phase = useAccess((state) => state.phase);
  const generation = useAccess((state) => state.generation);
  const writesSettled = useRef(Promise.resolve());

  useLayoutEffect(() => {
    const unsubscribe = useAccess.subscribe((next, previous) => {
      if (previous.phase === "open" && next.phase !== "open") {
        writesSettled.current = useApp.getState().suspend();
      }
    });
    const unobserve = observeWebAccess();
    const appState = Platform.OS === "web" ? undefined : AppState.addEventListener("change", (state) => {
      if (state === "active") { checkAccessDeadline(); void synchronizeAccess(); }
    });
    void synchronizeAccess();
    return () => { unsubscribe(); unobserve(); appState?.remove(); };
  }, []);

  useEffect(() => {
    if (phase === "open" && Platform.OS === "web") delete document.documentElement.dataset.olivaAccessSuspended;
  }, [phase, generation]);

  if (phase === "open") return <View testID="oliva-unlocked-content" onTouchStart={noteAccessActivity}
    onTouchMove={noteAccessActivity} style={{ flex: 1, minHeight: 0 }}>
    {children(writesSettled.current)}
  </View>;
  if (phase === "checking") return <View style={{ flex: 1, backgroundColor: t.bg, justifyContent: "center", alignItems: "center", gap: 14 }}>
    <ActivityIndicator color={t.primary} /><T>Dein Raum wird vorbereitet …</T>
  </View>;
  return <ScrollView role="main" testID="oliva-access-gate" keyboardShouldPersistTaps="handled" style={{ flex: 1, backgroundColor: t.bg }}
    contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 36, alignItems: "center", justifyContent: "center" }}>
    <View style={{ width: "100%", maxWidth: 440, gap: 18 }}>
      {phase === "locked" ? <Unlock key={generation} /> : <>
        <T variant="heading" accessibilityRole="header">Der Passwortschutz ist gerade nicht verfügbar</T>
        <T>Deine persönlichen Ansichten bleiben gesperrt, bis OLIVA den lokalen Schutzstatus lesen kann.</T>
        <Button onPress={() => void synchronizeAccess()}>Erneut prüfen</Button>
      </>}
    </View>
  </ScrollView>;
}
