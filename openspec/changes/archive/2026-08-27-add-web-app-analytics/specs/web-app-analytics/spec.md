## Purpose

Define safe, environment-isolated product analytics for observable behavior inside the web application without exposing authentication material, route identifiers, credentials, user content, or backend activity.

## ADDED Requirements

### Requirement: Analytics uses isolated recognized environments
The system SHALL send analytics only when the browser hostname exactly matches the configured production or staging hostname, SHALL use a different GA4 property and web stream for each environment, and SHALL remain disabled on local, preview, and unrecognized hosts. The web app SHALL use normal GA4 analytics storage without presenting an in-app consent interface because consent is established during signup outside this application.

#### Scenario: Production analytics is selected
- **WHEN** the web app runs on the exact production hostname
- **THEN** it loads only the production measurement ID

#### Scenario: Staging analytics is selected
- **WHEN** the web app runs on the exact staging hostname
- **THEN** it loads only the staging measurement ID

#### Scenario: Unknown environment remains disabled
- **WHEN** the web app runs on any hostname not explicitly configured
- **THEN** it does not load the Google tag or send an analytics collection request

#### Scenario: No consent interface is added
- **WHEN** a user opens the web app on a recognized hostname
- **THEN** the application does not display or persist a separate analytics-consent choice

### Requirement: Analytics never initializes with an unsafe page context
The system SHALL disable automatic page-view and interaction collection, SHALL resolve a canonical page context before configuring GA4, and SHALL remove a token query parameter before loading or configuring analytics for a routed settings page. The initial and subsequent analytics context SHALL use a canonical location, canonical title, and blank or canonical referrer rather than browser-derived URL fields.

#### Scenario: Valid token arrives in the URL
- **WHEN** a routed settings page receives a token through the query string
- **THEN** analytics initialization waits until the token has been processed and removed from the visible URL

#### Scenario: Invalid or expired token arrives in the URL
- **WHEN** token decoding resolves to an authentication error
- **THEN** analytics initialization waits until the token query has been removed and then uses the attempted canonical page context without assigning a User-ID

#### Scenario: Public not-found page loads
- **WHEN** GitHub Pages serves the React not-found page for an unmatched URL
- **THEN** analytics initializes with the canonical not-found context without reading or sending the unmatched URL

#### Scenario: Automatic collection is disabled
- **WHEN** GA4 is configured for a recognized environment
- **THEN** automatic page views, browser-history page changes, outbound clicks, form interactions, scrolling, and other Enhanced Measurement interactions are not collected

### Requirement: Authenticated identity uses only the reserved User-ID
The system SHALL assign the opaque JWT subject to GA4's reserved User-ID only after a valid authenticated session is available. It SHALL NOT send that subject as an event parameter, user property, custom dimension, URL value, or visible label.

#### Scenario: Authenticated session becomes available
- **WHEN** a valid session has a JWT subject and safe account context
- **THEN** analytics configures the reserved User-ID before sending the authenticated page view

#### Scenario: No valid identity is available
- **WHEN** the not-found page or an initial authentication-error state has no valid session
- **THEN** analytics sends permitted anonymous events without a User-ID

#### Scenario: Session identity is no longer valid
- **WHEN** the application clears or replaces its authenticated session
- **THEN** subsequent analytics events do not retain the obsolete User-ID

### Requirement: Eligibility context supports valid web-app adoption analysis
The system SHALL set only the low-cardinality user properties `account_status`, `access_mode`, `source_platform`, and `backend_version` when their values are available from a valid session. Page events SHALL include the stable `interface_language` value. The properties SHALL use controlled identifiers rather than translated labels or user-provided values.

#### Scenario: Eligible account context is known
- **WHEN** an authenticated page becomes measurable
- **THEN** its page view can be segmented by account status, access mode, source platform, backend version, and interface language

#### Scenario: Context is unavailable
- **WHEN** an anonymous error page has no valid account context
- **THEN** the event omits unavailable properties rather than inferring or fabricating them

