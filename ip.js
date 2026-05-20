// Pre-build / pre-dev hook. Rewrites the API base + WebSocket URLs in
// `.env.local` to point at this machine's current LAN IP, so the dev
// server can be hit from any device on the same network (browser on
// another laptop, the iPhone running the Capacitor build, etc.).
//
// Variable names MUST match what the app actually reads:
//   - axios.instances.ts → `VITE_API_BASE_URL`
//   - useSocket.ts       → `VITE_WEB_SOCKET_URL`
// (An earlier version of this script wrote `VITE_BASE_URL` /
// `VITE_WEB_SOCKET` which the code never reads — the dev server still
// worked because the axios fallback resolves against window.location
// when localhost happens to be on the same machine. iPhone builds
// have no such luck.)

import fs from 'fs';
import { execSync } from 'child_process';

// 1. Resolve the current active LAN IPv4. `ifconfig` order varies by
// machine; we look for the first non-loopback interface that has the
// classic "netmask … broadcast …" format the en0 (Wi-Fi) interface
// always carries on Apple Silicon.
const output = execSync('ifconfig').toString();
const match = output.match(/inet (\d+\.\d+\.\d+\.\d+) netmask .* broadcast .*/);
const ip = match ? match[1] : null;

if (!ip) {
  console.error('No active IP found');
  process.exit(1);
}

// 2. Read .env.local (create it from a minimal template if missing,
// so a fresh checkout doesn't crash here).
const envFile = '.env.local';
if (!fs.existsSync(envFile)) {
  fs.writeFileSync(
    envFile,
    [
      `VITE_API_BASE_URL="https://${ip}:8000/v1"`,
      `VITE_WEB_SOCKET_URL="wss://${ip}:8000/ws"`,
      `VITE_ENV="dev"`,
      ``,
    ].join('\n'),
  );
  console.log(`Created ${envFile} with IP ${ip}`);
  process.exit(0);
}

let env = fs.readFileSync(envFile, 'utf8');

// 3. Replace the host in both URLs. Match the full URL including
// scheme + port so the regex is anchored and can't grab an unrelated
// value lower in the file (e.g. a Firebase project id that happens
// to contain a digit run).
const before = env;
env = env
  .replace(
    /(VITE_API_BASE_URL="https?:\/\/)([^/:]+)(:8000\/v1")/,
    `$1${ip}$3`,
  )
  .replace(
    /(VITE_WEB_SOCKET_URL="wss?:\/\/)([^/:]+)(:8000\/ws")/,
    `$1${ip}$3`,
  );

// 4. If either key is missing entirely, append it. This handles the
// "old .env.local with the wrong variable names" migration without
// asking the developer to hand-edit.
if (!/VITE_API_BASE_URL=/.test(env)) {
  env = `VITE_API_BASE_URL="https://${ip}:8000/v1"\n` + env;
}
if (!/VITE_WEB_SOCKET_URL=/.test(env)) {
  env = `VITE_WEB_SOCKET_URL="wss://${ip}:8000/ws"\n` + env;
}

if (env !== before) {
  fs.writeFileSync(envFile, env);
  console.log(`Updated IP in ${envFile} to: ${ip}`);
} else {
  console.log(`IP in ${envFile} already current: ${ip}`);
}
