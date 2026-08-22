## Context

See `proposal.md` for motivation and `specs/agent-settings-experience/spec.md` for the behavioral contract.

The application is a React, TypeScript, Vite, Tailwind CSS 4, Radix, and shadcn project with a working local development flow. Its current design was intentionally aligned with the previous landing-page generation: a navy-to-indigo canvas, Playfair page titles, Heebo body copy, coral accents, translucent glass surfaces, and pill-shaped controls. That system remains coherent on its own; the recent landing redesigns created the present mismatch.

The new AppifyHub landing page uses a black and dark-green portfolio system with Lexend, Noto Sans, Cousine, teal status accents, aurora atmosphere, strong editorial hierarchy, and a project registry. The new Agent landing page uses a black canvas, Inter, warm-white text, coral/red emphasis, logo-derived blue/plum depth, restrained opaque surfaces, rounded geometry, compact pill navigation, and real product evidence. The settings application is a product surface, so The Agent is its primary visual parent while AppifyHub contributes family-level discipline, typography roles, utility treatment, and attribution.

The existing application already has useful migration seams: shadcn primitives under `src/components/ui/`, shared setting controls, `BaseSettingsPage`, and centralized services and hooks. It also has accumulated styling debt: global glass variants, direct Tailwind palette colors, raw interactive elements outside the shadcn layer, route-specific utility compositions, a large header containing both navigation policy and presentation, and pages that combine business state with long render trees. The redesign must peel these layers apart without combining a visual migration with service or persistence changes.

Only desktop screenshots were available for this exploration. Responsive, keyboard, motion, and live state behavior therefore remain milestone verification responsibilities rather than claims established by the screenshots.

## Goals / Non-Goals

**Goals:**

- Deliver reviewable vertical slices in which a real route, its required components, and its states become complete together.
- Keep shadcn/Radix primitives as the accessible interaction base and add only small, product-specific compositions above them.
- Separate route business state, settings composition, product components, UI primitives, and design tokens into clear dependency layers.
- Let legacy and redesigned route content coexist safely during migration without duplicating service behavior.
- Preserve offline development by bundling design assets and avoiding runtime CDN requirements.
- Stop after every milestone for owner review of the code and rendered interface.

**Non-Goals:**

- Changing backend APIs, cache behavior, storage, token formats, URL shapes, routing semantics, or setting meanings.
- Redesigning the AppifyHub or The Agent landing pages.
- Copying marketing-page scale, hero composition, or decorative effects directly into a task-focused settings application.
- Building a speculative component library, Storybook, new state framework, or generalized form engine.
- Performing a big-bang rewrite or cleaning unrelated code while a route is being migrated.
- Adding automated test files without the owner's explicit approval.

## Decisions

### 1. Translate The Agent's design language into a product UI

The settings app will use The Agent landing page as the primary visual source: near-black canvas, ink surfaces, warm-white text, muted cool copy, coral primary emphasis, logo-derived indigo/plum depth, Inter typography, thin borders, and controlled rounded geometry. Green remains available for semantic success but is not a primary product accent. AppifyHub family continuity comes through strong hierarchy, restrained accents, utility/data typography, dark high-contrast composition, and explicit attribution.

Marketing treatments will be translated to product density. Large landing-page section radii become moderate application surfaces; the compact capsule header informs utility controls; opaque and low-translucency panels replace the current collection of glass recipes; decorative glow is limited to rare brand moments rather than every control.

Alternative considered: combine the AppifyHub green palette and Agent coral palette evenly. This would blur the distinction the two new sites deliberately created and make the product feel like a third brand instead of The Agent.

### 2. Bundle typography instead of loading it at runtime

Inter will be included through a locally bundled dependency or checked-in licensed font asset, with a system sans fallback. Data such as credits, keys, timing, and status may use one local/system monospace stack. The existing Google Fonts imports will be removed once no migrated surface depends on Playfair or Heebo.

Alternative considered: continue using Google Fonts with fallbacks. It technically leaves the UI operable offline, but the intended rendering changes when the network disappears and does not satisfy offline visual fidelity.

