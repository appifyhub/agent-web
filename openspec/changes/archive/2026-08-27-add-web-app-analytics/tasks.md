# Apply protocol

Execute this checklist strictly in order. Present only the current task to the user.

- For `[AGENT]`, complete the repository work and its stated proof before advancing.
- For `[USER]`, give the user exact current UI/navigation steps, expected observations, and the single result to return; then stop and wait. Never preview or request a later user task at the same time.
- Related production and staging repetitions may be performed in one task. Unrelated Analytics UI, deployment, review, and verification activities must remain separate tasks.
- For `[REVIEW GATE]`, summarize the whole completed milestone and its evidence, request explicit approval, and stop. Do not start the next milestone before approval.
- Never mark a `[USER]` or `[REVIEW GATE]` task complete without the user's reported result. Never claim authenticated, staging, production, Analytics UI, Network, Realtime, or DebugView evidence that the agent did not observe.

## 1. Establish environments and GA4 properties

- [x] 1.1 [USER] Establish or identify the staging deployment, with one-task guidance appropriate to its hosting provider, and return the exact HTTPS hostname plus confirmation that the SPA and its `404.html` fallback are reachable there; do not proceed with a guessed hostname.
- [x] 1.2 [USER] Create one dedicated GA4 property and web stream for production and one for staging, then return the production and staging `G-...` measurement IDs and confirm Enhanced Measurement is disabled on both streams.
- [x] 1.3 [USER] Confirm Google Signals and ads-personalization data collection are off in both new properties and return the observed state for each property.
- [x] 1.4 [REVIEW GATE] Review the environment and GA4 prerequisite milestone, including the exact staging hostname, isolated property names, measurement IDs, and collection settings, and obtain explicit approval before adding analytics code.

## 2. Implement the safe analytics transport

- [x] 2.1 [AGENT] Define the exhaustive TypeScript analytics contract for canonical page states, page errors, onboarding, aggregate and per-field settings outcomes, feature actions, report filters, safe error diagnostics, eligibility properties, and every approved enum value, without exposing an arbitrary event-name or payload API.
- [x] 2.2 [AGENT] Implement exact hostname routing for the approved production and staging measurement IDs, with staging debug mode enabled, no fallback ID, and an early disabled path that creates no data layer, script, cookie, or collection request on local, preview, or unknown hosts.
- [x] 2.3 [AGENT] Implement one-time Google tag loading and canonical configuration with manual page views, blank or canonical referrers, disabled signals/personalization, context updates before events, and no reads of raw browser URL fields for analytics payloads.
- [x] 2.4 [AGENT] Implement analytics lifecycle and occurrence deduplication for disabled, pending, anonymous, and authenticated contexts, including identity replacement/clearing and active-error reset semantics that suppress StrictMode repeats without suppressing later real occurrences.
- [x] 2.5 [AGENT] Map only the valid JWT subject to reserved GA User-ID and map controlled account status, access mode, source platform, backend version, interface language, and permitted chat categories into their approved scopes.
- [x] 2.6 [AGENT] Run `bun run lint` and `bun run rebuild`, launch the actual local app, and prove through browser network inspection that an unrecognized local hostname neither loads `gtag.js` nor requests a GA collection endpoint and that existing page behavior remains intact.
- [x] 2.7 [REVIEW GATE] Review the complete transport and privacy boundary, including types, hostname isolation, canonical configuration, identity scope, deduplication, lint/rebuild output, and local disabled-host smoke evidence, and obtain explicit approval before page instrumentation.

## 3. Instrument canonical pages, not-found, and authentication errors

