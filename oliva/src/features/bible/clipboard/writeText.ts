import * as Clipboard from "expo-clipboard";

/** Expo can resolve false when the native write was not accepted. */
export async function writeText(text: string): Promise<void> {
  if ((await Clipboard.setStringAsync(text)) !== true)
    throw new Error("Der Text konnte nicht in die Zwischenablage kopiert werden.");
}