### 3. Keep one directional component dependency chain

The target dependency flow is:

```text
routes and page state
        │
        ▼
settings compositions
        │
        ▼
product components and variants
        │
        ▼
shadcn UI primitives
        │
        ▼
Radix and native elements

services, caches, and hooks feed route state but do not depend on UI layers
```

`src/components/ui/` remains the primitive layer. Product styling uses semantic tokens and controlled variants; it does not embed route-specific behavior in generated primitives. Reusable settings compositions are introduced only when a current slice proves reuse, such as a page shell, section, field row, action area, stat group, record, or empty state. Pages keep orchestration and business state while delegating presentation to those compositions.

Alternative considered: create a complete design system before migrating a route. That would front-load abstraction, produce unreviewable layer-only work, and guess at component APIs without real consumers.

### 4. Use a vertical-slice migration with shared-shell compatibility

The first slice establishes only the minimum foundation needed to deliver the shared application shell and Profile route. Shared shell changes must continue to host legacy route content until each route is migrated. Later slices migrate coherent workflows rather than file types:

1. Foundation, shared shell, navigation, and Profile.
2. Chat behavior settings.
3. Intelligence presets, tool choices, and related overlays.
4. Provider access and API-key management.
5. Usage and Purchases.
6. Sponsorships and Linked Profiles.
7. Authenticated Help and product guidance.
8. Focused mandatory onboarding.
9. Remaining surfaces, exceptional states, and legacy removal.

Each slice owns its required shadcn primitives, product compositions, route markup, responsive states, loading/empty/error states, and verification. A primitive is not redesigned globally ahead of the route that proves it, unless the shared shell requires it.

Alternative considered: restyle all primitives globally and then revisit pages. That creates a long partially broken period and makes regressions difficult to attribute during review.

### 5. Promote the existing navigation information architecture

The existing categorized drawer already expresses useful groups: Personal, Agent, Resources, and People. Those groups use the shadcn Sidebar foundation in three responsive modes: a right-side Sheet below the small breakpoint, a persistent collapsed icon rail from the small breakpoint to below the medium breakpoint, and the normal expandable sidebar from the medium breakpoint upward. The intermediate rail expands temporarily over the content without narrowing it or overwriting the persisted desktop preference. The expanded desktop sidebar owns the logo, short application name, and locale picker while the aligned content bar names the current settings category. When collapsed, the sidebar retains only the centered logo, the locale picker becomes available after expansion, and the content bar prefixes the category with the short application name and a chevron. The mobile drawer header owns the brand, locale picker, and matching panel-side close action; its main-header logo and non-interactive short application name crossfade out while the drawer is open. Category labels are complete translations and are never concatenated with a generic “settings” suffix. The logo navigates to Profile settings rather than the landing page, and application-name text is not a link. Chat selection belongs only to the sidebar; credits, session status, onboarding, and locked-mode help remain content-header utilities according to their current rules. On narrow screens, session status becomes a color-preserving icon trigger whose details surface exposes the full countdown without approaching the viewport edges.

Navigation destinations and handlers will come from one data model so desktop and narrow presentations cannot drift. Existing routing hooks remain authoritative.

Alternative considered: keep every destination behind the current hamburger at all widths. It preserves the old layout but keeps primary settings destinations hidden and forces the top row to carry page title, context, balance, language, and menu simultaneously.

### 6. Replace the universal page card with task-shaped composition

`BaseSettingsPage` currently wraps most route content in one large card. The redesigned shell will provide a page header, scoped action area, feedback region, and content flow. Within that flow, opaque settings sections group related controls; cards remain for actual objects such as a sponsored user, provider, preset, purchase, or usage record. Dividers and spacing handle simple sequential settings.

The countdown remains functional but becomes a quiet session-status utility. Save, cancel, transfer, purchase, sponsor, and other actions remain associated with the scope they affect and preserve their current disabled states.

Alternative considered: keep one giant card and only retheme it. This would change colors while retaining the main compositional difference between the settings app and both new landing systems.

