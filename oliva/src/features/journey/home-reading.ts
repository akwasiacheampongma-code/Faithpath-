import type { AppData } from "../../state/model";
import { sameReadingScope } from "../bible/position";
import { bookByCode, type Reference } from "../bible/repository";

const startChapter: Reference = { book: "MRK", chapter: 4 };
const firstReading: Reference = { ...startChapter, from: 35, to: 41 };

export function homeReading(
  data: Pick<AppData, "reading" | "readingPosition" | "readChapters" | "readPassages">,
) {
  const resume = !!data.readingPosition || data.readChapters.length > 0 ||
    data.readPassages.length > 0 || !sameReadingScope(data.reading, startChapter);
  const reference = resume ? data.reading : firstReading;
  const position = data.readingPosition && sameReadingScope(data.readingPosition.ref, reference)
    ? data.readingPosition : null;
  const testament = bookByCode(reference.book)?.testament === "AT" ? "AT" : "NT";

  return { resume, reference, position, testament } as const;
}
