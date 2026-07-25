## Why

The backend now exposes Twelve Data credentials, stock-quote tool selection, and stock-specific structured errors, but the frontend cannot persist those settings or display that tool. The frontend error-code catalog has also drifted from the backend, including a historical collision at code `6002`, so the contracts need to be aligned before the feature is exposed.

## What Changes

- Add Twelve Data API-key and stock-quote tool-choice fields to the frontend settings contracts and changed-payload handling.
- Display Twelve Data in access settings using the provider metadata supplied by the backend.
- Add stock quotes to the advanced tool selector, preset comparison, changed-state tracking, icons, and every supported locale.
- Temporarily copy the existing CoinMarketCap icon for Twelve Data so the provider has a deterministic visual until the real asset is supplied.
- Align frontend API error mappings with the backend, retain `6002` only for legacy insufficient-credit responses, and map stock quote rate limiting to the new unique code `6003`.
- Add every new or renamed error translation to all supported locales and regenerate the typed translation-key catalog.
- End implementation with a manual TODO for the user to supply and review the real Twelve Data icon before the placeholder is replaced.

## Capabilities

### New Capabilities

- `stock-quote-settings`: Frontend support for configuring a Twelve Data key and selecting the stock-quote tool through the existing access and intelligence settings flows.
- `api-error-code-alignment`: Complete, duplicate-free frontend mapping of backend API error codes, including localized stock-price errors and explicit legacy-code handling.

### Modified Capabilities

None.

## Impact

- Affects user-settings and external-tools service types, changed-payload construction, access-key clearing, advanced tool grouping, provider/tool icons, error parsing, and all locale files.
- Consumes the backend fields `twelve_data_api_key` and `tool_choice_api_stock_quote`, provider ID `twelve-data`, tool type `api_stock_quote`, and stock error codes.
- Adds no runtime dependency and no new user-facing HTTP endpoint.
- Requires frontend lint and production build validation.
