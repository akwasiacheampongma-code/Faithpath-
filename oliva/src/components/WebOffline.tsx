import { useEffect, useState, useRef } from "react";
import { Platform, View } from "react-native";
import { T } from "./ui";
import { useTheme } from "../design-system/theme";
import appConfig from "../../app.json";
function build(
  worker: ServiceWorker | null,
): Promise<{ id: string; version: string } | null> {
  if (!worker) return Promise.resolve(null);
  return new Promise((resolve) => {
    const channel = new MessageChannel(),
      timer = setTimeout(() => {
        channel.port1.close();
        resolve(null);
      }, 600);
    channel.port1.onmessage = (event) => {
      clearTimeout(timer);
      channel.port1.close();
      resolve(event.data?.id && event.data?.version ? event.data : null);
    };
    worker.postMessage({ type: "OLIVA_BUILD" }, [channel.port2]);
  });
}
export function WebOffline() {
  const t = useTheme(),
    [state, setState] = useState<
      "preparing" | "ready" | "unavailable" | "update"
    >("preparing"),
    sequence = useRef(0);
  useEffect(() => {
    if (Platform.OS !== "web" || __DEV__ || !("serviceWorker" in navigator))
      return;
    let active = true,
      registration: ServiceWorkerRegistration | undefined;
    async function refresh() {
      const request = ++sequence.current;
      const info = await build(
        navigator.serviceWorker.controller ?? registration?.active ?? null,
      );
      const expected = document
        .querySelector('meta[name="oliva-build"]')
        ?.getAttribute("content");
      const waiting = registration?.waiting;
      const waitingInfo = await build(waiting ?? null);
      if (
        active &&
        waiting &&
        waitingInfo?.id === expected &&
        waitingInfo?.version === appConfig.expo.version
      )
        waiting.postMessage({ type: "OLIVA_ACTIVATE", id: expected });
      if (active && request === sequence.current)
        setState(
          info?.id === expected && info?.version === appConfig.expo.version
            ? "ready"
            : info?.id &&
                expected &&
                (info.id !== expected ||
                  info.version !== appConfig.expo.version)
              ? "update"
              : "preparing",
        );
    }
    async function register() {
      try {
        registration = await navigator.serviceWorker.register("/sw.js", {
          updateViaCache: "none",
        });
        const watch = () => {
          registration?.installing?.addEventListener(
            "statechange",
            () => void refresh(),
          );
        };
        registration.addEventListener("updatefound", watch);
        watch();
        void registration.update().catch(() => {});
        void refresh();
      } catch {
        if (active) setState("unavailable");
      }
    }
    const changed = () => void refresh(),
      online = () => void register();
    navigator.serviceWorker.addEventListener("controllerchange", changed);
    window.addEventListener("online", online);
    void register();
    return () => {
      active = false;
      navigator.serviceWorker.removeEventListener("controllerchange", changed);
      window.removeEventListener("online", online);
    };
  }, []);
  if (Platform.OS !== "web" || __DEV__) return null;
  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 3,
        backgroundColor: t.bg,
      }}
    >
      <T
        accessibilityLiveRegion="polite"
        style={{
          textAlign: "center",
          fontSize: 10,
          lineHeight: 16,
          color: t.muted,
        }}
      >
        {!("serviceWorker" in navigator)
          ? "Dieser Browser unterstützt keinen Offline-Neustart."
          : state === "ready"
            ? "Für den Offline-Neustart bereit."
            : state === "update"
              ? "Aktualisierung verfügbar. Eingaben sichern und App erneut öffnen."
              : state === "unavailable"
                ? "Offline-Paket noch nicht vollständig. Mit Verbindung erneut öffnen."
                : "Offline-Paket wird vorbereitet …"}
      </T>
    </View>
  );
}
