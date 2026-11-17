import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Shell } from "../../src/components/Shell";
import { Button, Card, Progress, T, Tag } from "../../src/components/ui";
import { useTheme } from "../../src/design-system/theme";
import { useApp } from "../../src/state/store";
import { countBookRead } from "../../src/state/model";
import { bookByCode } from "../../src/features/bible/repository";
import { BookChapterGrid } from "../../src/features/bible/BookChapterGrid";

/** Book information remains useful for story links and old saved URLs. */
export default function BookOverview() {
  const { book: code } = useLocalSearchParams<{ book: string }>();
  const book = bookByCode(code ?? ""), data = useApp(s => s.data), t = useTheme();
  return <Shell>
    <Button kind="ghost" icon="back" onPress={() => router.canGoBack() ? router.back() : router.replace("/bibel")}>Zurück</Button>
    {!book ? <Card style={{ gap: 14 }}>
      <T variant="heading">Dieses Buch gibt es hier nicht.</T>
      <Button onPress={() => router.replace("/bibel")}>Zur Bibel</Button>
    </Card> : <View testID="book-overview" style={{ gap: 20, marginTop: 20 }}>
      <Tag icon="book">{book.testament === "AT" ? "Altes Testament" : "Neues Testament"}</Tag>
      <T variant="title" accessibilityRole="header">{book.name}</T>
      <T style={{ color: t.muted }}>{book.description}</T>
      <Card style={{ gap: 12 }}>
        <T>{countBookRead(data, book.code)} von {book.chapters} Kapiteln gelesen</T>
        <Progress value={countBookRead(data, book.code) / book.chapters} label={`Lesefortschritt in ${book.name}`} />
        <BookChapterGrid code={book.code} />
      </Card>
    </View>}
  </Shell>;
}
