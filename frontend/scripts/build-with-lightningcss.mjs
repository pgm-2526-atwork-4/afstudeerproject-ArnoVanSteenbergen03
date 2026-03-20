import { spawnSync } from "node:child_process";

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env,
  });

  return result.status ?? 1;
}

function hasLightningCss() {
  const status = run("node", ["-e", 'require("lightningcss")']);
  return status === 0;
}

function tryInstall(pkg) {
  console.log(`[build-with-lightningcss] Installing ${pkg}...`);
  return run("npm", ["install", "--no-save", pkg]) === 0;
}

const env = { ...process.env };

if (process.platform === "linux" && !hasLightningCss()) {
  const candidates = [
    "lightningcss-linux-x64-gnu@1.30.2",
    "lightningcss-linux-x64-musl@1.30.2",
  ];

  for (const pkg of candidates) {
    if (tryInstall(pkg) && hasLightningCss()) {
      break;
    }
  }

  if (!hasLightningCss()) {
    console.warn(
      "[build-with-lightningcss] Native LightningCSS unavailable, forcing WASM fallback.",
    );
    env.CSS_TRANSFORMER_WASM = "1";
  }
}

const buildStatus = run("next", ["build"], env);
process.exit(buildStatus);
