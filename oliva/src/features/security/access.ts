import { create } from "zustand";
import {
  changeRecordPassword, prepareAccess, rotateAccessId, verifyAppPassword, verifyRecoveryCode,
  type AccessRecord, type IdleMinutes, type PreparedAccess,
} from "./access-record";
import { readAccessRecord, writeAccessRecord } from "./access-storage";
import { checkNewPassword } from "./crypto-contract";

type Phase = "checking" | "open" | "locked" | "unavailable";
type AccessState = { phase: Phase; record: AccessRecord | null; generation: number; busy: boolean };
export const useAccess = create<AccessState>(() => ({ phase: "checking", record: null, generation: 0, busy: false }));
export type PendingAccess = PreparedAccess & { expectedId: string | null; generation: number };

const get = useAccess.getState;
const changed = () => new Error("Der Passwortschutz hat sich geändert. Öffne die aktuelle Ansicht erneut.");
let lastActivity = 0;
let expiryTimer: ReturnType<typeof setTimeout> | undefined;
let channel: BroadcastChannel | undefined;
const activitySignalKey = "oliva-access-update-v1";

function show(phase: Phase, record: AccessRecord | null) {
  useAccess.setState((state) => ({ phase, record, generation: state.generation + 1 }));
  lastActivity = Date.now();
  scheduleExpiry();
}

export function lockThisWindow() {
  const current = get();
  if (current.phase === "open" && current.record) show("locked", current.record);
}

export function checkAccessDeadline() {
  const state = get();
  if (state.phase !== "open" || !state.record) return;
  const elapsed = Date.now() - lastActivity;
  if (elapsed < 0 || elapsed >= state.record.idleMinutes * 60_000) lockThisWindow();
}

function scheduleExpiry() {
  clearTimeout(expiryTimer);
  const current = get();
  if (current.phase === "open" && current.record) {
    expiryTimer = setTimeout(() => { checkAccessDeadline(); scheduleExpiry(); },
      Math.max(1, current.record.idleMinutes * 60_000 - (Date.now() - lastActivity)));
  }
}

export function noteAccessActivity() {
  checkAccessDeadline();
  const current = get();
  if (current.phase === "open" && current.record) {
    lastActivity = Date.now();
    scheduleExpiry();
  }
}

export function captureAccess() {
  checkAccessDeadline();
  const session = get();
  return () => {
    checkAccessDeadline();
    const current = get();
    return session.phase === "open" && current.phase === "open" && session.generation === current.generation;
  };
}

export async function synchronizeAccess() {
  const previous = get();
  try {
    const saved = await readAccessRecord();
    if (previous.generation !== get().generation) return;
    if (previous.phase === "checking" || previous.phase === "unavailable" || saved?.id !== previous.record?.id)
      show(saved ? "locked" : "open", saved);
  } catch {
    if (previous.generation === get().generation) show("unavailable", null);
  }
}

function signalOtherWindows() {
  try { channel?.postMessage(null); } catch { /* Focus and reconciliation also check the record. */ }
  if (typeof document !== "undefined") {
    try { localStorage.setItem(activitySignalKey, String(Date.now())); }
    catch { /* BroadcastChannel and reconciliation remain available. */ }
  }
}

export function observeWebAccess() {
  scheduleExpiry();
  if (typeof document === "undefined") return () => clearTimeout(expiryTimer);
  const sync = () => { checkAccessDeadline(); void synchronizeAccess(); };
  const storage = (event: StorageEvent) => { if (event.key === activitySignalKey) sync(); };
  const resume = () => { if (document.visibilityState === "visible") sync(); };
  const restored = (event: PageTransitionEvent) => { if (event.persisted) lockThisWindow(); sync(); };
  const hide = () => {
    if (get().record) document.documentElement.dataset.olivaAccessSuspended = "true";
    lockThisWindow();
  };
  try {
    channel = new BroadcastChannel("oliva.access.v1");
    channel.onmessage = sync;
  } catch { /* Storage events and periodic reconciliation also cover this window. */ }
  window.addEventListener("storage", storage);
  window.addEventListener("focus", sync);
  window.addEventListener("pagehide", hide);
  window.addEventListener("pageshow", restored);
  document.addEventListener("visibilitychange", resume);
  const activityEvents = ["pointerdown", "keydown", "input", "wheel", "touchstart"];
  for (const event of activityEvents) window.addEventListener(event, noteAccessActivity, { capture: true, passive: true });
  const reconciliation = setInterval(resume, 5000);
  return () => {
    channel?.close();
    channel = undefined;
    window.removeEventListener("storage", storage);
    window.removeEventListener("focus", sync);
    window.removeEventListener("pagehide", hide);
    window.removeEventListener("pageshow", restored);
    document.removeEventListener("visibilitychange", resume);
    for (const event of activityEvents) window.removeEventListener(event, noteAccessActivity, true);
    clearInterval(reconciliation);
    clearTimeout(expiryTimer);
  };
}

