import { useCallback, useEffect, type ReactNode } from "react";
import { View, ActivityIndicator, Platform } from "react-native";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useApp } from "../src/state/store";
import { fonts } from "../src/design-system/fonts";
import { useTheme } from "../src/design-system/theme";
import { T } from "../src/components/ui";
import { RecoveryScreen } from "../src/components/RecoveryScreen";
import { useVolatileDrafts } from "../src/features/personal/volatile-drafts";
import { WebOffline } from "../src/components/WebOffline";
import { AccessGate } from "../src/features/security/AccessGate";
import { useAccess } from "../src/features/security/access";
import { resumeNotebookEdits } from "../src/features/notebook/autosave";
import { hasPendingNotes } from "../src/features/notebook/pending";
import "../src/design-system/global.css";
function ProfileRoutes({ writesSettled, fontsReady, children }: {
  writesSettled: Promise<void>; fontsReady: boolean; children: ReactNode;
}) {
  const hydrate = useApp((s) => s.hydrate),
    ready = useApp((s) => s.ready),
    healthy = useApp((s) => s.healthy),
    t = useTheme();
  useEffect(() => {
    let mounted = true;
    void writesSettled.then(() => { if (mounted && useAccess.getState().phase === "open") return hydrate(); });
    return () => { mounted = false; };
  }, [hydrate, writesSettled]);
  useEffect(() => {
    if (ready && healthy) void resumeNotebookEdits();
  }, [ready, healthy]);
  if (!ready || !fontsReady)
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: t.bg,
          gap: 20,
        }}
      >
        <ActivityIndicator color={t.primary} />
        <T>Dein Raum wird vorbereitet …</T>
      </View>
    );
  return healthy ? children : <RecoveryScreen />;
}

export default function RootLayout() {
  const [loaded, fontError] = useFonts(fonts);
  const fontsReady = loaded || !!fontError;
  const ready = useApp((s) => s.ready);
  const phase = useAccess((state) => state.phase);
  const t = useTheme();
  const layout = useCallback(({ children }: { children: ReactNode }) => (
    <AccessGate>{(writesSettled) => (
      <ProfileRoutes writesSettled={writesSettled} fontsReady={fontsReady}>{children}</ProfileRoutes>
    )}</AccessGate>
  ), [fontsReady]);
  useEffect(() => {
    if (Platform.OS !== "web") return;
    document.documentElement.lang = "de";
    const before = (event: BeforeUnloadEvent) => {
      if (Object.keys(useVolatileDrafts.getState().items).length || hasPendingNotes()) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", before);
    return () => window.removeEventListener("beforeunload", before);
  }, []);
  return <SafeAreaProvider>
    <StatusBar style={t.dark ? "light" : "dark"} />
    <Stack layout={layout} screenOptions={{
      headerShown: false, contentStyle: { backgroundColor: t.bg }, animation: "none",
    }} />
    {fontsReady && (phase === "locked" || (phase === "open" && ready)) && <WebOffline />}
  </SafeAreaProvider>;
}
