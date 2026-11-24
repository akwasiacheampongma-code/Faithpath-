import { useCallback, useLayoutEffect, useRef } from "react";
import {
  View,
  ScrollView,
  Pressable,
  useWindowDimensions,
  Platform,
  type ScrollViewProps,
} from "react-native";
import { router, usePathname, type Href } from "expo-router";
import { useTheme } from "../design-system/theme";
import { useApp } from "../state/store";
import { T, IconButton } from "./ui";
import { Icon, type IconName } from "./Icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ViewportSignals, useViewportSignals } from "./viewport";
const nav: { path: Href; label: string; icon: IconName }[] = [
  { path: "/", label: "Heute", icon: "home" },
  { path: "/bibel", label: "Bibel", icon: "book" },
  { path: "/wege", label: "Entdecken", icon: "path" },
  { path: "/garten", label: "Mein Garten", icon: "leaf" },
  { path: "/sammlung", label: "Sammlung", icon: "bookmark" },
];
export function Brand({ small = false }: { small?: boolean }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <View
        style={{
          width: 34,
          height: 40,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="leaf" size={29} color={t.primary} stroke={1.3} />
      </View>
      <View>
        <T
          style={{
            fontSize: small ? 21 : 25,
            letterSpacing: 5,
            fontWeight: "500",
            lineHeight: 30,
          }}
        >
          OLIVA
        </T>
        {!small && (
          <T style={{ fontSize: 8, letterSpacing: 2.1, color: t.muted }}>
            RAUM FÜR DEINEN GLAUBEN
          </T>
        )}
      </View>
    </View>
  );
}
export function Shell({
  children,
  wide = false,
  reader = false,
  header = "standard",
  scrollRef,
  onScroll,
  readerToolbar,
  readerActions,
  scrollable = true,
}: {
  children: React.ReactNode;
  wide?: boolean;
  reader?: boolean;
  header?: "standard" | "compact" | "intro";
  scrollRef?: React.Ref<React.ComponentRef<typeof ScrollView>>;
  onScroll?: ScrollViewProps["onScroll"];
  readerToolbar?: React.ReactNode;
  readerActions?: React.ReactNode;
  scrollable?: boolean;
}) {
  const viewport = useViewportSignals(),
    viewportRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const attachScroll = useCallback(
    (node: React.ComponentRef<typeof ScrollView> | null) => {
      viewportRef.current = node;
      if (typeof scrollRef === "function") {
        const cleanup = scrollRef(node);
        if (typeof cleanup === "function")
          return () => {
            viewportRef.current = null;
            cleanup();
          };
      } else if (scrollRef) scrollRef.current = node;
    },
    [scrollRef],
  );
  const measureViewport = useCallback(() => {
    // The web renderer owns visibility through IntersectionObserver.
    if (Platform.OS === "web") return;
    const element = viewportRef.current?.getNativeScrollRef();
    if (!element) {
      viewport.setBounds(null);
      return;
    }
    element.measureInWindow((x, y, width, height) =>
      viewport.setBounds({ x, y, width, height }),
    );
  }, [viewport]);
  const t = useTheme(),
    { width, height } = useWindowDimensions(),
    desktop = width >= 1000,
    path = usePathname(),
    insets = useSafeAreaInsets();
  const intro = header === "intro", compactHeader = header !== "standard";
  useLayoutEffect(() => {
    const frame = requestAnimationFrame(measureViewport);
    return () => cancelAnimationFrame(frame);
  }, [measureViewport, width, height, insets.top, insets.bottom]);
  const data = useApp((s) => s.data),
    mutate = useApp((s) => s.mutate),
    error = useApp((s) => s.error),
    clearError = useApp((s) => s.clearError);
  const item = (n: (typeof nav)[number], compact = false) => {
    const active =
      path === n.path ||
      (n.path === "/wege" && ["/vorhaben", "/weg/", "/themen", "/geschichte/", "/geschichten"].some((prefix) => path.startsWith(prefix))) ||
      (n.path === "/bibel" && ["/buch/", "/offen/"].some((prefix) => path.startsWith(prefix)));
    return (
      <Pressable
        key={String(n.path)}
        accessibilityRole="button"
        accessibilityLabel={n.label}
        accessibilityState={{ selected: active }}
        aria-current={active ? "page" : undefined}
        onPress={() => router.replace(n.path)}
        style={({ pressed }) => ({
          minHeight: compact ? 60 : 49,
          paddingHorizontal: compact ? 2 : 18,
          paddingVertical: 8,
          borderRadius: 12,
          backgroundColor:
            active && !compact ? t.soft : pressed ? t.soft : "transparent",
          flexDirection: compact ? "column" : "row",
          alignItems: "center",
          justifyContent: compact ? "center" : "flex-start",
          gap: compact ? 5 : 13,
          flex: compact ? 1 : undefined,
          minWidth: 0,
        })}
      >
        <Icon
          name={n.icon}
          color={active ? t.primary : t.muted}
          size={compact ? 20 : 21}
        />
        <T
          style={{
            fontSize: compact ? 9 : 13,
            color: active ? t.text : t.muted,
            fontWeight: active ? "600" : "400",
            maxWidth: compact ? "100%" : undefined,
            textAlign: compact ? "center" : undefined,
          }}
        >
          {n.label}
        </T>
        {active && !compact && (
          <View
            style={{
              width: 5,
              height: 5,
              borderRadius: 4,
              backgroundColor: t.gold,
              marginLeft: "auto",
            }}
          />
        )}
      </Pressable>
    );
  };
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        backgroundColor: t.bg,
        paddingTop: insets.top,
      }}
    >
      {desktop && !reader && !intro && (
        <View
          role="navigation"
          aria-label="Hauptnavigation"
          style={{
            width: 224,
            paddingHorizontal: 22,
            paddingTop: 38,
            paddingBottom: 24,
            borderRightWidth: 1,
            borderColor: t.line,
            backgroundColor: t.surface,
          }}
        >
          <Brand />
          <View style={{ height: 56 }} />
          <T
            variant="label"
            style={{
              fontSize: 9,
              color: t.muted,
              marginLeft: 18,
              marginBottom: 15,
            }}
          >
            DEIN PERSÖNLICHER ORT
          </T>
          <View style={{ gap: 6 }}>{nav.map((n) => item(n))}</View>
          <View style={{ flex: 1 }} />
          <View style={{ padding: 16, gap: 8, marginBottom: 14 }}>
            <Icon name="leaf" color={t.gold} size={20} />
            <T
              variant="small"
              style={{ fontFamily: "Cormorant", fontSize: 21, lineHeight: 27 }}
            >
              Glaube darf wachsen.
            </T>
            <T variant="small" style={{ color: t.muted, fontSize: 11 }}>
              In deinem Tempo. Ohne Druck.
            </T>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/einstellungen")}
            style={{
              padding: 16,
              minHeight: 48,
              flexDirection: "row",
              gap: 12,
              alignItems: "center",
            }}
          >
            <Icon name="settings" size={19} color={t.muted} />
            <T variant="small" style={{ color: t.muted }}>
              Einstellungen
            </T>
          </Pressable>
        </View>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        {!reader && (
          <View
            role="banner"
            style={{
              height: desktop && !intro ? 86 : compactHeader ? 52 : 73,
              paddingHorizontal: desktop && !intro ? 42 : compactHeader ? 18 : 22,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottomWidth: desktop ? 1 : 0,
              borderColor: t.line,
            }}
          >
            {desktop && !intro ? (
              <T variant="label" style={{ fontSize: 9, color: t.muted }}>
                LESEN. VERSTEHEN. WACHSEN.
              </T>
            ) : (
              <Brand small />
            )}
            {!intro && <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              {desktop && (
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 7 }}
                >
                  <View
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: 3,
                      backgroundColor: t.primary,
                    }}
                  />
                  <T variant="small" style={{ color: t.muted, fontSize: 10 }}>
                    Dein Raum. Ganz bei dir.
                  </T>
                </View>
              )}
              <IconButton
                name={t.dark ? "sun" : "moon"}
                label={
                  t.dark
                    ? "Hellen Modus aktivieren"
                    : "Dunklen Modus aktivieren"
                }
                onPress={() =>
                  void mutate((d) => {
                    d.settings.theme = t.dark ? "light" : "dark";
                  })
                }
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${data.name ? data.name[0]?.toUpperCase() : "Du"} · Profil und Einstellungen`}
                onPress={() => router.push("/einstellungen")}
                style={{
                  width: 35,
                  height: 35,
                  borderRadius: 18,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: t.soft,
                  borderWidth: 1,
                  borderColor: t.line,
                }}
              >
                <T style={{ fontSize: 12, color: t.primary }}>
                  {data.name ? data.name[0]?.toUpperCase() : "Du"}
                </T>
              </Pressable>
            </View>}
          </View>
        )}
        {error && (
          <View
            accessibilityRole="alert"
            style={{
              padding: 14,
              backgroundColor: t.goldSoft,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <T style={{ flex: 1, fontSize: 12 }}>{error}</T>
            <IconButton
              name="close"
              label="Meldung schließen"
              onPress={clearError}
            />
          </View>
        )}
        {reader && readerToolbar ? (
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 4,
              borderBottomWidth: 1,
              borderColor: t.line,
            }}
          >
            {readerToolbar}
          </View>
        ) : null}
        {!scrollable ? <View role="main" style={{ flex: 1, minHeight: 0 }}>
          <ViewportSignals.Provider value={viewport}>{children}</ViewportSignals.Provider>
        </View> : <ScrollView
          role="main"
          ref={attachScroll}
          onLayout={measureViewport}
          onContentSizeChange={() => {
            measureViewport();
            viewport.notify();
          }}
          onScroll={(event) => {
            onScroll?.(event);
            measureViewport();
            viewport.notify();
          }}
          scrollEventThrottle={100}
          contentContainerStyle={{
            paddingHorizontal: reader ? 20 : desktop ? 42 : compactHeader ? 18 : 22,
            paddingTop: reader ? 20 : desktop && !intro ? 30 : compactHeader ? 12 : 16,
            paddingBottom: reader ? 210 : 40,
            alignItems: "center",
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ width: "100%", maxWidth: wide ? 1200 : 1040, gap: 0 }}>
            <ViewportSignals.Provider value={viewport}>
              {children}
            </ViewportSignals.Provider>
          </View>
        </ScrollView>}
        {reader && readerActions ? (
          <View
            pointerEvents="box-none"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              paddingHorizontal: 12,
              paddingTop: 8,
              paddingBottom: Math.max(insets.bottom, 8),
            }}
          >
            {readerActions}
          </View>
        ) : null}
        {!desktop && !reader && !intro && (
          <View
            role="navigation"
            aria-label="Hauptnavigation"
            style={{
              flexDirection: "row",
              borderTopWidth: 1,
              borderColor: t.line,
              backgroundColor: t.surface,
              paddingHorizontal: 8,
              paddingBottom: Math.max(insets.bottom, 6),
            }}
          >
            {nav.map((n) => item(n, true))}
          </View>
        )}
      </View>
    </View>
  );
}
