## ADDED Requirements

### Requirement: Nested ChatSettings data shape

The web app SHALL model chat settings as a nested object with two top-level sections: `chat_config` (chat-wide settings, governed by admin permissions) and `user_chat_config` (per-user-per-chat privacy preferences). The `chat_config` section MUST include an `is_admin` boolean indicating whether the calling user can edit chat-wide settings.

#### Scenario: Type definition

- **WHEN** the chat-settings service exposes the `ChatSettings` type
- **THEN** the type matches `{ chat_config: ChatConfig, user_chat_config: UserChatConfig }`
- **AND** `ChatConfig` contains: `chat_id`, `title?`, `platform`, `is_own`, `is_private`, `is_admin`, `language_name?`, `language_iso_code?`, `reply_chance_percent`, `release_notifications`, `media_mode`
- **AND** `UserChatConfig` contains: `use_about_me`, `use_custom_prompt`

#### Scenario: ChatInfo removed from user-settings-service

- **WHEN** the user-settings-service module is imported
- **THEN** it MUST NOT export a `ChatInfo` type
- **AND** it MUST NOT export a `fetchUserChats` function

### Requirement: Single-source chat list endpoint

The web app SHALL fetch the user's chats from `GET /settings/chats` and treat the response as an array of full `ChatSettings` objects. This list is the only source of editable settings for the chat settings page; the legacy detail fetch SHALL be removed.

#### Scenario: List fetch endpoint

- **WHEN** the chat-settings service issues the chat list request
- **THEN** it calls `GET {apiBaseUrl}/settings/chats` with the bearer token
- **AND** it returns the parsed body as `ChatSettings[]`

#### Scenario: Detail fetch removed

- **WHEN** the chat-settings service module is imported
- **THEN** it MUST NOT export a `fetchChatSettings` function
- **AND** the chat settings page MUST NOT issue a per-chat detail fetch on mount

#### Scenario: useChats consumes the new list endpoint

- **WHEN** `useChats(userId, rawToken)` is invoked with valid arguments
- **THEN** it calls `fetchAllChatSettings` from the chat-settings service
- **AND** it returns `ChatSettings[]` (not `ChatInfo[]`)
- **AND** the in-memory chat cache stores `ChatSettings[]` keyed by user id

### Requirement: ChatSettings PATCH with explicit sections

The web app SHALL save chat settings via `PATCH /settings/chats/{chat_id}` with a payload that contains only the sections the caller is allowed to modify and that have actually changed. A non-admin caller MUST NEVER include `chat_config` in the payload.

#### Scenario: Admin saves chat-wide and personal changes

- **WHEN** an admin user has changed both chat-wide fields and privacy toggles and triggers save
- **THEN** the payload contains both `chat_config` (with the changed chat-wide fields) and `user_chat_config` (with the changed privacy fields)
- **AND** the request is `PATCH /settings/chats/{chat_id}` with the bearer token

#### Scenario: Non-admin saves only privacy changes

- **WHEN** a non-admin user has changed only privacy toggles and triggers save
- **THEN** the payload contains `user_chat_config` only
- **AND** `chat_config` is absent from the payload

#### Scenario: Save disabled when nothing changed

- **WHEN** neither `chat_config` nor `user_chat_config` differs from the last saved state
- **THEN** the save action button is disabled
- **AND** no PATCH is issued

### Requirement: Admin gating on the chat settings page

The chat settings page SHALL conditionally render chat-wide controls (language, release notifications, media mode, reply chance) based on `chat_config.is_admin`. When `is_admin` is `false`, the chat-wide section MUST NOT be rendered at all (not merely disabled).

#### Scenario: Admin in a group chat

- **WHEN** the page renders chat settings for a group chat where the user has `is_admin = true`
- **THEN** the language, release notifications, media mode, and reply chance controls are visible and editable
- **AND** the privacy toggles section is visible
- **AND** the "My experience in this chat" subtitle is visible between the two sections

