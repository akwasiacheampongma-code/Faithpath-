import { Platform } from "react-native";

/** Restore keyboard focus without replacing the reader's canonical scroll. */
export function focusReaderControl(node: unknown) {
  if (Platform.OS === "web" && node instanceof HTMLElement) {
    node.focus({ preventScroll: true });
  } else {
    const control = node as { focus?: () => void } | null;
    control?.focus?.();
  }
}
