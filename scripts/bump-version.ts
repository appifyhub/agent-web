/// <reference types="node" />
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PACKAGE_FILE = path.join(ROOT, "package.json");
const LOCK_FILE = path.join(ROOT, "package-lock.json");

const SEMVER_RE = /^(\d+)\.(\d+)\.(\d+)$/;

type BumpType = "major" | "minor" | "patch";

function readVersion(filePath: string): string {
  const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const version = content.version as string | undefined;
  if (!version || !SEMVER_RE.test(version)) {
    throw new Error(`Could not find a semantic version in '${path.basename(filePath)}'.`);
  }
  return version;
}

function bump(version: string, type: BumpType): string {
  const [, major, minor, patch] = SEMVER_RE.exec(version)!.map(Number);
  switch (type) {
    case "major": return `${major + 1}.0.0`;
    case "minor": return `${major}.${minor + 1}.0`;
    case "patch": return `${major}.${minor}.${patch + 1}`;
  }
}

function replaceVersion(filePath: string, oldVersion: string, newVersion: string): void {
  const updated = fs.readFileSync(filePath, "utf8").replace(
    `"version": "${oldVersion}"`,
    `"version": "${newVersion}"`,
  );
  fs.writeFileSync(filePath, updated, "utf8");
}

const bumpType = process.argv[2] as BumpType | undefined;
if (!bumpType || !["major", "minor", "patch"].includes(bumpType)) {
  console.error(`Usage: bun scripts/bump-version.ts {major|minor|patch}`);
  process.exit(1);
}

const currentVersion = readVersion(PACKAGE_FILE);
const lockVersion = readVersion(LOCK_FILE);

if (currentVersion !== lockVersion) {
  console.error(
    `Version mismatch: '${path.basename(PACKAGE_FILE)}' has ${currentVersion}, '${path.basename(LOCK_FILE)}' has ${lockVersion}.`,
  );
  process.exit(1);
}

const newVersion = bump(currentVersion, bumpType);
replaceVersion(PACKAGE_FILE, currentVersion, newVersion);

console.log(`Bumped version: ${currentVersion} → ${newVersion}`);
console.log("Syncing lock files...");

execSync("npm install --package-lock-only --ignore-scripts", {
  cwd: ROOT,
  stdio: "inherit",
});

console.log("Done.");
console.log(`Installed version: ${currentVersion} → ${newVersion}`);
