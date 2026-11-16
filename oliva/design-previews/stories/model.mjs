export const APP_ORIGIN = "https://oliva-v04-private-preview.purplebean128.chatgpt.site";
export const PREVIEW_IDS = ["NS-0006", "NS-0010", "NS-0052", "NS-0073", "NS-0203", "NS-0235", "NS-0241"];

export function normalizeSearch(value) {
  return String(value).normalize("NFKC").toLocaleLowerCase("de").replace(/[^\p{L}\p{N}]/gu, "");
}
export function filterStories(stories, query = "", testament = "Alle", kind = "Alle") {
  if (!["Alle", "AT", "NT"].includes(testament)) throw new Error("Ungültiger Bibelbereich.");
  const needle = normalizeSearch(query);
  return stories.filter((story) =>
    (testament === "Alle" || story.testament === testament) &&
    (kind === "Alle" || kind === "Bilder" && story.image || kind === "Psalmen" && !story.image) &&
    normalizeSearch(story.title + story.referenceLabel).includes(needle));
}
export function readerURL(reference) {
  if (!reference || !/^[1-3]?[A-Z]{2,3}$/.test(reference.book) || !Number.isInteger(reference.chapter) || reference.chapter < 1)
    throw new Error("Ungültige Bibelstelle.");
  const params = new URLSearchParams({ chapter: String(reference.chapter) });
  for (const bound of ["from", "to"]) {
    if (reference[bound] !== undefined) {
      if (!Number.isInteger(reference[bound]) || reference[bound] < 1) throw new Error("Ungültige Versgrenze.");
      params.set(bound, String(reference[bound]));
    }
  }
  if (reference.from && reference.to && reference.from > reference.to) throw new Error("Ungültiger Bereich.");
  return APP_ORIGIN + "/lesen/" + reference.book + "?" + params;
}
export function feedback(question, choice) {
  if (!Number.isInteger(choice) || choice < 0 || choice >= question.options.length) throw new Error("Wähle eine der Originalantworten.");
  return { correct: choice === question.correctIndex, answer: question.options[question.correctIndex], evidence: question.evidence };
}
export function validateSample(catalog) {
  if (catalog.sourceCommit !== "a519ce898fa33907b07d5ac7a585595127556183" ||
    catalog.targetCatalog.units !== 436 || catalog.targetCatalog.questions !== 2479 || catalog.targetCatalog.reflections !== 436)
    throw new Error("Die Originalquelle stimmt nicht.");
  if (catalog.stories.length !== 7 || catalog.sample.units !== 7 || catalog.sample.questions !== 36 || catalog.sample.reflections !== 7)
    throw new Error("Die Vorschau muss als begrenzte Auswahl erkennbar bleiben.");
  const ids = catalog.stories.map((story) => story.id);
  if (new Set(ids).size !== 7 || PREVIEW_IDS.some((id) => !ids.includes(id))) throw new Error("Ungültige Vorschauauswahl.");
  for (const story of catalog.stories) {
    if (!story.title || !story.reflection || !story.questions.length) throw new Error("Originalinhalt fehlt.");
    story.references.forEach(readerURL);
    for (const q of story.questions) {
      if (q.options.length !== 4 || !Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3)
        throw new Error("Originalfrage ist unvollständig.");
      q.references.forEach(readerURL);
    }
  }
  return catalog;
}
