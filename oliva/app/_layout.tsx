import { useEffect } from "react";
import { View, ActivityIndicator, Platform } from "react-native";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useApp } from "../src/state/store";
import { useTheme } from "../src/design-system/theme";
import { T, Button } from "../src/components/ui";
import "../src/design-system/global.css";
export default function RootLayout() {
  const [loaded, fontError] = useFonts({
      DMSans: require("../assets/fonts/DMSans.ttf"),
      Cormorant: require("../assets/fonts/CormorantGaramond.ttf"),
    }),
    hydrate = useApp((s) => s.hydrate),
    ready = useApp((s) => s.ready),
    t = useTheme();
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  useEffect(() => {
    if (Platform.OS === "web") document.documentElement.lang = "de";
  }, []);
  if (!ready || (!loaded && !fontError))
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
  return (
    <SafeAreaProvider>
      <StatusBar style={t.dark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: t.bg },
          animation: "none",
        }}
      />
      <WebOffline />
    </SafeAreaProvider>
  );
}
function WebOffline() {
  useEffect(() => {
    if (Platform.OS === "web" && "serviceWorker" in navigator && !__DEV__)
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* Native offline content is independent of this web enhancement. */
      });
  }, []);
  return null;
}
