import { BIBLE_EDITIONS } from "./editions";
import catalog from "../../data/open-bible-books.json";
import { withBookDisplayNames } from "./book-search";

export const OTB_NAME = BIBLE_EDITIONS.otb.name;
export const OTB_LABEL = "Open Translation Bible · Deutsch";
export const OTB_CREDIT = BIBLE_EDITIONS.otb.credit;
export const OTB_LICENCE = BIBLE_EDITIONS.otb.licence;
export const OTB_TERMS = "https://openbible.uk/en-GB/terms-and-conditions/";
export const OTB_SOURCE = BIBLE_EDITIONS.otb.source;

export const OTB_BOOKS = withBookDisplayNames(catalog);
export const otbBook = (code: string) => OTB_BOOKS.find((book) => book.code === code);
export { editionChapterRoute } from "./editions";
