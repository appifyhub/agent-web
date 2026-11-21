# Spec Delta

## Purpose

Defines the authenticated Command Line settings page, where users learn about the agent's command-line client, install it, obtain their connect command, and revoke all CLI access from the web app.

## ADDED Requirements

### Requirement: The Command Line page is a language-scoped authenticated settings route
The system SHALL serve the Command Line page at `/:lang_iso_code/user/:user_id/command-line` inside the standard settings shell, applying the same session, token-query cleanup, auth-required, expiry, and onboarding/policy behavior as every other user settings page.

#### Scenario: Valid session opens the page
- **WHEN** a user with a valid session and accepted policies opens `/en/user/<id>/command-line`
- **THEN** the Command Line page renders in the settings shell with its translated page title

#### Scenario: Missing or invalid session
- **WHEN** a visitor without a valid initial session opens the route
- **THEN** the standard auth-required page renders at that URL and no backend request for the page is made

#### Scenario: Policies not accepted
- **WHEN** a valid session whose policies are not accepted opens the route
- **THEN** the existing onboarding redirect takes effect

#### Scenario: Interface language is switched
- **WHEN** the user changes the interface language while on the page
- **THEN** the page reloads at the same route under the new language code with all its text translated

### Requirement: The page is reachable from the settings navigation
The system SHALL list "Command Line" in the settings navigation (desktop sidebar and mobile drawer) for sessions that can navigate to user pages, mark it as current while on the page, and not list it on locked shells such as onboarding.

#### Scenario: Navigation entry is shown
- **WHEN** an unlocked settings page renders with a known user
- **THEN** the navigation contains a "Command Line" entry that opens the page for that user in the current interface language

#### Scenario: Entry is highlighted on the page
- **WHEN** the user is on the Command Line page
- **THEN** its navigation entry is marked as the current page and the shell header shows its section label

#### Scenario: Locked shell
- **WHEN** the shell is locked (for example during onboarding)
- **THEN** the Command Line entry is not offered

#### Scenario: Preserved query parameters
- **WHEN** the user navigates to the page from another settings page
- **THEN** non-token search parameters are preserved and the token parameter is not added to the URL

### Requirement: The page explains the CLI and how to install it per operating system
The system SHALL explain in plain language what the command-line client is, using the product name from build configuration and never the word "bot", and SHALL present installation instructions for macOS, Linux, and Windows, with the operating system matching the visitor preselected.

#### Scenario: Visitor on macOS
- **WHEN** the page loads in a browser identifying as macOS
- **THEN** the macOS instructions (Homebrew) are preselected, and the other operating systems remain selectable

#### Scenario: Visitor on Linux
- **WHEN** the user selects Linux
- **THEN** the page shows the Homebrew option and the `.deb` and `.rpm` package options

#### Scenario: Visitor on Windows
- **WHEN** the user selects Windows
- **THEN** the page shows the Scoop instructions

#### Scenario: Unrecognized operating system
- **WHEN** the browser operating system cannot be determined
- **THEN** a default operating system is preselected and all three remain selectable

#### Scenario: Short alias on macOS and Linux
- **WHEN** the macOS or Linux instructions are shown
- **THEN** they mention that the install also provides the `@abot` alias; Windows instructions use `abot` without an alias-availability warning

#### Scenario: Releases page
- **WHEN** the user looks for a manual download
- **THEN** a link to `https://github.com/appifyhub/agent-cli/releases` is offered that opens in a new tab without leaking the opener
- **AND** the download link precedes package-install commands, with the Linux instructions explaining that the package must first be downloaded into the current directory

#### Scenario: Verifying the installation
- **WHEN** installation instructions are shown
- **THEN** a final step tells the user how to verify the install by running `abot --version`

### Requirement: Install and connect commands are individually copyable
The system SHALL render every shell command as monospaced text with its own copy control that places exactly that command text on the clipboard, confirms success with the shared "Copied" notification, and disables or reports failure when copying is impossible.

#### Scenario: Copying an install command
- **WHEN** the user activates the copy control next to an install command
- **THEN** the clipboard contains exactly that command and the "Copied" notification appears

