import { beforeEach, describe, expect, it, vi } from "vitest";

const { read, write } = vi.hoisted(() => ({ read: vi.fn(), write: vi.fn() }));

vi.mock("../src/services/device-preferences", () => ({
  readDevicePreference: read,
  writeDevicePreference: write,
}));

beforeEach(() => {
  vi.resetModules();
  read.mockReset().mockResolvedValue(null);
  write.mockReset().mockResolvedValue(undefined);
});

describe("Garteneinführung", () => {
  it("erscheint beim ersten Besuch genau einmal und merkt sich den Aufruf", async () => {
    const { claimGardenIntro } = await import("../src/features/garden/garden-intro");
    const results = await Promise.all([claimGardenIntro(() => true), claimGardenIntro(() => true)]);
    expect(results).toEqual([true, false]);
    expect(write).toHaveBeenCalledExactlyOnceWith("oliva.garden-intro.v1", "seen");
  });

  it("bleibt nach einem Neustart ausgeblendet, wenn sie bereits erschienen ist", async () => {
    read.mockResolvedValue("seen");
    const { claimGardenIntro } = await import("../src/features/garden/garden-intro");
    expect(await claimGardenIntro(() => true)).toBe(false);
    expect(write).not.toHaveBeenCalled();
  });

  it("merkt keinen Besuch, der vor der Anzeige verlassen wurde", async () => {
    const { claimGardenIntro } = await import("../src/features/garden/garden-intro");
    expect(await claimGardenIntro(() => false)).toBe(false);
    expect(write).not.toHaveBeenCalled();
    expect(await claimGardenIntro(() => true)).toBe(true);
  });

  it("zeigt die Einführung bei blockiertem Gerätespeicher einmal in der laufenden Sitzung", async () => {
    read.mockRejectedValue(new Error("storage blocked"));
    write.mockRejectedValue(new Error("storage blocked"));
    const { claimGardenIntro } = await import("../src/features/garden/garden-intro");
    expect(await claimGardenIntro(() => true)).toBe(true);
    expect(await claimGardenIntro(() => true)).toBe(false);
  });
});
