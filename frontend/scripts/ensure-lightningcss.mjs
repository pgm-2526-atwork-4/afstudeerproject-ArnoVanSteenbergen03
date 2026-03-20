import { execSync } from "node:child_process";

function hasLightningCssBinary() {
  try {
    return Boolean(execSync('node -e "require(\"lightningcss\")"', { stdio: "pipe" }));
  } catch {
    return false;
  }
}

if (process.platform !== "linux") {
  process.exit(0);
}

if (hasLightningCssBinary()) {
  process.exit(0);
}

const candidates = [
  "lightningcss-linux-x64-gnu@1.30.2",
  "lightningcss-linux-x64-musl@1.30.2",
];

for (const pkg of candidates) {
  try {
    console.log(`[ensure-lightningcss] Installing ${pkg}...`);
    execSync(`npm install --no-save ${pkg}`, { stdio: "inherit" });
    if (hasLightningCssBinary()) {
      console.log("[ensure-lightningcss] lightningcss native binary is available.");
      process.exit(0);
    }
  } catch {
    // Try next candidate.
  }
}

console.warn("[ensure-lightningcss] Unable to install lightningcss native binary on Linux. Falling back to JavaScript implementation.");
process.exit(0);