### 7. Convert controls only inside the active slice

Existing shadcn controls will be reused first. Raw buttons and custom selectors will move to shadcn Button, Select, Switch, Tabs, Accordion, Sheet, Dialog, Alert, Input, Textarea, Tooltip, and related primitives as their owning route is migrated. A new shadcn primitive may be added only when its semantics materially fit the interaction. Necessary extensions will live in product wrappers where possible so future shadcn refreshes do not overwrite route behavior.

The migration will preserve callback signatures, controlled values, disabled logic, focus behavior, and service invocation. Old helpers and glass classes are removed only after repository search proves no remaining consumer.

Alternative considered: mechanically replace every raw control first. That would touch many workflows without delivering a finished route and would mix semantic, visual, and behavioral review.

### 8. Freeze behavior below the page layer during visual slices

Services, caches, API mappers, token storage, navigation URLs, and persistence formats are treated as frozen. Page state may be extracted from render trees only when needed to present the active slice, and the extraction must preserve the same inputs, outputs, and effects. No feature refactor is combined with a visual refactor merely because the file is open.

Alternative considered: clean each page's business logic and UI in one pass. That produces attractive final files but makes a regression impossible to localize during manual review.

### 9. Make owner approval a hard milestone gate

Every milestone ends after project lint, production build, offline presentation checks, route-specific interaction checks, responsive review, and inspection of loading, empty, error, disabled, open-overlay, and destructive states relevant to that slice. The owner then reviews both code and rendered UI. Work on the next milestone does not begin until the owner explicitly approves the current one.

The end-of-milestone handoff is always exactly two short items:

```text
Summary: <super-short description of the completed slice>
Next: Milestone N — <name>
```

If review finds an issue, only the current milestone is revised. The next slice remains untouched.

Alternative considered: implement all slices and review once. That defeats the requested onion-peeling approach and makes both visual direction and code architecture expensive to correct.

### 10. Carry the reviewed Shell and Profile conventions forward

Milestone 1 review established concrete composition rules for later slices:

- The desktop navigation uses the shadcn Sidebar with a left-side expanded state and a slightly wider centered icon rail when collapsed. The narrow drawer opens from the right, matching its far-right trigger and `PanelRight` icon. Profile precedes Chats. A selected chat owns the active surface; its expanded parent uses accent text only, while its collapsed parent icon carries the active indication.
- Sidebar and content headers share an 80px height, border, and background. Expanded desktop branding lives in the sidebar; collapsed desktop prefixes the settings category with the configured short application name. Narrow layouts retain the logo on the left and place the drawer trigger after the session control on the far right; the underlying logo fades while the drawer is open.
- Locale selection lives at the right side of the sidebar header on narrow and expanded desktop layouts and hides with the collapsed desktop rail. The mobile drawer keeps locale selection before its explicit close action.
- Header icon interactions use the same small, soft shadow highlight with no enclosing hover capsule. Logos navigate to Profile; application-name text is not interactive.
- Session details live in the header utility area. The timer is full at large widths, icon-only below the large breakpoint, and uses a non-modal shadcn-based details surface fixed at `50vw` directly below the header on narrow screens. Popover collision padding and mobile sizing maintain a 16px viewport gutter. Token metadata belongs inside that details surface rather than Profile or the footer.
- Page titles and primary actions share one line, with eyebrow copy below the title. Sticky mode begins only after that title/action line has scrolled away. Its background spans the settings pane, while its inner title and actions use the same centered `max-w-5xl` container and responsive padding as page content.
- Contextual next-step links do not share the primary action bar. They render as wrapping, subdued blue chips below the owning settings section and disappear from sticky mode.
- Profile uses one `SettingsSection` composition. Field groups are full-width on narrow layouts and centered at the former `w-md` width, 28rem, from the small breakpoint upward. Labels and label-associated helper copy receive a 4px logical-start inset while reset actions remain aligned to the field edge.
- Shared user-facing and assistive copy uses translations, including shadcn primitive labels. Product names come from runtime configuration or translated brand data. Decorative graphics use empty or hidden accessible semantics.
- Repeated product structures are extracted only after the active slice proves reuse. Milestone 1 examples are the categorized navigation model, settings section, action bar, session-details content, and Profile guide chip; route state and navigation decisions remain above the primitive layer.

