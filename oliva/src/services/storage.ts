import * as SQLite from "expo-sqlite";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";
import { initialData, assertStorageBudget, type AppData } from "../state/model";
import {
  LOCAL_SCHEMA_SQL,
  LOCAL_SCHEMA_VERSION,
  LOCAL_RECOVERY_SQL,
  LOCAL_ARCHIVES_SQL,
} from "./local-migrations";
import {
  forStorage,
  decodeStored,
  archiveHashes,
  checkedHashes,
} from "./documents";
import type { RecoveryCopy, WriteOptions } from "../features/imports/schema";
let connection: Promise<SQLite.SQLiteDatabase> | null = null;
async function open() {
  return (connection ??= (async () => {
    const db = await SQLite.openDatabaseAsync("oliva.db");
    await db.execAsync("PRAGMA journal_mode=WAL;");
    const version = await db.getFirstAsync<{ user_version: number }>(
      "PRAGMA user_version",
    );
    if ((version?.user_version ?? 0) > LOCAL_SCHEMA_VERSION)
      throw new Error(
        "Diese Datenbank stammt aus einer neueren OLIVA-Version. Bitte aktualisiere die App.",
      );
    if ((version?.user_version ?? 0) < 1)
      await db.withExclusiveTransactionAsync(async (tx) => {
        await tx.execAsync(LOCAL_SCHEMA_SQL);
        await tx.execAsync("PRAGMA user_version=1;");
      });
    if ((version?.user_version ?? 0) < 2)
      await db.withExclusiveTransactionAsync(async (tx) => {
        await tx.execAsync(LOCAL_RECOVERY_SQL);
        await tx.execAsync("PRAGMA user_version=2;");
      });
    if ((version?.user_version ?? 0) < 3)
      await db.withExclusiveTransactionAsync(async (tx) => {
        await tx.execAsync(LOCAL_ARCHIVES_SQL);
        await tx.execAsync("PRAGMA user_version=3;");
      });
    return db;
  })().catch((error) => {
    connection = null;
    throw error;
  }));
}
export async function readData(): Promise<AppData> {
  const db = await open();
  const row = await db.getFirstAsync<{ payload: string }>(
    "SELECT payload FROM local_state WHERE id=1",
  );
  if (!row) return initialData();
  try {
    return await decodeStored(JSON.parse(row.payload), async (hash) => {
      const source = await db.getFirstAsync<{ source_text: string }>(
        "SELECT source_text FROM local_archives WHERE hash=?",
        hash,
      );
      if (!source) throw new Error("Eine Originalquelle fehlt.");
      return source.source_text;
    });
  } catch {
    throw new Error(
      "Die lokalen Daten konnten nicht gelesen werden. Bitte sichere sie vor dem Zurücksetzen.",
    );
  }
}
export async function writeData(
  next: AppData,
  expectedRevision: number,
  options: WriteOptions = {},
): Promise<void> {
  assertStorageBudget(next);
  const db = await open();
  await db.withExclusiveTransactionAsync(async (tx) => {
    const row = await tx.getFirstAsync<{ revision: number; payload: string }>(
      "SELECT revision,payload FROM local_state WHERE id=1",
    );
    if ((row?.revision ?? 0) !== expectedRevision)
      throw new Error(
        "Der Datenstand wurde verändert. Bitte öffne die App neu.",
      );
    const current = row ? JSON.parse(row.payload) : undefined;
    let recoveryHashes: string[] = [];
    if (options.consumeRecoveryToken) {
      const recovery = await tx.getFirstAsync<{ token: string }>(
        "SELECT token FROM local_recovery WHERE id='before-faithpath-import'",
      );
      if (recovery?.token !== options.consumeRecoveryToken)
        throw new Error(
          "Die Rückkehrsicherung wurde inzwischen verändert. Bitte prüfe sie erneut.",
        );
      await tx.runAsync(
        "DELETE FROM local_recovery WHERE id='before-faithpath-import'",
      );
    } else if (options.createRecovery) {
      recoveryHashes = archiveHashes(current);
      await tx.runAsync(
        "INSERT INTO local_recovery(id,token,created_at,payload,archive_hashes) VALUES('before-faithpath-import',?,?,?,?) ON CONFLICT(id) DO UPDATE SET token=excluded.token,created_at=excluded.created_at,payload=excluded.payload,archive_hashes=excluded.archive_hashes",
        options.createRecovery.token,
        options.createRecovery.createdAt,
        row?.payload ?? JSON.stringify(initialData()),
        JSON.stringify(recoveryHashes),
      );
    } else {
      const recovery = await tx.getFirstAsync<{ archive_hashes: string }>(
        "SELECT archive_hashes FROM local_recovery WHERE id='before-faithpath-import'",
      );
      recoveryHashes = recovery
        ? checkedHashes(JSON.parse(recovery.archive_hashes))
        : [];
    }
    const existing = await tx.getAllAsync<{ hash: string }>(
        "SELECT hash FROM local_archives",
      ),
      hashes = new Set(existing.map((r) => r.hash));
    for (const receipt of next.imports)
      if (!hashes.has(receipt.sourceHash)) {
        await tx.runAsync(
          "INSERT INTO local_archives(hash,source_text) VALUES(?,?)",
          receipt.sourceHash,
          receipt.sourceText,
        );
        hashes.add(receipt.sourceHash);
      }
    const keep = new Set([
      ...recoveryHashes,
      ...next.imports.map((r) => r.sourceHash),
    ]);
    for (const hash of hashes)
      if (!keep.has(hash))
        await tx.runAsync("DELETE FROM local_archives WHERE hash=?", hash);
    await tx.runAsync(
      "INSERT INTO local_state(id,revision,payload) VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET revision=excluded.revision,payload=excluded.payload",
      next.revision,
      JSON.stringify(forStorage(next)),
    );
  });
}
export async function exportData(data: AppData) {
  return exportText(
    JSON.stringify(data, null, 2),
    `oliva-sicherung-${Date.now()}.json`,
  );
}
export async function exportText(text: string, filename: string) {
  if (!(await Sharing.isAvailableAsync()))
    throw new Error("Auf diesem Gerät ist keine Dateifreigabe verfügbar.");
  const file = new File(Paths.cache, filename.replace(/[^a-zA-Z0-9._-]/g, "_"));
  try {
    file.create({ overwrite: true });
    file.write(text);
    await Sharing.shareAsync(file.uri, {
      mimeType: "application/json",
      UTI: "public.json",
      dialogTitle: "Persönliche Sicherung speichern",
    });
  } finally {
    if (file.exists) file.delete();
  }
}
export async function exportRawData() {
  if (!(await Sharing.isAvailableAsync()))
    throw new Error("Auf diesem Gerät ist keine Dateifreigabe verfügbar.");
  const db = await SQLite.openDatabaseAsync("oliva.db", {
      useNewConnection: true,
    }),
    file = new File(
      Paths.cache,
      `oliva-reparatursicherung-${Date.now()}.sqlite`,
    );
  try {
    file.create({ overwrite: true });
    file.write(await db.serializeAsync());
    await Sharing.shareAsync(file.uri, {
      mimeType: "application/vnd.sqlite3",
      UTI: "public.database",
      dialogTitle: "Unveränderten Speicher sichern",
    });
  } finally {
    if (file.exists) file.delete();
    await db.closeAsync();
  }
}
export async function readRecovery(): Promise<RecoveryCopy | null> {
  const db = await open(),
    row = await db.getFirstAsync<{
      token: string;
      created_at: string;
      payload: string;
    }>(
      "SELECT token,created_at,payload FROM local_recovery WHERE id='before-faithpath-import'",
    );
  if (!row) return null;
  try {
    return {
      token: row.token,
      createdAt: row.created_at,
      data: await decodeStored(JSON.parse(row.payload), async (hash) => {
        const source = await db.getFirstAsync<{ source_text: string }>(
          "SELECT source_text FROM local_archives WHERE hash=?",
          hash,
        );
        if (!source) throw new Error("Eine Originalquelle fehlt.");
        return source.source_text;
      }),
    };
  } catch {
    throw new Error(
      "Die lokale Rückkehrsicherung konnte nicht gelesen werden.",
    );
  }
}
