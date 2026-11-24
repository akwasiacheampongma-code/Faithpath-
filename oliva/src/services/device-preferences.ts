import storage from "expo-sqlite/kv-store";

export const readDevicePreference = (key: string) => storage.getItem(key);
export const writeDevicePreference = (key: string, value: string) => storage.setItem(key, value);
