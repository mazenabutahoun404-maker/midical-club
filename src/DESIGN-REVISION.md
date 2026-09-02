# V0.1 visual and personal-workspace revision

The content/services architecture is retained. The application shell and visual composition are redesigned.

| Area | Revised behavior |
| --- | --- |
| Desktop/laptop navigation | Persistent left sidebar with expand/collapse, labeled compact icons, active destinations, Learn disclosure and Appearance control |
| Optional desktop navigation | Horizontal top navigation with the same destinations and a Learn dropdown |
| Phone navigation | Horizontal floating bottom dock; Home, Learn, Search, Saved and More; safe-area spacing |
| Navigation preference | A working Appearance dialog; changes persist locally; invalid values use the sidebar default; unavailable storage keeps the change for the session |
| Hero | Large Manrope heading, red accent, layered CSS sculpture around the original logo, community link and full-width search entry |
| Page composition | Warm canvas, rounded panels, soft surfaces, distinct academic/event/journal sections |
| Typography | Bundled variable Manrope and Noto Sans Arabic, with local files and licenses |
| Components | Rounded resources, pathways, opportunities, course cards, event dates, dialogs and controls |
| Motion | Short hover transitions and existing reduced-motion support; no scroll hijacking |
| Arabic | Localized interface and settings; mirrored content/icon direction; the desktop sidebar remains on the left as requested |
| Personal entry | My profile enters `/my` with a short fade and warm tint; reduced-motion users get an immediate change |
| Personal shell | Dark russet sidebar, warm quiet canvas, personal monogram, own learning, saved collection, focus, profile and settings |
| Personal phone navigation | Home, Learn, Saved, Focus and Profile; Settings remains available in the header |
| Returning | Back to MedClub appears in every personal page's header and restores the public home and its navigation |

## Extending settings later

`AppearanceProvider` owns typed navigation orientation and `sidebarCollapsed` values in the existing `medclub.appearance.v1` storage record. Previous orientation-only records remain valid and start expanded. Navigation components consume these preferences without managing storage. A future account-settings adapter can replace persistence and retain the UI contract.

This is device-local customization with a sample profile. Authentication, editable identity and server-synced preferences remain future work.

## Verification

Strict TypeScript and production build pass. Component/data verification covers the original public flows plus compact navigation persistence, preference migration, public/personal entry and return, personal course links, scoped search, saved counts and profile recovery. Exact results are recorded in `V0.1-CHECKLIST.md`.

The browser security policy blocked the local visual preview, so real-device layout and pixel-level visual acceptance remain unverified. The delivered archive contains only the updated `src/` tree; the temporary verification harness and development dependencies are excluded.
