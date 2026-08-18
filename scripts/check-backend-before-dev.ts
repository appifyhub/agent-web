/// <reference types="node" />
import path from "path";
import { fileURLToPath } from "url";
import { createInterface } from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { loadEnv } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const BACKEND_URL_VARIABLE = "VITE_API_BASE_URL";
const REQUEST_TIMEOUT_MS = 2500;

function resolveBackendUrl(): string | undefined {
  const mode = process.env.MODE ?? process.env.NODE_ENV ?? "development";
  const env = loadEnv(mode, ROOT, "");
  return process.env[BACKEND_URL_VARIABLE] ?? env[BACKEND_URL_VARIABLE];
}

async function canReachBackend(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    await fetch(url, {
      method: "GET",
      signal: controller.signal,
    });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

async function askToProceed(message: string): Promise<boolean> {
  if (!input.isTTY) {
    console.error(message);
    console.error("Cannot ask whether to proceed because stdin is not interactive.");
    return false;
  }

  const rl = createInterface({ input, output });
  try {
    const answer = await rl.question(`${message}\nContinue launching Vite anyway? [y/N] `);
    return answer.trim().toLowerCase() === "y";
  } finally {
    rl.close();
  }
}

async function main(): Promise<void> {
  const backendUrl = resolveBackendUrl();

  if (!backendUrl) {
    const shouldProceed = await askToProceed(`${BACKEND_URL_VARIABLE} is not set.`);
    process.exit(shouldProceed ? 0 : 1);
  }

  let url: URL;
  try {
    url = new URL(backendUrl);
  } catch {
    const shouldProceed = await askToProceed(`${BACKEND_URL_VARIABLE} is not a valid URL: ${backendUrl}`);
    process.exit(shouldProceed ? 0 : 1);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    const shouldProceed = await askToProceed(`${BACKEND_URL_VARIABLE} must use http or https: ${backendUrl}`);
    process.exit(shouldProceed ? 0 : 1);
  }

  const isReachable = await canReachBackend(url.href);
  if (!isReachable) {
    const shouldProceed = await askToProceed(`Backend service did not respond at ${url.href}.`);
    process.exit(shouldProceed ? 0 : 1);
  }
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
