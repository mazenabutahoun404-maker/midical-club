# MedClub V0.13.14 — Calm study desk

This is the complete `src/` replacement based on the exact V0.13.13 source. Earlier routes, services, permissions, course themes, generated artwork, PDF.js vendor files, private notes, GPA planning, split study view and other modules remain included. Connected Learning Materials remain excluded.

## Study focus

The course toolbar, title block, Back to courses, theme/language controls and resource header/footer are removed from the visible focus surface. The notebook, its paper bookmarks, PDF controls and a labelled study strip remain. Exit returns the course toolbar; Escape also exits when no child dialog is handling it. Campus navigation cannot appear on scroll or through a reveal handle during explicit focus.

The strip offers Timer, Notes, GPA and PDF, with short visible labels. Drawers attach above it, remain within the viewport and scroll independently when needed. Private notes still require sign-in and remain account-scoped. GPA and the timer can be tried without signing in. There are no page-grab bindings or tool-drag handles. Previous/Next buttons use a calm bounded paper turn; keyboard page turns, PDF text selection, zoom, search and bookmarks remain available. RTL mirrors the turn; reduced motion removes spatial movement.

Section navigation uses individual paper flags protruding from the notebook's binding instead of a full-height navigation card. Hover or keyboard focus reveals a short label and a small attached preview. Flags do not move vertically as the rail is hovered. Close appears during rail interaction; a closed rail can reopen through hover, keyboard or a touch on the remaining paper edge.

The section list uses the primary pane as its scroll owner. Non-PDF materials use their reader surface; PDFs use their own viewport. Nested wrappers no longer compete for scrolling. A fit-to-page PDF spread may have nothing to scroll at 100%; zoom in to read larger type and pan/scroll inside it, or use the quiet page buttons to advance. Section and resource positions retain their existing storage boundaries.

## Test a PDF

1. Open a course from Learn or My Learning.
2. Select **PDF** on the study strip, then **Open PDF**.
3. Choose a real PDF up to 30 MB. Its signature is checked before opening.
4. It opens directly in the notebook. On a wide reading surface, two pages are shown; phones use one page. Use the arrows, page field, zoom, search or page bookmarks.

This personal testing path works for guests and students without granting content-editor access. The file stays in the current course/account session and is not published or saved as a shared material. Leaving the course/account or reloading closes that temporary file; reopen it when needed. Blob URLs are released when removed or the reader scope changes. Personal file views do not enter the shared resource activity log.

Editors with the existing review/publish/builder capability retain **Editor: add course materials** in this drawer and the importer in the section file list. Their actual course imports remain in device-local IndexedDB with the existing memory fallback. They survive reload when persistent storage is available. This remains a local preview; server-backed publishing/storage is not added.

## Page artwork and navigation

Existing section hero images fill the hero scene as backgrounds. Copy stays accessible HTML, floats above a localized soft blur and retains theme tokens. The picture fades at its edges and below the hero. Community's useful counts/event card is preserved. Artwork editing/restoration keeps the same capability checks and local service; the supplied home artwork is unchanged.

Public, Personal and Admin vertical sidebars hinge sideways at their screen-side vertical binding, mirrored in Arabic. A horizontal navigation layout and the independent header retain the top page hinge. Navigation behaviour, active-state travel, hidden-edge hint, pinning and hover-only utilities remain unchanged.

## Validation and boundaries

- All 321 automated checks pass, including inherited features and new file validation, temporary-file cleanup, account/course isolation, focus, non-dragging controls and scroll restoration.
- Strict TypeScript and the production build pass. No new runtime dependency or raster asset is added.
- Rendered Chromium checks cover real PDF import/read/page turns, zoomed wheel/touch scrolling, guest and signed-in tools, 1440×1000 desktop, 390×844 phone, 320×720 Arabic dark mode and 844×390 landscape.
- Existing shared-bundle optimization advisory remains (about 1,018 kB, about 315 kB gzip). The course and PDF renderer remain separately loaded. Keep the complete `src/vendor/pdfjs/` folder.
- Physical devices, Safari, software-keyboard variations, sustained frame-rate measurement and a complete accessibility audit are not certified by these checks. PDF rendering retains the original-file fallback for unsupported/corrupt documents.

Replace the entire `src/` directory, then run your project's compile/build commands. User-created files, notes and GPA data are not bundled into the source archive.
