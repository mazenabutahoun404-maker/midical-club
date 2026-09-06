# MedClub source architecture — V0.8

| Directory                    | Responsibility                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------ |
| `app/router`                 | Lazy public/auth/personal routes, guarded return paths, titles and transitions |
| `app/providers`              | Query, services, auth, locale, appearance, workspace and overlay state         |
| `app/layouts`                | Distinct public, auth and personal application worlds                          |
| `components/ui`              | Reusable controls and native-dialog modal lifecycle                            |
| `components/navigation`      | Responsive rails, phone dock, overflow measurement and feature navigation      |
| `components/cards`           | Academic, discovery, community, mentorship and store presentation              |
| `features/auth`              | Sign-in, registration, verification, recovery and WebGL identity field         |
| `features/profile`           | Authenticated account details, editing and sign-out                            |
| `features/*`                 | Feature-owned screens, workflows and selectors                                 |
| `data/mock`                  | Typed illustrative content outside JSX                                         |
| `services`                   | API contracts, local preview adapters, search and persistence                  |
| `hooks`                      | Shared queries, mutations, content paths and scroll-cue measurement            |
| `types`                      | Auth, content, student, workspace and commerce contracts                       |
| `constants`                  | Configuration, route builders and bilingual messages                           |
| `styles`                     | Tokens, RTL/accessibility and cumulative release layers                        |
| `admin` and reserved folders | Future scope; directory presence does not imply implementation                 |

## Identity flow

`AuthProvider` consumes the injected `AuthService`; pages never read browser storage directly. `RequireAuth` resolves three states: loading, anonymous, or authenticated. Anonymous requests are redirected to `/auth/sign-in` with a same-origin `returnTo`; unverified registrations are directed to `/auth/verify`. `safeReturnTo` accepts only internal paths.

The local adapter owns the demo account and browser-local registrations. It normalizes corrupt storage, broadcasts cross-tab changes, avoids raw registered-password storage, updates the shared personal-profile query and falls back to tab memory if storage is blocked. These behaviors make a coherent preview, not a security system.

The production replacement must establish identity on the server. It must not trust student IDs, role names, route visibility, local storage or client capability checks.

## Three application worlds

- Public: discovery-focused MedClub pages and public navigation.
- Auth: task-first form surface paired with a decorative medical WebGL field; no public or personal rail.
- Personal: protected My MedClub shell with account-aware profile data and a clear return to the public platform.

`SpaceTransition` distinguishes all three without hiding a focused descendant. Auth titles and route focus are managed centrally.

## WebGL field

`MedicalFieldCanvas` is a dependency-free WebGL renderer. It builds a double-helix-style point field plus low-density depth particles, uses restrained pointer parallax, caps rendering density, pauses when offscreen and cleans up listeners/resources. It is `aria-hidden` and has no semantic responsibility. Missing WebGL and `prefers-reduced-motion` use the static CSS composition.

## Navigation containment

`useNavigationScrollCues` measures the public and personal rail in either orientation using scroll events, resize observation and route changes. Scroll regions own their overflow, native scrollbars are hidden, and logical shadow cues indicate content above/below or before/after. Horizontal mega-menu content sits outside the clipping region so it remains usable while destinations cannot leak out of the rail.

## Existing domain architecture

V0.1–V0.7 retain the `UI → hooks/providers → MedClubServices → adapter` boundary. Academic relationships, normalized workspace persistence, search, notifications, event registration, opportunities, community, journal review, mentorship, contributions and store reservations continue to share the same typed records and account profile.

ISO timestamps retain explicit offsets and presentation uses `APP_TIMEZONE` (`Asia/Amman`). A production backend must own identity, time-sensitive authorization, data retention and notification delivery.
