## Context

`generate-translation-keys.ts` already loads all i18n JSON files, validates syntax, checks for duplicates, verifies key consistency against `en.json`, and validates placeholders. It then generates a TypeScript type definition file. Key ordering is not currently validated — non-English files have drifted in order at the tail end of both top-level and nested keys.

## Goals / Non-Goals

**Goals:**

- Ensure all non-English i18n files have keys in the same order as `en.json` at every nesting level
- Auto-fix misordered files in-place (no manual intervention needed)
- Log which files were reordered so the developer knows what changed

**Non-Goals:**

- Sorting or modifying `en.json` — it is the canonical source of order
- Introducing a `--fix` flag or any CLI arguments
- Changing the existing validation steps or their order

## Decisions

**1. Recursive reorder function that walks `en.json`'s structure**

Add a function `reorderToMatch(source, target)` that returns a new object with `target`'s values but `source`'s key order, applied recursively at every nesting level. This handles arbitrary depth including nested objects like `sponsorship`, `tools`, `cost_estimate`, and plural forms.

Alternative considered: flat-key comparison (flatten both, compare order, report). Rejected because rewriting requires rebuilding the nested structure anyway, and a recursive approach is simpler.

**2. Placement: after placeholder validation, before type generation**

The ordering check runs after all correctness validations pass (syntax, duplicates, key matching, placeholders). This means we only reorder files that are already structurally valid. The reordered files are then used for type generation.

Alternative considered: running ordering first. Rejected because reordering a file with missing/extra keys or bad JSON would mask real errors.

**3. Always auto-fix, no flag**

The script already writes files (generates `translation-keys.ts`). Rewriting misordered JSON files is the same pattern. CI catches forgotten runs via uncommitted changes.

**4. Output format: `JSON.stringify(obj, null, 2)` + trailing newline**

Matches the existing formatting of all i18n files (2-space indent, trailing newline).

## Risks / Trade-offs

- **First run rewrites all 10 non-English files** → Expected one-time churn. The diff will be order-only (no value changes). Mitigated by having it as a single commit.
- **Key order in `en.json` becomes load-bearing** → Developers must be aware that adding keys to `en.json` in a specific position determines order everywhere. This is already implicitly true for key existence; now it's also true for order.
