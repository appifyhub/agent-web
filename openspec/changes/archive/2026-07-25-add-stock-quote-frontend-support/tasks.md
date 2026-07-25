## 1. Twelve Data access settings

- [x] 1.1 Add `twelve_data_api_key` to the user settings response/payload contracts, map provider ID `twelve-data`, and include the field in masked diffing, API-key detection, and sparse PATCH construction.
- [x] 1.2 Add `twelve_data_api_key` to the remove-all-keys flow and verify individual save, masked reload, individual clear, and bulk clear produce the intended sparse payloads.
- [x] 1.3 Copy `coinmarketcap-white.svg` to a provider-specific temporary Twelve Data asset path and map `twelve-data` to that asset without hard-coding provider metadata or the key-management URL.

## 2. Stock quote tool settings

- [x] 2.1 Add `api_stock_quote` to `ToolType` and `tool_choice_api_stock_quote` to user settings response/payload contracts and string-field changed-payload handling.
- [x] 2.2 Add `api_stock_quote` to the integrations category, changed-category detection, and tool icon mapping so custom selections and preset comparison/application include stock quotes.
- [x] 2.3 Add the natural local equivalent of “Stocks and stock market” and a description under `tools.types.api_stock_quote` in every supported locale, using exact Serbian title `Akcije i berza`, preserving locale key ordering, and allowing the normal lint task to regenerate typed translation keys.

## 3. API error-code alignment

- [x] 3.1 Update `getErrorTranslationKey` for `1039`, `1040`, `1041`, `1042`, `2014`, `4003`, `5014`, and `6003`; retain `6002` only as the documented legacy insufficient-credit mapping.
- [x] 3.2 Add or rename the corresponding semantic error keys in every supported locale, including `invalid_resource_token`, and regenerate the typed translation-key catalog through the normal lint workflow.
- [x] 3.3 Mechanically compare the frontend mapping with the backend error-code catalog and confirm every current backend code is mapped exactly once, numeric cases contain no duplicates, all translation keys exist in every locale, and `6002` is the only documented legacy frontend-only exception.

## 4. Validation and icon handoff

- [x] 4.1 Run `bun run lint` and `bun run build` from the frontend repository, run `git diff --check`, and resolve all regressions without adding a new test framework.
- [x] 4.2 Manually review the Twelve Data access card, masked-key save/clear behavior, stock-quote custom choice and presets, localized tool visibility, provider navigation, and representative new API error mappings.
- [x] 4.3 **TODO — STOP for the user to supply and approve the real Twelve Data icon. Keep the copied CoinMarketCap artwork explicitly temporary; once the real asset is supplied, replace only the provider-specific asset contents and rerun lint, build, and visual review before completing the change.**
