// Pre-dev hook. Rewrites the API base URL in `.env.local` to point at
// this machine's current LAN IPv4, so phones / tablets / other laptops
// on the same Wi-Fi can hit `https://<lan-ip>:3000` and have the app
// resolve its API to the same host instead of `localhost` (which means
// nothing once you leave this machine).
//
// Pallio's frontend currently runs on dummy data, so this file is
// front-running the day a real backend lands. The variable name
// matches what `axios.instances.ts` / the future API client will read:
//   - VITE_API_BASE_URL
//
// To regenerate / rotate the mkcert HTTPS certs:
//   mkcert localhost 127.0.0.1 ::1 <your-lan-ip>
//   mv localhost+3.pem      localhost.pem
//   mv localhost+3-key.pem  localhost-key.pem

import fs from "fs"
import { execSync } from "child_process"

// 1. Resolve the current active LAN IPv4. `ifconfig` order varies by
//    machine; we look for the first non-loopback interface that has
//    the classic "netmask … broadcast …" format the en0 (Wi-Fi)
//    interface always carries on Apple Silicon.
const output = execSync("ifconfig").toString()
const match = output.match(/inet (\d+\.\d+\.\d+\.\d+) netmask .* broadcast .*/)
const ip = match ? match[1] : null

if (!ip) {
  console.error("[ip.js] No active LAN IPv4 found — is Wi-Fi up?")
  process.exit(1)
}

const envFile = ".env.local"

// 2. Bootstrap .env.local on first run from .env.example, so a fresh
//    clone doesn't crash here.
if (!fs.existsSync(envFile)) {
  const seed = fs.existsSync(".env.example")
    ? fs.readFileSync(".env.example", "utf8")
    : `VITE_API_BASE_URL="https://${ip}:8000/v1"\nVITE_ENV="dev"\n`
  fs.writeFileSync(envFile, seed)
  console.log(`[ip.js] Created ${envFile} from .env.example`)
}

let env = fs.readFileSync(envFile, "utf8")
const before = env

// 3. Replace the host in the API URL. Match the full URL including
//    scheme + port so the regex is anchored.
env = env.replace(/(VITE_API_BASE_URL="https?:\/\/)([^/:]+)(:\d+\/[^"]*")/, `$1${ip}$3`)

// 4. If the key is missing entirely, append it. Handles legacy
//    .env.local files without asking for a hand-edit.
if (!/VITE_API_BASE_URL=/.test(env)) {
  env = `VITE_API_BASE_URL="https://${ip}:8000/v1"\n` + env
}

if (env !== before) {
  fs.writeFileSync(envFile, env)
  console.log(`[ip.js] Updated IP in ${envFile} → ${ip}`)
} else {
  console.log(`[ip.js] IP in ${envFile} already current: ${ip}`)
}
