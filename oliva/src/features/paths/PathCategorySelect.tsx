import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Icon } from "../../components/Icon";
import { T } from "../../components/ui";
import { useTheme } from "../../design-system/theme";

export type PathCategorySelectProps = {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
};

export function PathCategorySelect({ value, options, onChange }: PathCategorySelectProps) {
  const t = useTheme(), [open, setOpen] = useState(false);
  return (
    <View style={{ width: "100%", maxWidth: 420, gap: 6 }}>
      <T variant="small" style={{ fontWeight: "600" }}>Wege filtern</T>
      <Pressable accessibilityRole="button" accessibilityLabel="Wege filtern"
        accessibilityValue={{ text: value }} accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        style={({ pressed }) => ({ minHeight: 50, padding: 14, gap: 12, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: t.line, borderRadius: 12, backgroundColor: t.surface, opacity: pressed ? 0.75 : 1 })}>
        <T style={{ flex: 1 }}>{value}</T>
        <View style={{ transform: [{ rotate: "90deg" }] }}><Icon name="chevron" color={t.muted} size={17} /></View>
      </Pressable>
      <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, padding: 24, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.35)" }}>
          <Pressable accessible={false} onPress={() => setOpen(false)} style={StyleSheet.absoluteFill} />
          <View accessibilityViewIsModal style={{ width: "100%", maxWidth: 420, maxHeight: "90%", padding: 20, gap: 14, borderRadius: 20, backgroundColor: t.surface }}>
            <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
              <T accessibilityRole="header" variant="heading" style={{ flex: 1 }}>Wege filtern</T>
              <Pressable accessibilityRole="button" accessibilityLabel="Wegefilter schließen" onPress={() => setOpen(false)} style={{ minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" }}>
                <Icon name="close" size={20} color={t.text} />
              </Pressable>
            </View>
            <ScrollView><View accessibilityRole="radiogroup" accessibilityLabel="Wege filtern">
              {options.map((option) => <Pressable key={option} accessibilityRole="radio" accessibilityLabel={option} accessibilityState={{ checked: option === value }}
                onPress={() => { onChange(option); setOpen(false); }}
                style={({ pressed }) => ({ minHeight: 52, padding: 14, marginVertical: 3, borderRadius: 12, flexDirection: "row", gap: 12, alignItems: "center", backgroundColor: option === value ? t.soft : t.surface, opacity: pressed ? 0.75 : 1 })}>
                <T style={{ flex: 1 }}>{option}</T>{option === value && <Icon name="check" color={t.primary} size={18} />}
              </Pressable>)}
            </View></ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
