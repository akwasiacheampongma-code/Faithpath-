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
  it("zeigt die Einführung bis zum Abschluss und speichert den Abschluss einmal", async () => {
    const { isGardenIntroComplete, completeGardenIntro } = await import("../src/features/garden/garden-intro");
    expect(await isGardenIntroComplete()).toBe(false);
    expect(await isGardenIntroComplete()).toBe(false);
    expect(write).not.toHaveBeenCalled();
    await Promise.all([completeGardenIntro(), completeGardenIntro()]);
    expect(await isGardenIntroComplete()).toBe(true);
    expect(write).toHaveBeenCalledExactlyOnceWith("oliva.garden-intro.v1", "seen");
  });

  it("berücksichtigt nach einem Neustart den vorhandenen Geräteschlüssel", async () => {
    read.mockResolvedValue("seen");
    const { isGardenIntroComplete } = await import("../src/features/garden/garden-intro");
    expect(await isGardenIntroComplete()).toBe(true);
    expect(write).not.toHaveBeenCalled();
  });

  it("merkt sich den Abschluss bei blockiertem Gerätespeicher für die laufende Sitzung", async () => {
    read.mockRejectedValue(new Error("storage blocked"));
    write.mockRejectedValue(new Error("storage blocked"));
    const { isGardenIntroComplete, completeGardenIntro } = await import("../src/features/garden/garden-intro");
    expect(await isGardenIntroComplete()).toBe(false);
    await completeGardenIntro();
    expect(await isGardenIntroComplete()).toBe(true);
  });
});
