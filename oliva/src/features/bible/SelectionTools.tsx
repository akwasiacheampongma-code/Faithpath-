import { verseKeyOf, chapterKeyOf, sameBibleChapter } from "./reference-key";
import { useEffect, useRef, useState } from "react";
import { Modal, ScrollView, TextInput, View, Pressable } from "react-native";
import { router } from "expo-router";
import { Button, T } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { useApp } from "../../state/store";
import { CaptureInput } from "../personal/CaptureInput";
import { captureSourceForReference } from "../personal/capture-model";
import { selectedBibleLabel } from "./selection";
import { referenceLabel, type Reference } from "./repository";
import { focusReaderControl } from "./flow/focus";

export type SelectionPanel = "note" | "more" | "copy";
/** Only the explicitly requested editor or extra options open a sheet. */
export function SelectionTools({
  visible,
  panel,
  reference,
  logicalReference,
  selected,
  copyText,
  onClose,
  onDismiss,
  onFocusChange,
}: {
  visible: boolean;
  panel: SelectionPanel;
  reference: Reference | null;
  logicalReference: Reference;
  selected: readonly number[];
  copyText: string | null;
  onClose: () => void;
  onDismiss?: () => void;
  onFocusChange: (focused: boolean) => void;
}) {
  const t = useTheme(),
    data = useApp((s) => s.data),
    busy = useApp((s) => s.busy);
  const [message, setMessage] = useState<string | null>(null);
  const close = useRef<React.ComponentRef<typeof Pressable>>(null);
  const generation = useRef(0);
  const sourceKey = `${chapterKeyOf(logicalReference)}:${selected.join(",")}`;
  useEffect(() => {
    generation.current++;
    setMessage(null);
    return () => {
      generation.current++;
    };
  }, [visible, panel, sourceKey]);
  const keys = selected.map(
    (n) => verseKeyOf(logicalReference, n),
  );
  const allBookmarked =
    keys.length > 0 && keys.every((key) => data.bookmarks.includes(key));
  function leave() {
    generation.current++;
    onFocusChange(false);
    onClose();
  }
  const title =
    panel === "note"
      ? "Deine Notiz"
      : panel === "copy"
        ? "Text manuell kopieren"
        : "Weitere Versaktionen";
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={leave}
      onDismiss={onDismiss}
      onShow={() => {
        setMessage(null);
        if (panel !== "note")
          requestAnimationFrame(() => focusReaderControl(close.current));
      }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          alignItems: "center",
          padding: 16,
          backgroundColor: "rgba(0,0,0,0.32)",
        }}
      >
        <View
          role="dialog"
          accessibilityLabel={title}
          accessibilityViewIsModal
          style={{
            maxHeight: "88%",
            width: "100%",
            maxWidth: 660,
            backgroundColor: t.bg,
            borderRadius: 24,
            padding: 20,
          }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ gap: 16 }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <T
                variant="heading"
                accessibilityRole="header"
                style={{ flex: 1 }}
              >
                {title}
              </T>
              <Button
                buttonRef={close}
                kind="ghost"
                icon="close"
                onPress={leave}
              >
                Schließen
              </Button>
            </View>
            {visible && selected.length > 0 && (
              <T variant="small" style={{ color: t.muted }}>
                {selectedBibleLabel(logicalReference, selected)}
              </T>
            )}
            {visible && panel === "note" && reference && (
              <CaptureInput
                key={`${chapterKeyOf(reference)}:${reference.from}:${reference.to}`}
                source={captureSourceForReference(reference)}
                autoFocus
                label={
                  reference.from === reference.to
                    ? `Notiz zu Vers ${reference.from}`
                    : "Deine Notiz zu dieser Auswahl"
                }
                onFocusChange={onFocusChange}
              />
            )}
            {visible && panel === "more" && (
              <>
                <Button
                  kind="secondary"
                  icon="bookmark"
                  disabled={busy}
                  onPress={() => {
                    const turn = generation.current;
                    void useApp
                      .getState()
                      .setSelectionBookmarked(
                        logicalReference,
                        selected,
                        !allBookmarked,
                      )
                      .then((ok) => {
                        if (turn === generation.current)
                          setMessage(
                            ok
                              ? allBookmarked
                                ? "Aus der Merkliste entfernt."
                                : "Auswahl gemerkt."
                              : (useApp.getState().error ??
                                  "Nicht gespeichert. Bitte erneut versuchen."),
                          );
                      });
                  }}
                >
                  {allBookmarked ? "Nicht mehr merken" : "Merken"}
                </Button>
                <Button
                  kind="secondary"
                  icon="leaf"
                  disabled={busy || !reference}
                  onPress={() => {
                    if (!reference) return;
                    const requested = { ...reference };
                    leave();
                    router.push({
                      pathname: "/vorhaben",
                      params: { start: "1", ...requested },
                    });
                  }}
                >
                  Mit einem Vorhaben verbinden
                </Button>
                {!reference && (
                  <T variant="small" style={{ color: t.muted }}>
                    Für ein gemeinsames Vorhaben benachbarte Verse wählen.
                  </T>
                )}
                {reference &&
                  data.notes
                    .filter(
                      (note) =>
                        note.ref && sameBibleChapter(note.ref, reference) &&
                        (note.ref.from ?? 1) <= reference.to! &&
                        (note.ref.to ?? Number.MAX_SAFE_INTEGER) >=
                          reference.from!,
                    )
                    .map((note) => (
                      <View
                        key={note.id}
                        style={{
                          borderTopWidth: 1,
                          borderColor: t.line,
                          paddingTop: 12,
                          gap: 8,
                        }}
                      >
                        <T variant="small" style={{ color: t.muted }}>
                          {note.ref ? referenceLabel(note.ref) : "Deine Worte"}
                        </T>
                        <T selectable>{note.text}</T>
                        <Button
                          kind="ghost"
                          icon="pen"
                          onPress={() => {
                            leave();
                            router.push({
                              pathname: "/sammlung",
                              params: { note: note.id },
                            });
                          }}
                        >
                          Eintrag bearbeiten
                        </Button>
                      </View>
                    ))}
              </>
            )}
            {visible && panel === "copy" && copyText !== null && (
              <>
                <T accessibilityRole="alert" variant="small">
                  Automatisches Kopieren ist hier nicht verfügbar. Markiere den
                  Text im Feld und wähle „Kopieren“.
                </T>
                <TextInput
                  accessibilityLabel="Bibeltext zum manuellen Kopieren"
                  value={copyText}
                  readOnly
                  multiline
                  selectTextOnFocus
                  onFocus={() => onFocusChange(true)}
                  onBlur={() => onFocusChange(false)}
                  style={{
                    minHeight: 180,
                    maxHeight: 320,
                    borderWidth: 1,
                    borderColor: t.line,
                    borderRadius: 12,
                    padding: 12,
                    color: t.text,
                    backgroundColor: t.surface,
                    fontFamily: "DMSans",
                    fontSize: 14,
                    lineHeight: 22,
                    textAlignVertical: "top",
                  }}
                />
              </>
            )}
            {message && <T accessibilityLiveRegion="polite">{message}</T>}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