#### Scenario: Non-admin in a group chat

- **WHEN** the page renders chat settings for a group chat where the user has `is_admin = false`
- **THEN** the chat-wide controls (language, notifications, media, reply chance) are NOT rendered
- **AND** the privacy toggles section is visible
- **AND** the "My experience in this chat" subtitle is visible

#### Scenario: Private (1:1) chat

- **WHEN** the page renders chat settings for a chat where `chat_config.is_private = true`
- **THEN** the chat-wide controls are visible (the user is admin of their own private chat)
- **AND** the reply chance control is NOT rendered
- **AND** the "My experience in this chat" subtitle is NOT rendered
- **AND** the privacy toggles section is visible

### Requirement: Self-scoped privacy toggle copy

The privacy toggles for "Use about me" and "Use custom prompt" SHALL use a single self-scoped label and helper text in every chat type. Plural ("everyone's") variants are removed.

#### Scenario: Toggle label and helper

- **WHEN** the privacy toggles render in any chat (private or group, admin or member)
- **THEN** "Use about me" reads with first-person framing (e.g., "Use my profile information")
- **AND** "Use custom prompt" reads with first-person framing (e.g., "Use my behavior instructions")
- **AND** the helper text references the user's own data only

#### Scenario: Plural translation keys removed

- **WHEN** the i18n locale files are loaded
- **THEN** they MUST NOT contain `use_about_me_label` distinct from a `_singular` variant (the singular content is the only label)
- **AND** they MUST NOT contain `use_custom_prompt_label` distinct from a `_singular` variant

### Requirement: ChatsDropdown consumes nested shape

The chats dropdown component SHALL consume `ChatSettings[]` and access fields via the `chat_config` nested object. Identifier and presentation properties (`chat_id`, `title`, `platform`, `is_own`) MUST be read from `chat.chat_config`.

#### Scenario: Dropdown renders chats

- **WHEN** the dropdown renders a `ChatSettings[]` list
- **THEN** each item displays `chat.chat_config.title` (or untitled fallback)
- **AND** the platform icon is sourced from `chat.chat_config.platform`
- **AND** the ownership icon (shield vs users) is keyed off `chat.chat_config.is_own`
- **AND** chat selection compares against `chat.chat_config.chat_id`

### Requirement: Error code mapping aligned with backend

The frontend error code mapping SHALL match the backend authoritative list for chat-settings-related codes: removing the deprecated 1006 and 1036 mappings, and adding 1038 (empty chat settings payload) and 3009 (not chat member).

#### Scenario: Removed validation codes

- **WHEN** `getErrorTranslationKey(1006)` is called
- **THEN** it returns `null` (no mapping)
- **AND** the same applies for code `1036`

#### Scenario: Added codes resolve to translation keys

- **WHEN** `getErrorTranslationKey(1038)` is called
- **THEN** it returns `error_codes.empty_chat_settings_payload`
- **AND** `getErrorTranslationKey(3009)` returns `error_codes.not_chat_member`

#### Scenario: Translation entries present in all locales

- **WHEN** any of the 11 locale files (ar, de, en, es, fr, hi, it, ru, sr, tr, zh) is loaded
- **THEN** it contains entries for `error_codes.empty_chat_settings_payload` and `error_codes.not_chat_member`
- **AND** it does NOT contain entries for `error_codes.invalid_use_about_me` or `error_codes.invalid_use_custom_prompt`

### Requirement: Chat-not-in-list blocker

When the chat settings page receives a `chat_id` route parameter that does not match any chat in the list, the page SHALL display a blocker error (replacing the legacy 404 path that came from the detail fetch).

#### Scenario: URL points to an unknown chat

- **WHEN** the page mounts with a `chat_id` route parameter
- **AND** the chat list has resolved
- **AND** no chat in the list has a matching `chat_config.chat_id`
- **THEN** the page sets a blocker error sourced from a translation key indicating the chat was not found
- **AND** the page does not allow editing or saving
