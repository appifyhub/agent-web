## Purpose

Defines a cohesive, accessible, offline-capable settings experience that belongs to The Agent while preserving every existing settings workflow and its AppifyHub relationship.

## ADDED Requirements

### Requirement: The settings application uses the current The Agent design language
The settings application SHALL use The Agent's current product-specific dark visual language, warm high-contrast text, coral and logo-derived technical accents, modern sans-serif typography, disciplined surface hierarchy, and rounded geometry. It SHALL retain recognizable AppifyHub family traits without adopting the AppifyHub landing page's green portfolio styling as the product application's primary theme.

#### Scenario: User opens a settings route
- **WHEN** a user opens any redesigned settings route
- **THEN** the route is visibly identifiable as part of The Agent and remains recognizably related to the AppifyHub family

#### Scenario: Status color is semantically required
- **WHEN** a setting or record communicates success, warning, error, or another status
- **THEN** the interface may use the appropriate semantic status color without treating that color as the page's brand accent

### Requirement: Existing settings behavior is preserved
The redesign SHALL preserve existing route URLs except for the approved Features-to-Help cutover, plus all navigation destinations, loaded values, editing behavior, save behavior, cancel and close actions, session-expiry handling, API-error presentation, access-token handling, sponsorship operations, profile-linking operations, provider-key management, intelligence selection, usage and purchase operations, and onboarding gates.

#### Scenario: User edits and saves a setting
- **WHEN** a user changes a supported setting and activates the existing save action
- **THEN** the application submits the same value through the same existing service contract and presents the resulting success or error state

#### Scenario: User does not change a setting
- **WHEN** a route has no unsaved changes
- **THEN** its save affordance retains the existing disabled or unavailable behavior

#### Scenario: User performs a non-editing workflow
- **WHEN** a user navigates, filters records, buys or transfers credits, manages sponsorships, links profiles, manages provider keys, or completes onboarding
- **THEN** the workflow retains its existing inputs, safeguards, service calls, and outcome

### Requirement: Settings navigation remains complete and context-aware
The settings application SHALL provide access to every existing destination at supported viewport sizes, visibly identify the current destination, preserve the selected chat context where relevant, and keep credit, language, profile, help, and session controls available wherever they are currently allowed.

#### Scenario: User navigates on a wide viewport
- **WHEN** a user views the settings application at a supported wide viewport
- **THEN** all route groups are discoverable without losing the current page and chat context

#### Scenario: User navigates on a narrow viewport
- **WHEN** a user opens navigation at a supported narrow viewport
- **THEN** the complete navigation is available in an accessible overlay that closes after a destination is selected

#### Scenario: User navigates between the small and medium breakpoints
- **WHEN** the viewport is at least the small breakpoint and below the medium breakpoint
- **THEN** navigation remains visible as a collapsed icon rail
- **AND** activating its trigger or collapsed Chats parent expands the same navigation over the content without shrinking the content pane or changing the user's persisted desktop sidebar preference

#### Scenario: User collapses wide navigation
- **WHEN** the user collapses the wide sidebar
- **THEN** the sidebar becomes a slightly wider icon rail with centered logo and navigation icons, no clipped text, and the active destination remains identifiable

#### Scenario: A chat is active
- **WHEN** the current route represents a selected chat
- **THEN** the selected chat row owns the bordered active surface, the expanded chat parent uses accent text without a second active surface, and the collapsed chat parent icon communicates the active chat context

### Requirement: The shared header preserves spatial continuity
The sidebar header and content header SHALL form one aligned bar with the same height, border position, and background. On wide expanded layouts, the sidebar SHALL own the logo, short application name, and locale picker while the content header uses the translated category name without a concatenated “settings” suffix. On collapsed layouts, the content header SHALL prefix that category name with the short application name and a chevron, and the locale picker SHALL remain available after expansion rather than competing with the centered logo rail. On narrow layouts, the main header SHALL keep the logo and non-interactive short application name on the left and place the right-side navigation trigger after the session utility, while the right-side drawer header owns the logo, short application name, locale picker, and matching panel-side close action.

