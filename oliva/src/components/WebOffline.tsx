import { useEffect, useState, useRef } from "react";
import { Platform, View } from "react-native";
import { T } from "./ui";
import { useTheme } from "../design-system/theme";
import appConfig from "../../app.json";
function build(
  worker: ServiceWorker | null,
  signal: AbortSignal,
): Promise<{ id: string; version: string } | null> {
  if (!worker || signal.aborted) return Promise.resolve(null);
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    let settled = false;
    const finish = (info: { id: string; version: string } | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal.removeEventListener("abort", aborted);
      channel.port1.onmessage = null;
      channel.port1.close();
      channel.port2.close();
      resolve(info);
    };
    const aborted = () => finish(null),
      timer = setTimeout(() => finish(null), 600);
    signal.addEventListener("abort", aborted, { once: true });
    channel.port1.onmessage = (event) => {
      finish(
        typeof event.data?.id === "string" &&
          event.data.id.length > 0 &&
          typeof event.data?.version === "string" &&
          event.data.version.length > 0
          ? { id: event.data.id, version: event.data.version }
          : null,
      );
    };
    try {
      worker.postMessage({ type: "OLIVA_BUILD" }, [channel.port2]);
    } catch {
      finish(null);
    }
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
    const retryDelays = [1000, 2000, 4000],
      installingWorkers = new Set<ServiceWorker>();
    let active = true,
      registration: ServiceWorkerRegistration | undefined,
      registrationRequest = 0,
      pending: AbortController | undefined,
      retryTimer: ReturnType<typeof setTimeout> | undefined,
      retries = 0,
      resumePending = false;
    function cancel() {
      clearTimeout(retryTimer);
      retryTimer = undefined;
      pending?.abort();
      pending = undefined;
    }
    async function refresh(resetRetries = true) {
      if (!active) return;
      const request = ++sequence.current;
      cancel();
      if (resetRetries) retries = 0;
      setState("preparing");
      if (document.visibilityState === "hidden") {
        resumePending = true;
        return;
      }
      resumePending = false;
      const query = new AbortController();
      pending = query;
      const expected = document
        .querySelector('meta[name="oliva-build"]')
        ?.getAttribute("content");
      const waiting = registration?.waiting;
      const [info, waitingInfo] = await Promise.all([
        build(
          navigator.serviceWorker.controller ?? registration?.active ?? null,
          query.signal,
        ),
        build(waiting ?? null, query.signal),
      ]);
      if (!active || request !== sequence.current || query.signal.aborted)
        return;
      pending = undefined;
      if (
        waiting &&
        waitingInfo?.id === expected &&
        waitingInfo?.version === appConfig.expo.version
      ) {
        try {
          waiting.postMessage({ type: "OLIVA_ACTIVATE", id: expected });
        } catch {
          // It may have become redundant while the build replies were pending.
        }
      }
      if (info?.id === expected && info?.version === appConfig.expo.version) {
        setState("ready");
      } else if (info && expected) {
        setState("update");
      } else if (!info && expected && retries < retryDelays.length) {
        setState("preparing");
        retryTimer = setTimeout(() => {
          retryTimer = undefined;
          void refresh(false);
        }, retryDelays[retries++]);
      } else {
        setState("unavailable");
      }
    }
    const changed = () => void refresh();
    const watch = () => {
      const worker = registration?.installing;
      if (!worker || installingWorkers.has(worker)) return;
      installingWorkers.add(worker);
      worker.addEventListener("statechange", changed);
    };
    function unwatch() {
      registration?.removeEventListener("updatefound", watch);
      for (const worker of installingWorkers)
        worker.removeEventListener("statechange", changed);
      installingWorkers.clear();
    }
    async function register() {
      if (!active) return;
      if (document.visibilityState === "hidden") {
        resumePending = true;
        return;
      }
      const request = ++registrationRequest;
      // A browser may leave register() pending across tab/document changes
      // even though its existing controller is active and answers messages.
      // Verify that real controller now; registration must not gate readiness.
      // With no controller, the same finite retries end honestly while the
      // actual registration continues. A later activation can still recover.
      void refresh();
      try {
        const next = await navigator.serviceWorker.register("/sw.js", {
          updateViaCache: "none",
        });
        if (!active || request !== registrationRequest) return;
        unwatch();
        registration = next;
        registration.addEventListener("updatefound", watch);
        watch();
        void registration.update().catch(() => {});
        void refresh();
      } catch {
        if (active && request === registrationRequest) {
          if (navigator.serviceWorker.controller) void refresh();
          else {
            ++sequence.current;
            cancel();
            setState("unavailable");
          }
        }
      }
    }
    const online = () => void register();
    const visibility = () => {
      if (document.visibilityState === "hidden") {
        resumePending ||= !!pending || retryTimer !== undefined;
        ++sequence.current;
        cancel();
      } else if (
        resumePending &&
        (navigator.onLine ||
          navigator.serviceWorker.controller ||
          registration?.active)
      ) {
        if (registration) void refresh();
        else void register();
      }
    };
    navigator.serviceWorker.addEventListener("controllerchange", changed);
    window.addEventListener("online", online);
    document.addEventListener("visibilitychange", visibility);
    void register();
    return () => {
      active = false;
      ++sequence.current;
      ++registrationRequest;
      cancel();
      unwatch();
      navigator.serviceWorker.removeEventListener("controllerchange", changed);
      window.removeEventListener("online", online);
      document.removeEventListener("visibilitychange", visibility);
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
