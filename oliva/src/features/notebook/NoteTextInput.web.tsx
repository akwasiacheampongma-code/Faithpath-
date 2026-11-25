import type { CSSProperties } from "react";
import { tokens, useTheme } from "../../design-system/theme";
import { NOTE_TEXT_LIMIT } from "./model";
import type { NoteTextInputProps } from "./NoteTextInput";

export function NoteTextInput({ value = "", onChangeText, autoFocus, editable, accessibilityLabel = "Notiztext" }: NoteTextInputProps) {
  const theme = useTheme();
  const typography: CSSProperties = {
    boxSizing: "border-box",
    padding: "0 0 12px",
    border: 0,
    fontFamily: `${tokens.font.body}, sans-serif`,
    fontSize: "1.1875rem",
    lineHeight: 30 / 19,
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word",
  };

  return (
    <div style={{ position: "relative", width: "100%", minHeight: 250 }}>
      {/* The mirror sets the height before paint, including after fonts load or the screen narrows. */}
      <div aria-hidden="true" style={{ ...typography, visibility: "hidden" }}>
        {value}{"\u200b"}
      </div>
      <textarea
        aria-label={accessibilityLabel}
        value={value}
        onChange={(event) => onChangeText?.(event.currentTarget.value)}
        autoFocus={autoFocus}
        readOnly={editable === false}
        placeholder="Hier ist Platz für deine Gedanken."
        maxLength={NOTE_TEXT_LIMIT}
        rows={1}
        style={{
          ...typography,
          position: "absolute", inset: 0, width: "100%", height: "100%",
          margin: 0, resize: "none", overflow: "hidden",
          background: "transparent", color: theme.text, caretColor: theme.primary,
        }}
      />
    </div>
  );
}
