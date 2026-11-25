import { useState } from "react";
import { tokens, useTheme } from "../../design-system/theme";
import type { BibleEditionSelectProps } from "./BibleEditionSelect";
import { BIBLE_EDITIONS, bibleEdition } from "./editions";

export function BibleEditionSelect({ value, onChange }: BibleEditionSelectProps) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", maxWidth: 420,
      color: t.text, fontFamily: `${tokens.font.body}, sans-serif` }}>
      <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>Bibelübersetzung</span>
      <span style={{ display: "flex", position: "relative", alignItems: "center", gap: 12, minHeight: 50,
        boxSizing: "border-box", padding: "12px 14px", border: `1px solid ${t.line}`, borderRadius: 12,
        backgroundColor: t.surface, outline: focused ? `2px solid ${t.gold}` : undefined, outlineOffset: 3 }}>
        <span aria-hidden="true" style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>{BIBLE_EDITIONS[value].name}</span>
        <span aria-hidden="true" style={{ color: t.muted }}>⌄</span>
        <select value={value} onChange={(event) => onChange(bibleEdition(event.currentTarget.value))}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0,
            cursor: "pointer", colorScheme: t.dark ? "dark" : "light", fontSize: "1rem" }}>
          {Object.entries(BIBLE_EDITIONS).map(([edition, { name }]) => <option key={edition} value={edition}>{name}</option>)}
        </select>
      </span>
    </label>
  );
}
