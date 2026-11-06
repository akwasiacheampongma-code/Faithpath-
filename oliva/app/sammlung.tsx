import { useState } from "react";
import { View, Pressable, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { Shell } from "../src/components/Shell";
import { T, Button, Card, Field, Tag, Progress } from "../src/components/ui";
import { SwordArt } from "../src/components/Artwork";
import { Icon } from "../src/components/Icon";
import { useTheme } from "../src/design-system/theme";
import { useApp } from "../src/state/store";
import {
  BOOKS,
  referenceLabel,
  getPassage,
} from "../src/features/bible/repository";
import { countBookRead, type Note } from "../src/state/model";
import { JournalEditor } from "../src/features/personal/Editors";
import { journalDraft } from "../src/features/personal/model";
import { highlightBackground } from "../src/features/bible/highlights";
export default function Collection() {
  const t = useTheme(),
    data = useApp((s) => s.data),
    mutate = useApp((s) => s.mutate),
    busy = useApp((s) => s.busy),
    { width } = useWindowDimensions(),
    [tab, setTab] = useState("Gedanken"),
    [query, setQuery] = useState(""),
    [deleting, setDeleting] = useState<string | null>(null),
    [lastDeleted, setLastDeleted] = useState<Note | null>(null),
    [showForm, setShowForm] = useState(false);
  const [editorMessage, setEditorMessage] = useState("");
  const pendingDraft = data.drafts.find((d) => d.key === "journal");
  const draft = pendingDraft?.type === "journal" ? pendingDraft : undefined;
  async function openEditor(note?: Note) {
    if (draft) {
      if (note && draft.values.targetId !== note.id) {
        setEditorMessage(
          "Du hast einen anderen Entwurf. Setze ihn fort oder verwirf ihn im Editor ausdrücklich, bevor du einen anderen Gedanken bearbeitest.",
        );
        setShowForm(true);
        return;
      }
      setShowForm(true);
      setEditorMessage("");
      return;
    }
    const saved = await useApp
      .getState()
      .saveEditorDraft(journalDraft(note), null);
    if (saved) {
      setShowForm(true);
      setEditorMessage("");
    }
  }
  async function remove(note: Note) {
    if (
      await mutate((d) => {
        d.notes = d.notes.filter((n) => n.id !== note.id);
      })
    ) {
      setLastDeleted(note);
      setDeleting(null);
    }
  }
  async function undo() {
    if (
      lastDeleted &&
      (await mutate((d) => {
        if (!d.notes.some((n) => n.id === lastDeleted.id))
          d.notes.unshift(lastDeleted);
      }))
    ) {
      setLastDeleted(null);
    }
  }
  const labels = {
    note: "Gedanke",
    reflection: "Reflexion",
    action: "Erfahrung",
  };
  return (
    <Shell>
      <Tag icon="bookmark">Was du bewahren möchtest</Tag>
      <T
        variant="title"
        accessibilityRole="header"
        style={{ fontSize: 44, marginTop: 14, marginBottom: 10 }}
      >
        Deine Sammlung.
      </T>
      <T style={{ fontSize: 13, color: t.muted, marginBottom: 26 }}>
        Eigene Worte, bedeutsame Verse und die Bücher, die du entdeckst. Privat
        auf diesem Gerät.
      </T>
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        {["Gedanken", "Lesezeichen", "Markierungen", "Buchschwerter"].map(
          (label) => (
            <Pressable
              key={label}
              accessibilityRole="button"
              accessibilityState={{ selected: tab === label }}
              onPress={() => {
                setTab(label);
                setQuery("");
              }}
              style={{
                minHeight: 44,
                paddingHorizontal: 16,
                paddingVertical: 11,
                borderRadius: 25,
                backgroundColor: tab === label ? t.primary : t.soft,
              }}
            >
              <T
                style={{
                  fontSize: 12,
                  color: tab === label ? t.onPrimary : t.text,
                }}
              >
                {label}
              </T>
            </Pressable>
          ),
        )}
      </View>
      <Field
        label={
          tab === "Buchschwerter" ? "Buch suchen" : "Deine Sammlung durchsuchen"
        }
        value={query}
        onChangeText={setQuery}
        placeholder={
          tab === "Buchschwerter"
            ? "Zum Beispiel Johannes"
            : "Deine Suchwörter …"
        }
      />
      <View style={{ height: 20 }} />
      {tab === "Gedanken" ? (
        <View style={{ gap: 17 }}>
          <View style={{ alignItems: "flex-start" }}>
            <Button
              icon="pen"
              onPress={() => {
                if (showForm) setShowForm(false);
                else void openEditor();
              }}
            >
              {showForm
                ? "Editor schließen"
                : draft
                  ? "Entwurf fortsetzen"
                  : "Einen Gedanken festhalten"}
            </Button>
          </View>
          {editorMessage && (
            <T accessibilityRole="alert" style={{ fontSize: 12 }}>
              {editorMessage}
            </T>
          )}
          {!showForm && draft && (
            <Card style={{ gap: 9 }}>
              <T>Dein Entwurf wartet auf dich.</T>
              <T style={{ fontSize: 11, color: t.muted }}>
                Auch nach einem Neustart kannst du deine bisherigen Worte
                fortsetzen.
              </T>
            </Card>
          )}
          {showForm && draft && (
            <JournalEditor
              key={draft.id}
              draft={draft}
              onDone={() => {
                setShowForm(false);
                setEditorMessage("");
              }}
            />
          )}
          {lastDeleted && (
            <Card style={{ backgroundColor: t.goldSoft, gap: 10 }}>
              <T>Eintrag gelöscht.</T>
              <Button
                disabled={busy}
                kind="secondary"
                icon="back"
                onPress={() => void undo()}
              >
                Rückgängig machen
              </Button>
              <T style={{ fontSize: 10, color: t.muted }}>
                Rückgängig ist hier bis zum Verlassen dieser Ansicht möglich.
              </T>
            </Card>
          )}
          {data.notes
            .filter((n) =>
              n.text
                .toLocaleLowerCase("de")
                .includes(query.toLocaleLowerCase("de")),
            )
            .map((note) => (
              <Card key={note.id} style={{ gap: 12 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <Tag icon={note.kind === "action" ? "leaf" : "pen"}>
                    {labels[note.kind]}
                  </Tag>
                  <T style={{ fontSize: 10, color: t.muted }}>
                    {new Date(note.createdAt).toLocaleDateString("de-DE")}
                  </T>
                </View>
                <T
                  style={{
                    fontFamily: "Cormorant",
                    fontSize: 25,
                    lineHeight: 34,
                  }}
                >
                  {note.text}
                </T>
                {note.ref && (
                  <Button
                    kind="ghost"
                    icon="book"
                    onPress={() =>
                      router.push({
                        pathname: "/lesen/[book]",
                        params: {
                          book: note.ref!.book,
                          chapter: note.ref!.chapter,
                          verse: note.ref!.from,
                        },
                      })
                    }
                  >
                    {referenceLabel(note.ref)}
                  </Button>
                )}
                {note.origin && (
                  <View style={{ gap: 8 }}>
                    <T variant="small" style={{ color: t.muted }}>
                      Aus FaithPath ·{" "}
                      {note.origin.referenceLabel ?? "eigene Worte"}
                    </T>
                    {note.goalIds?.map((id) => {
                      const goal = data.goals.find((g) => g.id === id);
                      return goal ? (
                        <Button
                          key={id}
                          kind="ghost"
                          icon="path"
                          onPress={() =>
                            router.push({
                              pathname: "/vorhaben/[id]",
                              params: { id },
                            })
                          }
                        >
                          {goal.title}
                        </Button>
                      ) : null;
                    })}
                    <Button
                      kind="ghost"
                      icon="info"
                      onPress={() =>
                        router.push({
                          pathname: "/importarchiv/[id]",
                          params: { id: note.origin!.importId },
                        })
                      }
                    >
                      Originalquelle dieses Gedankens
                    </Button>
                  </View>
                )}
                <View
                  style={{ flexDirection: "row", gap: 7, flexWrap: "wrap" }}
                >
                  <Button
                    kind="ghost"
                    icon="pen"
                    onPress={() => {
                      void openEditor(note);
                    }}
                  >
                    Bearbeiten
                  </Button>
                  <Button
                    kind="ghost"
                    icon="close"
                    onPress={() =>
                      setDeleting(deleting === note.id ? null : note.id)
                    }
                  >
                    Löschen
                  </Button>
                </View>
                {deleting === note.id && (
                  <View
                    style={{
                      gap: 10,
                      borderTopWidth: 1,
                      borderColor: t.line,
                      paddingTop: 15,
                    }}
                  >
                    <T style={{ fontSize: 12 }}>
                      Diesen persönlichen Eintrag wirklich löschen?
                    </T>
                    <Button
                      kind="secondary"
                      disabled={busy}
                      icon="close"
                      onPress={() => void remove(note)}
                    >
                      Eintrag jetzt löschen
                    </Button>
                    <Button
                      kind="ghost"
                      icon={null}
                      onPress={() => setDeleting(null)}
                    >
                      Behalten
                    </Button>
                  </View>
                )}
              </Card>
            ))}
          {!data.notes.filter((n) =>
            n.text
              .toLocaleLowerCase("de")
              .includes(query.toLocaleLowerCase("de")),
          ).length && (
            <Empty
              text={
                query
                  ? "Kein passender Gedanke gefunden."
                  : "Deine Sammlung darf langsam wachsen. Halte einen ersten Gedanken fest, wenn du möchtest."
              }
            />
          )}
        </View>
      ) : tab === "Buchschwerter" ? (
        <View style={{ gap: 20 }}>
          <Card
            style={{ backgroundColor: t.goldSoft, borderWidth: 0, gap: 10 }}
          >
            <T variant="heading">Worte geben Orientierung.</T>
            <T style={{ fontSize: 12, lineHeight: 22 }}>
              Inspiriert von Epheser 6,17 steht das Schwert hier für Gottes
              Wort: Wahrheit, Erkenntnis und Orientierung. Es bedeutet keine
              Macht über andere Menschen.
            </T>
            <T style={{ fontSize: 11, color: t.muted }}>
              Alle 66 Buchidentitäten sind von Anfang an sichtbar. Die
              Lichtlinie auf der Klinge zeigt bestätigte Kapitel – keinen
              Glaubensrang.
            </T>
          </Card>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 15 }}>
            {BOOKS.filter((b) =>
              b.name
                .toLocaleLowerCase("de")
                .includes(query.toLocaleLowerCase("de")),
            ).map((book) => (
              <Pressable
                key={book.code}
                accessibilityRole="button"
                accessibilityLabel={`${book.name}: ${book.sword}`}
                onPress={() =>
                  router.push({
                    pathname: "/lesen/[book]",
                    params: { book: book.code, chapter: 1 },
                  })
                }
                style={{
                  minWidth: width < 500 ? "46%" : 170,
                  flexBasis: width < 500 ? "46%" : "22%",
                  flexGrow: 1,
                  maxWidth: width < 500 ? "49%" : "32%",
                }}
              >
                <Card
                  style={{
                    alignItems: "center",
                    padding: 17,
                    height: 328,
                    gap: 5,
                  }}
                >
                  <SwordArt
                    book={book.code}
                    size={105}
                    progress={countBookRead(data, book.code) / book.chapters}
                  />
                  <T
                    variant="heading"
                    style={{ fontSize: 24, textAlign: "center" }}
                  >
                    {book.name}
                  </T>
                  <T
                    style={{ fontSize: 10, color: t.gold, textAlign: "center" }}
                  >
                    {book.sword}
                  </T>
                  <T
                    style={{ fontSize: 9, color: t.muted, textAlign: "center" }}
                  >
                    {book.motif}
                  </T>
                  <View style={{ width: "100%", marginTop: 9, gap: 8 }}>
                    <Progress
                      value={countBookRead(data, book.code) / book.chapters}
                      label={`${countBookRead(data, book.code)} von ${book.chapters} Kapiteln`}
                    />
                    <T
                      style={{
                        fontSize: 9,
                        color: t.muted,
                        textAlign: "center",
                      }}
                    >
                      {countBookRead(data, book.code)} / {book.chapters} Kapitel
                    </T>
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <View style={{ gap: 14 }}>
          {(tab === "Lesezeichen"
            ? data.bookmarks
            : Object.keys(data.highlights)
          )
            .filter((key) => {
              const [book, c, v] = key.split(":");
              const ref = {
                book: book!,
                chapter: Number(c),
                from: Number(v),
                to: Number(v),
              };
              return `${referenceLabel(ref)} ${getPassage(ref)[0]?.text}`
                .toLocaleLowerCase("de")
                .includes(query.toLocaleLowerCase("de"));
            })
            .map((key) => {
              const [book, c, v] = key.split(":"),
                ref = {
                  book: book!,
                  chapter: Number(c),
                  from: Number(v),
                  to: Number(v),
                };
              return (
                <Card
                  key={key}
                  style={{
                    gap: 12,
                    backgroundColor:
                      tab === "Markierungen"
                        ? highlightBackground(data.highlights[key], t.dark)
                        : t.surface,
                  }}
                >
                  <T variant="label" style={{ fontSize: 9, color: t.gold }}>
                    {referenceLabel(ref)}
                  </T>
                  <T
                    style={{
                      fontFamily: "Cormorant",
                      fontSize: 25,
                      lineHeight: 33,
                    }}
                  >
                    {getPassage(ref)[0]?.text}
                  </T>
                  <View
                    style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}
                  >
                    <Button
                      icon="book"
                      kind="ghost"
                      onPress={() =>
                        router.push({
                          pathname: "/lesen/[book]",
                          params: {
                            book: ref.book,
                            chapter: ref.chapter,
                            verse: ref.from,
                          },
                        })
                      }
                    >
                      Im Kapitel öffnen
                    </Button>
                    <Button
                      icon="close"
                      disabled={busy}
                      kind="ghost"
                      onPress={() =>
                        void mutate((d) => {
                          if (tab === "Lesezeichen")
                            d.bookmarks = d.bookmarks.filter((k) => k !== key);
                          else delete d.highlights[key];
                        })
                      }
                    >
                      Entfernen
                    </Button>
                  </View>
                </Card>
              );
            })}
          {(tab === "Lesezeichen"
            ? data.bookmarks
            : Object.keys(data.highlights)
          ).length === 0 && (
            <Empty
              text={`Noch keine ${tab.toLocaleLowerCase("de")}. Tippe im Reader auf einen Vers, um ihn hier wiederzufinden.`}
            />
          )}
        </View>
      )}
    </Shell>
  );
}
function Empty({ text }: { text: string }) {
  const t = useTheme();
  return (
    <Card style={{ alignItems: "center", padding: 35, gap: 15 }}>
      <Icon name="leaf" color={t.gold} size={27} />
      <T
        style={{
          fontSize: 13,
          color: t.muted,
          textAlign: "center",
          maxWidth: 400,
        }}
      >
        {text}
      </T>
    </Card>
  );
}
