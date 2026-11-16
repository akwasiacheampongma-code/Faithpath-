/** A fulfilled browser write is the only success signal. */
export async function writeText(text: string): Promise<void> {
  if (
    typeof window === "undefined" ||
    window.isSecureContext !== true ||
    typeof navigator === "undefined" ||
    typeof navigator.clipboard?.writeText !== "function"
  )
    throw new Error("Die Zwischenablage ist hier nicht verfügbar.");
  await navigator.clipboard.writeText(text);
}
