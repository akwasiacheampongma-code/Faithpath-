import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { initialData } from "../src/state/model";
import { prepareImport, applyImport } from "../src/features/imports/model";
import { faithpathFixture } from "./fixtures/faithpath-v5";
import { LOCAL_SCHEMA_SQL } from "../src/services/local-migrations";
const harness = vi.hoisted(() => ({
  db: null as DatabaseSync | null,
  failMain: false,
}));
vi.mock("expo-sharing", () => ({}));
vi.mock("expo-file-system", () => ({ File: class {}, Paths: {} }));
vi.mock("expo-sqlite", () => ({
  openDatabaseAsync: vi.fn(async () => {
    const db = harness.db!;
    const adapter = {
      execAsync: async (sql: string) => {
        db.exec(sql);
      },
      getFirstAsync: async (sql: string, ...params: any[]) =>
        db.prepare(sql).get(...params),
      getAllAsync: async (sql: string, ...params: any[]) =>
        db.prepare(sql).all(...params),
      runAsync: async (sql: string, ...params: any[]) => {
        if (harness.failMain && sql.startsWith("INSERT INTO local_state"))
          throw new Error("Simulierter Schreibfehler");
        return db.prepare(sql).run(...params);
      },
      withExclusiveTransactionAsync: async (
        work: (tx: unknown) => Promise<void>,
      ) => {
        db.exec("BEGIN IMMEDIATE");
        try {
          await work(adapter);
          db.exec("COMMIT");
        } catch (error) {
          db.exec("ROLLBACK");
          throw error;
        }
      },
    };
    return adapter;
  }),
}));
beforeEach(() => {
  vi.resetModules();
  harness.db = new DatabaseSync(":memory:");
  harness.failMain = false;
});
afterEach(() => harness.db?.close());
describe("Native SQLite-Adapter mit realer SQL-Engine", () => {
  it("migriert eine physische V1-Datenbank und V2-Nutzdaten verlustfrei", async () => {
    const { imports, readingPosition, retainedReviewGrowth, ...fields } =
        initialData(),
      old = { ...fields, version: 2, name: "Ada", revision: 7 };
    harness.db!.exec(LOCAL_SCHEMA_SQL + "PRAGMA user_version=1;");
    harness
      .db!.prepare("INSERT INTO local_state(id,revision,payload) VALUES(1,?,?)")
      .run(7, JSON.stringify(old));
    const storage = await import("../src/services/storage");
    const data = await storage.readData();
    expect(data).toEqual({
      ...old,
      version: 6,
      retainedReviewGrowth: { reflections: 0, actions: 0 },
      imports: [],
      readingPosition: null,
    });
    expect(harness.db!.prepare("PRAGMA user_version").get()?.user_version).toBe(
      3,
    );
    expect(await storage.readRecovery()).toBeNull();
    data.name = "Ada später";
    data.revision = 8;
    await storage.writeData(data, 7);
    expect((await storage.readData()).name).toBe("Ada später");
  });
  it("schreibt Sicherung und Import atomar, erhält sie bei Fehlern und prüft Revision sowie Rückkehrtoken", async () => {
    const storage = await import("../src/services/storage"),
      before = initialData();
    before.name = "Mein Bestand";
    before.revision = 1;
    await storage.writeData(before, 0);
    const plan = prepareImport(JSON.stringify(faithpathFixture()), before),
      next = structuredClone(before);
    applyImport(next, plan);
    next.revision = 2;
    harness.failMain = true;
    await expect(
      storage.writeData(next, 1, {
        createRecovery: { token: "first", createdAt: plan.receipt.importedAt },
      }),
    ).rejects.toThrow();
    expect(await storage.readRecovery()).toBeNull();
    expect(await storage.readData()).toEqual(before);
    harness.failMain = false;
    await storage.writeData(next, 1, {
      createRecovery: { token: "first", createdAt: plan.receipt.importedAt },
    });
    expect((await storage.readRecovery())?.data).toEqual(before);
    await expect(
      storage.writeData({ ...before, revision: 3 }, 1, {
        consumeRecoveryToken: "first",
      }),
    ).rejects.toThrow(/verändert/);
    expect((await storage.readData()).imports).toHaveLength(1);
    await expect(
      storage.writeData({ ...before, revision: 3 }, 2, {
        consumeRecoveryToken: "wrong",
      }),
    ).rejects.toThrow(/verändert/);
    expect(await storage.readRecovery()).not.toBeNull();
    harness.failMain = true;
    await expect(
      storage.writeData({ ...before, revision: 3 }, 2, {
        consumeRecoveryToken: "first",
      }),
    ).rejects.toThrow();
    expect(await storage.readRecovery()).not.toBeNull();
    harness.failMain = false;
    await storage.writeData({ ...before, revision: 3 }, 2, {
      consumeRecoveryToken: "first",
    });
    expect(await storage.readRecovery()).toBeNull();
    expect((await storage.readData()).name).toBe("Mein Bestand");
  });
  it("schreibt große Quellen einmalig und erhält ausschließlich von der Rückkehrsicherung benötigte Blobs", async () => {
    const storage = await import("../src/services/storage"),
      data = initialData(),
      first = faithpathFixture();
    (first as any).largeOriginal = "NATIVE-ORIGINAL " + "x".repeat(100000);
    const plan = prepareImport(JSON.stringify(first), data);
    applyImport(data, plan);
    data.revision = 1;
    await storage.writeData(data, 0);
    let payload = String(
      harness.db!.prepare("SELECT payload FROM local_state WHERE id=1").get()
        ?.payload,
    );
    expect(payload).not.toContain("NATIVE-ORIGINAL");
    expect(payload.length).toBeLessThan(15000);
    expect(
      harness.db!.prepare("SELECT count(*) AS count FROM local_archives").get()
        ?.count,
    ).toBe(1);
    const sourceBefore = harness
      .db!.prepare("SELECT source_text FROM local_archives")
      .get()?.source_text;
    data.name = "Kleine Änderung";
    data.revision = 2;
    await storage.writeData(data, 1);
    expect(
      harness.db!.prepare("SELECT source_text FROM local_archives").get()
        ?.source_text,
    ).toBe(sourceBefore);
    const second = structuredClone(data);
    first.data.paths[0]!.title = "Veränderte alte Quelle";
    const plan2 = prepareImport(JSON.stringify(first), second);
    applyImport(second, plan2);
    second.revision = 3;
    await storage.writeData(second, 2, {
      createRecovery: {
        token: "keep-first",
        createdAt: new Date().toISOString(),
      },
    });
    const blank = initialData();
    blank.revision = 4;
    await storage.writeData(blank, 3);
    expect(
      harness.db!.prepare("SELECT count(*) AS count FROM local_archives").get()
        ?.count,
    ).toBe(1);
    expect((await storage.readRecovery())?.data.name).toBe("Kleine Änderung");
    blank.revision = 5;
    await storage.writeData(blank, 4, { consumeRecoveryToken: "keep-first" });
    expect(
      harness.db!.prepare("SELECT count(*) AS count FROM local_archives").get()
        ?.count,
    ).toBe(0);
  });
});
