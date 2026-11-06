import { Pressable, View } from "react-native";
import { T } from "./ui";
import { useTheme } from "../design-system/theme";
export type ChoiceProps = {
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
};
export function Choice({ label, checked, onChange }: ChoiceProps) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked }}
      aria-checked={checked}
      onPress={onChange}
      style={{
        minHeight: 48,
        padding: 15,
        borderWidth: 1,
        borderRadius: 12,
        borderColor: checked ? t.gold : t.line,
        backgroundColor: checked ? t.soft : t.surface,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      <View
        accessibilityElementsHidden
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          borderWidth: 2,
          borderColor: t.primary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked && (
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: t.primary,
            }}
          />
        )}
      </View>
      <T style={{ fontSize: 13, flex: 1 }}>{label}</T>
    </Pressable>
  );
}