#### Scenario: Clipboard unavailable
- **WHEN** the browser cannot write to the clipboard
- **THEN** the page reports a translated copy failure and disables the affected copy controls

#### Scenario: Selecting text manually
- **WHEN** the user selects a command by hand
- **THEN** the text selects as a single unit without any decorative characters being copied

### Requirement: The page shows the user's connect key and a ready-to-run connect command
The system SHALL load the user's current connect key when the session is ready and display it in `XXXX-XXXX-XXXX` form together with the command `abot connect XXXX-XXXX-XXXX`, each with a copy control, and SHALL state that the key is secret and changes after each successful CLI connect.

#### Scenario: Key loads
- **WHEN** the session is ready and the connect key is fetched
- **THEN** the formatted key and the matching `abot connect` command are displayed

#### Scenario: Copy command
- **WHEN** the user copies the connect command
- **THEN** the clipboard contains `abot connect ` followed by the displayed key

#### Scenario: Key rotation notice
- **WHEN** the connect section is visible
- **THEN** it tells the user that the key changes after each successful connect, that it must not be shared, and that the user can generate a new one at any time

#### Scenario: Regenerating the key
- **WHEN** the user activates regenerate
- **THEN** a new key is requested, the displayed key and command update to it, and a translated success notification appears

#### Scenario: Key cannot be loaded
- **WHEN** fetching the connect key fails
- **THEN** a blocking translated error is shown through the standard error component and no key or connect command is displayed

#### Scenario: Regeneration fails
- **WHEN** regenerating the key fails
- **THEN** a non-blocking translated error is shown, the previous key remains displayed, and the control becomes usable again

### Requirement: Users can revoke all CLI access after explicit confirmation
The system SHALL offer a "Revoke all CLI access" action that opens a confirmation explaining that every connected CLI on every machine will lose access and must be reconnected, and SHALL only call the backend after the user confirms. The wording SHALL NOT mention token generations, expiry times, or other internal mechanics.

#### Scenario: Opening the confirmation
- **WHEN** the user activates "Revoke all CLI access"
- **THEN** a confirmation appears with a cancel option and a destructive confirm option, and no backend request is made yet

#### Scenario: Cancelling
- **WHEN** the user cancels or dismisses the confirmation
- **THEN** it closes, no backend request is made, and the page state is unchanged

#### Scenario: Confirming
- **WHEN** the user confirms
- **THEN** the page sends `DELETE /user/{user_id}/cli/devices` with the user's web access token as bearer credential and no request body

#### Scenario: Successful revoke
- **WHEN** the backend answers with success
- **THEN** the confirmation closes and a translated success notification states that all CLI access was revoked

#### Scenario: Single submission
- **WHEN** a revoke request is in flight
- **THEN** the confirm action and the revoke button are disabled so the request cannot be submitted twice

#### Scenario: Web token only
- **WHEN** any request is made from this page
- **THEN** it is authorized with the web session token and never with, or while handling, a CLI token

### Requirement: Failures use the standard translated error presentation
The system SHALL convert API failures to translated errors via the shared API-error mapping and show them through the standard error component, never as toasts: loading failures as blockers and action failures as non-blocking errors that auto-dismiss, with unknown failures using a translated generic message.

#### Scenario: Revoke rejected by the backend
- **WHEN** the revoke request returns an error with a known error code
- **THEN** the confirmation closes and a non-blocking error with the mapped translated message is shown

#### Scenario: Revoke fails without a response
- **WHEN** the revoke request times out or the network fails
- **THEN** a non-blocking translated generic revoke-failed error is shown and the user can retry

#### Scenario: Session expired during revoke
- **WHEN** the revoke request is rejected as unauthenticated
- **THEN** the shared authentication-failure handling applies as on other settings pages

#### Scenario: Endpoint not yet deployed
- **WHEN** the revoke request returns not-found or another unexpected status from a backend without the endpoint
- **THEN** the same non-blocking error treatment applies and the page remains usable

