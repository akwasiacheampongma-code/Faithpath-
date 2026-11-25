import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Icon } from "../../components/Icon";
import { Button, Field, T } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { BIBLE_SCOPES, normalizeBookSearch, type BibleScope } from "./book-search";

export type BibleScopeSelectProps = {
  value: BibleScope;
  onChange: (value: BibleScope) => void;
  compact?: boolean;
  inline?: boolean;
  bookFilter?: {
    value?: string;
    books: readonly { code: string; name: string; testament: string }[];
    onChange: (code: string) => void;
  };
};

export function BibleScopeSelect({ value, onChange, compact = false, inline = false, bookFilter }: BibleScopeSelectProps) {
  const t = useTheme(),
    [open, setOpen] = useState(false),
    [chooseBook, setChooseBook] = useState(false),
    [bookQuery, setBookQuery] = useState(""),
    selected = bookFilter?.books.find((book) => book.code === bookFilter.value)?.name
      ?? BIBLE_SCOPES.find((scope) => scope.value === value)!.label;
  const close = () => {
    setOpen(false);
    setChooseBook(false);
    setBookQuery("");
  };
  const books = bookFilter?.books.filter((book) => normalizeBookSearch(book.name).includes(normalizeBookSearch(bookQuery)));
  return (
    <View style={{ width: bookFilter ? undefined : "100%", minWidth: bookFilter ? 180 : undefined, maxWidth: bookFilter ? undefined : 420, gap: inline ? 12 : 7, ...(inline ? { flexDirection: "row", flexWrap: "wrap", alignItems: "center" } : {}) }}>
      <T variant="small" style={{ fontWeight: "600" }}>
        Bibelbereich
      </T>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Bibelbereich"
        accessibilityValue={{ text: selected }}
        accessibilityState={{ expanded: open }}
        accessibilityHint="Öffnet die Auswahl des Bibelbereichs"
        onPress={() => setOpen(true)}
        style={({ pressed }) => ({
          minHeight: 50,
          ...(inline ? { flexGrow: 1, flexBasis: 160, minWidth: 0 } : {}),
          padding: compact ? 10 : 14,
          borderWidth: 1,
          borderColor: t.line,
          borderRadius: 12,
          backgroundColor: t.surface,
          flexDirection: "row",
          alignItems: "center",
          gap: compact ? 6 : 12,
          opacity: pressed ? 0.75 : 1,
        })}
      >
        <T style={{ flex: 1, ...(compact ? { fontSize: 12 } : {}) }}>{selected}</T>
        <View style={{ transform: [{ rotate: "90deg" }] }}>
          <Icon name="chevron" size={17} color={t.muted} />
        </View>
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="none"
        onRequestClose={close}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
            backgroundColor: "rgba(0, 0, 0, 0.35)",
          }}
        >
          <Pressable
            accessible={false}
            onPress={close}
            style={StyleSheet.absoluteFill}
          />
          <View
            accessibilityViewIsModal
            style={{
              width: "100%",
              maxWidth: 420,
              maxHeight: "90%",
              padding: 20,
              gap: 14,
              borderRadius: 20,
              backgroundColor: t.surface,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <T accessibilityRole="header" variant="heading" style={{ flex: 1 }}>
                {chooseBook ? "Ein Buch wählen" : "Bibelbereich"}
              </T>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Bibelbereich schließen"
                onPress={close}
                style={{
                  minWidth: 44,
                  minHeight: 44,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="close" color={t.text} size={20} />
              </Pressable>
            </View>
            {chooseBook && bookFilter ? <>
              <Field label="Buch im Bibelbereich suchen" value={bookQuery} onChangeText={setBookQuery} />
              <ScrollView style={{ maxHeight: 350, flexShrink: 1 }} keyboardShouldPersistTaps="handled">
                {books?.map((book) => <Button key={book.code} kind="ghost" icon={null}
                  selected={book.code === bookFilter.value} style={{ justifyContent: "flex-start" }}
                  onPress={() => { bookFilter.onChange(book.code); close(); }}>{book.name}</Button>)}
                {!books?.length && <T variant="small">Kein Buch gefunden.</T>}
              </ScrollView>
              <Button kind="ghost" icon="back" onPress={() => { setChooseBook(false); setBookQuery(""); }}>Zu den Bibelbereichen</Button>
            </> : <View accessibilityRole="radiogroup" accessibilityLabel="Bibelbereich">
              {BIBLE_SCOPES.map((scope) => (
                <Pressable
                  key={scope.value}
                  accessibilityRole="radio"
                  accessibilityLabel={scope.label}
                  accessibilityState={{ checked: !bookFilter?.value && value === scope.value }}
                  onPress={() => {
                    onChange(scope.value);
                    close();
                  }}
                  style={({ pressed }) => ({
                    minHeight: 52,
                    padding: 14,
                    marginVertical: 3,
                    borderRadius: 12,
                    backgroundColor: !bookFilter?.value && value === scope.value ? t.soft : t.surface,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  <T style={{ flex: 1 }}>{scope.label}</T>
                  {!bookFilter?.value && value === scope.value && (
                    <Icon name="check" size={18} color={t.primary} />
                  )}
                </Pressable>
              ))}
              {bookFilter && <Button kind="secondary" icon="chevron" onPress={() => setChooseBook(true)}>Ein Buch wählen</Button>}
            </View>}
          </View>
        </View>
      </Modal>
    </View>
  );
}
