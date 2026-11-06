import * as Picker from "expo-document-picker";
import { MAX_SOURCE_BYTES } from "../features/imports/schema";
export async function pickBackup(
  limit = MAX_SOURCE_BYTES,
): Promise<string | null> {
  const result = await Picker.getDocumentAsync({
    type: "*/*",
    multiple: false,
    base64: false,
  });
  if (result.canceled) return null;
  const file = result.assets[0]?.file;
  if (!file) throw new Error("Die Datei konnte nicht geöffnet werden.");
  if (file.size > limit) throw new Error("Die ausgewählte Datei ist zu groß.");
  return await file.text();
}
