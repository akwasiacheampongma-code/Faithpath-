import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
// Isolated CLI cache for restricted workspaces. Does not read an existing login.
const cache = join(tmpdir(), "oliva-expo-cli");
mkdirSync(cache, { recursive: true, mode: 0o700 });
const child = spawn(
  process.execPath,
  ["node_modules/expo/bin/cli", ...process.argv.slice(2)],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      EXPO_NO_TELEMETRY: "1",
      __UNSAFE_EXPO_HOME_DIRECTORY: cache,
    },
  },
);
child.on("exit", (code) => process.exit(code ?? 1));
