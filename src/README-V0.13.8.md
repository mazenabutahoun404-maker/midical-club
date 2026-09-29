# MedClub V0.13.8 — Wine theme and anchored search

Replace the complete `src/` directory. Retain the existing package manifest,
lockfile, project configuration and dependencies. No dependency was added.
This release starts from the exact 390-file V0.13.7 archive.

## Changes

- Dark mode uses wine navigation (`#4a1428`), white navigation icons/type,
  burgundy selections, plum-black reading surfaces and pearl text. The phone
  navigation uses the same palette. Legacy dark ink/fill/border aliases are
  recolored without changing their original light-mode fallback colors.
- Light, Dark and System preferences, Arabic, reduced motion, high-contrast
  handling and both campus lighting modes remain. The campus still becomes an
  evening scene in dark mode; source PDFs and other original media are unchanged.
- An opaque backing masks scrolling content behind the inset header's upper gap.
  The rounded inset sidebar, continuous header join and notebook fittings remain.
- The fixed sidebar fits its contents, with a viewport maximum and an internal
  scroller for longer menus. Public/admin footer tools consume no idle row on a
  fine pointer. Hover or keyboard focus reveals them; touch retains access.
- Join the team is a separate primary destination, including the phone More menu.
  Get involved now contains Events, Opportunities and Contribute. Existing URLs
  remain; old group-history entries pointing to recruitment safely default to Events.
- Search keeps its glyph at the opening control and reveals the input directly
  beside it, toward the available space. A distinct results surface appears below
  the input. A bottom phone trigger opens results upward to keep them on-screen.
  Placement responds to viewport changes, RTL and the on-screen keyboard.
- Input reveal is 210ms; results arrive in 190ms after a short 65ms delay. There is
  no whole-dialog scale or centering transform. Reduced motion skips the reveal.
  The background retains a soft 5px blur. Desktop scrollbar space stays stable.
- Existing search scopes, filters, result actions, history, full-search page and
  keyboard navigation remain. Close and full-search links keep their own Enter
  behavior. Native dialog focus containment, Escape, dismissal through transparent
  areas or the backdrop, and immediate focus restoration are preserved.
- The welcome intro is consumed at entry, including Home. Home cannot arm an intro
  for Community. A direct non-home entry can show it once for 1.25 seconds; changing
  routes dismisses it. A per-document fallback prevents replay when session storage
  is blocked or the public layout remounts.

## Preservation

All 390 existing source files remain. Fourteen existing files changed; two files
were added (the anchored-search stylesheet and these notes), for 392 source files.
All other source files are byte-identical to V0.13.7. Previous routes, permissions,
notebooks, PDFs, static event/opportunity cards, unique main-navigation morphs,
static secondary icons, reading positions and page fades are retained.

## Verification

- Complete inherited and new regression: 250/250 passed.
- After the additional keyboard correction, all 33 affected checks passed,
  including a new Enter-on-controls regression: 251 distinct checks in total.
- Strict TypeScript and production build passed.
- Search geometry checks cover 320–1440px widths, RTL, short visible viewports,
  bottom controls and keyboard offsets. Core dark text pairs meet 4.5:1 contrast.
- Original light-mode color fallbacks remain equal to the earlier source values.
- All 390 baseline files were compared against the saved V0.13.7 archive before
  editing. The completed source-only archive is checked byte-for-byte.

DOM and geometry tests do not render the page. Real-browser visual QA was not
available here, so clipping, perceived animation quality, device keyboard behavior,
WebGL appearance and touch/zoom layouts still need rendered acceptance testing.

The existing bundle advisory remains: shared JavaScript approximately 1,010 kB
(311 kB gzip), campus renderer 622 kB (158 kB gzip), shared CSS approximately
589 kB (112 kB gzip). No new runtime package or image/model payload was added.
Device-local PDF storage and preview-service production boundaries are unchanged.
