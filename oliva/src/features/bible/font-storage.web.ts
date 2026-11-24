const key = "oliva.reader-font";
export async function readFont() { return localStorage.getItem(key); }
export async function saveFont(font: string) { localStorage.setItem(key, font); }
