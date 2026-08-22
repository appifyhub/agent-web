## Why

The recent AppifyHub and The Agent landing-page redesigns established a newer shared family language while this settings application still represents the previously matching design generation. Evolving the settings experience now can restore that relationship and use the existing shadcn integration to reduce visual and component-level duplication without disrupting the workflows users already rely on.

## What Changes

- Evolve the settings application toward The Agent landing page's product-specific visual system while retaining recognizable AppifyHub family traits.
- Establish semantic color, typography, spacing, radius, surface, and interaction tokens that work without runtime access to third-party design assets.
- Make shadcn primitives the canonical base for controls, overlays, feedback, and layout compositions, with small product-level settings components layered above them.
- Simplify the shared settings shell, navigation, action area, content hierarchy, and responsive composition without changing user tasks; the obsolete public Features destination is intentionally replaced by authenticated Help at `/:lang_iso_code/help`.
- Replace the public, marketing-style Features surface with authenticated in-product Help that uses the landing page's editorial strengths and verified backend behavior to explain complex user workflows.
- Redesign onboarding as a mandatory, focused, navigation-free setup flow and verify its standard, sponsored, invited, waitlist, and transient failure branches through normal local account state and browser interception without adding production simulation behavior.
- Migrate settings routes as reviewable vertical slices that include the relevant tokens, shadcn-based components, real page composition, states, and verification in the same milestone.
- Preserve API contracts, persistence behavior, service and cache semantics, translations, access-token handling, error presentation, and offline local development throughout the redesign.
- Stop after every milestone for owner review of both code and rendered UI; later milestones do not begin until the current slice is approved.

## Capabilities

### New Capabilities

- `agent-settings-experience`: Defines the shared visual language, shadcn-based composition rules, responsive settings shell, accessible interaction states, offline design assets, preserved workflow behavior, and review-gated route migration.

### Modified Capabilities

None.

## Impact

- Affected areas include `src/index.css`, `src/components/ui/`, shared settings components, `BaseSettingsPage`, `Header`, `Footer`, and the settings pages under `src/pages/`.
- The Agent landing page and backend repository are read-only research sources for Help copy, examples, limits, and workflow semantics; their implementations are not changed by this work.
- Local font or other brand assets may be added so the intended design remains available during offline development; runtime CDN dependencies will not be introduced.
- Additional shadcn/Radix primitives may be added only when a vertical slice needs them, using both Bun and npm dependency metadata as required by the project.
- Backend APIs and routes, service contracts, caches, token storage, and persisted settings formats are out of scope for behavioral change.
- Existing translations remain authoritative; any new user-facing copy must be added to every locale through the existing project workflow.
