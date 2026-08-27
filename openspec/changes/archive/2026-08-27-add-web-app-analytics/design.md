## Context

See `proposal.md` for motivation and `specs/web-app-analytics/spec.md` for the behavioral contract.

The application is a React single-page app deployed to GitHub Pages. `src/App.tsx` defines the settings routes and a standalone wildcard `NotFoundPage`; the production build copies `index.html` to `dist/404.html`, so an unknown full-load URL still reaches the React not-found surface. Authenticated routes pass a stable `SettingsPage` identifier through `BaseSettingsPage` and rely on `usePageSession` for token and account state.

A JWT can arrive through `?token=`, is moved to session storage, and is removed from the URL by an effect. Settings routes contain raw user and chat identifiers. Automatic GA URL collection would therefore expose credentials or identifiers even if application-defined event parameters were otherwise safe.

`usePageSession` currently distinguishes missing, expired, and invalid initial tokens only through translated display errors and also handles runtime expiry. API authentication failures can be represented by backend error codes 4001–4003 or HTTP 401, but `PageError.fromApiError` currently discards numeric code/status metadata. HTTP 403 is not sufficient evidence of an authentication failure.

There is no analytics code or dependency today. Production is deployed to `web.agent.appifyhub.com` through the `release`-branch GitHub Pages workflow. Staging is deployed through Netlify for pull requests into `release` at `staging.web.agent.appifyhub.com`.

## Goals / Non-Goals

**Goals:**

- Make authenticated web-app page reach, saved settings, meaningful workflows, not-found navigation, and page-context authentication failures measurable.
- Guarantee that GA receives canonical application context rather than browser-derived URLs or user-controlled values.
- Keep event contracts small, typed, stable, and useful for eligibility-aware web-app adoption analysis.
- Make staging and production setup and proof reproducible by an operator who performs one cohesive manual task at a time.

**Non-Goals:**

- Backend, assistant, provider, or tool-usage telemetry, and cross-system analytics joins.
- Marketing-site analytics or changes to the signup consent flow.
- An in-app cookie banner, Consent Mode, consent persistence, or analytics revocation controls.
- Session replay, heat maps, generic click capture, scroll tracking, or automatic outbound-link tracking.
- A new automated test framework solely for analytics; the repository currently has none.
- Using event absence to infer configuration that may have existed before analytics was deployed.

## Decisions

### Use direct GA4 integration with an allowlisted application API

Use the Google tag directly rather than adding a general analytics wrapper package. A small application-owned module will own environment selection, script loading, canonical context, identity, deduplication, and event serialization. Application code will call dedicated typed operations such as page view, page error, settings result, field saved, feature action, onboarding progress, and report filter change; it will not receive a general `track(name, arbitraryPayload)` escape hatch.

This keeps the integration dependency-free and makes forbidden fields difficult to introduce. A third-party React analytics wrapper was rejected because it would add an abstraction without removing the need for custom URL, identity, and payload safety controls.

### Select each deployment’s GA property by environment

Each build receives `VITE_APP_BASE_URL`, `VITE_ANALYTICS_MEASUREMENT_ID`, and `VITE_ANALYTICS_DEBUG_MODE`. At runtime the analytics module parses the configured app URL and requires its hostname to equal `window.location.hostname` exactly before creating `dataLayer`, loading `gtag.js`, or sending a request. A missing/invalid measurement ID, malformed app URL, or mismatched local/preview hostname disables analytics without a fallback.

Production supplies its measurement ID with debug mode off through GitHub Actions repository variables. Staging supplies its measurement ID with debug mode on through Netlify environment variables so events appear in DebugView. Measurement IDs are public routing identifiers rather than secrets; environment configuration avoids coupling reusable source code to deployment-specific product hostnames and IDs while retaining exact-host isolation.

### Configure a canonical context before loading the tag

The first GA configuration call will include:

- `send_page_view: false`;
- an allowlisted canonical `page_location` derived from `page_id`;
- a stable canonical `page_title`;
- a blank or previously tracked canonical `page_referrer`;
- `allow_google_signals: false`;
- `allow_ad_personalization_signals: false`;
- the reserved `user_id` only when authenticated context is valid;
- allowlisted user properties only when available.

