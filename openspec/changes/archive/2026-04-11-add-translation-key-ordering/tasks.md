## 1. Core Implementation

- [x] 1.1 Add `reorderToMatch(source, target)` function to `generate-translation-keys.ts` that recursively reorders `target`'s keys to match `source`'s key order at every nesting level, preserving values
- [x] 1.2 Add key ordering validation step in `main()` after placeholder validation and before type generation: for each non-English file, compare key order against `en.json`, auto-fix by rewriting if mismatched, and log which files were reordered (or a success message if none needed reordering)

## 2. Verify

- [x] 2.1 Run `bun run lint` to confirm the script works end-to-end and all non-English files are reordered correctly
