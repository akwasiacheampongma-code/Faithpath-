import { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Icon } from "../../components/Icon";
import { T } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { BIBLE_SCOPES, type BibleScope } from "./book-search";

export type BibleScopeSelectProps = {
  value: BibleScope;
  onChange: (value: BibleScope) => void;
  compact?: boolean;
};

export function BibleScopeSelect({ value, onChange, compact = false }: BibleScopeSelectProps) {
  const t = useTheme(),
    [open, setOpen] = useState(false),
    selected = BIBLE_SCOPES.find((scope) => scope.value === value)!;
  return (
    <View style={{ width: "100%", maxWidth: 420, gap: 7 }}>
      <T variant="small" style={{ fontWeight: "600" }}>
        Bibelbereich
      </T>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Bibelbereich"
        accessibilityValue={{ text: selected.label }}
        accessibilityState={{ expanded: open }}
        accessibilityHint="Öffnet die Auswahl des Bibelbereichs"
        onPress={() => setOpen(true)}
        style={({ pressed }) => ({
          minHeight: 50,
          padding: compact ? 10 : 14,
          borderWidth: 1,
          borderColor: t.line,
          borderRadius: 12,
          backgroundColor: t.surface,
          flexDirection: "row",
          alignItems: "center",
          gap: compact ? 6 : 12,
          opacity: pressed ? 0.75 : 1,
        })}
      >
        <T style={{ flex: 1, ...(compact ? { fontSize: 12 } : {}) }}>{selected.label}</T>
        <View style={{ transform: [{ rotate: "90deg" }] }}>
          <Icon name="chevron" size={17} color={t.muted} />
        </View>
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="none"
        onRequestClose={() => setOpen(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
            backgroundColor: "rgba(0, 0, 0, 0.35)",
          }}
        >
          <Pressable
            accessible={false}
            onPress={() => setOpen(false)}
            style={StyleSheet.absoluteFill}
          />
          <View
            accessibilityViewIsModal
            style={{
              width: "100%",
              maxWidth: 420,
              padding: 20,
              gap: 14,
              borderRadius: 20,
              backgroundColor: t.surface,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <T accessibilityRole="header" variant="heading" style={{ flex: 1 }}>
                Bibelbereich
              </T>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Bibelbereich schließen"
                onPress={() => setOpen(false)}
                style={{
                  minWidth: 44,
                  minHeight: 44,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="close" color={t.text} size={20} />
              </Pressable>
            </View>
            <View accessibilityRole="radiogroup" accessibilityLabel="Bibelbereich">
              {BIBLE_SCOPES.map((scope) => (
                <Pressable
                  key={scope.value}
                  accessibilityRole="radio"
                  accessibilityLabel={scope.label}
                  accessibilityState={{ checked: value === scope.value }}
                  onPress={() => {
                    onChange(scope.value);
                    setOpen(false);
                  }}
                  style={({ pressed }) => ({
                    minHeight: 52,
                    padding: 14,
                    marginVertical: 3,
                    borderRadius: 12,
                    backgroundColor: value === scope.value ? t.soft : t.surface,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  <T style={{ flex: 1 }}>{scope.label}</T>
                  {value === scope.value && (
                    <Icon name="check" size={18} color={t.primary} />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
