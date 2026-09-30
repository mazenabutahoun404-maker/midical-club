# MedClub V0.13.10 — Dark palette and readable controls

Replace the complete `src/` directory, retaining the existing manifest, lockfile
and project configuration. This is based on the verified 401-file V0.13.9 archive.
No dependency, model, image or external service was added.

## What changed

- The dark theme separates neutral reading surfaces from colored category surfaces.
  Coral, amber, olive, green, teal, blue, violet and rose have independent ink/fill
  pairs. 216 legacy color references were assigned appropriate accent tokens while
  retaining their exact light-mode fallback values.
- Dark red-russet navigation uses a restrained fixed gradient with white type.
  Content uses charcoal-plum surfaces; the whole page is not tinted brown or wine.
  Gradients are static CSS backgrounds with no animation loop or new media payload.
- Resource thumbnails, academic batch progress, product visuals, media cards,
  recruitment roles, calendar categories, workflow statuses, Admin metrics and
  governance role glyphs retain category color. Existing course book-cover hues
  remain. Status labels continue to carry meaning alongside their colors.
- Quiet gradients give the Community, academic, mentorship, contribution, event
  and opportunity surfaces depth. Event/opportunity card transforms were not changed.
- Corrected selected Store navigation, dark notebook return links/import glyphs,
  category-colored metric icons, dim course-cover descriptions, inputs, placeholders,
  native select options and browser autofill text. Selected backgrounds no longer
  reuse a light foreground token.
- Desktop header height is 64px instead of 76px; the phone minimum is 60px instead
  of 68px. Existing action dimensions, search anchoring, fixed sidebar, hover tools,
  fittings and 200px-down/50px-up scroll thresholds remain.
- Existing Light/Dark/System settings, Arabic RTL and reduced motion remain. Source
  PDFs and other media are not inverted or recolored; the existing evening campus
  renderer still controls 3D lighting. The fallback poster retains more saturation.

## Attached console log

- Replaced `PCFSoftShadowMap` with `PCFShadowMap`. The installed Three.js renderer
  explicitly reports that the former was removed and already falls back to the
  latter. This removes the application's deprecated-shadow warning without
  changing its effective shadow technique.
- Language, theme and Honors controls now use non-modal menus. The installed menu
  library's modal path calls `hideOthers`, which can hide the surrounding workspace
  while route focus moves. These navigation menus retain arrow-key selection,
  Escape and outside dismissal without hiding the page. Actual dialogs remain modal.
- The supplied Similarweb CORS/fetch messages originate from its browser extension.
  No unrelated endpoint or browser security policy was modified.
- Development-time long-task/reflow notices alone do not establish production frame
  rate. No claim is made that every performance notice has been eliminated.

## Verification

- Complete inherited and new regression: **272/272 passed**.
- Strict TypeScript and production Vite build passed.
- New checks cover eight distinct accent families against dark surfaces, main and
  muted text, form/placeholder/boundary contrast, header-gradient endpoints, selected
  Store navigation, hero-gradient endpoints, real batch color bindings, immediate
  search typing, Arabic mode selection and menu focus behavior.
- Automated comparison confirms exact light-mode fallback values were preserved.
- All 401 baseline source files remain: **378 unchanged**, **23 modified** and
  **3 added**, for **404 files**. Model/image/font assets remain byte-identical.
- The complete src-only ZIP is integrity-checked and compared byte-for-byte.
- The existing bundle advisory remains: shared JavaScript approximately **1,039 kB
  / 320 kB gzip**, shared CSS **616 kB / 116 kB gzip**. No new dependency or media
  payload; detail and route modules remain split.

Computed token contrast and DOM tests do not render the page. Real-browser visual
QA remains unavailable in this environment. Full-device acceptance still needs to
cover clipping, text on composited/translucent surfaces, zoom, autofill appearance,
keyboard display, gradient balance and all desktop/phone/RTL layouts. This release
fixes identified readability defects; it does not claim a complete WCAG audit.

All previous source files and functional features remain included. Device-local
PDFs, preview analytics, sample Community counts and production API/storage
boundaries are unchanged. This is a complete source handoff, not a deployment.
