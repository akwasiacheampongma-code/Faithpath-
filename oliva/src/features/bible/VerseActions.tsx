import { View } from "react-native";
import { router } from "expo-router";
import { Button, Card, T } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { useApp } from "../../state/store";
import { CaptureInput } from "../personal/CaptureInput";
import type { Reference, Verse } from "./repository";

/** Existing single-verse tools, rendered outside any paragraph Text tree. */
export function VerseActions({
  reference,
  verse,
  onClose,
  onFocusChange,
}: {
  reference: Reference;
  verse: Verse;
  onClose?: () => void;
  onFocusChange?: (focused: boolean) => void;
}) {
  const t = useTheme(),
    data = useApp((s) => s.data),
    mutate = useApp((s) => s.mutate),
    busy = useApp((s) => s.busy),
    key = `${reference.book}:${reference.chapter}:${verse.n}`,
    color = data.highlights[key];
  return (
    <Card
      testID={`verse-actions-${verse.n}`}
      style={{ marginVertical: 12, padding: 17, gap: 14 }}
    >
      <T variant="label" accessibilityRole="header" style={{ fontSize: 9 }}>
        DEIN MOMENT MIT VERS {verse.n}
      </T>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Button
          icon="bookmark"
          kind={data.bookmarks.includes(key) ? "primary" : "secondary"}
          disabled={busy}
          onPress={() =>
            void mutate((d) => {
              d.bookmarks = d.bookmarks.includes(key)
                ? d.bookmarks.filter((k) => k !== key)
                : [...d.bookmarks, key];
            })
          }
        >
          {data.bookmarks.includes(key) ? "Gemerkt" : "Merken"}
        </Button>
        <Button
          icon={null}
          kind="secondary"
          disabled={busy}
          onPress={() =>
            void mutate((d) => {
              d.highlights[key] = "olive";
            })
          }
        >
          Oliv markieren
        </Button>
        <Button
          icon={null}
          kind="secondary"
          disabled={busy}
          onPress={() =>
            void mutate((d) => {
              d.highlights[key] = "gold";
            })
          }
        >
          Gold markieren
        </Button>
        {color && (
          <Button
            icon="close"
            kind="ghost"
            disabled={busy}
            onPress={() =>
              void mutate((d) => {
                delete d.highlights[key];
              })
            }
          >
            Markierung entfernen
          </Button>
        )}
      </View>
      <Button
        kind="secondary"
        icon="leaf"
        onPress={() =>
          router.push({
            pathname: "/vorhaben",
            params: {
              start: "1",
              book: reference.book,
              chapter: reference.chapter,
              from: verse.n,
              to: verse.n,
            },
          })
        }
      >
        Mit einem Vorhaben verbinden
      </Button>
      <CaptureInput
        onFocusChange={onFocusChange}
        key={key}
        source={{
          type: "verse",
          ref: {
            book: reference.book,
            chapter: reference.chapter,
            from: verse.n,
            to: verse.n,
          },
        }}
        label={`Notiz zu Vers ${verse.n}`}
        placeholder="Was möchtest du festhalten?"
      />
      {data.notes
        .filter(
          (n) =>
            n.ref?.book === reference.book &&
            n.ref.chapter === reference.chapter &&
            (!n.ref.from || n.ref.from <= verse.n) &&
            (!n.ref.to || n.ref.to >= verse.n),
        )
        .map((n) => (
          <View
            key={n.id}
            style={{
              gap: 9,
              paddingTop: 14,
              borderTopWidth: 1,
              borderColor: t.line,
            }}
          >
            <T variant="label" style={{ fontSize: 9, color: t.muted }}>
              DEINE GESPEICHERTEN WORTE
            </T>
            <T selectable style={{ fontSize: 14 }}>
              {n.text}
            </T>
            <Button
              kind="ghost"
              icon="pen"
              onPress={() =>
                router.push({
                  pathname: "/sammlung",
                  params: { note: n.id },
                })
              }
            >
              Diesen Eintrag in der Sammlung bearbeiten
            </Button>
          </View>
        ))}
      {onClose && (
        <Button kind="ghost" icon="close" onPress={onClose}>
          Versaktionen schließen
        </Button>
      )}
    </Card>
  );
}
