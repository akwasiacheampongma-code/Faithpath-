import * as SQLite from "expo-sqlite";
import { decodeAccessRecord, type AccessRecord } from "./access-record";

let connection: Promise<SQLite.SQLiteDatabase> | null = null;
const unavailable = () => new Error("Der lokale Passwortschutz konnte nicht geprüft oder gespeichert werden.");

function open() {
  return (connection ??= SQLite.openDatabaseAsync("oliva-access.db").then(async (db) => {
    try {
      await db.execAsync("CREATE TABLE IF NOT EXISTS protection(id INTEGER PRIMARY KEY CHECK (id=1), payload TEXT NOT NULL);");
      return db;
    } catch (error) {
      await db.closeAsync();
      throw error;
    }
  }).catch(() => { connection = null; throw unavailable(); }));
}

async function read(db: SQLite.SQLiteDatabase) {
  const entry = await db.getFirstAsync<{ payload: string }>("SELECT payload FROM protection WHERE id=1");
  if (!entry) return null;
  if (entry.payload.length > 2048) throw unavailable();
  const record = decodeAccessRecord(JSON.parse(entry.payload));
  if (!record) throw unavailable();
  return record;
}

export async function readAccessRecord(): Promise<AccessRecord | null> {
  try { return await read(await open()); }
  catch { throw unavailable(); }
}

export async function writeAccessRecord(expectedId: string | null, next: AccessRecord | null): Promise<boolean> {
  const db = await open();
  let written = false;
  await db.withExclusiveTransactionAsync(async (tx) => {
    const current = await read(tx);
    if ((current?.id ?? null) !== expectedId) return;
    if (next) {
      await tx.runAsync("INSERT INTO protection(id,payload) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload", JSON.stringify(next));
    } else {
      await tx.runAsync("DELETE FROM protection WHERE id=1");
    }
    written = true;
  });
  return written;
}
