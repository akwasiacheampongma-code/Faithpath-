import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Shell } from "../../src/components/Shell";
import { Button, Card, Field, T, Tag } from "../../src/components/ui";
import { Icon } from "../../src/components/Icon";
import { useTheme } from "../../src/design-system/theme";
import { useApp } from "../../src/state/store";
import { NT_BOOKS } from "../../src/features/quiz/index";
import { referenceLabel } from "../../src/features/bible/repository";

export default function Understand() {
  const t = useTheme(),
    study = useApp((s) => s.data.ntStudy),
    [query, setQuery] = useState(""),
    [expanded, setExpanded] = useState<string | null>(null);
  const viewed = useMemo(
    () =>
      new Set(
        Object.values(study.completions).map(
          (item) => `${item.book}:${item.chapter}`,
        ),
      ),
    [study.completions],
  );
  const books = NT_BOOKS.filter((book) =>
    book.name
      .toLocaleLowerCase("de")
      .includes(query.trim().toLocaleLowerCase("de")),
  );
  const open = (book: string, chapter: number) =>
    router.push({ pathname: "/verstehen/[book]", params: { book, chapter } });
  return (
    <Shell>
      <View style={{ maxWidth: 760, gap: 24 }}>
        <Tag icon="book">Das Neue Testament entdecken</Tag>
        <View style={{ gap: 12 }}>
          <T
            variant="title"
            accessibilityRole="header"
            style={{ fontSize: 46, lineHeight: 48 }}
          >
            Lesen. Fragen. Verstehen.
          </T>
          <T style={{ color: t.muted, maxWidth: 570 }}>
            Was ist dir im Text begegnet? Fünf kurze Fragen pro Kapitel helfen
            dir, genauer hinzusehen. Du brauchst kein Vorwissen.
          </T>
        </View>
        <Card style={{ gap: 14, backgroundColor: t.soft, borderWidth: 0 }}>
          <T variant="heading">In deinem Tempo.</T>
          <T style={{ fontSize: 13 }}>
            Wähle eine Antwort und sieh dir danach die Erklärung mit Bibelstelle
            an. Du kannst jederzeit nachlesen, pausieren oder eine Antwort
            ändern.
          </T>
          <T variant="small" style={{ color: t.muted }}>
            27 Bücher · 260 Kapitel · 1.300 Fragen aus FaithPath. Deine
            Antworten bleiben auf diesem Gerät. Es gibt keine Rangliste.
          </T>
          <Button
            onPress={() =>
              open(study.position?.book ?? "MRK", study.position?.chapter ?? 4)
            }
          >
            {study.position
              ? `Fragen zu ${referenceLabel(study.position)} fortsetzen`
              : "Mit Markus 4 beginnen"}
          </Button>
        </Card>
        <Field
          label="NT-Buch suchen"
          value={query}
          onChangeText={setQuery}
          placeholder="Zum Beispiel Markus oder Römer"
        />
        <View style={{ gap: 2 }}>
          {books.map((book) => {
            const isOpen = expanded === book.code;
            const count = Array.from(
              { length: book.chapters },
              (_, index) => `${book.code}:${index + 1}`,
            ).filter((key) => viewed.has(key)).length;
            return (
              <View
                key={book.code}
                style={{
                  borderBottomWidth: 1,
                  borderColor: t.line,
                  paddingVertical: 8,
                }}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${book.name}: Kapitel ${isOpen ? "schließen" : "auswählen"}`}
                  accessibilityState={{ expanded: isOpen }}
                  onPress={() => setExpanded(isOpen ? null : book.code)}
                  style={{
                    minHeight: 74,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 16,
                    paddingVertical: 8,
                  }}
                >
                  <View
                    style={{
                      width: 37,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: t.soft,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon
                      name="book"
                      size={20}
                      color={t.primary}
                      stroke={1.4}
                    />
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <T variant="heading" style={{ fontSize: 27 }}>
                      {book.name}
                    </T>
                    <T variant="small" style={{ color: t.muted }}>
                      {book.chapters} Kapitel · je 5 Fragen
                      {count > 0 ? ` · ${count} angesehen` : ""}
                    </T>
                  </View>
                  <Icon
                    name={isOpen ? "close" : "arrow"}
                    size={17}
                    color={t.muted}
                  />
                </Pressable>
                {isOpen && (
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 9,
                      paddingVertical: 14,
                    }}
                  >
                    {Array.from(
                      { length: book.chapters },
                      (_, index) => index + 1,
                    ).map((chapter) => (
                      <Pressable
                        key={chapter}
                        accessibilityRole="button"
                        accessibilityLabel={`${book.name} ${chapter} entdecken${viewed.has(`${book.code}:${chapter}`) ? ", bereits angesehen" : ""}`}
                        onPress={() => open(book.code, chapter)}
                        style={{
                          minWidth: 54,
                          minHeight: 54,
                          borderWidth: 1,
                          borderColor: t.line,
                          borderRadius: 13,
                          backgroundColor: viewed.has(`${book.code}:${chapter}`)
                            ? t.soft
                            : t.surface,
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 2,
                          padding: 9,
                        }}
                      >
                        <T style={{ fontSize: 16 }}>{chapter}</T>
                        {viewed.has(`${book.code}:${chapter}`) && (
                          <Icon name="check" size={11} color={t.primary} />
                        )}
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
          {books.length === 0 && (
            <T style={{ color: t.muted, paddingVertical: 24 }}>
              Zu dieser Suche gibt es kein NT-Buch. Versuche einen anderen
              Namen.
            </T>
          )}
        </View>
        <T variant="small" style={{ color: t.muted }}>
          Die Erklärungen sind redaktionelle FaithPath-Inhalte und vom Bibeltext
          getrennt. Ein abgeschlossener Fragensatz erinnert ans Ansehen,
          bewertet deinen Glauben aber nicht.
        </T>
        <Button
          kind="ghost"
          icon="info"
          onPress={() => router.push("/quellen")}
        >
          Quellen ansehen
        </Button>
        <Button
          kind="secondary"
          icon="back"
          onPress={() => router.replace("/bibel")}
        >
          Zur Bibel
        </Button>
      </View>
    </Shell>
  );
}
