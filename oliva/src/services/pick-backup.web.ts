import * as Picker from "expo-document-picker";
import { MAX_SOURCE_BYTES } from "../features/imports/schema";
async function pick<T>(limit: number, read: (file: File) => Promise<T>): Promise<T | null> {
  const result = await Picker.getDocumentAsync({
    type: "*/*",
    multiple: false,
    base64: false,
  });
  if (result.canceled) return null;
  const file = result.assets[0]?.file;
  if (!file) throw new Error("Die Datei konnte nicht geöffnet werden.");
  if (file.size > limit) throw new Error("Die ausgewählte Datei ist zu groß.");
  return read(file);
}

export function pickBackup(limit = MAX_SOURCE_BYTES) {
  return pick(limit, (file) => file.text());
}

export function pickBackupBytes(limit: number) {
  return pick(limit, async (file) => new Uint8Array(await file.arrayBuffer()));
}
