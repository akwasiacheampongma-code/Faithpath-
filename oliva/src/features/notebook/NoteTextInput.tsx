import { useState } from "react";
import { TextInput, type TextInputProps } from "react-native";
import { tokens, useTheme } from "../../design-system/theme";
import { NOTE_TEXT_LIMIT } from "./model";

export type NoteTextInputProps = Pick<TextInputProps, "value" | "onChangeText" | "autoFocus" | "editable" | "accessibilityLabel">;

export function NoteTextInput(props: NoteTextInputProps) {
  const theme = useTheme();
  const [height, setHeight] = useState(250);
  return (
    <TextInput
      accessibilityLabel="Notiztext"
      {...props}
      multiline
      scrollEnabled={false}
      onContentSizeChange={({ nativeEvent }) => setHeight(Math.max(250, Math.ceil(nativeEvent.contentSize.height)))}
      placeholder="Hier ist Platz für deine Gedanken."
      placeholderTextColor={theme.muted}
      selectionColor={theme.primary}
      maxLength={NOTE_TEXT_LIMIT}
      style={{
        padding: 0,
        paddingBottom: 12,
        height,
        textAlignVertical: "top",
        color: theme.text,
        fontFamily: tokens.font.body,
        fontSize: 19,
        lineHeight: 30,
      }}
    />
  );
}
