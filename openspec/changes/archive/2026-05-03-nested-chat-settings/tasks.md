## 1. Service & Type Layer

- [x] 1.1 In `src/services/chat-settings-service.ts`, define `ChatConfig` (chat-wide fields including new `is_admin: boolean`) and `UserChatConfig` (`use_about_me`, `use_custom_prompt`)
- [x] 1.2 Replace the flat `ChatSettings` interface with `{ chat_config: ChatConfig, user_chat_config: UserChatConfig }`
- [x] 1.3 Add `fetchAllChatSettings({ apiBaseUrl, rawToken })` calling `GET /settings/chats`, returning `ChatSettings[]`, using `parseApiError` on non-OK responses
- [x] 1.4 Delete the old `fetchChatSettings` function
- [x] 1.5 Rewrite `saveChatSettings` to accept `{ apiBaseUrl, chat_id, rawToken, chatConfig?, userChatConfig? }` and PATCH `/settings/chats/{chat_id}` with the nested payload (omit absent sections); use `parseApiError` on non-OK responses
- [x] 1.6 In `src/services/user-settings-service.ts`, delete the `ChatInfo` type and the `fetchUserChats` function
- [x] 1.7 In `src/lib/api-error.ts`, remove `case 1006` and `case 1036`, add `case 1038 → "error_codes.empty_chat_settings_payload"` and `case 3009 → "error_codes.not_chat_member"`

## 2. Caching & Hooks

- [x] 2.1 Update `src/services/chat-cache.ts` to import `ChatSettings` from `chat-settings-service` and replace every `ChatInfo` reference with `ChatSettings`
- [x] 2.2 Update `src/hooks/useChats.ts` to import `ChatSettings` from `chat-settings-service`, call `fetchAllChatSettings` (not `fetchUserChats`), and return `ChatSettings[]`
- [x] 2.3 Verify `useChats` no longer imports anything from `user-settings-service`

## 3. ChatsDropdown Component

- [x] 3.1 In `src/components/ChatsDropdown.tsx`, update the props/types to use `ChatSettings` instead of `ChatInfo`
- [x] 3.2 Update every property access on the `chats` array items: `chat.chat_id`, `chat.title`, `chat.platform`, `chat.is_own` → `chat.chat_config.*`
- [x] 3.3 Update `selectedChat` matching logic to compare against `chat.chat_config.chat_id`
- [x] 3.4 Remove the `ChatInfo` import

## 4. ChatSettingsPage

- [x] 4.1 In `src/pages/ChatSettingsPage.tsx`, remove the `fetchChatSettings` import and its usage
- [x] 4.2 Replace the in-page detail fetch effect: seed `chatSettings` and `remoteSettings` state from the `useChats` list (find by `chat_id`) once the list resolves
- [x] 4.3 Add a "chat not found in list" blocker: if the list has resolved and contains no chat with the route's `chat_id`, set a blocker `PageError` from a `chat_not_found`-style translation key
- [x] 4.4 Update every read on `chatSettings.*` to access nested fields (`chatSettings.chat_config.language_iso_code`, `chatSettings.user_chat_config.use_about_me`, etc.)
- [x] 4.5 Update every `setChatSettings(prev => …)` writer to spread through the nested object correctly (`{ ...prev, chat_config: { ...prev.chat_config, language_iso_code: newVal } }` and the same pattern for `user_chat_config`)
- [x] 4.6 Update `selectedChat` lookup to use `chat.chat_config.chat_id` and use `selectedChat.chat_config.title` / `selectedChat.chat_config.platform` for the drawer label
- [x] 4.7 Refactor `areSettingsChanged` to compare nested fields under both `chat_config` and `user_chat_config`
- [x] 4.8 Wrap the four chat-wide controls (language, release notifications, media mode, reply chance) in a conditional that renders only when `chatSettings.chat_config.is_admin === true`
- [x] 4.9 Wrap the reply chance control in an additional condition: do NOT render when `chatSettings.chat_config.is_private === true` (and remove the prior `disabled={…|| chatSettings?.is_private}` rule)
- [x] 4.10 Add the "My experience in this chat" subtitle (matching the `IntelligenceSettingsPage` `<h3>` styling) above the privacy toggles; render it only when `!chatSettings.chat_config.is_private` (so it shows in groups but is hidden in private 1:1 chats)
- [x] 4.11 Remove the `is_private` ternary on the "use about me" and "use custom prompt" labels and helpers — always use the (renamed) singular variants
- [x] 4.12 Rewrite `handleSave` to assemble the explicit payload: only include `chatConfig` when `chat_config.is_admin` is true AND chat_config fields changed; only include `userChatConfig` when user_chat_config fields changed; pass them as separate arguments to `saveChatSettings`
- [x] 4.13 Update local cache after a successful save (call `setCachedChats` or equivalent) so the dropdown reflects any changed `title`/admin section state

## 5. Internationalization

- [x] 5.1 In every locale file under `src/assets/i18n/` (ar, de, en, es, fr, hi, it, ru, sr, tr, zh), delete the four plural toggle keys: `use_about_me_label`, `use_about_me_helper`, `use_custom_prompt_label`, `use_custom_prompt_helper`
- [x] 5.2 Rename `use_about_me_label_singular` → `use_about_me_label`, `use_about_me_helper_singular` → `use_about_me_helper`, `use_custom_prompt_label_singular` → `use_custom_prompt_label`, `use_custom_prompt_helper_singular` → `use_custom_prompt_helper` in every locale
- [x] 5.3 Add a new key `chat_settings_personal_subtitle` (or similar) with translated copy "My experience in this chat" in all 11 locales
- [x] 5.4 Delete `error_codes.invalid_use_about_me` and `error_codes.invalid_use_custom_prompt` from every locale file
- [x] 5.5 Add `error_codes.empty_chat_settings_payload` and `error_codes.not_chat_member` with translated copy in every locale (suggested copy: "Settings save was empty — change something first." and "You are not a member of this chat.")
- [x] 5.6 Add (or reuse) a `chat_not_found` blocker key for the chat-not-in-list scenario — confirm whether one already exists; add to all locales if missing

## 6. Verification & Lint

- [x] 6.1 Run `bun run lint` from the project root and resolve any TS errors and translation-key parity issues it surfaces
- [x] 6.2 Verify `getErrorTranslationKey` no longer references the removed cases and resolves the new codes correctly (compile-only check via TS strict)
- [x] 6.3 Run `bun` build task (per `package.json`) and confirm a clean build
- [ ] 6.4 Smoke-test (manual, in dev) the three primary flows: (a) admin in a group chat — sees full layout, can save chat-wide changes; (b) non-admin in a group chat — sees only privacy toggles + subtitle, can save privacy changes only; (c) private 1:1 chat — sees admin section without reply chance, no subtitle, can save
- [ ] 6.5 Smoke-test the bookmarked-to-deleted-chat path: navigating to a `chat_id` not in the list shows the blocker without crashing
