## Why

The authenticated settings web app currently cannot show which pages, settings, and workflows users engage with or where navigation and authentication prevent use. It needs privacy-bounded product analytics that never exposes tokens, route identifiers, credentials, user content, or raw URLs while still making normal pages, the public not-found page, and page-context authentication failures measurable.

## What Changes

- Add a dedicated GA4 integration for this web app, using normal analytics cookies without an in-app consent interface because consent is established during signup on the landing page.
- Route production and staging to isolated GA4 properties by exact hostname; keep local, preview, and unknown hosts disabled.
- Disable automatic page and interaction collection and emit canonical page views only after the application has removed any token query and resolved a safe page state.
- Associate valid authenticated sessions with the opaque JWT subject through GA4's reserved User-ID and report only low-cardinality eligibility context.
- Track web-app behavior through a compact semantic event taxonomy covering page views, page-context errors, onboarding progress, persisted settings, meaningful feature actions, and report filters.
- Track the public not-found page without its unmatched URL and track initial or runtime authentication failures together with the affected canonical page.
- Replace the current missing-session error treatment on known protected routes with a translated auth-required page that matches the not-found page and returns to the landing page.
- Redirect the root route to the same external landing-page destination regardless of session state while preserving the public not-found page for unknown routes.
- Present every critical blocker error as an accessible centered modal over a viewport-covering dark backdrop while preserving the current timed treatment for non-critical errors.
- Explicitly exclude backend telemetry and any claim about assistant or tool usage; this change measures only behavior within this repository's web application.
- Add technical tracking documentation and a staged operating procedure that guides the operator through GA4 property setup, custom definitions, staging verification, production rollout, and final verification one cohesive user task at a time.

## Capabilities

### New Capabilities

- `web-app-analytics`: Safe environment routing, identity handling, canonical page and error measurement, semantic product events, data exclusions, and verifiable analytics operations for the authenticated web app.
- `authenticated-page-access`: Root routing, signed-out protected-page behavior, public not-found precedence, and critical-error presentation for the settings web app.

### Modified Capabilities

None.

## Impact

- Affects the application router and not-found page, authenticated page/session orchestration, shared error presentation, all translation catalogs, API-error metadata used for authentication classification, and page-specific settings and feature workflows.
- Adds a browser analytics module and GA4 tag loading, with no backend telemetry or API contract change.
- Requires isolated production and staging GA4 properties/web streams, an established staging hostname, event-scoped and user-scoped custom definitions, and operator access to GA4 Realtime/DebugView.
- Requires production and staging measurement IDs before analytics can be enabled on either recognized host.
- Adds repository tracking documentation and manual staging/production verification records.
