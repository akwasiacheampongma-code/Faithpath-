/** Use the spelling in the Bible text without changing the imported catalogs. */
export function withBookDisplayNames<T extends { code: string; name: string }>(books: T[]) {
  return books.map((book) => book.code === "RUT" ? { ...book, name: "Ruth" } : book);
}

/** Book-name matching only. Full-text Bible search keeps its own semantics. */
export function normalizeBookSearch(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("de")
    .replace(/[\s\p{White_Space}.]/gu, "");
}

export const BIBLE_SCOPES = [
  { value: "Alle", label: "Gesamte Bibel" },
  { value: "NT", label: "Neues Testament (NT)" },
  { value: "AT", label: "Altes Testament (AT)" },
] as const;

export type BibleScope = (typeof BIBLE_SCOPES)[number]["value"];