- [x] 3.1 [AGENT] Integrate canonical ready-state page views into `BaseSettingsPage` for chat, profile, access, intelligence, sponsorships, linked profiles, usage, purchases, help, and onboarding, ensuring chat navigation can count distinct logical routes while route IDs and token-query cleanup never become payloads or duplicate views.
- [x] 3.2 [AGENT] Add structured session authentication reasons for missing, invalid, initially expired, and runtime-expired tokens, and preserve optional numeric API code/status on `PageError` without exposing server messages to analytics.
- [x] 3.3 [AGENT] Emit attempted-page `auth_error` page views for initial authentication failures and deduplicated page-context `page_error` events for initial, runtime, and API authentication failures, classifying API codes 4001–4003 or HTTP 401 while leaving a standalone 403 as authorization.
- [x] 3.4 [AGENT] Instrument the wildcard `NotFoundPage` with canonical not-found `page_view` and `page_error` events plus a semantic return-to-landing recovery action, without sending the unmatched URL, referrer, or resolved link destination.
- [x] 3.5 [AGENT] Run `bun run lint` and `bun run rebuild`, exercise normal, missing-token, malformed-token, and not-found rendering locally, and verify that the new state handling does not change visible page behavior while local analytics remains disabled.
- [x] 3.6 [AGENT] Add a translated auth-required page matching the existing not-found surface, with “not signed in” copy and a “Go home” action, and update every editable language catalog without placeholders.
- [x] 3.7 [AGENT] Redirect `/` with history replacement to the exact external landing-page URL, render auth-required in place for missing/invalid/initially-expired sessions on known protected routes after token cleanup, preserve existing valid-session and onboarding behavior, and leave unknown routes on the public 404.
- [x] 3.8 [AGENT] Change `ErrorMessage` so every blocker uses an accessible centered modal with a full-viewport dark backdrop and blocked underlying interaction while non-blockers retain their existing position, timer, and dismissal behavior.
- [x] 3.9 [AGENT] Track auth-required recovery with a stable semantic feature action and confirm the new UI does not alter attempted-page auth-error, runtime-expiry, or not-found analytics identity rules.
- [x] 3.10 [AGENT] Run `bun run lint` and `bun run rebuild`, then browser-verify root redirection, translated auth-required and 404 precedence, blocker centering/backdrop behavior, non-blocker preservation where reproducible, responsive layout, and disabled local analytics.
- [x] 3.11 [AGENT] Reduce the 401 and 404 title scale consistently without changing their hierarchy, wrapping, card layout, or responsive centering, then verify both surfaces at desktop and mobile widths.
- [x] 3.12 [AGENT] Replace the auth-required description with the concise instruction requested by the user and update every editable language catalog with its equivalent.
- [x] 3.13 [AGENT] Audit every access/error and analytics string introduced by this change, replace product-derived “agent” or “Agent Web” text with `VITE_APP_NAME_SHORT`/`{botName}`, update all translations consistently, and verify no introduced product-name literal remains.
- [x] 3.14 [AGENT] Replace hard-coded analytics hostnames, measurement IDs, and staging debug selection with `VITE_APP_BASE_URL`, `VITE_ANALYTICS_MEASUREMENT_ID`, and `VITE_ANALYTICS_DEBUG_MODE`, update the production build workflow and environment example, and preserve exact-host disablement.
- [x] 3.15 [AGENT] Change the 404 description back to generic “your agent” language in every editable translation, remove its unused product-name interpolation, and verify the auth-required page still uses the configured bot name.
- [x] 3.16 [AGENT] Surface the sponsorship save error through the shell like every comparable page and wrap the add-sponsorship state in a settings card, then confirm lint and build.
- [x] 3.17 [USER] Configure the production GitHub Actions variables and staging Netlify environment variables for the analytics measurement ID and debug mode, then return the observed values for each deployment.
- [x] 3.18 [USER] Deploy the updated page/error/access milestone to the staging hostname using the established staging release procedure and return the deployed revision plus confirmation that normal routes and the Netlify 404 fallback load.
- [x] 3.19 [AGENT] Verify the unauthenticated staging surfaces by driving the deployed hostname: 401 auth-required page, recovery action, canonical not-found page, root redirect, and every resulting `/g/collect` payload; confirm the staging measurement ID, canonical locations, absent User-ID, forbidden-value absence, and no duplicate page views.
- [x] 3.20 [USER] Verify authenticated staging collection in browser Network and GA DebugView: ready page view, logical chat navigation, runtime-expiry modal where reproducible, and API authentication failure where reproducible; report event order, canonical fields, User-ID presence, and duplicate counts without sharing any real token.
- [x] 3.21 [REVIEW GATE] Review the page/error/access milestone and all staging observations, resolve or explicitly block any unverified required scenario, and obtain explicit approval before adding page-specific product events.

