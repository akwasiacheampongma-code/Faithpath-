import * as Picker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import { MAX_SOURCE_BYTES } from "../features/imports/schema";
export async function pickBackup(
  limit = MAX_SOURCE_BYTES,
): Promise<string | null> {
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
    return await file.text();
  } finally {
    if (file.uri.startsWith(Paths.cache.uri) && file.exists) file.delete();
  }
}
