# MedClub V0.13.5 — Connected navigation

Replace the complete `src/` directory. Keep your existing package.json, lockfile,
configuration and dependencies, including the Three.js dependencies required by
V0.13.4. This update adds no dependency.

## Implemented

- Six public primary destinations: Home, Learning, Community, Mentorship,
  Get involved, Store. Get involved contains Events, Opportunities, Contribute
  and Join the team. Existing direct URLs, detail pages and saved links survive.
  `/get-involved` restores the last visited subsection, defaulting to Events.
- Fixed desktop rail meets the upper header without a vertical dividing line.
  The boundary starts below the header. Original cream, russet and red colors
  remain; personal/admin retain their existing palette. The rail sits flush
  against the viewport edge, mirrored for Arabic.
- A shared selection bubble moves between primary destinations. Main destination
  icons retain two SVG states. Secondary navigation and filter icons are static.
  Explicit primary icon mappings replace the recruitment fallback; Admin content
  and approvals also have separate forms.
- Logo-slot expand/collapse; internal pin/hide tray revealed on hover or focus.
  Touch controls remain available. Hiding leaves a desktop edge shadow, with a
  named keyboard-accessible reveal target. Mobile retains a visible menu control.
  Manual hiding overrides scroll-up reveal and clears pinning. Revealing an
  unpinned section rail overlays content without reflowing the document.
- Route-aware header label, compact search icon with a lens scan on hover/focus,
  and a curved reveal of the full search modal. Existing search, keyboard
  shortcuts, Escape handling and focus restoration are retained.
- Event tickets retain their date stub/perforations; opportunities keep category,
  eligibility and deadline information. Hover layers and card rotations are
  removed. Course books, notebook reading, PDF import and campus assets remain.
- Mobile, compact desktop, Arabic, horizontal navigation preference, reduced
  motion and forced-color rules are included.

## Validation and limits

221 distinct automated checks passed across the regression run and focused
reruns. One worker failed during the initial full run; its 25-test search and
workspace suite passed on rerun. The final six navigation checks also passed.
Strict TypeScript and the production build passed.

Browser installation failed (invalid downloaded archive). Consequently, actual
rendered desktop/mobile/RTL geometry, clipping and animation quality have NOT
been visually verified. Automated DOM tests cannot certify those properties.

The existing large-bundle advisory remains: shared entry approximately 1,000 kB
uncompressed, campus renderer approximately 615 kB in its separate lazy chunk.
No backend behavior, account permissions, PDF persistence boundaries or campus
prototype fidelity claims changed in this release. See the earlier release
notes for those limitations.