These conventions are the baseline for later vertical slices. A later milestone may extend them when its workflow proves a new requirement, but it must not silently fork the shell, action, label, localization, or responsive behavior.

### 11. Carry the reviewed Chat conventions forward

Milestone 2 established the route pattern for behavior-oriented settings:

- The page title stays short and stable. Selected-chat identity lives in a compact context bar with a truncated data-provided name, a centrally aligned brand-colored platform glyph, and translated private or group metadata. When navigation is collapsed, the bar exposes Configure Chats; below the small breakpoint that translated action becomes an accessible icon-only control so chat identity retains space.
- Chat-wide defaults, response behavior, and personal context are separate `SettingsSection` compositions. Section headers use compact white uppercase utility text with normal letter spacing, a 4px logical inset, and the same restrained blue hue as the settings pane's secondary glow.
- Chat selectors and toggles use explicit section variants over the existing shadcn Select, Button, Switch, Label, and Tooltip primitives. Legacy variants remain visually unchanged until their owning route is migrated.
- Fields are full-width while the content column is constrained and adopt the reviewed 36rem cap only when container width allows it. This is based on available settings-column space and sidebar state rather than an incidental viewport breakpoint.
- Page state retains ownership of dirty detection, payload selection, service calls, cache updates, errors, and navigation. `ChatSettingsForm` owns presentation composition, `ChatContextBar` owns selected-chat context presentation, and shared setting components own product variants over shadcn primitives. Typed comparison helpers are shared by the Save disabled state and payload selection so those behaviors cannot drift.

These decisions extend the Shell and Profile baseline without changing any Chat service contract, stored value, defaulting rule, conditional field, or reset behavior.

### 12. Carry the reviewed Intelligence conventions forward

Milestone 3 established the route pattern for choice-oriented settings, and extends the section header treatment agreed in decision 11:

- A small, mutually exclusive choice uses a segmented `ToggleGroup` rather than stacked cards: one horizontal strip when the section container affords it, stacked full-width rows below that. The selected segment takes a filled coral surface with bold label and heavier icon stroke, and the active option's description sits below the group, swapping with the selection, so descriptions do not multiply across segments. Radix clears a single-select value when the active item is pressed again, so any caller must ignore the empty callback where the setting is never absent.
- Responsive decisions inside a settings section use container queries against `.settings-section-content`, never viewport breakpoints. The sidebar takes 20rem from the content pane, so a 768px viewport can leave a nested row narrower than a 640px phone; a viewport breakpoint gets that backwards.
- Sections that appear conditionally animate in and out on a `grid-template-rows` transition with the content permanently mounted, and become `inert` while collapsed so a hidden subtree leaves the tab order. Revealing a section scrolls it into view only on entry, never on load of an already-selected value.
- Dense numeric data is presented as one surface with typography carrying the structure: a section label, then a two-column grid with labels at the start and right-aligned tabular mono figures, separated by hairlines. Groups are not each boxed into their own card, and `<dl>`/`<dt>`/`<dd>` carry the label-value relationship.
- Section header glow uses the pane's indigo at 30% with a soft falloff; header text stays warm white per decision 11. The blue lives in the glow, not the letterforms.
- Trailing controls on a select row are siblings of the trigger, not children of it, so they remain operable when the trigger is disabled and never crowd the selected value. Within an option row, the label grows and trailing controls sit at the end in DOM order — `| label … [help] [indicator] |` — rather than being absolutely positioned against a padding reserve.
- Repeated product structures are extracted once a slice proves reuse: `ToolTypeRow` for a single tool's icon, name, description, and selector, and `SettingsGuideChip` for the subdued next-step link that appears below a settings section on Profile, Chat, and Intelligence.

