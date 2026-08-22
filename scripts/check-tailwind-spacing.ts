/// <reference types="node" />
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, "../src");
const SOURCE_EXTENSIONS = [".ts", ".tsx", ".css"];

// Tailwind 4.3.3 miscompiles shorthand and physical-side padding/margin utilities
// on integer scale steps 2 through 8: the step is emitted as a px length in the
// multiplier slot, producing `padding: calc(var(--spacing) * 32px)` for `p-4`.
// That is a length multiplied by a length, so browsers drop the declaration and
// the utility silently applies no spacing at all. Steps 0, 1, fractional values
// and 9+ compile correctly, as do the axis (`px`/`py`) and logical (`ps`/`pe`)
// families. Use `px-4 py-4`, `pt-[1rem]`, `ps-4`, or `me-2` instead.
// Remove this check once a Tailwind release fixes the codegen upstream.
const BROKEN_PREFIXES = ["p", "pt", "pb", "pl", "pr", "m", "mt", "mb", "ml", "mr"];
const BROKEN_STEPS = ["2", "3", "4", "5", "6", "7", "8"];

const REPLACEMENTS: Record<string, string> = {
  p: "px-N py-N",
  m: "mx-N my-N",
  pt: "pt-[Vrem]",
  pb: "pb-[Vrem]",
  mt: "mt-[Vrem]",
  mb: "mb-[Vrem]",
  pl: "ps-N",
  pr: "pe-N",
  ml: "ms-N",
  mr: "me-N",
};

// the spacing scale is 0.25rem per step, so step 6 is 1.5rem
const stepToRem = (step: string): string => `${Number(step) * 0.25}`;

interface Finding {
  file: string;
  line: number;
  utility: string;
  suggestion: string;
}

function collectSourceFiles(dir: string): string[] {
  const found: string[] = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...collectSourceFiles(full));
    } else if (SOURCE_EXTENSIONS.includes(path.extname(entry.name))) {
      found.push(full);
    }
  }

  return found;
}

function findBrokenUtilities(): Finding[] {
  // a broken utility may carry variant prefixes (`data-[inset]:pl-8`,
  // `[.border-b]:pb-6`, `sm:p-4`), so the boundary check allows a preceding `:`
  // while still rejecting matches inside a longer word such as `gap-2`
  const pattern = new RegExp(
    `(?<![\\w.-])(${BROKEN_PREFIXES.join("|")})-(${BROKEN_STEPS.join("|")})(?![\\w.\\d-])`,
    "g",
  );
  const findings: Finding[] = [];

  for (const file of collectSourceFiles(SRC_DIR)) {
    const lines = fs.readFileSync(file, "utf-8").split("\n");

    lines.forEach((line, index) => {
      for (const match of line.matchAll(pattern)) {
        findings.push({
          file: path.relative(path.join(__dirname, ".."), file),
          line: index + 1,
          utility: match[0],
          suggestion: REPLACEMENTS[match[1]]
            .replace(/V/g, stepToRem(match[2]))
            .replace(/N/g, match[2]),
        });
      }
    });
  }

  return findings;
}

function main(): void {
  console.log("Checking for miscompiled Tailwind spacing utilities...\n");

  const findings = findBrokenUtilities();

  if (findings.length === 0) {
    console.log("✅ No miscompiled spacing utilities found!\n");
    return;
  }

  console.log(
    `⚠️  Found ${findings.length} utility use(s) that compile to invalid CSS:\n`,
  );
  for (const { file, line, utility, suggestion } of findings) {
    console.log(`  ${file}:${line}  ${utility}  →  use ${suggestion}`);
  }
  console.log(
    "\nThese emit `calc(var(--spacing) * Npx)`, which browsers discard, so the\n" +
      "spacing never renders. See the comment in scripts/check-tailwind-spacing.ts.\n",
  );

  process.exit(1);
}

main();
