import { useId } from "react";
import { useTheme } from "../../../design-system/theme";
import type { AnswerOptionsProps } from "./AnswerOptions";

/** Native radio inputs preserve keyboard arrow/Space behavior in the browser. */
export function AnswerOptions({
  options,
  selected,
  disabled,
  onSelect,
}: AnswerOptionsProps) {
  const t = useTheme(),
    name = useId();
  return (
    <fieldset
      aria-label="Antwort auswählen"
      style={{
        border: 0,
        padding: 0,
        margin: 0,
        minWidth: 0,
        display: "grid",
        gap: 10,
      }}
    >
      {options.map((option, index) => (
        <label
          key={index}
          style={{
            minHeight: 58,
            boxSizing: "border-box",
            padding: 16,
            borderRadius: 14,
            border: `1px solid ${selected === index ? t.primary : t.line}`,
            backgroundColor: selected === index ? t.soft : t.surface,
            color: t.text,
            fontFamily: "DMSans",
            fontSize: 14,
            lineHeight: "24px",
            display: "flex",
            alignItems: "center",
            gap: 13,
            cursor: disabled ? "default" : "pointer",
          }}
        >
          <input
            type="radio"
            name={name}
            checked={selected === index}
            disabled={disabled}
            onChange={() => onSelect(index)}
            style={{
              width: 19,
              height: 19,
              flexShrink: 0,
              margin: 0,
              accentColor: t.primary,
            }}
          />
          <span>{option}</span>
        </label>
      ))}
    </fieldset>
  );
}
