# Personal workspace extension points

The public experience and My MedClub are independent route layouts. The shared providers keep saved items, language and appearance stable while the page frame changes.

## Sidebar

`SidebarToggle` is used by both sidebars. `AppearanceProvider` stores `{ navigation, sidebarCollapsed }` under the existing `medclub.appearance.v1` key. Older orientation-only records work without a migration step; absent collapse state means expanded. Invalid storage uses the default vertical, expanded sidebar. If a write fails, the changed state still works for the session.

At widths of 768 px and above, vertical navigation can collapse to a 76 px icon rail. `NavigationHint` adds hover/focus labels in this mode; accessible link names remain in the DOM. The compact Learn disclosure opens beside the public rail. Horizontal navigation ignores the compact state visually while retaining its value. Phones always use the bottom dock.

## Personal layout and routes

`PersonalLayout` mounts its own navigation and header. The public footer and public menu are not mounted. All personal subpages share that frame; only the content changes. The header includes Back to MedClub, scoped search, language and settings. The default entry is the dashboard at `/my`; identity details are at `/my/profile`.

`SpaceTransition` detects crossings between `/my/*` and public routes. It keys only that boundary and uses a short opacity transition with a fading tint. It honors reduced motion and avoids transforming the fixed-navigation ancestor. Direct loads do not play an entrance transition. Overlays close on route changes, and the personal not-found page links back into the personal home.

`useWorkspacePaths` chooses public or personal course URLs and breadcrumb roots. Use it for new reusable academic components so a personal link does not unexpectedly open the public shell. Personal search filters results using the profile's course IDs and navigates to `/my/learning/:slug`.

## Data and persistence

`StudentProfile` is defined in `types/student.ts`. `MedClubServices.personal.getProfile()` supplies it, currently from `data/mock/student.ts`. Set its `courseIds` to existing course IDs. Its `focusMinutes` initializes the personal timer; it is not a count of time spent. Dashboard saved counts are computed from records that still exist, using the same selector as the library.

Only sample identity is shown. Browser-local saved items and preferences are working features; authentication, editable identity, account-specific storage and server synchronization are not implemented. A future signed-in implementation must provide real backend access checks and account-scoped persistence. The visual separation is not a security boundary.

No new package dependencies were added for this revision. Replace the complete `src` tree together, since routes, service types, providers, translations and shared cards changed alongside the new pages.
