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
    const { imports, ...fields } = initialData(),
      old = { ...fields, version: 2, name: "Ada", revision: 7 };
    harness.db!.exec(LOCAL_SCHEMA_SQL + "PRAGMA user_version=1;");
    harness
      .db!.prepare("INSERT INTO local_state(id,revision,payload) VALUES(1,?,?)")
      .run(7, JSON.stringify(old));
    const storage = await import("../src/services/storage");
    const data = await storage.readData();
    expect(data).toEqual({ ...old, version: 3, imports: [] });
    expect(harness.db!.prepare("PRAGMA user_version").get()?.user_version).toBe(
      2,
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
});
