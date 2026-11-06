export const LOCAL_SCHEMA_VERSION = 1;
export const LOCAL_SCHEMA_SQL = `CREATE TABLE IF NOT EXISTS local_state (
 id INTEGER PRIMARY KEY CHECK(id=1),
 revision INTEGER NOT NULL CHECK(revision>=0),
 payload TEXT NOT NULL
);`;