#### Scenario: Narrow header space is constrained
- **WHEN** the viewport is below the small breakpoint
- **THEN** the session timer becomes a status-preserving icon and its details surface is fixed at the horizontal viewport center immediately below the header with at least a 16px viewport gutter

#### Scenario: User opens narrow navigation
- **WHEN** the user activates the right-side navigation trigger on a narrow viewport
- **THEN** the drawer enters from the right with a matching panel-side icon, the underlying main-header logo and application name fade out while open, and the drawer exposes locale selection and an explicit matching panel-side close action

#### Scenario: User activates the product logo
- **WHEN** the user activates the logo in either header presentation
- **THEN** the application navigates to Profile settings, while adjacent application-name text remains non-interactive

### Requirement: Settings content uses task-appropriate hierarchy
Each redesigned route SHALL present a clear page heading, supporting context when needed, semantically grouped settings or records, and actions adjacent to the scope they affect. Containers SHALL distinguish real objects or task groups rather than wrapping every piece of content in an equivalent card.

#### Scenario: User scans a form-oriented route
- **WHEN** a route contains editable settings
- **THEN** each setting exposes its label, helper text when present, current value, disabled state, and relevant reset or help action as one coherent group

#### Scenario: User scans a data-oriented route
- **WHEN** a route contains statistics, filters, records, or empty states
- **THEN** summary, filtering, record, and empty-state regions are visually distinct and ordered according to the task flow

#### Scenario: A page exposes primary actions
- **WHEN** the page heading is visible
- **THEN** primary actions share the title line and supporting eyebrow copy remains below the title

#### Scenario: The page heading scrolls away
- **WHEN** the title and primary-action line leaves the visible content area
- **THEN** a full-width sticky surface appears below the global header, keeps its title and actions within the settings content width, and excludes contextual navigation chips

#### Scenario: Profile is shown on different viewport widths
- **WHEN** Profile is shown below the small breakpoint
- **THEN** its field groups use the available width minus section padding
- **AND WHEN** Profile is shown at or above the small breakpoint
- **THEN** its field groups use the reviewed 28rem width and remain centered inside the settings section

#### Scenario: Profile offers a contextual next step
- **WHEN** Profile determines that credits, access keys, or intelligence configuration is the relevant next step
- **THEN** the translated destination appears as a subdued blue chip row below the settings section rather than inside the primary action area

#### Scenario: User opens Chat settings
- **WHEN** a selected chat is shown on the Chat route
- **THEN** a compact context bar exposes its truncated data-provided name, brand-colored platform icon, and translated private or group type without using the potentially long chat name as the page title
- **AND** collapsed navigation exposes a translated Configure Chats action that becomes icon-only below the small breakpoint

#### Scenario: User scans Chat settings
- **WHEN** Chat settings are available
- **THEN** chat-wide defaults, response behavior, and personal context controls appear in distinct translated settings sections
- **AND** each section uses the shared shadcn-based selectors or toggles while preserving admin-only controls, private-chat conditions, current values, reset actions, and disabled states

#### Scenario: Chat fields reflow
- **WHEN** the Chat content column is constrained
- **THEN** its fields use the available section width
- **AND WHEN** sufficient content-column width is available
- **THEN** fields use the reviewed desktop cap rather than stretching across the entire settings pane

### Requirement: Authenticated Help provides task-oriented product guidance
The public Features destination SHALL be replaced by authenticated in-product Help at `/:lang_iso_code/help`, with no compatibility route or alias. It SHALL use the reviewed application shell only for users who completed onboarding. Authenticated users who have not accepted policies SHALL be redirected to onboarding before guide content renders, and the guide SHALL NOT render without a valid session. Help SHALL replace the public marketing grid and standalone landing call-to-action with localized, task-oriented guidance grounded in verified landing-page positioning and backend behavior, while retaining the shared application Footer.

#### Scenario: An onboarded user opens Help
- **WHEN** an authenticated user who accepted policies opens Help
- **THEN** Help appears inside the normal product shell with clear topic navigation, practical examples, and direct links to the settings destinations that perform each supported task

#### Scenario: A user opens Help during onboarding
- **WHEN** an authenticated user who has not accepted policies opens Help directly
- **THEN** the global policy gate redirects to mandatory onboarding without rendering Help guidance or exposing regular settings navigation

