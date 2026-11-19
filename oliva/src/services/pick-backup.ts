import * as Picker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import { MAX_SOURCE_BYTES } from "../features/imports/schema";
async function pick<T>(limit: number, read: (file: File) => Promise<T>): Promise<T | null> {
  const result = await Picker.getDocumentAsync({
    type: "*/*",
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset) throw new Error("Die Datei konnte nicht geöffnet werden.");
  const file = new File(asset.uri);
  try {
    if ((asset.size ?? file.size) > limit)
      throw new Error("Die ausgewählte Datei ist zu groß.");
    return await read(file);
  } finally {
    if (file.uri.startsWith(Paths.cache.uri) && file.exists) file.delete();
  }
}

export function pickBackup(limit = MAX_SOURCE_BYTES) {
  return pick(limit, (file) => file.text());
}

export function pickBackupBytes(limit: number) {
  return pick(limit, async (file) => (await file.bytes()) as Uint8Array<ArrayBuffer>);
}
