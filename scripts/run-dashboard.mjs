import { randomBytes } from "node:crypto"
import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("../", import.meta.url))
const command = process.argv[2] === "start" ? "start" : "dev"
const child = spawn("npm", ["--prefix", "projects/market-dashboard", "run", command, "--", "-H", "127.0.0.1"], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, LOCAL_WATCHLIST_SESSION: randomBytes(32).toString("hex") },
})

for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal))
child.on("exit", (code, signal) => process.exit(signal ? 1 : (code ?? 1)))

