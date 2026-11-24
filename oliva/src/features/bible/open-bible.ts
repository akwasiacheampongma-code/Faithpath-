import catalog from "../../data/open-bible-books.json";

export const OTB_NAME = "Open Translation Bible";
export const OTB_LABEL = "Open Translation Bible · Deutsch";
export const OTB_CREDIT = "Open Translation Bible (OTB), Deutsch · © OpenBible · CC BY-SA 4.0";
export const OTB_LICENCE = "https://creativecommons.org/licenses/by-sa/4.0/";
export const OTB_TERMS = "https://openbible.uk/en-GB/terms-and-conditions/";
export const OTB_SOURCE = "https://github.com/OpenTranslationBible/open-bible/tree/31d411ac1c2d277242a3bd85697f354eaa11526b/lang/de-DE";

export const OTB_BOOKS = catalog;
export const otbBook = (code: string) => OTB_BOOKS.find((book) => book.code === code);
