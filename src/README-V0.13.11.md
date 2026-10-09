# MedClub V0.13.11 — Campus image, shared navigation and focused reading

Replace the complete `src/` directory while retaining the existing manifest,
lockfile and project configuration. This release extends the verified 404-file
V0.13.10 source. It adds no package dependency and does not deploy the site.

## Requested changes

| Area | Implemented behavior |
| --- | --- |
| Sidebar motion | Public, Personal and Admin navigation retreat with the header's upward page-flip motion. Phone navigation folds toward its bottom attachment. Reduced motion removes spatial movement. |
| Scroll thresholds | Deliberate **200px downward travel hides** navigation; **300px upward travel reveals** it. Direction changes reset the accumulator. Returning near the top reveals automatically. Manual hiding, pinning, focus and open-menu protections remain. |
| Activity status | Event tickets and compact event cards, opportunities and recruitment positions use green, amber, blue or muted status colors, with text labels. Ticket silhouettes and static card faces remain. |
| Hidden navigation hint | A quiet physical edge meets the viewport, with thin ends and curved junctions. It has no glow or floating label. Its accessible button remains keyboard operable, with a larger touch hit area. |
| Home hero | The supplied `homeImage.png` replaces the home 3D stage. Responsive WebP encodings preserve its composition. Live bilingual welcome text sits over the planet; the artwork fades into the page without a card border. Two decorative cloud layers rise with scrolling. |
| Batch gates | Academic batch cards have arched entrances, readable existing metadata and two small doors that open on pointer hover or keyboard focus. Essential information never depends on hover. |
| Notebook interior | A compact course toolbar, section index and actual PDF surface replace repeated headings, descriptions and links. One available file opens directly on section selection. Multiple files have compact file rows. Source details are available in a disclosure. |
| Local navigation | Store and Get involved have compact, centered navigation that sticks when it reaches the header offset. Destination icons remain static, and the row can scroll on small screens. |
| Meaningful feedback | Successful event registration gets a short confirmation stamp; marking a resource reviewed draws a check. These complement the retained save flight, PDF landing and gate interactions. They do not animate unsuccessful actions or loop continuously. |
| Dark color | Lighter charcoal-plum reading surfaces retain eight separate coral, amber, olive, green, teal, blue, violet and rose families. Navigation stays darker russet with white type. Additional legacy category fills and inks are assigned semantic tokens while preserving their original light fallbacks. |
| Workspace consistency | Personal and Admin use the same scroll rules, motion and viewport hint as the public shell. Appearance remains available; pin/hide utilities retain their hover/focus treatment. Routes, capability checks and mobile destination groups remain. |
| Phones | Header action targets are 44px, notebook tools stay in a compact row, PDF mode has a tall reading surface, artwork has a smaller source, and local navigation remains scrollable. Arabic RTL, safe-area spacing and reduced motion remain. |

## Reading and data boundaries

- The uploaded artwork is used on Home. Authentication retains the existing 3D
  campus and its evening lighting. No model or authentication feature was deleted.
- Clouds use passive scroll events and one requestAnimationFrame update for two
  decorative layers, with offscreen, hidden-tab and reduced-motion guards. This
  replaces the home WebGL renderer; it is not a claim about measured frame rate.
- The notebook retains return-to-courses, save, section/resource position storage,
  focus mode, split view, actual file viewing, permission-aware PDF importing and
  removal. PDF source information is available on demand rather than printed
  throughout the reading surface. Browser PDF controls are supplied by the native
  viewer. PDFs are not inverted in dark mode.
- Imported PDFs remain device-local through the existing IndexedDB service and
  memory fallback. Shared publishing still requires a storage/API backend.
- Existing sample schedules use the preview reference date, 2026-09-03. Availability
  colors describe that sample data; they do not turn it into a live event feed.
- Preview analytics, governance enforcement boundaries, account-scoped personal
  data and every previous functional module remain. Connected Learning Materials
  remains excluded as requested.

## Verification and integration

- The release gate covers **280 inherited and new checks**, including shared
  navigation thresholds, manual/pinned controls, cloud scrolling, reduced motion,
  Arabic content, activity status labels, direct PDF selection, native viewer
  bookmark URLs, static local navigation and successful registration feedback.
- Strict TypeScript and production Vite build pass. No dependency was added.
- Computed checks retain readable main/muted text and all eight accent families
  on the defined dark surfaces, plus input, placeholder, boundary and button
  contrast. These checks do not prove readability over every composited surface.
- All 404 baseline source files remain: **362 unchanged**, **42 modified** and
  **6 added**, for **410 files**. The complete `src/` archive is integrity-checked
  and compared byte-for-byte with the final source tree.
- Home's responsive artwork is about **127 kB** at 768px and **368 kB** at 1448px.
  Home JavaScript remains about **14.4 kB / 5.1 kB gzip**, and the course page
  about **32.3 kB / 10.7 kB gzip**. Existing authentication WebGL stays split.
- The existing build advisory remains: shared JavaScript approximately
  **1,039 kB / 320 kB gzip**, and shared CSS **631 kB / 119 kB gzip**.

Run your existing project's TypeScript check and production build after replacing
`src/`. The local preview loaded, but the browser connection was blocked by this
environment. **No rendered browser or real-device visual QA was completed.**
Acceptance testing still needs phone portrait/landscape, keyboard display,
320px widths, zoom, long Arabic text, native PDF support, cloud composition,
navigation flipping/clipping and dark translucent surfaces. DOM/CSS and computed
contrast checks are not a full accessibility or visual audit.
