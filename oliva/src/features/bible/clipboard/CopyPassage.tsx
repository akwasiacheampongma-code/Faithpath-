import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TextInput, View } from "react-native";
import type { Pressable } from "react-native";
import { useFocusEffect } from "expo-router";
import { Button, Card, T } from "../../../components/ui";
import { useTheme } from "../../../design-system/theme";
import { focusReaderControl } from "../flow/focus";
import type { Reference } from "../repository";
import { formatBibleCopy } from "../selection";
import { writeText } from "./writeText";

type CopyPassageProps = {
  reference: Reference;
  onFocusChange?: (focused: boolean) => void;
  label?: string;
};

export function CopyPassage(props: CopyPassageProps) {
  const { book, chapter, from, to } = props.reference;
  // A changed reference owns a separate request generation and fallback text.
  const key = JSON.stringify([book, String(chapter), String(from), String(to)]);
  return <CopySession key={key} {...props} />;
}

function CopySession({
  reference,
  onFocusChange,
  label = "Bibeltext kopieren",
}: CopyPassageProps) {
  const t = useTheme();
  const formatted = useMemo(() => {
    try {
      return { text: formatBibleCopy(reference), error: false };
    } catch {
      return { text: "", error: true };
    }
  }, [reference.book, reference.chapter, reference.from, reference.to]);
  const [working, setWorking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fallback, setFallback] = useState<string | null>(null);
  const trigger = useRef<React.ComponentRef<typeof Pressable>>(null);
  const mounted = useRef(true);
  const focused = useRef(false);
  const generation = useRef(0);
  const focusCallback = useRef(onFocusChange);
  focusCallback.current = onFocusChange;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      generation.current++;
      focusCallback.current?.(false);
    };
  }, []);
  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      setWorking(false);
      return () => {
        focused.current = false;
        generation.current++;
        focusCallback.current?.(false);
      };
    }, []),
  );

  async function copy() {
    if (formatted.error || working || !focused.current) return;
    const request = ++generation.current;
    const text = formatted.text;
    const current = () =>
      mounted.current && focused.current && generation.current === request;
    setWorking(true);
    setCopied(false);
    try {
      await writeText(text);
      if (!current()) return;
      setFallback(null);
      setCopied(true);
    } catch {
      if (!current()) return;
      setFallback(text);
    } finally {
      if (current()) setWorking(false);
    }
  }

  return (
    <View style={{ gap: 10 }}>
      <Button
        buttonRef={trigger}
        kind="secondary"
        icon={null}
        disabled={working || formatted.error}
        onPress={() => void copy()}
      >
        {working ? "Bibeltext wird kopiert …" : label}
      </Button>
      {formatted.error && (
        <T accessibilityRole="alert" variant="small" style={{ color: t.danger }}>
          Diese Bibelstelle kann nicht kopiert werden. Öffne eine gültige Stelle.
        </T>
      )}
      {copied && (
        <T accessibilityLiveRegion="polite" variant="small">
          Bibeltext kopiert.
        </T>
      )}
      {fallback !== null && (
        <Card style={{ gap: 12, padding: 16 }}>
          <T accessibilityRole="alert" variant="small">
            Automatisches Kopieren ist hier nicht verfügbar. Markiere den Text
            im Feld und wähle „Kopieren“.
          </T>
          <T variant="small" style={{ fontWeight: "600" }}>
            Bibeltext zum manuellen Kopieren
          </T>
          <TextInput
            accessibilityLabel="Bibeltext zum manuellen Kopieren"
            value={fallback}
            readOnly
            multiline
            selectTextOnFocus
            onFocus={() => focusCallback.current?.(true)}
            onBlur={() => focusCallback.current?.(false)}
            style={{
              minHeight: 160,
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
          <Button
            kind="ghost"
            icon="close"
            onPress={() => {
              setFallback(null);
              focusCallback.current?.(false);
              focusReaderControl(trigger.current);
            }}
          >
            Kopierfeld schließen
          </Button>
        </Card>
      )}
    </View>
  );
}
