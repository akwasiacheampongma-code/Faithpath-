/** Shipped V1–V10 path identities and step bounds. Never derive these from
 * the current content registry: adding content must not widen old contracts. */
export const HISTORICAL_PATH_STEPS: Readonly<Record<string, number>> = Object.freeze({
  jesus: 3, anfang: 3, bibel: 3, beten: 3, gnade: 3,
  hoffnung: 3, vergebung: 3, frieden: 3, geschichte: 3,
});
export const isHistoricalPath = (id: string) => Object.hasOwn(HISTORICAL_PATH_STEPS, id);
export function isHistoricalStep(value: string) {
  const [id, number] = value.split(":"), n = Number(number);
  return !!id && isHistoricalPath(id) && Number.isInteger(n) && n >= 0 &&
    n < HISTORICAL_PATH_STEPS[id]! && value === `${id}:${n}`;
}
