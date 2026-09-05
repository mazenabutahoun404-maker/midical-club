# MedClub V0.5 — Community & Medical Journal

Source-only release for an existing React + TypeScript + Vite + Tailwind CSS 4 setup. It contains the complete V0.1–V0.4 source plus the V0.5 community and journal release. Project scaffolding, `node_modules`, build output and secrets are intentionally excluded.

## Integrate

1. Back up your current `src` directory.
2. Replace it with this complete `src` directory. Routes, contracts, navigation, messages and styles changed together, so do not copy only the new pages.
3. Keep the existing package and Vite/Tailwind configuration. V0.5 adds no dependency.
4. Run the normal type-check, tests and production build.
5. Test with existing browser storage intact. V0.1–V0.4 saves, registrations, collections, language and appearance preferences remain compatible.

## V0.5 outcome

| Area                | Implemented behavior                                                                                                                    |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Community           | Dedicated landing page joining activities, journal, media, executive bodies, recognitions and club identity                             |
| Activities          | Search, animated category tabs, participation details and clearly labelled illustrative outcomes                                        |
| Medical Journal     | Searchable/filterable article index, dedicated article routes, authorship, scientific reviewer, dates, tags and save-to-library support |
| Media               | Rights-aware archive shell with designed placeholders instead of fabricated club photography                                            |
| Governance          | Executive-body terms and public titles kept separate from application permissions                                                       |
| Recognition         | Separate Honor Plate and Hall of Honor routes with structured records                                                                   |
| About               | Logo-led club story, values and accountable content principles                                                                          |
| Experience          | Clinical-signal route reveals, pulse-based icon motion, red/russet diagnostic surfaces, responsive/RTL/reduced-motion support           |
| Personal navigation | Hidden scrollbar with position-aware top/bottom or start/end shadow cues                                                                |
| Data boundary       | Expanded typed records and replaceable community/journal service adapters                                                               |

The original public and personal shells, collapsible vertical desktop navigation, optional horizontal desktop navigation, phone dock, academic journeys, search, library, calendar, notifications, dashboard, events, opportunities and utilities remain included.

## New routes

| Route                         | Screen                                   |
| ----------------------------- | ---------------------------------------- |
| `/community`                  | Community gateway                        |
| `/community/activities`       | Searchable activity archive              |
| `/community/media`            | Rights-aware media archive               |
| `/community/executive-bodies` | Public team terms and positions          |
| `/community/honor-plate`      | Academic and service recognition         |
| `/community/hall-of-honor`    | Long-term club recognition               |
| `/community/about`            | Club identity and values                 |
| `/journal`                    | Medical Journal index                    |
| `/journal/:slug`              | Article reading view and review metadata |

All earlier public, academic, discovery and personal routes remain available.

## API readiness

The UI continues to follow `UI → hooks/providers → MedClubServices → adapter`.

- `types/content.ts` defines articles, activities, media stories, executive bodies, members, recognitions and club values.
- `services/contracts.ts` exposes list/detail methods without coupling pages to fetch calls.
- `services/mock-services.ts` is the current replaceable adapter.
- `data/mock/community.ts` and `data/mock/journal.ts` contain explicit illustrative fixtures.
- Journal records join the existing global search and personal-library systems through the same domain IDs.

A production publishing API must enforce contributor identity, source, rights, references, scientific review and approval before publication. These rules cannot be secured by React alone.

## Console note

`[vite] connecting`, `[vite] connected` and the React DevTools suggestion are normal development messages. The supplied `VM### … reportAllChanges … undefined.startTime` stack points to an anonymous injected script: `reportAllChanges` is absent from this source and the inspected runtime packages. Test the direct localhost page in a clean browser profile or Incognito window with extensions disabled; do not suppress global errors in the app. See `CONSOLE-TROUBLESHOOTING.md`.

## Honest limitations

- People, activities, dates, awards and club-history records are illustrative until verified by MedClub.
- Media tiles are intentional placeholders; approved assets still need source, contributor and rights metadata.
- Journal copy is demonstration content, not medical guidance or a substitute for institutional clinical protocols.
- The scientific contribution/review workflow, real authentication, backend permissions, CMS/admin and store checkout remain later milestones.
- The production build passes, but the consumer Vite project should configure vendor chunk groups to reduce the current main-bundle warning.
- Native dialog, motion, responsive layout and assistive-technology behavior still need final real-browser and real-device acceptance in the integrating project.

Read `V0.5-CHECKLIST.md`, `V0.5-DESIGN.md`, `ARCHITECTURE.md` and `CONSOLE-TROUBLESHOOTING.md` before integration.
