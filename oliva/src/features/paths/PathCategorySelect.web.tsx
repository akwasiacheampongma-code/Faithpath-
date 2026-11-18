import { useState } from "react";
import { useTheme } from "../../design-system/theme";
import type { PathCategorySelectProps } from "./PathCategorySelect";

/** A native HTML select retains keyboard behavior; its visible value can wrap. */
export function PathCategorySelect({ value, options, onChange }: PathCategorySelectProps) {
  const t = useTheme(), [focused, setFocused] = useState(false);
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", maxWidth: 420, color: t.text, fontFamily: "DMSans, sans-serif" }}>
      <span style={{ fontSize: 12, lineHeight: "19px", fontWeight: 600 }}>Wege filtern</span>
      <span style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, minHeight: 50, boxSizing: "border-box", padding: "12px 14px", border: `1px solid ${t.line}`, borderRadius: 12, backgroundColor: t.surface, outline: focused ? `2px solid ${t.gold}` : undefined, outlineOffset: 3 }}>
        <span aria-hidden="true" style={{ flex: 1, minWidth: 0, fontSize: 15, lineHeight: "24px", overflowWrap: "anywhere" }}>{value}</span>
        <span aria-hidden="true" style={{ color: t.muted, fontSize: 16 }}>⌄</span>
        <select aria-label="Wege filtern" value={value}
          onChange={(event) => { if (options.includes(event.currentTarget.value)) onChange(event.currentTarget.value); }}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 15, colorScheme: t.dark ? "dark" : "light" }}>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </span>
    </label>
  );
}
