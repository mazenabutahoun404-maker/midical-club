# Source ownership

| Directory | Responsibility |
| --- | --- |
| `app/router` | Route tree, lazy route loading, route titles, hash navigation, transitions |
| `app/providers` | Query client, dependency injection, locale, appearance preferences, saved state and dialogs |
| `app/layouts` | Independent public and personal shells; global feature overlays |
| `components/ui` | Low-level reusable primitives |
| `components/navigation` | Desktop sidebar/optional top bar, phone dock, Learn disclosure, workspace header, appearance dialog, language, brand and footer |
| `components/cards` | Course/resource/event/opportunity cards and save control |
| `components/forms` | Search input |
| `components/feedback` | Skeleton/loading, empty, error, notices, fallback page |
| `components/data-display` | Headings, breadcrumbs and detail facts |
| `features/homepage` | Homepage composition and independent section renderers |
| `features/academics`, `courses`, `resources` | Sample catalogue, course routes, filters and resource metadata |
| `features/search` | Public command search and profile-scoped personal search |
| `features/library` | Device-local saved collection |
| `features/student-dashboard` | Personal landing page using profile and shared saved-item selectors |
| `features/profile`, `features/settings` | Read-only sample profile and working device preferences |
| `features/events`, `opportunities`, `community` | Preview detail and article renderers |
| `features/utilities` | Working focus timer preview |
| Other feature directories and `admin/*` | Reserved for later releases, explicitly documented |
| `hooks` | Shared queries and debounce |
| `services` | Async interface, mock implementation, bilingual search |
| `types` | Content models and discriminated result/detail types |
| `constants` | App configuration, translations and route helpers |
| `lib` | Date/localization helpers, section filtering and class composition |
| `styles` | Theme, responsive layout, accessibility and RTL adjustments |
| `data/mock` | Typed sample content, stored independently of components |
| `assets/brand` | Original supplied logo |
| `vendor` | Local styling dependency and its license |

A page uses hooks; a hook uses a service; the service reads data. Feature components never import mock records. A future server adapter replaces the registry while preserving those call sites.

Runtime records are structured as typed data, not injected HTML. Personal preview state contains language, saved record IDs, navigation orientation and sidebar collapse state. No authentication or organization permissions are inferred from these local values.

`/my/*` is a separate layout branch. `SpaceTransition` animates a public/personal boundary change without remounting the personal shell between its subpages. `useWorkspacePaths` keeps reused course/resource cards and breadcrumbs in their current space. Search uses separate query keys and limits personal results to the course IDs from `personal.getProfile()`. This is presentation scoping, not a backend authorization mechanism.

`useLibraryContent` supplies both the personal dashboard and library so stale saved IDs are excluded consistently. The service contract's `StudentProfile` model is implemented by `data/mock/student.ts` through the mock adapter. No component imports that fixture directly.

Public page sections, detail renderers, cards and primitives are separate modules. The current homepage does not contain a catalogue, search, library or store implementation inside one large page component.