The Google tag is loaded once, only after that configuration has been queued. Every logical page transition updates the global canonical context before any page or product event. Application code may inspect the current hostname to select an environment and may use raw route state internally to distinguish navigations, but it never serializes raw `location`, path, query, fragment, or referrer values.

Enhanced Measurement history changes, outbound clicks, form interactions, scrolls, and similar automatic features must also be disabled in both GA4 web streams. Code-side manual page views alone do not prevent property-side Enhanced Measurement duplicates.

### Model analytics bootstrap as safe page states

Analytics has four relevant states:

```text
disabled
  unknown/local host

pending_context
  recognized host, but token query or page classification is unresolved

configured_anonymous
  public not-found or initial authentication-error context

configured_authenticated
  valid JWT subject and account context
```

The standalone not-found page can enter `configured_anonymous` without session loading. A routed page with an invalid or expired query token remains pending until the query is removed, then configures anonymously for the canonical attempted page. A valid routed page configures with User-ID only after the session and eligibility properties are available. Runtime expiry clears the authenticated identity for subsequent events after reporting the expiry against the page context in which it occurred.

This state model replaces the earlier simplifying assumption that all measurable pages are authenticated: the repository proves that the wildcard not-found page is public, and authentication errors must be observable before a valid session exists.

### Keep page context canonical and separate from navigation identity

Define an exhaustive mapping from stable page IDs to virtual locations and titles. The IDs cover `chat`, `profile`, `access`, `intelligence`, `sponsorships`, `linked_profiles`, `usage`, `purchases`, `help`, `onboarding`, and `not_found`. Virtual locations use a non-sensitive namespace such as `/app/<page-id>` and never mirror parameterized router paths.

A page-view occurrence is keyed internally by logical navigation identity plus `page_id` and `page_state`. This allows two different chat routes to count as two canonical chat views while token-query cleanup and React StrictMode repetition do not duplicate an occurrence. Internal navigation keys are never emitted.

The page states are:

- `ready` for a resolved authenticated surface;
- `auth_error` when an authenticated route cannot establish or retain authentication during initial resolution;
- `not_found` for the wildcard page.

### Treat not-found as a page plus a page-context error

`NotFoundPage` emits:

1. `page_view` with `page_id=not_found` and `page_state=not_found`;
2. `page_error` with `page_id=not_found`, `error_category=not_found`, and `error_code=route_not_found`.

Neither event includes the requested path, query, referrer, or destination. A direct full-load 404 has no reserved User-ID. An in-app transition may retain a previously established valid User-ID. The return-to-landing control emits a manual `feature_action` using stable recovery and destination identifiers, not `link_url`.

Tracking only an error event was rejected because a canonical page view is needed to include 404s in page reach and recovery funnels. Tracking the actual unmatched route was rejected because it can contain identifiers, tokens, user input, or arbitrary high-cardinality content.

### Keep root, auth-required, and not-found entry states distinct

The root route does not select an authenticated destination. A small root redirect component calls `window.location.replace(VITE_LANDING_PAGE_URL)` so both logged-in and logged-out visits leave the web app for the same destination as “Go home.” It never forwards the root query or fragment.

Known protected routes distinguish initial authentication failure from runtime expiry. Missing, invalid, or initially expired authentication renders a translated `AuthRequiredPage` at the attempted sanitized URL. The page uses “You’re not signed in” language and the existing public-error-page visual structure; its “Go home” link targets `VITE_LANDING_PAGE_URL`. Keeping the attempted route avoids redirect state and preserves its stable `page_id` for the existing `auth_error` page view and `page_error`. The recovery link emits `feature_action` with `feature_id=auth_required_recovery`.

The wildcard route remains public and renders `NotFoundPage` regardless of session state. This precedence keeps unknown routes semantically correct and preserves anonymous 404 measurement.

### Present blocker errors as true modal interruptions

`ErrorMessage` branches only on its existing `isBlocker` contract. Non-blockers retain their current fixed notification position, progress timer, and five-second dismissal. Blockers render through the existing Radix dialog primitives with a full-viewport dark overlay, centered alert content, no close affordance, focus containment, outside-click prevention, and Escape prevention. This preserves copy and alert styling while preventing interaction with the page beneath it.

Initial authentication errors no longer use `ErrorMessage`; they render `AuthRequiredPage`. Runtime token expiry and other blocker page errors remain on the current page and receive the centered modal treatment.