### Requirement: Routed pages emit canonical manual page views
The system SHALL emit one manual `page_view` for each resolved page state using a stable `page_id`, `page_state`, canonical `page_location`, canonical `page_title`, and safe interface context. Supported settings page identifiers SHALL cover chat, profile, access, intelligence, sponsorships, linked profiles, usage, purchases, help, and onboarding without including route identifiers.

#### Scenario: Authenticated page becomes ready
- **WHEN** a settings page resolves a valid session and page state
- **THEN** it emits one `page_view` with its canonical `page_id` and `page_state=ready`

#### Scenario: Chat route identity changes
- **WHEN** navigation changes the underlying chat route while remaining on the canonical chat page
- **THEN** the system emits another canonical chat page view without sending the chat ID, user ID, title, or raw pathname

#### Scenario: Token cleanup changes only the query
- **WHEN** the application removes the token query without changing the canonical page state
- **THEN** it does not emit a duplicate page view

#### Scenario: React renders an effect more than once
- **WHEN** development StrictMode repeats the same resolved page-view effect
- **THEN** the same page-state occurrence is reported only once

### Requirement: The public not-found page is measurable without its requested URL
The system SHALL track the wildcard not-found page with a canonical `page_view` using `page_id=not_found` and `page_state=not_found`, followed by one `page_error` using `error_category=not_found` and `error_code=route_not_found`. It SHALL NOT send the unmatched path, query, fragment, referrer, or requested destination.

#### Scenario: Unknown URL is loaded directly
- **WHEN** an unmatched production or staging URL renders the public not-found page
- **THEN** the canonical not-found page view and page error are emitted without a User-ID unless a valid application session is already configured

#### Scenario: User reaches not-found during an authenticated app session
- **WHEN** client-side navigation reaches the wildcard route after analytics has a valid authenticated identity
- **THEN** the canonical not-found events may retain that valid User-ID but still omit the unmatched URL

#### Scenario: User leaves the not-found page
- **WHEN** the user activates the return-to-landing control
- **THEN** the system emits a semantic recovery `feature_action` with a stable destination identifier and without the resolved link URL

### Requirement: Authentication failures are tracked with page context
The system SHALL classify and track missing tokens, invalid tokens, initially expired tokens, runtime token expiry, and API authentication failures. Each `page_error` SHALL include the attempted canonical `page_id`, `error_category=authentication`, and a stable safe `error_code`. It MAY include only the numeric API error code and HTTP status as diagnostic fields and SHALL NOT include token contents or server error messages.

#### Scenario: Initial token is missing
- **WHEN** a routed authenticated page resolves without a token
- **THEN** the system emits one canonical page view with `page_state=auth_error` and one page error identifying `token_missing` and the attempted page ID

#### Scenario: Initial token is invalid
- **WHEN** token decoding fails validation
- **THEN** the system emits one canonical page view with `page_state=auth_error` and one page error identifying `token_invalid` and the attempted page ID

#### Scenario: Initial token is expired
- **WHEN** token decoding establishes that the supplied token expired before page initialization
- **THEN** the system emits one canonical page view with `page_state=auth_error` and one page error identifying `token_expired_initial` and the attempted page ID

#### Scenario: Valid page session expires at runtime
- **WHEN** runtime token-expiry handling invalidates a page that already emitted its ready page view
- **THEN** the system emits one page error identifying `token_expired_runtime` without emitting another initial page view

#### Scenario: Authenticated API request reports authentication failure
- **WHEN** a loaded page receives API error code 4001, 4002, or 4003, or HTTP status 401
- **THEN** the system emits a page-context authentication error containing the stable classification and available numeric code or status but no server message

#### Scenario: API request reports forbidden authorization
- **WHEN** a loaded page receives HTTP status 403 without an authentication error code
- **THEN** the system does not classify the failure as an authentication error

