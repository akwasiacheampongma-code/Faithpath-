import type { ChoiceProps } from "./Choice";
import { useTheme } from "../design-system/theme";
export function Choice({ name, label, checked, onChange }: ChoiceProps) {
  const t = useTheme();
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        minHeight: 48,
        boxSizing: "border-box",
        padding: 15,
        border: "1px solid " + (checked ? t.gold : t.line),
        borderRadius: 12,
        backgroundColor: checked ? t.soft : t.surface,
        color: t.text,
        fontFamily: "DMSans",
        fontSize: 13,
        lineHeight: "22px",
        cursor: "pointer",
      }}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        style={{
          accentColor: t.primary,
          width: 18,
          height: 18,
          flexShrink: 0,
          margin: 0,
        }}
      />
      <span>{label}</span>
    </label>
  );
}
