import { chapterKeyOf } from "./reference-key";
import { useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { Icon, type IconName } from "../../components/Icon";
import { T } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { useApp } from "../../state/store";
import { highlightBackground, type HighlightColor } from "./highlights";
import { CopyPassage } from "./clipboard/CopyPassage";
import { selectedBibleLabel, selectionReference } from "./selection";
import type { Reference } from "./repository";

const colors: { value: HighlightColor; label: string }[] = [
  { value: "olive", label: "Oliv" },
  { value: "gold", label: "Gold" },
  { value: "sand", label: "Sand" },
  { value: "sage", label: "Salbei" },
  { value: "terra", label: "Terrakotta" },
];

/** One tap selects; these actions never insert a panel into the Bible text. */
export function ReaderSelectionBar({
  reference,
  selected,
  onClear,
  onNote,
  onMore,
  onFallback,
}: {
  reference: Reference;
  selected: readonly number[];
  onClear: () => void;
  onNote: () => void;
  onMore: () => void;
  onFallback: (text: string) => void;
}) {
  const t = useTheme(),
    busy = useApp((s) => s.busy);
  const [palette, setPalette] = useState(false),
    [message, setMessage] = useState<string | null>(null);
  const selectionKey = `${chapterKeyOf(reference)}:${selected.join(",")}`;
  const current = useRef(selectionKey),
    mounted = useRef(true);
  current.current = selectionKey;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    setMessage(null);
  }, [selectionKey]);
  let contiguous = true;
  try {
    selectionReference(reference, selected);
  } catch {
    contiguous = false;
  }
  async function mark(color: HighlightColor | null) {
    const requested = selectionKey;
    const ok = await useApp
      .getState()
      .setSelectionHighlight(reference, selected, color);
    if (!mounted.current || current.current !== requested) return;
    setMessage(
      ok
        ? color
          ? "Auswahl markiert."
          : "Markierung entfernt."
        : (useApp.getState().error ??
            "Nicht gespeichert. Bitte erneut versuchen."),
    );
    if (ok) setPalette(false);
  }
  function action(
    label: string,
    icon: IconName,
    onPress: () => void,
    disabled = false,
  ) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => ({
          flex: 1,
          minWidth: 60,
          minHeight: 50,
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          borderRadius: 10,
          opacity: disabled ? 0.4 : pressed ? 0.65 : 1,
        })}
      >
        <Icon name={icon} size={19} color={t.text} />
        <T style={{ fontSize: 11, lineHeight: 16 }}>{label}</T>
      </Pressable>
    );
  }
  return (
    <View
      role="toolbar"
      accessibilityLabel="Versauswahl"
      style={{
        backgroundColor: t.surface,
        borderWidth: 1,
        borderColor: t.line,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingBottom: 6,
        boxShadow: t.dark
          ? "0 -4px 20px rgba(0,0,0,0.24)"
          : "0 -4px 20px rgba(38,60,48,0.09)",
        width: "100%",
        maxWidth: 660,
        alignSelf: "center",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingLeft: 8,
          minHeight: 42,
        }}
      >
        <View style={{ flex: 1 }}>
          <T
            numberOfLines={1}
            style={{ fontSize: 12, lineHeight: 18, fontWeight: "600" }}
          >
            {selectedBibleLabel(reference, selected)}
          </T>
          {message && (
            <T
              accessibilityLiveRegion="polite"
              style={{ fontSize: 11, lineHeight: 16 }}
            >
              {message}
            </T>
          )}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Auswahl aufheben"
          onPress={onClear}
          style={{
            minWidth: 44,
            minHeight: 44,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="close" size={18} color={t.muted} />
        </Pressable>
      </View>
      {!contiguous && (
        <T
          variant="small"
          style={{ color: t.muted, paddingHorizontal: 8, fontSize: 11 }}
        >
          Für eine gemeinsame Notiz benachbarte Verse wählen.
        </T>
      )}
      {palette && (
        <View
          role="group"
          accessibilityLabel="Markierfarben"
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: "space-around",
            paddingBottom: 5,
          }}
        >
          {colors.map(({ value, label }) => (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityLabel={`${label} markieren`}
              disabled={busy}
              onPress={() => void mark(value)}
              style={{
                minWidth: 44,
                minHeight: 44,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: 29,
                  height: 29,
                  borderRadius: 15,
                  backgroundColor: highlightBackground(value, t.dark),
                  borderWidth: 1,
                  borderColor: t.muted,
                }}
              />
            </Pressable>
          ))}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Markierungen entfernen"
            disabled={busy}
            onPress={() => void mark(null)}
            style={{
              minWidth: 44,
              minHeight: 44,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="close" color={t.muted} size={16} />
            <T style={{ fontSize: 10, lineHeight: 13 }}>Ohne</T>
          </Pressable>
        </View>
      )}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderTopWidth: 1,
          borderColor: t.line,
        }}
      >
        {action("Markieren", "pen", () => setPalette(!palette), busy)}
        <View style={{ flex: 1 }}>
          <CopyPassage
            reference={reference}
            selected={selected}
            compact
            onFallback={onFallback}
          />
        </View>
        {action("Notiz", "book", onNote, !contiguous)}
        {action("Mehr", "more", onMore)}
      </View>
    </View>
  );
}
