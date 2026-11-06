import * as SQLite from "expo-sqlite";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";
import {
  decodeData,
  initialData,
  assertStorageBudget,
  type AppData,
} from "../state/model";
import {
  LOCAL_SCHEMA_SQL,
  LOCAL_SCHEMA_VERSION,
  LOCAL_RECOVERY_SQL,
} from "./local-migrations";
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
    return db;
  })());
}
export async function readData(): Promise<AppData> {
  const db = await open();
  const row = await db.getFirstAsync<{ payload: string }>(
    "SELECT payload FROM local_state WHERE id=1",
  );
  if (!row) return initialData();
  try {
    return decodeData(JSON.parse(row.payload));
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
      await tx.runAsync(
        "INSERT INTO local_recovery(id,token,created_at,payload) VALUES('before-faithpath-import',?,?,?) ON CONFLICT(id) DO UPDATE SET token=excluded.token,created_at=excluded.created_at,payload=excluded.payload",
        options.createRecovery.token,
        options.createRecovery.createdAt,
        row?.payload ?? JSON.stringify(initialData()),
      );
    }
    await tx.runAsync(
      "INSERT INTO local_state(id,revision,payload) VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET revision=excluded.revision,payload=excluded.payload",
      next.revision,
      JSON.stringify(next),
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
      data: decodeData(JSON.parse(row.payload)),
    };
  } catch {
    throw new Error(
      "Die lokale Rückkehrsicherung konnte nicht gelesen werden.",
    );
  }
}
