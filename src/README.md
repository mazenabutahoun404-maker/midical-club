# Current release: MedClub V0.13.10

Read [README-V0.13.10.md](./README-V0.13.10.md) for this release, integration instructions,
verification and remaining limits. The V0.11 document below is retained as historical context.

---

# MedClub V0.11 — CMS and Page Builder

This is the complete source-only V0.11 release for an existing React + TypeScript + Vite + Tailwind CSS 4 project. It contains every V0.1–V0.10 feature plus a structured page library and visual page builder inside MedClub Admin.

## Integrate

1. Back up the current `src` directory.
2. Replace it with this complete `src` directory. Routes, services, types, messages, navigation and styles changed together.
3. Keep the existing project configuration and dependencies. V0.11 adds no package dependency.
4. Run strict TypeScript checking, all automated tests and the production build.
5. Test admin review, the builder, both navigation orientations, phone layouts and Arabic RTL in real browsers before deployment.

## Admin access

| Route                    | Feature                                  |
| ------------------------ | ---------------------------------------- |
| `/admin`                 | V0.10 operational dashboard              |
| `/admin/content`         | V0.10 scientific content review          |
| `/admin/activity`        | V0.10 read-only activity history         |
| `/admin/versions`        | V0.10 content comparison and restoration |
| `/admin/builder`         | V0.11 page library                       |
| `/admin/builder/:pageId` | V0.11 visual editor                      |

Anonymous admin routes return through sign-in. The V0.8 preview account remains:

- Email: `student@medclub.jo`
- Password: `MedClub2026!`
- Registration verification code: `260908`

## V0.11 outcome

| Area          | Implemented behavior                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| Page library  | Search and status filters, localized summaries, page creation and duplication                          |
| Block system  | Hero, announcement, rich text, quick links, dynamic course grid, metrics, media, CTA, group and spacer |
| Canvas        | Selection, pointer drag, keyboard-operable ordering, duplicate, hide and delete                        |
| Inspector     | Bilingual content, page settings, SEO, themes, audience and language visibility, and schedules         |
| Reuse         | Save any selected block as a reusable pattern and insert cloned instances                              |
| Media         | URL field plus size-limited device-local image preview with an explicit production boundary            |
| Editing state | Debounced autosave, manual save shortcut and 30-step undo and redo history                             |
| Preview       | Current unsaved canvas in desktop, tablet and phone frames                                             |
| Publishing    | Save-first publish and schedule actions with append-only milestone versions                            |
| Recovery      | Restore an earlier milestone as a new draft revision without erasing history                           |
| Architecture  | Typed replaceable `BuilderService`, mock records outside JSX and localized React rendering             |
| Accessibility | Text states, non-drag ordering, native dialogs, RTL and reduced-motion fallbacks                       |

V0.1–V0.10 remain included: public, personal, auth and admin shells; orientation-aware navigation; homepage; academics; courses; search; library; calendar; notifications; events; opportunities; community; Medical Journal; mentorship; contributions; store, cart and orders; authentication; recruitment; applications; onboarding; team profiles; admin review; activity; and content versions.

## Critical boundary

V0.11 is a front-end CMS preview. Its data, drafts, local image previews and publish state remain on the current device. Publish does not deploy the public site. Production must provide durable APIs, validated schemas, sanitized rich text, object storage, malware scanning, background scheduling, atomic publishing, cache invalidation and immutable audit events.

The current admin guard proves identity only; it is not production authorization. V0.12 remains responsible for capability permissions, protected founders, high-risk approval and server enforcement.

## Verification

- Strict TypeScript checking passes.
- Production Vite build passes with route-split builder screens.
- All 157 V0.2–V0.11 data and UI regression checks pass.
- DOM automation does not replace real browser, zoom, touch, keyboard and assistive-technology acceptance testing.

Read `V0.11-CHECKLIST.md`, `V0.11-DESIGN.md`, `ARCHITECTURE.md` and `CONSOLE-TROUBLESHOOTING.md` before integration.
