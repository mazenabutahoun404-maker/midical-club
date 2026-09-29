# MedClub V0.13.6 — Stable shell and living campus

Replace your complete `src/` directory. Keep your existing project configuration,
package.json, lockfile and dependencies, including the Three.js dependencies
introduced in V0.13.4. This release adds no dependency.

## Changes

- Search uses fixed inset/margin centering independently of its reveal animation.
  Opening the panel no longer lets the animation overwrite its position.
- Removed the filter from the workspace transition ancestor: even `blur(0px)`
  made the fixed sidebar follow its ancestor instead of the viewport. The
  existing workspace aperture remains; the content layer uses opacity.
- Expanded navigation keeps the logo and places its toggle at the opposite end
  of the brand row. Compact navigation swaps the logo for its toggle on hover
  or keyboard focus. Touch users retain a visible control.
- Selected destinations return to separate rounded pills. Removed the connected
  selection bubble from public, personal and admin navigation. The header and
  rail retain the existing shared surface and colors.
- Pin/hide controls occupy no row when idle. Hover or keyboard focus reveals
  their tray inside the rail; touch controls remain available.
- Opportunity cards remain stable while their bottom-right decorative rings
  rotate on hover or focus. Event tickets and course books remain intact.
- Home begins with the campus before the marketing heading. Its welcome overlay
  is suppressed on Home so it cannot cover that first impression.
- The active campus gains warm canopy and lamp light, three non-shadow-casting
  fill lights, walking figures, two slow road vehicles, highlighted destinations
  and a golden-hour/evening control. Each building retains an accessible HTML
  destination. The registration campus retains its dormant state.
- Pause is available even before WebGL starts. Motion stops when the campus is
  offscreen or the document is hidden. Reduced-motion and data-saving users
  keep the preview unless they choose to start 3D. Rendering is capped at 30 fps
  with a pixel-ratio cap of 1.25 on phones and 1.5 on larger screens.
- Applied the requested lucide compatibility fix: `ShieldCheck` replaces the
  unavailable `ShieldLock` import, with `ShieldCheck: ShieldCheck` in the map.

## Preservation

All 379 V0.13.5 source files are retained. Thirteen original files changed and
three files were added, including these notes: 382 source files in total.
Previous course/PDF workflows, routes, grouped Get involved navigation,
permissions, themes, Arabic support and responsive navigation remain included.
Secondary navigation icons remain static. No backend behavior changed.

## Verification and limits

- Full regression: 229 tests passed, zero failures or skipped tests.
- TypeScript verification passed.
- Production build passed.
- Source-only ZIP integrity and content comparison passed.

The cloud browser blocked the local preview with `ERR_BLOCKED_BY_CLIENT`.
Rendered desktop/mobile/RTL layout, clipping, lighting quality and GPU frame
rate have therefore NOT been visually verified. Automated checks do not prove
those properties; inspect this release in your real browser before accepting
the visuals.

The existing large-bundle advisory remains. The shared entry is approximately
1,001 kB uncompressed (308 kB gzip); the independently loaded campus renderer is
approximately 622 kB (158 kB gzip). No new animation or rendering package was
added. This extends the existing campus prototype; it is not a new exact Blender
reconstruction of the reference image. Earlier preview-data, local PDF storage
and production authorization boundaries still apply.
