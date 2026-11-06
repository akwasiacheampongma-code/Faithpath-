export const LOCAL_SCHEMA_VERSION = 2;
export const LOCAL_SCHEMA_SQL = `CREATE TABLE IF NOT EXISTS local_state (
 id INTEGER PRIMARY KEY CHECK(id=1),
 revision INTEGER NOT NULL CHECK(revision>=0),
 payload TEXT NOT NULL
);`;
export const LOCAL_RECOVERY_SQL = `CREATE TABLE IF NOT EXISTS local_recovery (
 id TEXT PRIMARY KEY,
 token TEXT NOT NULL,
 created_at TEXT NOT NULL,
 payload TEXT NOT NULL
);`;