### Introduce structured authentication issue metadata

Extend the page-session result with a safe discriminated authentication-reason value separate from translated display copy:

- `token_missing`;
- `token_invalid`;
- `token_expired_initial`;
- `token_expired_runtime`;
- `api_authentication_failed`.

Preserve optional numeric API error code and HTTP status on `PageError`, while keeping the server message available only to the existing UI error rendering path. The analytics classifier receives only the safe reason and numeric metadata. API codes 4001–4003 and HTTP 401 classify as authentication; HTTP 403 alone remains authorization and is not reclassified.

Initial authentication failure emits a canonical attempted-page view with `page_state=auth_error`, followed by `page_error`. Runtime expiry and API authentication failure occur after the ready page view and therefore emit only `page_error` against the current page.

The analytics module maintains the currently active page-error fingerprint by logical page occurrence. Re-rendering or StrictMode replay of the same active issue is ignored. Clearing the issue removes the active fingerprint, so a later occurrence can be reported again. A permanent process-wide set was rejected because it would hide legitimate recurring errors.

### Use eligibility context without user-provided properties

Set the JWT subject only as GA4's reserved User-ID. Never register it as a custom definition or repeat it in payload parameters. Configure four controlled user properties:

- `account_status`: `waitlisted`, `invited`, or `active`;
- `access_mode`: `sponsored`, `keys`, `credits`, `mixed`, or `none`;
- `source_platform`: controlled platform enum;
- `backend_version`: controlled version value.

These properties make web-app non-use interpretable because pages and controls are conditionally available. `interface_language` remains event-scoped. Chat page views may add controlled `chat_platform`, `chat_kind`, `chat_role`, and `chat_ownership` values, never chat identity or title.

The JWT subject can change when linked-profile merging selects an older surviving profile. GA will not retroactively merge the prior User-ID history; this is documented rather than hidden behind another identity layer because the user explicitly selected the JWT subject.

### Emit semantic events at outcome boundaries

Use this fixed taxonomy:

| Event | Boundary | Core fields |
| --- | --- | --- |
| `page_view` | Resolved logical page occurrence | `page_id`, `page_state`, `interface_language` |
| `page_error` | New active not-found or authentication issue | `page_id`, `error_category`, `error_code`, optional numeric diagnostics |
| `onboarding_progress` | Meaningful step or transition | `step_id`, `action`, approved choice flags |
| `settings_saved` | Completed settings request | `area`, `result`, `changed_field_count`, safe error metadata |
| `setting_saved` | Each successfully persisted changed field | `area`, `setting_id`, safe `state` or `option_id` |
| `feature_action` | Meaningful intent or completed feature operation | `feature_id`, `action`, `result`, `option_id`, `source_area`, safe error metadata |
| `report_filter_changed` | Supported usage/purchase filter change | `report_id`, `filter_id`, `option_id` |

Settings events are emitted after the API result, not on every control change. A successful multi-field save emits one aggregate result and one per-field event so GA can report field adoption without arrays. A failed save emits the aggregate failure only.

Feature instrumentation covers help-guide destinations; transfer open/cancel/result; store picker and product intent; license binding result; sponsorship add/remove/unlink; linked-profile key view/copy/share/regenerate and connection result; interface-language change; and not-found or auth-required recovery. Stable products, providers, tools, platforms, presets, filters, and variants may be emitted only from reviewed allowlists. Exact transfer values, balances, keys, handles, notes, resolved URLs, and visible text are never emitted.

### Register only reportable custom definitions

Create the same definitions in both GA4 properties after the final parameter contract exists.

Event-scoped custom dimensions:

- `page_id`, `page_state`, `interface_language`;
- `error_category`, `error_code`, `api_error_code`, `http_status`;
- `chat_platform`, `chat_kind`, `chat_role`, `chat_ownership`;
- `step_id`, `action`;
- `area`, `setting_id`, `state`, `option_id`;
- `feature_id`, `result`, `source_area`;
- `report_id`, `filter_id`.

Event-scoped custom metric:

- `changed_field_count`.

User-scoped custom dimensions:

- `account_status`, `access_mode`, `source_platform`, `backend_version`.

`user_id`, `page_location`, `page_title`, and event name are built-in GA fields and must not be registered as custom definitions. Definitions are property-scoped and non-retroactive, so staging and production must be configured consistently before their acceptance traffic is treated as reportable data.

