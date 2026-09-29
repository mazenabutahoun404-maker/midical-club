# MedClub V0.13.7 — Notebook frame and adaptive color modes

Replace your complete `src/` directory. Retain your current project configuration,
package.json, lockfile and dependencies, including Three.js. No package was added.

## Navigation and search

- The default desktop sidebar is fixed, inset from the screen edge and rounded at
  the bottom. Its top joins the header through one continuous surface and a curved
  inner corner. The existing light palette and separate selected-tab pills remain.
- Two small metal binding fittings decorate each bar without receiving pointer or
  keyboard input. On phones the header fittings shrink; controls remain compact.
- The expanded logo/toggle arrangement, collapsed hover toggle, fixed positioning,
  shadow reveal, pinning and hover-only action tray from V0.13.6 remain included.
- Search records the control that opened it and positions the same search panel
  at that control, with a short origin-based reveal. A search opened from the
  bottom navigation opens upward. Placement clamps to the visible viewport and
  adjusts for resize, RTL and the mobile keyboard. Shortcuts use a visible trigger
  when available. A 5px backdrop blur softens the page behind the panel.
- Native modal focus containment, Escape, outside dismissal and focus restoration
  are retained. Closing is immediate so keyboard focus is never delayed.

## Page continuity

- A single routed page tree fades out over 140ms; the destination fades in over
  240ms. Navigation and the fixed header remain outside these content transforms.
- Visited routes restore their reading position in the current app session.
  Browser Back uses saved history-entry positions. First visits begin at the top
  while the page is faded out. Filters and notebook section changes keep their
  existing independent behavior.
- Restoration waits for lazy modules and query-driven loading states. Hash targets
  that appear later remain supported. Loading feedback stays visible.
- Outgoing page content and footer links become inert during the fade, preventing
  stale destinations from receiving a click as their layout is replaced.
- Rapid navigation discards superseded arrivals. Focus moves only when it will
  not interrupt a newer menu/dialog interaction. Reduced motion skips the delays.

## Light, Dark and System

- A dedicated selector sits beside language in public, personal, admin and auth
  headers. It persists the choice, synchronizes across tabs and defaults to the
  computer setting. Existing navigation preferences migrate without being reset.
- Dark mode uses warm charcoal surfaces, ivory reading text and softened russet
  accents. Legacy surfaces use separate ink, fill and boundary color aliases;
  each alias preserves the original light color as its fallback.
- Academic notebook paper, course accents, forms, dialogs, notifications and
  workspace surfaces have corresponding dark colors. Source PDFs and other
  original media are not inverted or recolored.
- Active and dormant 3D campuses follow the resolved theme. Dark mode selects
  evening lighting; the active campus retains warm illuminated buildings while
  registration stays dormant. The non-WebGL poster also adapts. Theme changes do
  not reload the model, and the existing motion/performance limits remain.

## Preservation and verification

All 382 V0.13.6 source files are retained. Forty-eight original files changed,
mostly to provide theme-aware color fallbacks. Eight files were added, including
these notes, for a complete 390-file source archive. Routes, permissions,
PDF workflows, saved content and all earlier features remain included.

- 242 distinct regression checks passed across the full run and focused reruns.
  The full run exposed one lost-click issue in the journal-to-library flow. After
  correcting the outgoing footer, the original community suite passed 7/7;
  all 15 affected navigation/theme checks also passed on the corrected source.
- Strict TypeScript and the final production build passed.
- Legacy light-mode color declarations were checked against V0.13.6; their
  fallbacks preserve the original values. Core dark reading/control color pairs
  meet a 4.5:1 text contrast threshold; this is not a full accessibility audit.
- Source-only archive integrity and byte comparison passed.

Real-browser visual QA remains unavailable in this environment. Automated tests
cannot establish the appearance of the binding fittings, rendered mobile/RTL
geometry, animation smoothness or WebGL lighting quality. Inspect those in your
browser before visually accepting the release.

The inherited large-bundle warning remains. The shared entry is approximately
1,010 kB uncompressed (311 kB gzip); the independent campus renderer is 622 kB
(158 kB gzip). Theme coverage adds about 12 kB of compressed shared CSS. This is
still the existing procedural campus prototype, not an exact Blender recreation.
Earlier device-local PDF storage and preview-service boundaries remain unchanged.
