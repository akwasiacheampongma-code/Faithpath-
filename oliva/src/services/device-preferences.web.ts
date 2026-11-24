export async function readDevicePreference(key: string) { return localStorage.getItem(key); }
export async function writeDevicePreference(key: string, value: string) { localStorage.setItem(key, value); }
