import storage from "expo-sqlite/kv-store";

const key = "oliva.reader-font";
export const readFont = () => storage.getItem(key);
export const saveFont = (font: string) => storage.setItem(key, font);
