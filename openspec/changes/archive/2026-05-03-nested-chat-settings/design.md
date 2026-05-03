## Context

The backend has split chat settings into two privacy scopes (chat-wide vs per-user-per-chat) and changed the wire format from a flat object to a nested `{ chat_config, user_chat_config }` shape. The list endpoint now returns the same full shape for every chat the user is a member of (admin or otherwise), making it the de-facto source of truth for the dropdown and the chat settings page alike.

The current frontend has the legacy split:
- `user-settings-service.ts` owns a lean `ChatInfo` and `fetchUserChats` (the dropdown source).
- `chat-settings-service.ts` owns a flat `ChatSettings` and a separate detail fetch (the page form-state source).
- Privacy toggles use a `_singular` / plural label split keyed off `is_private` because admins used to control everyone's data in group chats.

All of those assumptions break under the new contract. The `is_admin` flag is also new, which shifts the page from a single permission level to two.

Constraints:
- The web app must deploy in lockstep with the backend.
- `bun run lint` regenerates translation keys; never run translation scripts manually.
- API errors flow through `parseApiError()` and `PageError.fromApiError()` with the `ErrorMessage` component (never toast).
- Project enforces TS strict mode, trailing commas, and translations available across all 11 locales from day zero.

## Goals / Non-Goals

**Goals:**
- Match the backend's nested response and PATCH shape end-to-end.
- Make the chat-list response the single source of editable settings for the page (drop the redundant detail fetch).
- Gate chat-wide controls behind `is_admin` via conditional rendering, mirroring the existing `is_private` pattern.
- Preserve privacy by construction: a non-admin's save payload never contains `chat_config`.
- Update copy so the privacy toggles read as self-scoped in every chat.

**Non-Goals:**
- Reworking the dropdown icon vocabulary to differentiate admin vs member (CHANGELOG flags it as optional; existing `is_own` icon stays).
- Adding a freshness/refetch strategy for the in-memory chat cache (pre-existing behavior unchanged).
- Backend changes — already complete.
- Touching unrelated settings pages (Intelligence, Access, etc.) beyond the shared `api-error.ts` mapping.

## Decisions

### 1. Single source of truth: the list response feeds the page

**Decision**: Drop `fetchChatSettings` (the detail call). The chat settings page seeds its initial state from the `useChats`-cached list by `chat_id` lookup; saves go straight to `PATCH /settings/chats/{id}`.

**Rationale**: The list now returns the full `ChatSettings` shape per chat. The detail endpoint's only unique side effect (creating a missing membership row) is moot — the list endpoint already creates rows for confirmed members, and any unauthorized/invalid ID is rejected on either path. Keeping the detail call would mean two round-trips for identical data.

**Alternatives considered**:
- *Keep detail fetch for freshness*: rejected — the cache is already in-memory and per-session, and freshness was not the original motivation for the detail call.
- *Seed from list and detail-fetch in background*: rejected — adds flicker risk and code complexity for no clear win.

### 2. Save payload built explicitly by the page, not diffed by the service

**Decision**: `saveChatSettings` accepts an explicit `{ chatConfig?, userChatConfig? }` argument. The page decides what to put in each section based on `is_admin` and what changed.

**Rationale**: A non-admin caller including `chat_config` causes the entire request to fail server-side. The page is the only layer that knows both `is_admin` and the change set, so it is the right place to assemble the payload. A service-level diff would have to re-derive `is_admin`, which is leaky and easy to get wrong.

**Alternatives considered**:
- *Service diffs current vs remote*: rejected — pushes auth-aware logic into the wrong layer.
- *Always send both sections, let backend reject*: rejected — hard error for non-admins on every save.

### 3. Visibility matrix using conditional rendering, not disabled state

**Decision**: Sections are conditionally rendered (mounted/unmounted) rather than disabled. The matrix:

| Chat type | Admin section | Subtitle | Privacy toggles | Reply % |
|---|---|---|---|---|
| Private (1:1) | SHOW | HIDE | SHOW | HIDDEN |
| Group, admin | SHOW | SHOW | SHOW | SHOW |
| Group, non-admin | HIDE | SHOW | SHOW | — |

**Rationale**: The page already uses conditional rendering for the existing `is_private` rules (e.g., reply chance was disabled-when-private, but the inline toggle helper text already switches between variants). Hiding scales better than disabling: a non-admin viewing four greyed-out controls is noisier than seeing only what they can act on. The subtitle exists to separate admin and personal sections; it is hidden in private chats because the user is always admin of their own 1:1 — there is nothing to differentiate.

**Alternatives considered**:
- *Disabled controls for non-admins*: rejected — visually noisy; no actionable feedback to the user about why.
- *Show subtitle always*: rejected — meaningless visual artefact in private chats.

### 4. Toggle copy collapses to a single self-scoped variant

**Decision**: Drop the plural label/helper variants. Promote `_singular` keys to be the only versions (rename `use_about_me_label_singular` → `use_about_me_label`, etc.).

**Rationale**: Toggles are now always per-user; the plural variants ("Use everyone's profile information") are semantically wrong under the new contract. Keeping both variants would invite drift and confusion.

### 5. New capability namespace: `chat-settings`

**Decision**: Introduce a new OpenSpec capability `chat-settings` for this surface. No existing capability covers chat-related frontend behavior.

**Rationale**: The split between `user-settings-service` and `chat-settings-service` becomes cleaner with this change (chat-list logic moves from user to chat). Naming the capability `chat-settings` matches that consolidation.

## Risks / Trade-offs

- [Lockstep deploy required] → Coordinate the merge/deploy with backend; document the breaking shape in `CHANGELOG.md` (already done).
- [Bookmarked URL to deleted/unauthorized chat now surfaces a generic blocker instead of a typed 404/3009 from detail fetch] → Add an explicit "chat not found in list" blocker once the list resolves and the chat is missing; reuse existing not-found copy. The 3009 (NOT_CHAT_MEMBER) mapping still ships for any other code path that may surface it.
- [Translation drift across 11 locales] → All copy changes (rename `_singular`, add subtitle, error code adds/removes) must be applied to every locale file. `bun run lint` validates key parity; we will not ship until it passes.
- [Save payload mistakes] → A non-admin must never include `chat_config`. Mitigation: the page's payload assembly is gated by `chatSettings.chat_config.is_admin`. Add a focused review on `handleSave` during implementation.
- [Stale chat cache] → Pre-existing limitation (cache lives the session). Out of scope to address here, but worth noting: a settings save updates local state but does not reseed the cached list — title or `is_admin` changes from elsewhere will not appear until the next session.

## Migration Plan

This is a one-shot replacement, not a phased rollout:

1. Implement service-layer changes (types, endpoints, payload assembly).
2. Update hooks/cache to the new shape.
3. Update components/pages.
4. Update `api-error.ts` and translations across all locales.
5. Run `bun run lint` to regenerate translation keys and verify TS strict + parity.
6. Deploy with the backend release.

Rollback: revert the merge commit. There is no schema migration on the frontend; the only side effect is build artefact replacement.

## Open Questions

None — explore-mode synthesis closed the loop on subtitle behavior, save-payload strategy, detail-fetch removal, and the i18n plan.