### Keep analytics administration separate from application implementation

Rewrite the imported root `TRACKING.md` for this web app. It will document environment behavior, the external signup-consent boundary, identity, canonical pages, event and parameter registry, explicit exclusions, custom definitions, maintenance steps, and verification records. It will not carry over landing-page section tracking, cookie-banner mechanics, measurement IDs, or old verification claims.

GA4 property creation, stream settings, custom definitions, report configuration, staging checks, and production checks remain operator actions because they require authenticated Analytics UI access and real deployed sessions. Code, lint, build, and disabled-host browser smoke checks remain agent actions.

### Enforce one-task-at-a-time collaboration

`tasks.md` uses three explicit task types:

- `[AGENT]`: repository work the implementation agent completes and verifies;
- `[USER]`: one cohesive Analytics UI, deployment, or authenticated browser activity presented with exact inputs, clicks, expected observations, and requested output;
- `[REVIEW GATE]`: a mandatory full-milestone review.

During apply, tasks are executed strictly in order. When a `[USER]` task becomes current, the agent presents only that task, stops, and waits for its result; it does not preview or request outputs for later tasks. Related production and staging repetitions may share one task, but unrelated activities never do. At every `[REVIEW GATE]`, the agent summarizes the complete milestone, identifies its evidence, requests explicit approval, and stops before beginning the next milestone.

This protocol is part of the change because property setup and authenticated verification cannot be performed or truthfully claimed by the implementation agent.

### Keep reporting proportional to current needs

Both GA properties have one page-engagement Exploration using `page_id`, `page_state`, eligible-user properties, interface language, active users, and event count. Custom definitions remain available for ad hoc settings, feature, and navigation analysis, but no additional dashboards are part of this change.

The page-engagement report describes web-app reach only. It does not claim authoritative assistant, provider, or backend tool use.

## Risks / Trade-offs

- [Automatic GA events expose raw route or token data] → Queue a canonical config before loading the tag, disable code-side automatic page views, disable property-side Enhanced Measurement interactions, and inspect every staging collection request before production.
- [The public 404 is not authenticated] → Track it anonymously with canonical context; assign User-ID only if a valid app session was already configured.
- [Authentication failures duplicate under StrictMode] → Deduplicate the active page/error occurrence and reset deduplication only on an actual state transition or new logical navigation.
- [Deduplication hides recurring failures] → Track active lifecycle state rather than keeping a permanent fingerprint set.
- [Root or auth-required routing accidentally forwards token data] → Redirect root with a fixed external target, render auth-required in place only after token-query cleanup, and never derive analytics context from the raw URL.
- [Production and staging configuration drift] → Create and verify the same stream settings and custom definitions in one paired operator task where the activities are equivalent.
- [Custom definitions do not backfill] → Configure them before final acceptance traffic and record their creation date.
- [JWT-subject identity changes after profile merge] → Document the discontinuity and never invent a client-derived linking identifier.
- [Ad blockers reduce measured totals] → Treat GA as directional web-app usage evidence and never present counts as a billing or authoritative audit source.
- [Event absence is misread as non-use] → Segment by eligibility and distinguish observed web interactions from current configuration or backend behavior.
- [The external signup disclosure changes independently] → Document that signup is the consent boundary and keep consent-flow changes explicitly outside this repository's implementation.

## Migration Plan

1. Establish the staging deployment and exact hostname.
2. Create isolated production and staging GA4 properties/web streams, record their measurement IDs, and disable unwanted automatic/signals settings.
3. Implement the typed analytics transport, exact hostname routing, canonical bootstrap, and authenticated identity handling while all unrecognized hosts remain disabled.
4. Add root/auth-required routing, critical-error presentation, canonical normal-page, not-found, and authentication-error instrumentation; lint, build, and smoke-check the disabled local path.
5. Add page-specific semantic events.
6. Deploy to staging and verify the full network and DebugView matrix, including forbidden-field inspection and duplicate detection.
7. Register matching custom definitions and create the page-engagement Exploration in both properties.
8. Pass the staging review gate, deploy to production, and repeat the production smoke matrix.

Rollback removes or disables the recognized-host mapping, which prevents tag loading and collection without changing page behavior. If unsafe payloads are observed, disable the affected environment immediately before diagnosing individual events.

