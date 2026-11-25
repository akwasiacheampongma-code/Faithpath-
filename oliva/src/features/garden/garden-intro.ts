import { readDevicePreference, writeDevicePreference } from "../../services/device-preferences";

const key = "oliva.garden-intro.v1";
let completeThisSession = false;

export async function isGardenIntroComplete() {
  if (completeThisSession) return true;
  const saved = await readDevicePreference(key).catch(() => null);
  if (saved === "seen") completeThisSession = true;
  return completeThisSession;
}

export async function completeGardenIntro() {
  if (completeThisSession) return;
  completeThisSession = true;
  await writeDevicePreference(key, "seen").catch(() => {});
}