#### Scenario: Bad-request status
- **WHEN** any request from the page is answered with HTTP 400 and a JSON error body containing an error code
- **THEN** the error is parsed and translated by its code exactly as for any other status, with no status-specific handling

### Requirement: CLI-access error codes are mapped and translated
The system SHALL translate CLI-access error codes 1043, 1044, 1045, 1046, 2015, 3010, 4004, 4005, 5018 and 6004 in all supported locales, whether or not this page can trigger them. Codes 3010 and 6004 SHALL be supported for CLI compatibility even when absent from current backend definitions.

#### Scenario: Known new code
- **WHEN** an API error carrying any of these ten codes is shown through the standard error component
- **THEN** its translated message for the current interface language is displayed instead of the generic unknown-error text

#### Scenario: Code mapping completeness
- **WHEN** the project lint (translation validation) runs
- **THEN** all ten codes resolve to translation keys that exist with identical placement in every locale catalog, and none is reported unused

#### Scenario: CLI compatibility codes
- **WHEN** a response carries code 3010 with HTTP 403 or code 6004 with HTTP 429
- **THEN** the shared error component shows `error_codes.delivery_refused` (the platform refused delivery) or `error_codes.provider_rate_limited` (the provider's request limit was reached) respectively, rather than `errors.unknown` or the obsolete chat-unreachable / notification-request-limit keys

#### Scenario: Unknown future code
- **WHEN** an API error carries a code that is not mapped
- **THEN** the existing generic error with the server message is shown, unchanged

### Requirement: All page text is translated in every supported locale
The system SHALL provide real translations for every user-visible string introduced by this page in all supported interface locales (ar, de, en, es, fr, hi, it, ru, sr, tr, zh), with no placeholders and no hard-coded user-facing strings, keeping shell commands, URLs, and the `abot` command name untranslated.

#### Scenario: Locale catalog completeness
- **WHEN** the project lint (translation validation) runs
- **THEN** every new key exists in all eleven catalogs with matching interpolation placeholders and ordering, and every key is used

#### Scenario: Right-to-left locale
- **WHEN** the page renders under the Arabic locale
- **THEN** translated prose follows the application's existing text handling while every command is displayed left to right, unmangled, and fully readable

#### Scenario: Product naming
- **WHEN** translated copy names the product
- **THEN** it uses the configured short application name via interpolation and never "bot"

### Requirement: Page analytics follow the existing privacy-safe taxonomy
The system SHALL report a canonical `command_line` page view through the shared shell, and SHALL report copy, regenerate, release-link, and revoke interactions as typed feature actions with stable identifiers, safe error metadata, and no connect key, command text containing a key, access token, or user identifier.

#### Scenario: Page view
- **WHEN** the page reaches its ready state
- **THEN** one canonical page view is reported with a fixed `/app/command-line` location and a fixed page title, not the real URL

#### Scenario: Copying
- **WHEN** the user copies the key, the connect command, or an install command
- **THEN** a copy action is reported with a controlled option identifier naming what was copied and without its value

#### Scenario: Revoke outcome
- **WHEN** the user confirms a revoke and the outcome is known
- **THEN** a revoke action is reported with a success or failure result and, on failure, only the API error code and HTTP status

#### Scenario: Confirmation dismissed
- **WHEN** the user opens and then cancels the revoke confirmation
- **THEN** open and cancel actions are reported without any further data

#### Scenario: Analytics disabled
- **WHEN** the host is not a recognized analytics environment
- **THEN** no analytics collection happens and the page behaves identically

### Requirement: Existing profile-linking behavior is unchanged by shared extractions
The system SHALL keep the Linked Profiles page behavior identical (displayed key format, copy notifications, copy-failure handling, analytics) while it uses the connect-key formatter and clipboard helper shared with the Command Line page.

#### Scenario: Linked Profiles key display
- **WHEN** the user opens Linked Profiles and views their key
- **THEN** it is shown in `XXXX-XXXX-XXXX` form and copying it behaves exactly as before

#### Scenario: Linked Profiles copy failure
- **WHEN** copying fails on Linked Profiles
- **THEN** the same translated failure message appears and copy controls are disabled as before