## 4. Instrument settings, onboarding, and language behavior

- [x] 4.1 [AGENT] Instrument profile-save completion with one aggregate result and successful per-field presence/state events while excluding names, biographies, prompts, image content, and all other entered values.
- [x] 4.2 [AGENT] Instrument chat-settings completion with one aggregate result and successful per-field controlled enum or numeric-option events while excluding chat IDs, user IDs, titles, and messages.
- [x] 4.3 [AGENT] Instrument access/API-key settings completion with provider and configured-state identifiers only, never key material or user-entered labels.
- [x] 4.4 [AGENT] Instrument intelligence settings completion with allowlisted preset, tool type, and stable tool identifiers only, using the post-API result boundary.
- [x] 4.5 [AGENT] Instrument meaningful onboarding step reach, navigation, skip, and completion transitions with stable step/action IDs and only reviewed categorical or boolean choices, never typed onboarding content.
- [x] 4.6 [AGENT] Instrument interface-language changes as a semantic completed feature action using stable language identifiers rather than translated labels.
- [x] 4.7 [AGENT] Run `bun run lint` and `bun run rebuild`, smoke the changed save and onboarding paths in the actual app where unauthenticated/local execution permits, and review every new call against the typed allowlist and sensitive-data exclusions.
- [x] 4.8 [REVIEW GATE] Review all settings, onboarding, and language event boundaries and parameter inventories with their lint/rebuild evidence, and obtain explicit approval before instrumenting the remaining feature workflows.

## 5. Instrument feature workflows and reports

- [x] 5.1 [AGENT] Instrument credit-transfer open, cancel, success, and failure actions with a safe platform category and error classification only, excluding handles, notes, amounts, balances, and server messages.
- [x] 5.2 [AGENT] Instrument store-picker and product-link intent with reviewed product identifiers and source areas only, excluding resolved URLs and price data.
- [x] 5.3 [AGENT] Instrument license-binding intent and result with controlled variant and error fields only, never the license key.
- [x] 5.4 [AGENT] Instrument sponsorship add, remove, unlink, success, and failure boundaries with a safe platform category only, excluding handles and account identifiers.
- [x] 5.5 [AGENT] Instrument linked-profile key view, copy, share, and regeneration plus connection results with safe variant/result fields only, excluding every key, handle, URL, and profile identifier.
- [x] 5.6 [AGENT] Instrument help-guide opens and approved destinations with semantic identifiers only, excluding raw outbound URLs and visible copy.
- [x] 5.7 [AGENT] Instrument usage-report filter changes with controlled report, filter, and option identifiers, without reporting underlying usage records, token counts, costs, or backend activity.
- [x] 5.8 [AGENT] Instrument purchase-report filter changes and approved purchase-page intents with controlled identifiers, without exact prices, balances, costs, or raw product links.
- [x] 5.9 [AGENT] Run `bun run lint` and `bun run rebuild`, exercise every locally reachable changed surface in the actual app, and perform a source-level payload review proving each analytics call uses only its typed safe contract.
- [x] 5.10 [REVIEW GATE] Review the complete product-event inventory, outcome boundaries, explicit non-events, and validation evidence, and obtain explicit approval before full staging QA.

## 6. Configure definitions and complete staging acceptance

