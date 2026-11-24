import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Button, Card, Field, T } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { BibleScopeSelect } from "./BibleScopeSelect";
import { normalizeBookSearch, type BibleScope } from "./book-search";

type BookChoice = { code: string; name: string; chapters: number; testament: string };

export function ChapterPicker({ books, currentBook, currentChapter, onChoose, onClose }: {
  books: readonly BookChoice[];
  currentBook: string;
  currentChapter: number;
  onChoose: (book: string, chapter: number) => void;
  onClose: () => void;
}) {
  const theme = useTheme();
  const [book, setBook] = useState(() => books.find((item) => item.code === currentBook) ?? books[0]!);
  const [changeBook, setChangeBook] = useState(false);
  const [scope, setScope] = useState<BibleScope>("Alle");
  const [query, setQuery] = useState("");
  const needle = normalizeBookSearch(query);
  const results = books.filter((item) => (scope === "Alle" || item.testament === scope) &&
    normalizeBookSearch(item.name).includes(needle));

  return <Card style={{ gap: 10 }}>
    <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
      <T variant="heading">Buch und Kapitel</T>
      <Button icon={null} kind="ghost" onPress={onClose}>Auswahl schließen</Button>
    </View>
    <Button kind="secondary" icon="book" onPress={() => setChangeBook(!changeBook)}>
      {changeBook ? "Zur Kapitelwahl" : book.name + " · Buch wechseln"}
    </Button>
    {changeBook ? <>
      <Field label="Bibelbuch suchen" value={query} onChangeText={setQuery} />
      <BibleScopeSelect value={scope} onChange={setScope} />
      <ScrollView style={{ maxHeight: 240 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
        {results.map((item) => (
          <Pressable key={item.code} accessibilityRole="button" accessibilityState={{ selected: book.code === item.code }}
            onPress={() => { setBook(item); setChangeBook(false); }}
            style={{ minHeight: 44, paddingVertical: 8, paddingHorizontal: 9, justifyContent: "center", borderBottomWidth: 1, borderColor: theme.line }}>
            <T>{item.name}</T>
          </Pressable>
        ))}
        {!results.length && <T variant="small">Kein passendes Buch gefunden.</T>}
      </ScrollView>
    </> :
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {Array.from({ length: book.chapters }, (_, index) => {
          const chapter = index + 1;
          const current = currentBook === book.code && currentChapter === chapter;
          return <Pressable key={chapter} accessibilityRole="button" accessibilityLabel={book.name + ", Kapitel " + chapter}
            accessibilityState={{ selected: current }} onPress={() => onChoose(book.code, chapter)}
            style={{ minWidth: 44, minHeight: 44, paddingHorizontal: 8, justifyContent: "center", alignItems: "center",
              borderRadius: 10, backgroundColor: current ? theme.primary : theme.soft }}>
            <T style={{ color: current ? theme.onPrimary : theme.text }}>{chapter}</T>
          </Pressable>;
        })}
      </View>}
  </Card>;
}
