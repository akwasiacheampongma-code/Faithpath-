import { useEffect, useRef, useState } from "react";
import { Modal, ScrollView, View, Pressable } from "react-native";
import { router } from "expo-router";
import { Button, Card, T } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { useApp } from "../../state/store";
import { CaptureInput } from "../personal/CaptureInput";
import { captureSourceForReference } from "../personal/capture-model";
import { getPassage, referenceLabel, type Reference } from "./repository";
import { highlightBackground, type HighlightColor } from "./highlights";
import { focusReaderControl } from "./flow/focus";
import { CopyPassage } from "./clipboard/CopyPassage";

const colors: { value: HighlightColor; label: string }[] = [
  { value: "olive", label: "Oliv" }, { value: "gold", label: "Gold" },
  { value: "sand", label: "Sand" }, { value: "sage", label: "Salbei" },
  { value: "terra", label: "Terrakotta" },
];

/** Outside the Bible Text tree: selecting never changes or copies a verse. */
export function SelectionTools({ visible, reference, error, onClose, onDismiss, onFocusChange }: {
  visible: boolean;
  reference: Reference | null;
  error: string | null;
  onClose: () => void;
  onDismiss?: () => void;
  onFocusChange: (focused: boolean) => void;
}) {
  const t = useTheme(), data = useApp((s) => s.data), busy = useApp((s) => s.busy);
  const [message, setMessage] = useState<string | null>(null);
  const close = useRef<React.ComponentRef<typeof Pressable>>(null);
  const generation = useRef(0);
  const sourceKey = reference ? `${reference.book}:${reference.chapter}:${reference.from}:${reference.to}` : "";
  useEffect(() => { generation.current++; setMessage(null); return () => { generation.current++; }; }, [visible, sourceKey]);
  const keys = reference ? getPassage(reference).map((verse) => `${reference.book}:${reference.chapter}:${verse.n}`) : [];
  const allBookmarked = keys.length > 0 && keys.every((key) => data.bookmarks.includes(key));
  async function mark(color: HighlightColor | null) {
    if (!reference || busy) return;
    const turn = generation.current;
    const ok = await useApp.getState().setPassageHighlight(reference, color);
    if (generation.current !== turn) return;
    setMessage(ok ? (color ? "Die ausgewählten Verse sind markiert." : "Die Markierungen sind entfernt.") : useApp.getState().error ?? "Die Änderung wurde nicht gespeichert.");
  }
  function leave() { generation.current++; onFocusChange(false); onClose(); }
  return <Modal visible={visible} transparent animationType="none" onRequestClose={leave} onDismiss={onDismiss}
    onShow={() => { setMessage(null); requestAnimationFrame(() => focusReaderControl(close.current)); }}>
    <View style={{ flex: 1, justifyContent: "flex-end", alignItems: "center", padding: 16, backgroundColor: "rgba(0,0,0,0.32)" }}>
      <View role="dialog" accessibilityLabel="Auswahl verwenden" accessibilityViewIsModal
        style={{ maxHeight: "90%", width: "100%", maxWidth: 720, backgroundColor: t.bg, borderRadius: 24, padding: 20 }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 18 }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <T variant="heading" accessibilityRole="header">Deine Auswahl</T>
            <Button buttonRef={close} kind="ghost" icon="close" onPress={leave}>Auswahlwerkzeuge schließen</Button>
          </View>
          {error || !reference ? <T accessibilityRole="alert">{error ?? "Wähle zuerst einen oder mehrere Verse aus."}</T> : <>
            <T variant="label" style={{ color: t.muted }}>{referenceLabel(reference)}</T>
            <T variant="small" style={{ color: t.muted }}>Markierungen und Notizen gelten genau für diese Verse. Dein Lesefortschritt bleibt unverändert.</T>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {colors.map((color) => <Button key={color.value} kind="secondary" icon={null} disabled={busy}
                style={{ backgroundColor: highlightBackground(color.value, t.dark) }} onPress={() => void mark(color.value)}>
                {color.label} markieren
              </Button>)}
              <Button kind="ghost" icon="close" disabled={busy} onPress={() => void mark(null)}>Markierungen entfernen</Button>
            </View>
            <Button kind="secondary" icon="bookmark" disabled={busy} onPress={() => {
              const turn = generation.current;
              void useApp.getState().setPassageBookmarked(reference, !allBookmarked).then((ok) => {
                if (turn === generation.current) setMessage(ok ? (allBookmarked ? "Aus der Merkliste entfernt." : "Alle ausgewählten Verse sind gemerkt.") : useApp.getState().error ?? "Die Änderung wurde nicht gespeichert.");
              });
            }}>{allBookmarked ? "Ausgewählte Verse nicht mehr merken" : "Ausgewählte Verse merken"}</Button>
            <CopyPassage reference={reference} onFocusChange={onFocusChange} />
            <Button kind="secondary" icon="leaf" disabled={busy} onPress={() => {
              const requested = { ...reference }; leave();
              router.push({ pathname: "/vorhaben", params: { start: "1", ...requested } });
            }}>Auswahl mit einem Vorhaben verbinden</Button>
            <Card style={{ padding: 16, gap: 10 }}>
              <T variant="heading">Deine Worte zum Abschnitt</T>
              <CaptureInput key={`${reference.book}:${reference.chapter}:${reference.from}:${reference.to}`}
                source={captureSourceForReference(reference)} label="Deine Notiz zu dieser Auswahl" onFocusChange={onFocusChange} />
            </Card>
          </>}
          {message && <T accessibilityLiveRegion="polite">{message}</T>}
        </ScrollView>
      </View>
    </View>
  </Modal>;
}