#### Scenario: An unauthenticated visitor opens Help
- **WHEN** the Help destination has no valid user session
- **THEN** task guidance is not rendered and the existing session-error behavior explains that the settings application must be opened through an authenticated Agent session

#### Scenario: A user needs guidance for a complex workflow
- **WHEN** the user explores setup, Intelligence and provider access, credits and usage, chat behavior, sponsorship, connected profiles, media, monitoring, or related capabilities
- **THEN** Help distinguishes prerequisites, consequential behavior, availability, costs, limits, and the next in-product action without presenting backend implementation details

### Requirement: Onboarding uses focused chrome and remains fully reviewable
Onboarding SHALL preserve its policy, profile, Intelligence, access, sponsorship, waitlist, chat-language, save, and destination behavior while replacing the regular settings shell with a focused setup composition. The regular sidebar, navigation triggers, credit controls, Help access, and global sticky settings action bar SHALL be absent. Essential product identity and session status SHALL remain in minimal chrome, while progress and Back, Continue, and Finish actions SHALL belong to the active onboarding step. Persistent branches SHALL be selected through normal backend account state; browser interception MAY be used to review transient responses without adding simulation behavior to the production application.

#### Scenario: A user completes standard onboarding
- **WHEN** an authenticated, eligible user moves through policy and language, profile, Intelligence, and access
- **THEN** the interface communicates the current step and remaining progress, preserves the existing completion prerequisites and service calls, and routes to the same post-onboarding destination

#### Scenario: A sponsored user reaches access setup
- **WHEN** the loaded settings identify an active sponsorship
- **THEN** onboarding explains the sponsored access path instead of requiring provider keys or prepaid credits and preserves the existing sponsored completion route

#### Scenario: A user is waitlisted
- **WHEN** the user is waitlisted and not invited to start
- **THEN** the focused waitlist state replaces the setup steps and exposes no step actions

#### Scenario: The onboarding experience is reviewed
- **WHEN** the milestone is prepared for owner review
- **THEN** the real onboarding surface is exercised with local database state for standard-key, standard-credit, sponsored, invited, and waitlisted branches plus browser-intercepted loading, disabled, and error responses at narrow and wide viewports without submitting production data

### Requirement: The interface remains usable across responsive and accessible interaction modes
The redesigned settings application SHALL preserve content and actions across supported responsive layouts, provide visible keyboard focus, maintain readable contrast, expose control names and states to assistive technology, and respect reduced-motion preferences for non-essential motion.

#### Scenario: User operates a route with a keyboard
- **WHEN** a user navigates interactive elements using a keyboard
- **THEN** focus order follows the visual task order and every active control has a visible focus indicator

#### Scenario: User requests reduced motion
- **WHEN** the user's environment requests reduced motion
- **THEN** non-essential transitions and decorative motion are removed without hiding content or state changes

#### Scenario: Layout reflows
- **WHEN** the viewport narrows or content is zoomed
- **THEN** labels, controls, actions, navigation, and feedback reflow without overlap, clipping, or loss of operation

### Requirement: Design assets work during offline local development
The settings application's typography, icons, logos, component styling, and layout SHALL render without runtime access to third-party asset or font hosts. Data-dependent workflows MAY continue to require the locally configured backend.

#### Scenario: Developer starts the installed project without internet access
- **WHEN** dependencies are already installed and the developer runs the existing local development command without internet access
- **THEN** the intended application typography, icons, logos, component styling, and layouts render from local project or bundled dependency assets

### Requirement: User-facing copy remains localized
All new or changed user-facing labels, descriptions, feedback, empty states, and control names SHALL use the existing translation system and SHALL be supplied for every maintained locale without placeholder values.

#### Scenario: User opens a redesigned route in a supported language
- **WHEN** the route language is any maintained locale
- **THEN** all redesigned user-facing copy resolves through that locale's translation data and the layout remains operable

#### Scenario: A shared primitive exposes an accessible name
- **WHEN** a shared button, overlay, drawer, carousel control, icon, or other primitive exposes visible or assistive copy
- **THEN** that copy resolves through translations, decorative graphics expose no redundant label, and runtime product names come from configuration or translated brand data rather than route-local literals
