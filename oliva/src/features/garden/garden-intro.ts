import { readDevicePreference, writeDevicePreference } from "../../services/device-preferences";

const key = "oliva.garden-intro.v1";
let introducedThisSession = false;

export async function claimGardenIntro(isVisiting: () => boolean) {
  if (introducedThisSession) return false;
  const saved = await readDevicePreference(key).catch(() => null);
  if (introducedThisSession || !isVisiting()) return false;
  introducedThisSession = true;
  if (saved === "seen") return false;
  void writeDevicePreference(key, "seen").catch(() => {});
  return true;
}
