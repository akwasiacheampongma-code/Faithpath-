import { Pressable } from "react-native";
import { T } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { notebookText } from "./model";

const date = new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "short", year: "numeric" });

export function NoteListRow({ text, updatedAt, context, pending, legacy, testID, onOpen }: {
  text: string;
  updatedAt: string;
  context?: string;
  pending?: boolean;
  legacy?: boolean;
  testID?: string;
  onOpen: () => void;
}) {
  const theme = useTheme();
  const { title, preview } = notebookText(text);
  // A long paragraph from a saved thought can have no line breaks.
  const split = !preview && title.length > 72 ? title.lastIndexOf(" ", 72) : -1;
  const rowTitle = split > 0 ? title.slice(0, split) : title;
  const rowPreview = preview || (split > 0 ? title.slice(split + 1) : context);
  const when = new Date(updatedAt);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${legacy ? "Eintrag" : "Notiz"} öffnen: ${rowTitle.slice(0, 120)}`}
      accessibilityHint={pending ? "Speicherung steht aus" : undefined}
      testID={testID}
      onPress={onOpen}
      style={({ pressed }) => ({
        minHeight: 66,
        paddingVertical: 11,
        paddingHorizontal: 3,
        borderBottomWidth: 1,
        borderColor: theme.line,
        backgroundColor: pressed ? theme.soft : "transparent",
        gap: 3,
      })}
    >
      <T numberOfLines={1} style={{ fontWeight: "700", fontSize: 17, lineHeight: 24 }}>{rowTitle}</T>
      {!!rowPreview && <T numberOfLines={2} variant="small" style={{ fontSize: 14, lineHeight: 21, color: theme.muted }}>
        {rowPreview}
      </T>}
      <T variant="small" style={{ color: theme.muted }}>{pending ? "Speicherung steht aus" : date.format(when)}</T>
    </Pressable>
  );
}