async function operation<T>(work: (session: AccessState) => Promise<T>): Promise<T> {
  checkAccessDeadline();
  const session = get();
  if (session.busy) throw new Error("Der Passwortschutz wird gerade geprüft.");
  useAccess.setState({ busy: true });
  try { return await work(session); }
  finally { useAccess.setState({ busy: false }); }
}

async function commit(generation: number, expected: string | null, next: AccessRecord | null, phase: Phase) {
  checkAccessDeadline();
  if (get().generation !== generation) throw changed();
  if (!await writeAccessRecord(expected, next)) {
    await synchronizeAccess();
    throw changed();
  }
  if (get().generation === generation) show(phase, next);
  else await synchronizeAccess();
  signalOtherWindows();
}

export function unlockApp(password: string) {
  return operation(async (session) => {
    if (session.phase !== "locked" || !session.record) throw changed();
    if (!await verifyAppPassword(session.record, password)) throw new Error("Das App-Passwort stimmt nicht.");
    const current = await readAccessRecord();
    if (get().generation !== session.generation || current?.id !== session.record.id) {
      await synchronizeAccess();
      throw changed();
    }
    show("open", current);
  });
}

export function prepareAppProtection(password: string, confirmation: string, recovery?: string) {
  return operation(async (session): Promise<PendingAccess> => {
    checkNewPassword(password, confirmation);
    if (recovery !== undefined) {
      if (session.phase !== "locked" || !session.record) throw changed();
      if (!verifyRecoveryCode(session.record, recovery)) throw new Error("Der Wiederherstellungscode stimmt nicht.");
    } else if (session.phase !== "open" || session.record) throw changed();
    const prepared = await prepareAccess(password, session.record?.idleMinutes);
    if (get().generation !== session.generation) throw changed();
    return { ...prepared, generation: session.generation, expectedId: session.record?.id ?? null };
  });
}

export function confirmAppProtection(pending: PendingAccess, confirmation: string) {
  return operation(async () => {
    if (!verifyRecoveryCode(pending.record, confirmation)) throw new Error("Bestätige den angezeigten Wiederherstellungscode.");
    await commit(pending.generation, pending.expectedId, pending.record, "open");
  });
}

export function changeAppPassword(currentPassword: string, password: string, confirmation: string) {
  return operation(async ({ phase, record, generation }) => {
    if (phase !== "open" || !record) throw changed();
    checkNewPassword(password, confirmation);
    if (!await verifyAppPassword(record, currentPassword)) throw new Error("Das bisherige App-Passwort stimmt nicht.");
    await commit(generation, record.id, await changeRecordPassword(record, password), "open");
  });
}

export function disableAppProtection(password: string) {
  return operation(async ({ phase, record, generation }) => {
    if (phase !== "open" || !record) throw changed();
    if (!await verifyAppPassword(record, password)) throw new Error("Das App-Passwort stimmt nicht.");
    await commit(generation, record.id, null, "open");
  });
}

export function setAppTimeout(idleMinutes: IdleMinutes) {
  return operation(async ({ phase, record, generation }) => {
    if (phase !== "open" || !record) throw changed();
    if (idleMinutes !== record.idleMinutes)
      await commit(generation, record.id, await rotateAccessId(record, idleMinutes), "open");
  });
}

export function lockAllWindows() {
  return operation(async ({ phase, record }) => {
    if (phase !== "open" || !record) return;
    lockThisWindow();
    await commit(get().generation, record.id, await rotateAccessId(record), "locked");
  });
}
