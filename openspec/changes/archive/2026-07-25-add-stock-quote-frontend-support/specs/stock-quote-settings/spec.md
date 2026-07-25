## ADDED Requirements

### Requirement: Twelve Data credential settings
The frontend SHALL represent `twelve_data_api_key` in user settings and sparse update payloads and SHALL associate backend provider ID `twelve-data` with that field.

#### Scenario: Existing credential is loaded
- **WHEN** the user-settings API returns a masked Twelve Data credential
- **THEN** the access page SHALL display the masked value for the Twelve Data provider without treating it as a local change

#### Scenario: Credential is saved
- **WHEN** a user enters or replaces a Twelve Data credential
- **THEN** the frontend SHALL send `twelve_data_api_key` in the sparse settings PATCH payload

#### Scenario: Credential is cleared
- **WHEN** a user clears Twelve Data individually or uses the remove-all-keys action
- **THEN** the frontend SHALL send an empty `twelve_data_api_key` and SHALL include that removal in changed-state detection

### Requirement: Backend-owned Twelve Data metadata
The frontend SHALL display the Twelve Data name, key-management URL, token format, and tool labels from the external-provider response rather than duplicating those values locally.

#### Scenario: Provider catalog is displayed
- **WHEN** the external-tools API returns provider ID `twelve-data`
- **THEN** the access page SHALL render the provider using the returned metadata, including `https://twelvedata.com/account/api-keys`

### Requirement: Stock quote tool choice
The frontend SHALL support `api_stock_quote` as an integrations tool type and SHALL persist its selection through `tool_choice_api_stock_quote`.

#### Scenario: Stock quote tool is returned
- **WHEN** the external-tools API returns a tool with type `api_stock_quote`
- **THEN** the advanced tool panel SHALL render a localized stock-quote section in the integrations category

#### Scenario: Custom stock quote choice is saved
- **WHEN** a user changes the stock-quote tool selection
- **THEN** changed-state detection SHALL activate and the sparse settings PATCH SHALL contain `tool_choice_api_stock_quote`

#### Scenario: Preset includes stock quotes
- **WHEN** the selected intelligence preset contains an `api_stock_quote` choice
- **THEN** preset application and preset detection SHALL include the stock-quote setting

### Requirement: Stock quote localization
Every supported locale SHALL provide a natural local equivalent of “Stocks and stock market” as the title and a localized description for `tools.types.api_stock_quote`, and the generated translation-key type SHALL contain both keys. The Serbian title SHALL be exactly `Akcije i berza`.

#### Scenario: Any supported locale is active
- **WHEN** the intelligence page renders the stock-quote tool
- **THEN** it SHALL show the natural localized “Stocks and stock market” title and description rather than a literal provider-operation label, hiding the type, or displaying a raw key

### Requirement: Temporary Twelve Data icon
The frontend SHALL map provider ID `twelve-data` to a provider-specific asset path that temporarily contains a copy of the existing CoinMarketCap icon.

#### Scenario: Temporary icon is rendered
- **WHEN** Twelve Data appears in access or intelligence settings before the real icon is supplied
- **THEN** the frontend SHALL render the temporary provider asset instead of the generic unknown-provider icon

#### Scenario: Real icon becomes available
- **WHEN** the user supplies and approves the real Twelve Data artwork
- **THEN** the temporary asset contents SHALL be replaced without changing provider IDs or component logic
