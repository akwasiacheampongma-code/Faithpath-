import { useState } from "react";
import { useTheme } from "../../design-system/theme";
import { BIBLE_SCOPES } from "./book-search";
import type { BibleScopeSelectProps } from "./BibleScopeSelect";

export function BibleScopeSelect({ value, onChange, compact = false, inline = false, bookFilter }: BibleScopeSelectProps) {
  const t = useTheme(),
    [focused, setFocused] = useState(false);
  const selected = bookFilter?.books.find((book) => book.code === bookFilter.value)?.name
    ?? BIBLE_SCOPES.find((scope) => scope.value === value)!.label;
  const select = (
    <select
      value={bookFilter?.value ? "book:" + bookFilter.value : value}
      onChange={(event) => {
        const choice = BIBLE_SCOPES.find((scope) => scope.value === event.currentTarget.value);
        if (choice) onChange(choice.value);
        else {
          const book = bookFilter?.books.find((entry) => "book:" + entry.code === event.currentTarget.value);
          if (book) bookFilter?.onChange(book.code);
        }
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%", minWidth: 0, minHeight: 50, boxSizing: "border-box",
        border: `1px solid ${t.line}`, borderRadius: 12,
        padding: compact ? "12px 8px" : "12px 14px",
        backgroundColor: t.surface, color: t.text,
        colorScheme: t.dark ? "dark" : "light", fontFamily: "inherit",
        fontSize: compact ? 12 : 15, lineHeight: "24px", cursor: "pointer",
        outline: focused ? `2px solid ${t.gold}` : undefined, outlineOffset: 3,
        ...(inline ? { position: "absolute", inset: 0, height: "100%", opacity: 0 } : {}),
      }}
    >
      {BIBLE_SCOPES.map((scope) => <option key={scope.value} value={scope.value}>{scope.label}</option>)}
      {bookFilter && (["AT", "NT"] as const).map((testament) => (
        <optgroup key={testament} label={testament === "AT" ? "Bücher des Alten Testaments" : "Bücher des Neuen Testaments"}>
          {bookFilter.books.filter((book) => book.testament === testament).map((book) => (
            <option key={book.code} value={"book:" + book.code}>{book.name}</option>
          ))}
        </optgroup>
      ))}
    </select>
  );
  return (
    <label
      style={{
        display: "flex",
        flexDirection: inline ? "row" : "column",
        ...(inline ? { flexWrap: "wrap", alignItems: "center" } : {}),
        gap: inline ? 12 : 7,
        width: "100%",
        maxWidth: bookFilter ? 230 : 420,
        color: t.text,
        fontFamily: "DMSans, sans-serif",
      }}
    >
      <span style={{ fontSize: 12, lineHeight: "19px", fontWeight: 600 }}>
        Bibelbereich
      </span>
      {inline ? <span style={{ position: "relative", display: "flex", alignItems: "center", flex: "1 1 160px", minWidth: 0, maxWidth: "100%", gap: 12, minHeight: 50, boxSizing: "border-box", padding: "12px 14px", border: `1px solid ${t.line}`, borderRadius: 12, backgroundColor: t.surface, outline: focused ? `2px solid ${t.gold}` : undefined, outlineOffset: 3 }}>
        <span data-testid="bible-scope-value" aria-hidden="true" style={{ flex: 1, minWidth: 0, fontSize: 15, lineHeight: "24px", overflowWrap: "anywhere" }}>{selected}</span>
        <span aria-hidden="true" style={{ color: t.muted, fontSize: 16 }}>⌄</span>
        {select}
      </span> : select}
    </label>
  );
}
