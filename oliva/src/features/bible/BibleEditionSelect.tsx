import { useState } from "react";
import { Pressable, View } from "react-native";
import { Icon } from "../../components/Icon";
import { T } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { BIBLE_EDITIONS, type BibleEdition } from "./editions";

export type BibleEditionSelectProps = {
  value: BibleEdition;
  onChange: (edition: BibleEdition) => void;
};

export function BibleEditionSelect({ value, onChange }: BibleEditionSelectProps) {
  const t = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <View style={{ width: "100%", maxWidth: 420, gap: 6 }}>
      <T variant="small" style={{ fontWeight: "600" }}>Bibelübersetzung</T>
      <Pressable accessibilityRole="button" accessibilityLabel="Bibelübersetzung"
        accessibilityValue={{ text: BIBLE_EDITIONS[value].name }} accessibilityState={{ expanded: open }}
        onPress={() => setOpen(!open)}
        style={{ minHeight: 50, paddingVertical: 12, paddingHorizontal: 14, borderWidth: 1,
          borderColor: t.line, borderRadius: 12, backgroundColor: t.surface,
          flexDirection: "row", alignItems: "center", gap: 12 }}>
        <T style={{ flex: 1 }}>{BIBLE_EDITIONS[value].name}</T>
        <View style={{ transform: [{ rotate: open ? "-90deg" : "90deg" }] }}>
          <Icon name="chevron" size={17} color={t.muted} />
        </View>
      </Pressable>
      {open && <View accessibilityRole="radiogroup" accessibilityLabel="Verfügbare Bibelübersetzungen"
        style={{ borderWidth: 1, borderColor: t.line, borderRadius: 12, backgroundColor: t.surface, padding: 4 }}>
        {(Object.keys(BIBLE_EDITIONS) as BibleEdition[]).map((edition) => (
          <Pressable key={edition} accessibilityRole="radio" accessibilityState={{ checked: edition === value }}
            onPress={() => { setOpen(false); onChange(edition); }}
            style={{ minHeight: 48, padding: 12, borderRadius: 8, backgroundColor: edition === value ? t.soft : t.surface }}>
            <T>{BIBLE_EDITIONS[edition].name}</T>
          </Pressable>
        ))}
      </View>}
    </View>
  );
}
