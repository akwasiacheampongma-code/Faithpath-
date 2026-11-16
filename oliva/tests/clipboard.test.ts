import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatBibleCopy } from "../src/features/bible/selection";
import { writeText as writeWebText } from "../src/features/bible/clipboard/writeText.web";
import { writeText as writeNativeText } from "../src/features/bible/clipboard/writeText";

const native = vi.hoisted(() => ({ setStringAsync: vi.fn() }));
vi.mock("expo-clipboard", () => native);

const text = formatBibleCopy({ book: "JHN", chapter: 6, from: 35, to: 36 });

beforeEach(() => {
  vi.clearAllMocks();
});
afterEach(() => vi.unstubAllGlobals());

describe("Web-Zwischenablageadapter ohne Ersatz-API", () => {
  it("übergibt den exakten Kopierstring und erfüllt erst nach angenommenem Schreibversprechen", async () => {
    let accept!: () => void;
    const writeText = vi.fn(() => new Promise<void>((resolve) => { accept = resolve; }));
    vi.stubGlobal("window", { isSecureContext: true });
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    let fulfilled = false;
    const pending = writeWebText(text).then(() => { fulfilled = true; });
    expect(writeText).toHaveBeenCalledWith(text);
    await Promise.resolve();
    expect(fulfilled).toBe(false);
    accept();
    await pending;
    expect(fulfilled).toBe(true);
  });

  it("weist fehlende oder unsichere APIs vor einem Schreibversuch ab", async () => {
    const writeText = vi.fn();
    for (const context of [false, undefined]) {
      vi.stubGlobal("window", { isSecureContext: context });
      vi.stubGlobal("navigator", { clipboard: { writeText } });
      await expect(writeWebText(text)).rejects.toThrow(/nicht verfügbar/);
    }
    vi.stubGlobal("window", { isSecureContext: true });
    for (const navigatorValue of [undefined, {}, { clipboard: {} }]) {
      vi.stubGlobal("navigator", navigatorValue);
      await expect(writeWebText(text)).rejects.toThrow(/nicht verfügbar/);
    }
    vi.stubGlobal("window", undefined);
    await expect(writeWebText(text)).rejects.toThrow(/nicht verfügbar/);
    expect(writeText).not.toHaveBeenCalled();
  });

  it("reicht Ablehnung und synchrone Fehler weiter, ohne Erfolg vorzutäuschen", async () => {
    vi.stubGlobal("window", { isSecureContext: true });
    const rejected = new Error("Verweigert");
    const writeText = vi.fn().mockRejectedValue(rejected);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    await expect(writeWebText(text)).rejects.toBe(rejected);
    writeText.mockImplementation(() => { throw rejected; });
    await expect(writeWebText(text)).rejects.toBe(rejected);
    expect(writeText).toHaveBeenCalledTimes(2);
    expect(writeText).toHaveBeenLastCalledWith(text);
  });
});

describe("Expo-Zwischenablageadapter mit gemocktem Plattformaufruf", () => {
  it("erfüllt ausschließlich nach einem tatsächlich als true aufgelösten APIaufruf", async () => {
    let accept!: (accepted: boolean) => void;
    native.setStringAsync.mockImplementation(() =>
      new Promise<boolean>((resolve) => { accept = resolve; }),
    );
    let fulfilled = false;
    const pending = writeNativeText(text).then(() => { fulfilled = true; });
    expect(native.setStringAsync).toHaveBeenCalledWith(text);
    await Promise.resolve();
    expect(fulfilled).toBe(false);
    accept(true);
    await pending;
    expect(fulfilled).toBe(true);
  });

  it("weist Expo false oder fehlenden Erfolgswert ab", async () => {
    for (const result of [false, undefined]) {
      native.setStringAsync.mockResolvedValue(result);
      await expect(writeNativeText(text)).rejects.toThrow(/nicht.*kopiert/);
    }
  });

  it("reicht native Ablehnungen mit unverändertem Eingabestring weiter", async () => {
    const failure = new Error("Native API fehlt");
    native.setStringAsync.mockRejectedValue(failure);
    await expect(writeNativeText(text)).rejects.toBe(failure);
    expect(native.setStringAsync).toHaveBeenCalledWith(text);
  });
});