- [x] 6.1 [USER] Create the complete matching set of event-scoped dimensions, the `changed_field_count` event-scoped metric, and user-scoped dimensions in both GA4 properties exactly as registered in `design.md`; do not create a custom definition for reserved User-ID or built-in page fields, and return confirmation of each scope/parameter pair and creation date.
- [x] 6.2 [USER] Deploy the complete instrumented build to staging and return the deployed revision and successful page-load confirmation as a deployment-only activity.
- [x] 6.3 [USER] Verify successful settings events for profile, chat, access, and intelligence in staging DebugView, checking the aggregate `settings_saved` event and safe per-field `setting_saved` events without sharing entered values or credentials.
- [x] 6.4 [USER] Verify onboarding progress and completion in staging DebugView using only stable step and choice IDs.
- [x] 6.5 [USER] Verify the interface-language event in staging DebugView using the selected ISO code and current page ID rather than translated labels.
- [x] 6.6 [USER] Verify usage and purchase workflow events in staging DebugView: credit transfer, store/product intent, license binding, and report-filter changes, without sharing handles, amounts, notes, keys, prices, or product URLs.
- [x] 6.7 [USER] Verify sponsorship and linked-profile workflow events in staging DebugView: add/remove/unlink, key view/copy/share/regenerate, and connection outcomes, without sharing handles, profile IDs, keys, or links.
- [x] 6.8 [USER] Verify help-guide view and destination events in staging DebugView using stable guide/destination IDs.
- [x] 6.9 [USER] Perform the separate staging payload-safety and duplicate audit in browser Network: inspect `/g/collect` requests for the staging measurement ID, canonical location/referrer/title, correct User-ID rules, forbidden-value absence, no Enhanced Measurement events, and one-event-per-occurrence behavior; return a sanitized pass/fail matrix rather than a HAR containing tokens.
- [x] 6.10 [AGENT] Reconcile the reported staging results against the specification, fix every confirmed repository defect, request only one focused recheck at a time if a fix changes observed behavior, and rerun `bun run lint` and `bun run rebuild`.
- [x] 6.11 [REVIEW GATE] Review the full staging acceptance package—deployment revision, DebugView event matrix, Network safety matrix, duplicate results, custom definitions, and fixes—and require explicit production-rollout approval.

## 7. Create web-app analytics reports

- [x] 7.1 [USER] Confirm that the newly registered custom definitions are selectable in GA Explorations for both properties, waiting for GA processing when necessary, and return only the missing or available definition status.
- [x] 7.2 [USER] Create equivalent production and staging page-engagement Explorations using `page_id`, `page_state`, account eligibility properties, interface language, active users, and event count, with filters that keep the report explicitly scoped to web-app page reach and authentication state.

## 8. Confirm production readiness

- [x] 8.1 [AGENT] Perform the final implementation review against every OpenSpec scenario, confirm staging/prod isolation and rollback behavior, run `bun run lint` and `bun run rebuild`, and report any scenario that still lacks evidence rather than narrowing acceptance.
- [x] 8.2 [REVIEW GATE] Present the complete production-readiness evidence and unresolved-risk list, obtain explicit release approval, and stop before asking the user to deploy.

## 9. Roll out and verify production

- [x] 9.1 [USER] Deploy the explicitly approved revision to production using the existing release procedure and return the deployed revision plus successful normal-page and `404.html` load confirmation; do not combine deployment with analytics verification.
- [x] 9.2 [USER] Verify production authenticated collection as one focused activity using browser Network and GA Realtime or an operator-enabled Debugger session: confirm the production measurement ID, canonical ready page, reserved User-ID behavior, and one representative event from each implemented product-event family without sharing credentials or user content.
- [x] 9.3 [USER] Verify production not-found and authentication-error collection as a separate page/error activity, confirming canonical page context, safe error classifications, expected anonymous/authenticated identity behavior, and no unmatched URL, token, route identifier, or server message.
- [x] 9.4 [USER] Perform the final production payload-safety and duplicate audit as a separate Network activity, confirming canonical URL fields, forbidden-value absence, no automatic Enhanced Measurement events, and no duplicate manual events, and return a sanitized matrix rather than a token-bearing HAR.
- [x] 9.5 [AGENT] Resolve every confirmed production defect before acceptance, disable the affected environment mapping immediately if unsafe collection is observed, and present only the single focused user re-verification needed for each fix.
- [x] 9.6 [AGENT] Reconcile the final production evidence with the OpenSpec scenarios, then run `bun run lint` and `bun run rebuild` one final time.
- [x] 9.7 [REVIEW GATE] Review the final production evidence, report configuration, and validation output, obtain explicit acceptance, and leave no unverified scenario marked as complete.
