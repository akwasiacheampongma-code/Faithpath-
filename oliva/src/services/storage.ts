import * as SQLite from "expo-sqlite";
import { Share } from "react-native";
import { decodeData, initialData, type AppData } from "../state/model";
import { LOCAL_SCHEMA_SQL, LOCAL_SCHEMA_VERSION } from "./local-migrations";
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
): Promise<void> {
  const db = await open();
  await db.withExclusiveTransactionAsync(async (tx) => {
    const row = await tx.getFirstAsync<{ revision: number }>(
      "SELECT revision FROM local_state WHERE id=1",
    );
    if ((row?.revision ?? 0) !== expectedRevision)
      throw new Error(
        "Der Datenstand wurde verändert. Bitte öffne die App neu.",
      );
    await tx.runAsync(
      "INSERT INTO local_state(id,revision,payload) VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET revision=excluded.revision,payload=excluded.payload",
      next.revision,
      JSON.stringify(next),
    );
  });
}
export async function exportData(data: AppData) {
  await Share.share({
    title: "OLIVA-Sicherung",
    message: JSON.stringify(data, null, 2),
  });
}
