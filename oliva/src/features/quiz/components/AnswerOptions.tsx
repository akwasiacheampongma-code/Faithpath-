import { Pressable, View } from "react-native";
import { T } from "../../../components/ui";
import { useTheme } from "../../../design-system/theme";

export type AnswerOptionsProps = {
  options: readonly string[];
  selected: number | null;
  disabled: boolean;
  onSelect: (choice: number) => void;
};

export function AnswerOptions({
  options,
  selected,
  disabled,
  onSelect,
}: AnswerOptionsProps) {
  const t = useTheme();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel="Antwort auswählen"
      style={{ gap: 10 }}
    >
      {options.map((option, index) => (
        <Pressable
          key={index}
          accessibilityRole="radio"
          accessibilityLabel={option}
          accessibilityState={{ checked: selected === index, disabled }}
          disabled={disabled}
          onPress={() => onSelect(index)}
          style={({ pressed }) => ({
            minHeight: 58,
            padding: 16,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: selected === index ? t.primary : t.line,
            backgroundColor: selected === index ? t.soft : t.surface,
            flexDirection: "row",
            alignItems: "center",
            gap: 13,
            opacity: pressed ? 0.75 : 1,
          })}
        >
          <View
            style={{
              width: 19,
              height: 19,
              borderRadius: 10,
              borderWidth: 1.5,
              borderColor: selected === index ? t.primary : t.muted,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {selected === index && (
              <View
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 5,
                  backgroundColor: t.primary,
                }}
              />
            )}
          </View>
          <T style={{ flex: 1, fontSize: 14 }}>{option}</T>
        </Pressable>
      ))}
    </View>
  );
}
