## ADDED Requirements

### Requirement: Complete API error mapping
The frontend SHALL map every current backend API error code to exactly one semantic translation key and SHALL contain no duplicate numeric cases.

#### Scenario: Current backend error is received
- **WHEN** an API response contains a numeric code defined by the backend error-code catalog
- **THEN** `getErrorTranslationKey` SHALL return the corresponding semantic translation key

#### Scenario: Error catalog is audited
- **WHEN** frontend validation compares the mapping with the backend catalog
- **THEN** it SHALL report no missing current codes, no duplicate numeric mappings, and no undocumented frontend-only codes

### Requirement: Corrected existing error mappings
The frontend SHALL map code `1039` to `unsupported_media_type` and code `4003` to `invalid_resource_token`.

#### Scenario: Unsupported media is returned
- **WHEN** the backend returns error code `1039`
- **THEN** the frontend SHALL display the localized unsupported-media message

#### Scenario: Resource token is invalid
- **WHEN** the backend returns error code `4003`
- **THEN** the frontend SHALL display the localized invalid-resource-token message

### Requirement: Asset and stock error mappings
The frontend SHALL map `1040` to `invalid_asset_type`, `1041` to `invalid_asset_amount`, `1042` to `invalid_stock_symbol`, `2014` to `stock_quote_not_found`, `5014` to `stock_quote_failed`, and `6003` to `stock_quote_rate_limited`.

#### Scenario: Asset validation fails
- **WHEN** the backend returns code `1040`, `1041`, or `1042`
- **THEN** the frontend SHALL display the corresponding localized validation message

#### Scenario: Stock provider operation fails
- **WHEN** the backend returns code `2014`, `5014`, or `6003`
- **THEN** the frontend SHALL display the corresponding localized not-found, provider-failure, or rate-limit message

### Requirement: Explicit legacy code compatibility
The frontend SHALL retain code `6002` as the sole documented frontend-only legacy mapping and SHALL interpret it only as `insufficient_credits`; current stock rate limiting SHALL use `6003`.

#### Scenario: Legacy insufficient-credit response is received
- **WHEN** an older backend returns code `6002`
- **THEN** the frontend SHALL display the insufficient-credits message

#### Scenario: Current stock rate limit is received
- **WHEN** the current backend returns code `6003`
- **THEN** the frontend SHALL display the stock-quote-rate-limited message without colliding with legacy code `6002`

### Requirement: Localized API errors
Every API error translation key used by the mapping SHALL exist in every supported locale and in the generated typed translation-key catalog.

#### Scenario: New error is displayed in any locale
- **WHEN** a user receives an asset, stock, media, or resource-token error in any supported language
- **THEN** the frontend SHALL render localized text rather than a missing key

#### Scenario: Unknown error code is received
- **WHEN** an API response contains an unmapped code
- **THEN** the existing unknown-error fallback SHALL remain in effect
