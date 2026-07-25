## Context

The frontend receives provider and tool catalogs dynamically, but it keeps static TypeScript contracts and field lists for persisted user settings, tool purposes, category grouping, translations, and provider icons. The backend now returns provider ID `twelve-data`, settings fields `twelve_data_api_key` and `tool_choice_api_stock_quote`, tool type `api_stock_quote`, and additional asset/stock errors. Without matching static entries, the provider can appear but its credential and tool choice cannot be saved, and the stock tool is intentionally hidden when translations are absent.

The frontend also maps numeric API errors locally. Backend code `6002` historically represented insufficient credits and remains supported by the frontend, while stock quote rate limiting has been assigned the new unique backend code `6003`.

## Goals / Non-Goals

**Goals:**

- Make Twelve Data credentials fully editable, mask-aware, clearable, and persistable through the existing access-settings flow.
- Make the stock-quote tool visible and configurable through presets and custom intelligence settings.
- Keep every API error code mapped once with matching semantics and complete localization.
- Provide a temporary deterministic Twelve Data icon without blocking implementation on the final brand asset.

**Non-Goals:**

- Add a stock-price lookup page, price-alert page, or new HTTP client endpoint.
- Reimplement stock lookup, alert logic, or provider validation in the frontend.
- Change provider metadata that is already supplied by the backend, including the API-key URL.
- Add a new test framework or runtime dependency.

## Decisions

### 1. Extend the existing settings contract symmetrically

Add `twelve_data_api_key` and `tool_choice_api_stock_quote` everywhere their CoinMarketCap and cryptocurrency-tool counterparts participate: response and payload types, provider-to-setting mapping, masked-field diffing, string-field diffing, API-key detection, and bulk clearing.

This preserves the existing sparse PATCH behavior. A provider-specific form or separate stock settings service would duplicate the access-settings flow and is unnecessary.

### 2. Continue consuming provider metadata dynamically

Use backend provider ID `twelve-data`; continue displaying its backend-supplied name, token format, `Stocks` label, and `https://twelvedata.com/account/api-keys` management URL. Only the field mapping and icon remain frontend-owned.

Hard-coding the URL or provider display metadata again in the frontend would create an avoidable second source of truth.

### 3. Integrate stock quotes into the existing tool taxonomy

Add `api_stock_quote` to `ToolType`, place it in the integrations category and changed-state map, assign a stock-market icon, and add its title and description to all locales. The user-facing title uses the natural local equivalent of “Stocks and stock market,” including exact Serbian title `Akcije i berza`, rather than a literal translation of the provider operation “stock quote.” Preset comparison and application continue using the existing dynamic `tool_choice_${toolType}` convention once the typed settings field exists.

### 4. Use a clearly named temporary provider asset

Copy `coinmarketcap-white.svg` to a distinct Twelve Data asset path and map `twelve-data` to that copy. The duplicate is intentional and temporary: callers reference the correct provider-specific filename now, so replacing the artwork later changes only the asset contents.

The last implementation task is a manual TODO for the user to provide and review the real Twelve Data icon. The temporary asset remains until that separate input is available.

### 5. Preserve the existing error mapping shape while auditing it mechanically

Keep `getErrorTranslationKey` as the central numeric mapping and add missing current backend codes exactly once. Rename the semantic key for `4003` to `invalid_resource_token`; add the previously omitted `1039`; add asset/stock codes `1040`, `1041`, `1042`, `2014`, `5014`, and `6003`; and retain `6002` solely as a documented legacy insufficient-credit mapping.

All mapped keys are added to every locale, and the normal i18n lint regenerates the typed translation-key union. A deterministic comparison against the backend constants verifies completeness, uniqueness, and the single documented legacy exception.

## Risks / Trade-offs

- [The copied CoinMarketCap artwork can misrepresent Twelve Data] → Use a distinct filename, call it temporary in the task record, and stop at a final manual replacement TODO.
- [Static frontend settings lists can drift again] → Update every symmetric list in one task and verify key save, clear, and preset paths during review.
- [Legacy `6002` makes a strict set comparison report one frontend-only code] → Treat it as the only documented legacy exception; current stock rate limiting uses unique code `6003`.
- [Missing locale entries cause the stock tool to disappear] → Update all locales before running i18n lint and verify the rendered tool group exists.

## Migration Plan

Deploy the backend containing stock code `6003` before or with this frontend. The frontend remains compatible with older insufficient-credit responses through `6002`. Rollback requires only reverting the frontend; unknown Twelve Data fields returned by the backend are otherwise ignored.

## Open Questions

- The final Twelve Data icon asset is pending from the user and will replace the temporary copied artwork after the implementation review.
