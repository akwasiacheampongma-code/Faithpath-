import { useState } from "react";
import { useTheme } from "../../design-system/theme";
import { BIBLE_SCOPES } from "./book-search";
import type { BibleScopeSelectProps } from "./BibleScopeSelect";

export function BibleScopeSelect({ value, onChange, compact = false, inline = false }: BibleScopeSelectProps) {
  const t = useTheme(),
    [focused, setFocused] = useState(false);
  return (
    <label
      style={{
        display: "flex",
        flexDirection: inline ? "row" : "column",
        ...(inline ? { flexWrap: "wrap", alignItems: "center" } : {}),
        gap: inline ? 12 : 7,
        width: "100%",
        maxWidth: 420,
        color: t.text,
        fontFamily: "DMSans, sans-serif",
      }}
    >
      <span style={{ fontSize: 12, lineHeight: "19px", fontWeight: 600 }}>
        Bibelbereich
      </span>
      <select
        value={value}
        onChange={(event) => {
          const choice = BIBLE_SCOPES.find(
            (scope) => scope.value === event.currentTarget.value,
          );
          if (choice) onChange(choice.value);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: inline ? "auto" : "100%",
          ...(inline ? { flex: "1 1 160px", maxWidth: "100%" } : {}),
          minWidth: 0,
          minHeight: 50,
          boxSizing: "border-box",
          border: `1px solid ${t.line}`,
          borderRadius: 12,
          padding: compact ? "12px 8px" : "12px 14px",
          backgroundColor: t.surface,
          color: t.text,
          colorScheme: t.dark ? "dark" : "light",
          fontFamily: "inherit",
          fontSize: compact ? 12 : 15,
          lineHeight: "24px",
          cursor: "pointer",
          outline: focused ? `2px solid ${t.gold}` : undefined,
          outlineOffset: 3,
        }}
      >
        {BIBLE_SCOPES.map((scope) => (
          <option key={scope.value} value={scope.value}>
            {scope.label}
          </option>
        ))}
      </select>
    </label>
  );
}
