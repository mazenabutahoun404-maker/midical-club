# MedClub V0.13.9 — Community overview and independent header

Replace the complete `src/` directory. Keep the existing dependencies, manifest,
lockfile and build configuration. This update adds no package, image or 3D asset.
The baseline is the exact 392-file V0.13.8 source archive.

## Community

- Shorter secondary navigation with static destination icons and persistent text
  labels. At 1150px and below, Honors groups Honor Plate and Hall of Honor in an
  accessible menu. Both original URLs remain, including Arabic navigation.
- A record-derived overview replaces the decorative signal chart: unique public
  activities, published journal articles, open team roles, and the nearest valid
  upcoming event. Each value links to the relevant content.
- The recruitment schema does not identify leadership vacancies. The UI therefore
  says **Open team roles**, not leadership opportunities. Counts are position
  records with remaining openings, not a sum of seats or applications.
- The default service still uses illustrative records. The card explicitly says
  **Preview records** and uses the service's declared **3 September 2026** sample
  calendar. These are not production statistics. A live adapter can declare its
  own snapshot date or omit it to use the current date.
- Loading and failure states do not display false zero counts. Retry reloads the
  service queries. A genuinely empty event list shows an explicit empty state.
- The hero uses a more balanced information panel and two headline groups:
  “Medicine” / “is learned together.” Narrow widths can wrap further. Controls,
  cards and panels use scoped 10/16/24px radii. Decorative rings and signal lines
  were removed while the typography, light palette and spacing character remain.

## Header, sidebar and search

- Public, personal and admin headers are independent of the fixed rounded sidebar.
  An opaque backing still masks the upper gap while the header is visible.
- Deliberate downward scrolling hides the header after 200px. An upward movement
  of 50px reveals it. Reversing direction resets accumulated distance; returning
  near the document top reveals it. Negative overscroll is clamped.
- The header folds backward around its top edge in 340ms, with a 220ms fade. The
  same transition reverses on reveal. Reduced motion skips spatial movement.
- Search, dialogs, menus, header focus/hover and route transitions keep the header
  visible. Tab reveals it. A hidden header is inert and excluded from the accessible
  tree; keyboard focus is never deliberately hidden inside it.
- Search is ready with the shell rather than waiting for the detail-overlay chunk.
  Native modality opens and explicitly focuses the input in the opening gesture.
  The existing adjacent input, anchored results, Escape, outside dismissal,
  filtering and opener-focus restoration remain. Detail overlays stay lazy-loaded.
- Appearance remains visible in the public/admin sidebar. Only pin/hide controls
  reveal on hover or keyboard focus, over the existing compact status row. Touch
  retains access to these controls. Revealing this tray no longer adds footer
  height. Decorative fittings use fixed viewport-clamped offsets instead of a
  percentage of the rail's changing height.
- Sidebar selection is quieter than the active Community section. Language glyphs,
  Appearance slider knobs and the color-mode halo have brief hover feedback on
  fine pointers, disabled by reduced-motion preferences.

## Dark details

Wine navigation remains. Teal, blue, violet, amber and rose provide small category
accents in the overview, community cards, event tickets/statuses, recruitment and
course tabs. New foreground/fill pairs meet 4.5:1 computed contrast. Light/Dark/
System, existing campus night lighting, RTL and forced-color fallbacks remain.
PDF source pages and other original media are not recolored.

## Verification and remaining limits

- Full inherited and new regression: **262/262 passed** (251 inherited, 11 new).
- Focused Community, search and shell regression: **39/39 passed**.
- Strict TypeScript and production Vite build passed.
- New checks cover incremental 200/50px thresholds, direction reversal, overlay/
  focus holds, route resets, search typing in the opening gesture, retry and empty
  states, sample provenance, next-event sorting, Honors keyboard/RTL navigation,
  unique records and the new dark accent contrast pairs.
- All 392 baseline files remain: **374 unchanged**, **18 changed**, **9 added**.
  The complete source-only archive contains **401 files**, verified byte-for-byte.
- No new dependency or media payload. Route splitting remains. Shared JavaScript
  is approximately **1,039 kB / 320 kB gzip** and shared CSS **603 kB / 115 kB gzip**.
  The existing large-chunk advisory remains; global search readiness accounts for
  part of the additional shell code. Detail overlays still load separately.

DOM automation cannot establish visual smoothness or rendered geometry. A real
browser was not available in this environment: device keyboard behavior, clipping,
hover fittings, 200/50px flipping at different zoom levels, desktop/phone/RTL
layouts and perceived color balance still require rendered acceptance testing.

Previous permissions, navigation destinations, route transitions, notebooks, PDF
storage, static event/opportunity card surfaces, unique primary navigation icons,
secondary static icons and campus assets remain included. Production API/storage
boundaries are unchanged; no deployment is included in this source handoff.
