# Proposal

## Why

The agent is gaining a command-line client (`abot`, repository `agent-cli`) that authenticates with the user's existing connect key and can send notifications to the user's chats. Users need one place in the settings web app to learn what the CLI is, install it on their operating system, copy the exact `abot connect` command for their profile, and cut off every connected CLI if a machine is lost or a token leaks. Without this page the CLI would have no discoverable entry point and no web-side kill switch.

## What Changes

- Add a new authenticated settings page, **Command Line**, at `/:lang_iso_code/user/:user_id/command-line`, built on the existing `usePageSession` gate and `BaseSettingsPage` shell and modeled on `LinkedProfilesPage`.
- Explain what the CLI is, with per-operating-system install instructions (Homebrew on macOS and Linux, Scoop on Windows, `.deb` and `.rpm` packages on Linux, and a link to the GitHub Releases page `https://github.com/appifyhub/agent-cli/releases`), each command copyable.
- Show the user's current connect key (loaded with the existing `getConnectKey`, refreshable with the existing `regenerateConnectKey`) and a copyable `abot connect XXXX-XXXX-XXXX` command, and state that the key changes after each successful CLI connect.
- Add a **Revoke all CLI access** action with an explicit confirmation step that calls the new backend endpoint `DELETE /user/{user_id}/cli/devices` with the web JWT, reports success, and surfaces failures through the standard `PageError` / `ErrorMessage` path.
- Link the page from the settings navigation (sidebar and mobile drawer built in `Header.tsx`) next to the other settings pages, with a dedicated navigation helper and analytics page identity.
- Map the eight backend CLI-access error codes (`1043`, `1044`, `1045`, `1046`, `2015`, `4004`, `4005`, `5018`) and the two additional CLI compatibility codes `3010` (`CodeDeliveryRefused`) and `6004` (`CodeProviderRateLimited`) in the web error-code mapping, with real translations in all eleven locales. Include the latter two by explicit user decision even though the current backend definitions and API docs omit them; HTTP 400 error bodies are parsed by code like any other status.
- Add translations for the page in every supported interface locale, and analytics feature identifiers consistent with the existing taxonomy (never including JWTs or connect keys).
- Small shared extractions needed by the new page and kept behavior-neutral for the existing one: the connect-key display formatter and the clipboard-copy helper currently private to `LinkedProfilesPage`.

**Dependency (not part of this change):** the backend API documents `DELETE /user/{user_id_hex}/cli/devices` for web-token revocation, with no body and response `{"status":"OK"}`. The web service already uses this route, but its browser verification must be repeated: the earlier stub run exercised the removed POST endpoint. The CLI uses the separate CLI-token route `DELETE /cli/user/{user_id_hex}/devices`; do not substitute that route in the web app.

## Capabilities

### New Capabilities

- `command-line-page`: The authenticated Command Line settings page: reachability from the settings navigation, CLI explanation and per-OS installation guidance, connect key and copyable connect command, confirmed revoke-all action against the backend, error handling, translations in every supported locale, and privacy-safe analytics for the page.

### Modified Capabilities

None. (`openspec/specs/` is empty in this repository; the analytics contract from the archived `add-web-app-analytics` change was never synced to main specs, so the analytics requirements for this page are expressed inside `command-line-page`.)

## Impact

- New: `src/pages/CommandLinePage.tsx`, `src/services/cli-access-service.ts`, `src/lib/command-line.ts`, `src/lib/connect-key.ts`, `src/lib/clipboard.ts`, `src/components/CopyableCommand.tsx`, and a confirmation dialog component.
- Modified: `src/lib/api-error.ts` (ten CLI-access code mappings, including two user-requested compatibility mappings), `src/App.tsx` (route), `src/lib/settings-pages.ts` (page id and title), `src/hooks/useNavigation.ts` (helper), `src/components/Header.tsx` (navigation entry and section label), `src/lib/analytics.ts` (page path/title, feature ids, `revoke` action), `src/pages/LinkedProfilesPage.tsx` (use the shared formatter and clipboard helper), all eleven `src/assets/i18n/*.json` catalogs, and the generated `src/lib/translation-keys.ts`.
- Backend: consumes `DELETE /user/{user_id}/cli/devices` (web JWT, response `{status: "OK"}`); no new web authentication scheme and no CLI JWT is ever handled by the web app.
- Dependencies: none added.
