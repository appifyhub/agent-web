## Purpose

Define deterministic entry behavior for the web app root, protected settings routes, unknown routes, and critical runtime errors while preserving the existing application surfaces for valid sessions.

## ADDED Requirements

### Requirement: The root route always returns to the landing page
The system SHALL redirect `/` to the exact external `VITE_LANDING_PAGE_URL` destination used by public error-page “Go home” actions, regardless of whether session storage contains a token. The redirect SHALL replace the root history entry and SHALL NOT forward the root query string or fragment.

#### Scenario: Logged-out visitor opens the root
- **WHEN** a visitor without a valid session opens `/`
- **THEN** the browser replaces the root entry with `VITE_LANDING_PAGE_URL`

#### Scenario: Logged-in visitor opens the root
- **WHEN** a visitor with a valid stored session opens `/`
- **THEN** the browser replaces the root entry with the same `VITE_LANDING_PAGE_URL` rather than entering a settings page

#### Scenario: Root contains query data
- **WHEN** `/` contains a query string or fragment
- **THEN** the redirect uses only the configured landing-page URL and does not forward those values

### Requirement: Known protected routes show an auth-required page without a valid initial session
The system SHALL render a standalone translated auth-required page when a known settings route resolves a missing token, invalid token, or token that was already expired on arrival. The page SHALL remain at the attempted protected URL, SHALL use visible “not signed in” language rather than “403 Forbidden,” and SHALL provide a “Go home” action to `VITE_LANDING_PAGE_URL`.

#### Scenario: Protected route has no token
- **WHEN** a visitor opens a known settings route without a stored or query token
- **THEN** the auth-required page replaces the settings shell at the attempted URL

#### Scenario: Protected route has an invalid token
- **WHEN** a known settings route receives a token that cannot establish a valid initial session
- **THEN** the application removes the token query and then renders the auth-required page at the sanitized attempted URL

#### Scenario: Protected route has an initially expired token
- **WHEN** a known settings route receives a token that expired before page initialization
- **THEN** the application removes the token query and then renders the auth-required page rather than the critical runtime-error overlay

#### Scenario: Visitor returns home
- **WHEN** the visitor activates “Go home” on the auth-required page
- **THEN** the browser navigates to `VITE_LANDING_PAGE_URL`

### Requirement: Valid sessions preserve existing page behavior
The system SHALL continue to render the requested protected settings page for a valid initial session, subject only to the existing onboarding/policy redirects and page-specific eligibility behavior.

#### Scenario: Valid active session opens a settings page
- **WHEN** a valid session with accepted policies opens a known settings route
- **THEN** the requested page renders with its existing behavior

#### Scenario: Valid session still requires onboarding
- **WHEN** a valid session without accepted policies opens a protected route other than onboarding
- **THEN** the existing onboarding redirect remains in effect

### Requirement: Unknown routes remain not-found regardless of authentication
The wildcard route SHALL continue to render the public not-found page before any protected-page authentication treatment. It SHALL not become an auth-required page merely because no valid session exists.

#### Scenario: Logged-out visitor opens an unknown route
- **WHEN** a visitor without a valid session opens an unmatched URL
- **THEN** the public not-found page renders

#### Scenario: Logged-in visitor opens an unknown route
- **WHEN** a visitor with a valid session opens an unmatched URL
- **THEN** the same public not-found page renders

### Requirement: Critical runtime errors block the full viewport
The system SHALL present every critical `PageError.isBlocker` error as a modal alert centered in the viewport over a dark backdrop covering the complete visible surface. The modal SHALL prevent pointer and keyboard interaction with the underlying page, manage focus accessibly, remain visible until its blocking condition resolves, and preserve the existing error copy.

#### Scenario: Session expires after a page has rendered
- **WHEN** a valid page session expires at runtime
- **THEN** the current page remains beneath a full-viewport dark backdrop and the critical error appears in the exact viewport center

#### Scenario: Another critical page error occurs
- **WHEN** any page supplies a blocker `PageError`
- **THEN** it uses the same centered modal treatment rather than the non-blocking notification position

#### Scenario: Critical error is active on a small viewport
- **WHEN** a blocker error appears on a mobile-sized viewport
- **THEN** the backdrop still covers the full viewport and the error card remains centered with safe edge spacing

### Requirement: Non-critical error behavior remains unchanged
The system SHALL retain the current position, visual treatment, progress timer, five-second auto-dismissal, and underlying-page interactivity for errors whose `isBlocker` value is false.

#### Scenario: Non-blocking error appears
- **WHEN** a page supplies a dismissible non-blocker error
- **THEN** it appears in the existing notification position, counts down, and dismisses without a modal backdrop