These decisions extend the Shell, Profile, and Chat baseline without changing any Intelligence service contract, preset defaulting rule, tool-choice semantics, or cost-estimate data.

### 13. Audit a primitive's base class before overriding it

Every remaining slice restyles shadcn primitives, and a generated base class encodes assumptions about the layout it was written for. Those assumptions are typically expressed with a pseudo-class, attribute, or variant selector, which outranks a plain utility passed through `className` — so when a redesign contradicts one, the base wins silently and the symptom surfaces away from its cause.

Milestone 3 hit this four times. `AccordionItem`'s `border-b last:border-b-0` assumes a divided list, so the last card lost its bottom border. `DrawerContent`'s `data-[vaul-drawer-direction=bottom]:rounded-t-lg` and `max-h-[80vh]` outranked plain `rounded-t-3xl` and `max-h-[85vh]`, leaving both overrides inert. `SelectItem`'s absolutely positioned indicator required a padding reserve that pushed a sibling control inward, which no margin value could correct. `CardHeader`'s `[.border-b]:pb-6` is a variant `tailwind-merge` cannot pair with `py-0`, so it defeated the consumer's intent as soon as the underlying utility began compiling.

The practice: read the base `cn(...)` first and note every declaration carrying a pseudo-class, attribute, or variant selector. Then match that specificity, cancel the declaration within its own group, or restructure so the conflict cannot arise. Prefer restructuring — moving `SelectItem`'s indicator into flow deleted the padding reserve and every margin that had accumulated around it. Needing a magic number to align two adjacent elements is evidence the structure is wrong rather than the value, and `tailwind-merge` should be verified with `cn()` rather than assumed to have reconciled a variant against its plain counterpart.

### 14. Replace the public feature gallery with authenticated, task-oriented Help

The current Help destination is implemented by `FeaturesPage` at `/:lang_iso_code/features`. It conditionally works without a session, duplicates the landing page's marketing role through ten static feature cards, retains legacy glass styling, and owns separate optional-auth Header logic around the shared shell. The redesign will make a clean cutover to `HelpPage` at `/:lang_iso_code/help`, with matching internal page and navigation names and no compatibility route or alias. It will require a valid Agent session, remove the anonymous content branch and standalone marketing call-to-action, and retain the standard shared application Footer.

Help is a product surface, not a second landing page. Only authenticated users who completed onboarding receive the normal reviewed settings shell and product guide. A direct Help visit by a user who has not accepted policies follows the global policy gate back to onboarding before guide content renders. Missing or expired sessions use the existing page-error path rather than rendering product guidance anonymously.

The content model follows the landing page's strongest editorial pattern — concrete task or prompt, plain-language mechanism, important limit, then the next action — without copying its hero scale or promotional sections. The backend OpenAPI contract and feature services are the factual source for prerequisites and consequential behavior. Initial guide priorities are:

1. Finish setup and choose an access path.
2. Configure Intelligence by capability, including the distinction between selecting a tool and configuring its provider or prepaid access.
3. Understand credits, variable costs, usage records, transfers, and purchases.
4. Configure personal and per-chat behavior.
5. Use media, monitoring, search, and group capabilities with explicit availability notes.
6. Sponsor another user and understand pending, accepted, expiry, payer, and revocation behavior.
7. Connect Telegram and WhatsApp profiles with clear merge and key-rotation consequences.

The page will use concise topic navigation and progressive disclosure rather than a search system or a wall of equivalent cards. Direct in-product links take users to the relevant settings route; canonical landing, source, legal, or self-hosting material remains external where appropriate. Every guide is localized in all maintained locales.

Alternative considered: preserve anonymous Help as a lightly restyled Features page. The public landing page already owns discovery and product positioning; retaining a second anonymous marketing surface would preserve duplicated shell logic and leave existing users without procedural guidance.

### 15. Give onboarding a focused shell and verify every branch with real local state

Onboarding is currently a four-screen carousel inside the generic settings card and global action bar. Policy lock already removes navigation data, but the remaining Header and sticky settings-action composition still look like an empty settings page. Legacy `CardSelector` glass states, green selection styling, amber progress dots, and the generic atmosphere also predate the reviewed product layer.

