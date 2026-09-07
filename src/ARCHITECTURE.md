# MedClub source architecture — V0.11

| Directory               | Responsibility                                                                 |
| ----------------------- | ------------------------------------------------------------------------------ |
| `app/router`            | Lazy public/auth/personal routes, guarded return paths, titles and transitions |
| `app/providers`         | Query, services, auth, locale, appearance, workspace and overlay state         |
| `app/layouts`           | Distinct public, auth and personal application worlds                          |
| `components/ui`         | Reusable controls and native-dialog modal lifecycle                            |
| `components/navigation` | Responsive rails, phone dock, overflow measurement and feature navigation      |
| `components/cards`      | Academic, discovery, community, mentorship, store and recruitment presentation |
| `features/auth`         | Sign-in, registration, verification, recovery and WebGL identity field         |
| `features/profile`      | Authenticated account details, editing and sign-out                            |
| `features/recruitment`  | Public positions, applications, onboarding, team identity and volunteer hours  |
| `features/*`            | Other feature-owned screens, workflows and selectors                           |
| `data/mock`             | Typed illustrative content outside JSX                                         |
| `services`              | API contracts, local preview adapters, search and persistence                  |
| `hooks`                 | Shared queries, mutations, content paths and scroll-cue measurement            |
| `types`                 | Auth, content, student, workspace, commerce and recruitment contracts          |
| `constants`             | Configuration, route builders and bilingual messages                           |
| `styles`                | Tokens, RTL/accessibility and cumulative release layers                        |
| `admin`                 | Operations, review, audit, versions and the visual page-composition workspace  |
| `admin/builder`         | Page library, typed block canvas, inspector, preview and editing history       |
| Reserved admin folders  | Future users, roles and broader management modules                             |

## Identity flow

`AuthProvider` consumes the injected `AuthService`; pages never read browser storage directly. `RequireAuth` resolves three states: loading, anonymous, or authenticated. Anonymous requests are redirected to `/auth/sign-in` with a same-origin `returnTo`; unverified registrations are directed to `/auth/verify`. `safeReturnTo` accepts only internal paths.

The local adapter owns the demo account and browser-local registrations. It normalizes corrupt storage, broadcasts cross-tab changes, avoids raw registered-password storage, updates the shared personal-profile query and falls back to tab memory if storage is blocked. These behaviors make a coherent preview, not a security system.

The production replacement must establish identity on the server. It must not trust student IDs, role names, route visibility, local storage or client capability checks.

## Four application worlds

- Public: discovery-focused MedClub pages and public navigation.
- Auth: task-first form surface paired with a decorative medical WebGL field; no public or personal rail.
- Personal: protected My MedClub shell with account-aware profile data and a clear return to the public platform.
- Admin: protected operations shell with explicit review, audit and version boundaries.

`SpaceTransition` distinguishes all four without hiding a focused descendant. Titles and route focus are managed centrally.

## Admin operations

`AdminService` owns overview metrics, content workflow records, activity history and versions. Pages consume it only through query hooks. The local adapter validates allowed status transitions, requires notes for requested changes, blocks publication without approval/rights/references and appends versions and activity records for every mutation.

Restoration copies an earlier snapshot into a new version; it never deletes history. Activity records are read-only in the interface and intentionally exclude arbitrary values that could become secrets.

The V0.10 route guard proves identity only. It is not a permissions system. A production adapter must enforce capability-based authorization, founder protection, reviewer assignment, high-risk approvals and immutable audit persistence on the server. Those governance rules remain V0.12 scope.

## Page composition

`BuilderService` owns page documents, summaries, reusable blocks and milestone versions. The editor consumes the service through query hooks and keeps its working canvas in an undo/redo history. A debounced save writes the current structured document; public rendering is represented by the same `BuilderBlockPreview` contract rather than raw HTML.

Each block has a stable ID, a typed kind, bilingual content, an enabled state, audience/language visibility and an optional schedule. Page-level records add path, theme, audience, SEO metadata, status and revision. Groups contain related child blocks, while data blocks identify their source rather than embedding fetched API results.

Publishing and scheduling first save the latest draft and then append a milestone version. Restoration copies a prior snapshot into a new draft revision without deleting later history. Browser-local persistence is only a preview adapter: production must validate documents, resolve schedules, sanitize rich content, store assets, enforce capabilities and publish atomically on the server.

## WebGL field

`MedicalFieldCanvas` is a dependency-free WebGL renderer. It builds a double-helix-style point field plus low-density depth particles, uses restrained pointer parallax, caps rendering density, pauses when offscreen and cleans up listeners/resources. It is `aria-hidden` and has no semantic responsibility. Missing WebGL and `prefers-reduced-motion` use the static CSS composition.

## Navigation containment

`useNavigationScrollCues` measures the public and personal rail in either orientation using scroll events, resize observation and route changes. Scroll regions own their overflow, native scrollbars are hidden, and logical shadow cues indicate content above/below or before/after. Horizontal mega-menu content sits outside the clipping region so it remains usable while destinations cannot leak out of the rail.

## Existing domain architecture

V0.1–V0.8 retain the `UI → hooks/providers → MedClubServices → adapter` boundary. Academic relationships, normalized workspace persistence, search, notifications, event registration, opportunities, community, journal review, mentorship, contributions, store reservations and identity continue to share typed records and account profile.

## Recruitment workflow

`RecruitmentPosition` describes public role facts. `RecruitmentApplication` owns the student's form, stage, history, interview and onboarding tasks. `ClubMembershipProfile` owns organizational team identity, simultaneous positions and volunteer-hour records. These records are related, but none grants a website capability.

`useRecruitmentWorkspace` resolves the authenticated student, then calls the injected recruitment service. Public role queries remain usable without authentication; applications and membership do not. Search indexes public positions, calendar composes scheduled interviews, and notifications derive status updates from the same records.

The local adapter normalizes malformed storage, locks submitted drafts, prevents duplicate active applications and limits withdrawal/onboarding mutations to valid states. A production service must re-enforce every transition server-side and record reviewer identity, reasons, consent and audit events.

ISO timestamps retain explicit offsets and presentation uses `APP_TIMEZONE` (`Asia/Amman`). A production backend must own identity, time-sensitive authorization, recruitment decisions, hour verification, data retention and notification delivery.
