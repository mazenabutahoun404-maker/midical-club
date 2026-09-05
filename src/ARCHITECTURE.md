# MedClub source architecture — V0.5

| Directory                          | Responsibility                                                                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| app/router                         | Public/personal route branches, lazy pages, academic/workspace/medical transitions and safe route focus                  |
| app/providers                      | Query client, service injection, locale, appearance, workspace state, compatibility saved-items facade and overlay state |
| app/layouts                        | Public frame, personal frame and lazy search/detail overlays                                                             |
| components/ui                      | Reusable UI primitives and native Modal                                                                                  |
| components/navigation              | Desktop rail/top navigation, phone navigation, personal navigation, community tabs, mobile menus and appearance          |
| components/cards                   | Resource, course, event, opportunity, article, activity, academic-portal, batch and clinical cards                       |
| components/forms                   | SearchInput and SelectField                                                                                              |
| components/feedback                | Loading, retry, empty, error and planned-feature states                                                                  |
| components/data-display            | Headings, introductions and detail facts                                                                                 |
| features                           | Feature-owned screens and selectors                                                                                      |
| data/mock                          | Illustrative academic, discovery, community, journal and personal records                                                |
| services                           | Typed API boundary, mock registry, metadata search index, workspace persistence and preview event registration           |
| hooks                              | Shared query hooks and workspace-aware paths                                                                             |
| types                              | Content, student and workspace contracts                                                                                 |
| constants                          | Configuration, routes and bilingual interface messages                                                                   |
| styles                             | Tokens, foundations, RTL/accessibility and cumulative public, academic, personal, discovery and community layers         |
| admin and reserved feature folders | Future scope; their presence does not mean workflows are implemented                                                     |

## Content flow

Pages consume hooks/providers. Those call the injected `MedClubServices` registry. Only mock adapters import fixture records; static records are never declared in page JSX. Journal, event and resource details stay honest about sample content and absent source files.

Academic relationships remain Batch → AcademicTerm → Course → ordered CourseSection, with resources referencing courses and declaring shared or batch-specific audience. Events declare stable slugs, registration windows, capacity and waitlist behavior. Opportunities declare stable slugs and machine-readable type, field, location, year and deadline metadata.

Community content adds Article, CommunityActivity, MediaStory, ExecutiveBody, TeamMember, Recognition and ClubValue records. Public titles are display data and do not grant application permissions.

## Community and journal

The community gateway is a route-level composition layer, not a second copy of its source records. Activities, media, public team history and recognitions are fetched through typed service contracts. Journal articles use stable slugs and join the same search/save/library flow as earlier content.

Article presentation exposes authorship, publication date, tags and scientific reviewer. The current fixtures model the metadata boundary but do not implement approval. A production adapter must enforce contributor, references, rights and scientific review server-side before returning published records.

## Events and opportunities

Public index/detail pages consume the same event and opportunity records used by homepage cards, search, library, calendar and notifications. `MedClubServices.events` owns registration mutations; page components do not edit capacity or browser storage. The current local adapter is intentionally a preview. A real API must enforce all reservation rules atomically.

Saving remains workspace state. Registration is a separate domain state. Calendar and reminders compose both without treating a bookmark as attendance.

## Workspace state

`WorkspaceProvider` resolves the profile ID, loads `workspace.get(id)` with TanStack Query, and serializes `dispatch(id, action)` calls. The mock adapter reads the latest persisted state, applies a pure reducer and returns an isolated snapshot. Failed writes are surfaced; unavailable storage uses an in-memory session fallback. Components do not write workspace JSON directly.

`SavedItemsProvider` and `useSavedItems` remain compatibility entry points for earlier card code, backed by the workspace service. Legacy saves migrate only for `demo-student`. Memberships are removed on unsave; deleting a collection does not unsave items. State normalization handles damaged persisted records. Same-browser tabs refresh through storage events; simultaneous cross-tab changes are last-write-wins.

An API adapter must provide real identity, ownership checks, validation and concurrency handling. Student IDs and route branches in React are not security boundaries.

## Search

One index and one `SearchPanel` serve the command modal and full page. Search normalizes English/Arabic text, expands a small configurable alias set, filters before returning matches, and ranks direct title matches. Articles add authors and tags to the metadata index. Personal scope uses profile course IDs. It is not PDF indexing or authorization.

## Navigation and motion

The personal navigation hides native scrollbars while retaining keyboard, wheel and touch scrolling. Measured scroll position controls non-interactive edge shadows, including horizontal and RTL layouts; the cues disappear when no more content exists in that direction.

`MedicalTransition` adds a short scan-line route reveal to V0.5 community pages. Community tabs use pulse/signal icon responses for hover and active states. All decorative motion is disabled or shortened by `prefers-reduced-motion`; it never delays access to content.

## Modal and routing lifecycle

`Modal` uses native dialog `showModal()`/`close()`. It does not manually aria-hide the application shell. Escape is handled through `cancel`; the browser controls focus and background inertness. All active application modals, the mobile menu and appearance switcher use this wrapper.

`RouteEffects` moves focus after navigation only if the user has not already moved it or opened a modal. `SpaceTransition` continues to separate `/my` from the public community without remounting the personal shell between subpages.

## Dates

Demo content uses ISO timestamps with explicit offsets. Date presentation uses `APP_TIMEZONE` (`Asia/Amman`). Calendar fixtures use a stable September 2026 anchor, while user preview/saved timestamps reflect the actual action time. Study-entry input is interpreted as Amman wall time in the mock adapter.

Before integrating real scheduling across regions or daylight-saving changes, let the API own timezone conversion and schedule delivery.
