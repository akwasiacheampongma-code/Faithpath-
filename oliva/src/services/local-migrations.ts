export const LOCAL_SCHEMA_VERSION = 3;
export const LOCAL_SCHEMA_SQL = `CREATE TABLE IF NOT EXISTS local_state (
 id INTEGER PRIMARY KEY CHECK(id=1),
 revision INTEGER NOT NULL CHECK(revision>=0),
 payload TEXT NOT NULL
);`;
export const LOCAL_ARCHIVES_SQL = `CREATE TABLE IF NOT EXISTS local_archives (
 hash TEXT PRIMARY KEY CHECK(length(hash)=64),
 source_text TEXT NOT NULL
);
ALTER TABLE local_recovery ADD COLUMN archive_hashes TEXT NOT NULL DEFAULT '[]';`;
export const LOCAL_RECOVERY_SQL = `CREATE TABLE IF NOT EXISTS local_recovery (
 id TEXT PRIMARY KEY,
 token TEXT NOT NULL,
 created_at TEXT NOT NULL,
 payload TEXT NOT NULL
);`;
