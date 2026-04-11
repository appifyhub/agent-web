## Why

Non-English i18n JSON files have drifted in key ordering compared to `en.json`. While the existing validation ensures all keys match, inconsistent ordering makes diffs noisy and cross-file comparison harder. Enforcing consistent key order across all language files eliminates this drift automatically.

## What Changes

- Add a key ordering check to `generate-translation-keys.ts` that compares every non-English i18n file's key order (at all nesting levels) against `en.json`
- When a mismatch is detected, the script auto-fixes by rewriting the file with keys reordered to match `en.json`
- Logs which files were reordered during the run
- `en.json` is never modified — it is the canonical source of key order

## Capabilities

### New Capabilities

- `translation-key-ordering`: Automatic validation and correction of i18n key ordering against the English source file

### Modified Capabilities

None.

## Impact

- **Code**: `scripts/generate-translation-keys.ts` gains a new validation/auto-fix step
- **i18n files**: All non-English JSON files in `src/assets/i18n/` may be rewritten on first run to match `en.json` key order
- **CI**: No changes needed — the existing lint pipeline already runs this script; misordered files would show up as uncommitted changes in CI