The redesigned flow keeps the existing policy/language, profile, Intelligence preset, and access sequence, including sponsored and waitlist branches and every completion service call. It replaces the settings shell with a focused onboarding composition:

- no sidebar, drawer trigger, credit balance, profile/chat navigation, or global sticky settings action bar;
- minimal product identity plus essential session status only;
- a meaningful four-step progress treatment with translated labels rather than unlabeled color dots;
- one active step surface with local Back and Continue or Finish controls;
- no actions in the waitlist state;
- product-layer fields and selectors using the reviewed secondary blue for interactive emphasis and semantic colors only for status;
- responsive step content, visible keyboard focus, and reduced-motion-safe transitions.

The interaction remains production-real: hooks, caches, payload construction, chat-language updates, policy acceptance, and destination routing are unchanged. For owner review, persistent account branches are selected through normal local database fields and transient loading, disabled, and API-error states are exercised through browser interception; no simulation route, query, fixture parser, or alternate completion behavior ships in product code. The same rendered page must cover standard provider-key access, standard prepaid-credit access, sponsored, invited, waitlisted, loading, disabled, and API-error states before the milestone is approved. No review may submit production data.

Alternative considered: review onboarding only with the current authenticated account state and no local state changes or browser interception. That cannot reliably reach sponsorship, invitation, waitlist, loading, and failure branches and would leave the most consequential first-use surface largely uninspected.

## Risks / Trade-offs

- [Shared shell changes affect legacy routes before their content is migrated] → Keep the shell compatible with existing children, review all route chrome in the first milestone, and avoid changing route content contracts.
- [Global shadcn or token edits can produce wide visual regressions] → Change only primitives required by the active slice, search all consumers, and include those consumers in milestone review.
- [Temporary coexistence leaves two visual generations] → Treat coexistence as an explicit migration state and remove legacy helpers in the final slice after all consumers move.
- [Presentation extraction can accidentally alter effects or service calls] → Freeze services and hooks, retain controlled values and callbacks, and keep behavior changes out of visual commits.
- [Desktop screenshots do not prove responsive or accessible behavior] → Require owner review at representative narrow and wide viewports plus keyboard and reduced-motion checks at each milestone.
- [Locally bundled fonts add dependency or asset maintenance] → Pin the asset source and license, update both lockfiles when a package is used, and keep robust system fallbacks.
- [Long pages and dense data routes can remain visually inconsistent after simple token changes] → Give Usage, Purchases, Intelligence, and Access dedicated vertical slices rather than forcing them through one generic form layout.
- [No automated UI regression suite currently exists] → Use explicit offline manual interaction checklists and create tests only after separate owner approval.
- [Help guidance can drift from product behavior] → Ground each consequential claim in the landing source, backend OpenAPI contract, or feature implementation during Milestone 7 and keep guide copy task-focused rather than exhaustive.
- [Onboarding review tooling can accidentally become production behavior] → Select persistent branches through normal local database state, keep transient response interception outside product code, prove the production path still uses the existing hooks and services, and never submit production data during review.

## Migration Plan

1. Record the current route/state checklist and confirm the first milestone's visual direction from the supplied screenshots and landing-page sources.
2. Implement one milestone only, using the smallest foundation and component changes required by that slice.
3. Run `bun run lint` and `bun run build`, then verify the slice offline and exercise its responsive, keyboard, loading, empty, error, disabled, overlay, and destructive states as applicable.
4. Stop and provide the two-item handoff. Wait for owner code and UI approval.
5. Revise only the current milestone until approved, then continue with the next vertical slice.
6. In Milestone 9, migrate the final exceptional surfaces, remove proven-unused legacy presentation code, verify every route and locale, and complete a full application review.

Rollback is milestone-local: revert only the current unapproved milestone. No data migration or backend rollback is required.

## Open Questions

None for the reviewed Shell and Profile direction. Later route-specific composition remains subject to its milestone review.
