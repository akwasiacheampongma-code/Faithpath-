import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { T } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { useApp } from "../../state/store";
import { bookByCode } from "./repository";

export function BookChapterGrid({ code }: { code: string }) {
  const t = useTheme(), readChapters = useApp(s => s.data.readChapters), book = bookByCode(code);
  if (!book) return null;
  return <View style={{ gap: 10 }}>
    <T variant="label" style={{ fontSize: 9 }}>Wähle ein Kapitel</T>
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}>
      {Array.from({ length: book.chapters }, (_, index) => index + 1).map(chapter => {
        const read = readChapters.includes(`${book.code}:${chapter}`);
        return <Pressable key={chapter} accessibilityRole="button"
          accessibilityLabel={`${book.name}, Kapitel ${chapter}${read ? ", gelesen" : ""}`}
          onPress={() => router.push({ pathname: "/lesen/[book]", params: { book: book.code, chapter } })}
          style={{ width: 46, height: 46, borderRadius: 9, backgroundColor: read ? t.primary : t.soft, alignItems: "center", justifyContent: "center" }}>
          <T style={{ fontSize: 12, color: read ? t.onPrimary : t.text }}>{chapter}</T>
        </Pressable>;
      })}
    </View>
  </View>;
}