#### Scenario: The same rendered error effect repeats
- **WHEN** React repeats an effect for the same current authentication issue
- **THEN** that issue occurrence is emitted once, while a later issue after recovery can be emitted again

### Requirement: Product events describe semantic web-app outcomes
The system SHALL use the events `onboarding_progress`, `settings_saved`, `setting_saved`, `feature_action`, and `report_filter_changed` for meaningful web-app behavior. Event names and values SHALL be stable identifiers independent of visible or translated text, and generic delegated click tracking SHALL NOT be used.

#### Scenario: Settings submission succeeds
- **WHEN** a profile, chat, access, or intelligence settings request succeeds
- **THEN** the system emits one `settings_saved` result and one `setting_saved` event for each successfully persisted changed field using only its area, stable setting identifier, safe state, or approved enum option

#### Scenario: Settings submission fails
- **WHEN** a settings request returns an error
- **THEN** the system emits the failed `settings_saved` outcome with safe error metadata and does not emit successful per-field events

#### Scenario: Meaningful feature workflow occurs
- **WHEN** the user performs a help-guide, transfer, store, license, sponsorship, linked-profile, interface-language, or error-recovery action
- **THEN** the system emits the semantic intent or post-operation result with controlled feature, action, result, option, and source identifiers

#### Scenario: Report filter changes
- **WHEN** the user changes a supported usage or purchase report filter
- **THEN** the system emits `report_filter_changed` with controlled report, filter, and option identifiers

#### Scenario: Onboarding progresses
- **WHEN** the user reaches or acts on a meaningful onboarding step
- **THEN** the system emits `onboarding_progress` with a stable step, action, and only approved categorical or boolean choices

#### Scenario: Unsaved control changes
- **WHEN** the user changes a control without persisting or otherwise completing a meaningful action
- **THEN** the system does not report a settings outcome solely for that transient change

### Requirement: Analytics excludes sensitive and high-cardinality data
The system SHALL NOT send raw URLs or referrers; route user or chat identifiers; platform identifiers or handles; names, phone numbers, or user-entered text; JWTs, API keys, license keys, or connection keys; server messages; exact balances, amounts, prices, token counts, or costs; raw link destinations; pointer movement; continuous scroll; component renders; fetch activity; or backend usage telemetry. The implementation SHALL expose only typed, allowlisted event fields to application callers.

#### Scenario: Sensitive value is present in application state
- **WHEN** a tracked page or action has access to a sensitive or high-cardinality value
- **THEN** the analytics payload omits that value and uses only an approved stable category or presence/state identifier

#### Scenario: Application code attempts an unsupported payload
- **WHEN** a caller tries to pass a field outside the event contract
- **THEN** the analytics interface rejects it at development time or omits it before transmission

#### Scenario: Backend activity occurs
- **WHEN** assistant, provider, tool, runtime, token, or cost activity occurs outside a measured web-app interaction
- **THEN** this web application sends no analytics event for that backend activity

### Requirement: Analytics behavior is maintainable and verifiable
The repository SHALL document environment routing, identity behavior, the complete event and parameter registry, data exclusions, GA4 custom definitions, maintenance rules, and environment-specific verification. Verification SHALL prove both expected event delivery and the absence of unsafe or duplicate collection before production rollout.

#### Scenario: A new tracked interaction is introduced
- **WHEN** maintainers add or change an analytics event or parameter
- **THEN** they update the allowlisted contract, all affected instrumentation, the event registry, required GA4 custom definitions, and the relevant verification case together

#### Scenario: Staging is evaluated before production
- **WHEN** implementation is ready for deployment
- **THEN** the operator verifies the complete network and DebugView acceptance matrix on staging before approving production rollout

#### Scenario: Verification is recorded
- **WHEN** staging or production verification finishes
- **THEN** the repository records the date, environment, exercised scenarios, observed measurement ID, payload-safety result, duplicate-event result, and any intentional test traffic without claiming unperformed checks
