import {
  bookByCode,
  getChapter,
  getPassage,
  referenceLabel,
  validReference,
  type Reference,
} from "./repository";

export const SELECTION_GAP_MESSAGE =
  "Bitte wähle zusammenhängende Verse aus.";

export type SelectionErrorCode =
  | "invalid-reference"
  | "invalid-verse"
  | "duplicate-verse"
  | "non-contiguous";

export class SelectionError extends Error {
  constructor(
    public readonly code: SelectionErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "SelectionError";
  }
}

function checkedReference(reference: Reference): Reference {
  if (
    !reference ||
    !bookByCode(reference.book) ||
    !validReference(reference)
  )
    throw new SelectionError("invalid-reference", "Ungültige Bibelstelle.");

  return {
    book: reference.book,
    chapter: reference.chapter,
    ...(reference.from === undefined ? {} : { from: reference.from }),
    ...(reference.to === undefined ? {} : { to: reference.to }),
  };
}

function checkedSelection(
  reference: Reference,
  selected: readonly number[],
): number[] {
  const numbers = new Set(
    getChapter(reference.book, reference.chapter).map((verse) => verse.n),
  );
  const seen = new Set<number>();
  for (const verse of selected) {
    if (!Number.isInteger(verse) || !numbers.has(verse))
      throw new SelectionError("invalid-verse", "Ungültiger Vers.");
    if (seen.has(verse))
      throw new SelectionError(
        "duplicate-verse",
        "Ein Vers darf nur einmal ausgewählt sein.",
      );
    seen.add(verse);
  }
  return [...selected].sort((a, b) => a - b);
}

/** The complete containing chapter, independent of the logical focus bounds. */
export function displayReference(logicalReference: Reference): Reference {
  const { book, chapter } = checkedReference(logicalReference);
  return { book, chapter };
}

/** Add or remove exactly one verse; a temporary gap remains in the selection. */
export function toggleVerseSelection(
  logicalReference: Reference,
  selected: readonly number[],
  verse: number,
): number[] {
  const reference = checkedReference(logicalReference);
  // Validate the complete operation before returning a replacement array.
  const current = checkedSelection(reference, selected);
  checkedSelection(reference, [verse]);
  return current.includes(verse)
    ? current.filter((n) => n !== verse)
    : [...current, verse].sort((a, b) => a - b);
}

/**
 * Exact range for a range action. Gaps are never filled automatically.
 * With no selection, return a fresh logical reference, matching currentRef().
 * Selection-only interfaces must require a nonempty selection before acting.
 */
export function selectionReference(
  logicalReference: Reference,
  selected: readonly number[],
): Reference {
  const reference = checkedReference(logicalReference);
  const sorted = checkedSelection(reference, selected);
  if (!sorted.length) return reference;
  if (sorted.some((verse, i) => i > 0 && verse !== sorted[i - 1]! + 1))
    throw new SelectionError("non-contiguous", SELECTION_GAP_MESSAGE);
  return {
    book: reference.book,
    chapter: reference.chapter,
    from: sorted[0]!,
    to: sorted[sorted.length - 1]!,
  };
}

/** Verbatim repository text, with LF separators and the original copy footer. */
export function formatBibleCopy(reference: Reference): string {
  const checked = checkedReference(reference);
  const verses = getPassage(checked);
  // The repository accepts one-sided bounds. Spell out their actual range so
  // the copied label always describes exactly the included canonical verses.
  const labelReference =
    checked.from === undefined && checked.to === undefined
      ? checked
      : {
          book: checked.book,
          chapter: checked.chapter,
          from: verses[0]!.n,
          to: verses[verses.length - 1]!.n,
        };
  return [
    referenceLabel(labelReference),
    ...verses.map((verse) => `${verse.n} ${verse.text}`),
    "Lutherbibel 1912",
  ].join("\n");
}
