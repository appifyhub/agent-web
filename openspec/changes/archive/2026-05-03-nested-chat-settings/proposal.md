## Why

The backend has introduced **breaking** API changes that move two privacy-related fields (`use_about_me`, `use_custom_prompt`) out of the chat-wide config and into a per-user-per-chat scope. The chat list endpoint now also returns chats the user is a regular member of (not just admin of), so non-admins can manage their own privacy preferences. The web app must deploy in lockstep with the backend, or chat settings will break for every user.

## What Changes

- **BREAKING** Replace flat `ChatSettings` shape with nested `{ chat_config, user_chat_config }` everywhere it is consumed.
- **BREAKING** Drop the standalone chat-detail fetch (`GET /settings/chat/{id}`) and source the editable form state from the all-chats list (`GET /settings/chats`), which now returns full settings per chat.
- Move chat-list fetching from `user-settings-service` to `chat-settings-service` (new `fetchAllChatSettings`); delete `ChatInfo` and `fetchUserChats` from the user service.
- Repoint chat settings save to `PATCH /settings/chats/{id}` with an explicit `{ chat_config?, user_chat_config? }` payload — non-admins must never include `chat_config` (backend rejects the entire request otherwise).
- Add `is_admin` field handling on `chat_config`; gate chat-wide controls (language, release notifications, media mode, reply chance) behind it on the chat settings page.
- Reframe the privacy toggles as always self-scoped (drop singular/plural label variants, simplify copy).
- Add a section subtitle ("My experience in this chat") to separate admin and personal sections in group chats; hide it in private chats.
- Switch the reply-chance dropdown from disabled-when-private to hidden-when-private to match the new conditional-rendering pattern.
- Update error code mappings: remove 1006/1036, add 1038 (empty payload) and 3009 (not chat member).

## Capabilities

### New Capabilities

- `chat-settings`: Frontend behavior for fetching, editing, and saving chat settings on the web — including the nested data shape, admin gating, privacy toggles, and the chat list dropdown. This consolidates chat-related concerns that previously straddled the user and chat services on the frontend.

### Modified Capabilities

<!-- None — no existing specs cover this surface area -->

## Impact

- **Services**: `src/services/chat-settings-service.ts`, `src/services/user-settings-service.ts`, `src/services/chat-cache.ts`, `src/lib/api-error.ts`.
- **Hooks**: `src/hooks/useChats.ts`.
- **Components/Pages**: `src/components/ChatsDropdown.tsx`, `src/pages/ChatSettingsPage.tsx`.
- **Translations**: all 11 locale files in `src/assets/i18n/` (ar, de, en, es, fr, hi, it, ru, sr, tr, zh) — drop plural toggle copy, rename singular variants, add subtitle key, update error code keys.
- **Deployment**: must ship together with the corresponding backend release; the API surface is incompatible across the boundary.
- **Out of scope**: redesign of the chat dropdown icon scheme (admin vs member); freshness/refetch strategy for the chat list cache; backend changes (already complete).
