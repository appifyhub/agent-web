## Route baseline

| Surface | Preserved behavior and states |
|---|---|
| Shared shell | Token and onboarding gates, session countdown and expiry, blocker and dismissible errors, language switching, chat context, credits, help, footer links, loading state, and narrow navigation |
| Profile | Fetch, edit, clear, keyboard save, trimming, changed-payload save, disabled save, blocker state, success feedback, and conditional links to Intelligence, Purchases, or Access |
| Legacy routes | Chat, Intelligence, Access, Usage, Purchases, Sponsorships, Linked Profiles, and Onboarding remain hosted by the shared shell without changing their child contracts |

## Review states

- wide and narrow navigation, including active destinations and the selected chat
- loading, loaded, dirty, saving, saved, blocker-error, and dismissible-error states
- enabled, disabled, hover, focus-visible, and reduced-motion interaction states
- installed local development with third-party font hosts unavailable

The supplied settings screenshots and the pre-change source are the visual and behavioral comparison set. No automated test files are introduced in this milestone.
