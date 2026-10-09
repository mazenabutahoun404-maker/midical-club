# MedClub V0.13.13 — A quieter study desk and private student tools

Replace the entire `src/` folder. Retain your existing React, TypeScript, Vite,
Tailwind configuration and dependencies. This source-only release starts from
exact V0.13.12 and preserves the earlier routes, workspaces, governance, import
permissions, PDF reader, themes, navigation, transitions and resource workflows.
No dependency or backend is added. Connected Learning Materials remains excluded.

## Study space

- The notebook occupies the available screen, with a non-sticky compact course
  toolbar. The document does not scroll at the tested study viewport sizes.
  Reading, zoomed PDFs, long file lists and open tool panels can scroll internally.
- Wider readers retain the real two-page PDF spread and centre binding. Narrower
  readers and phones use one page. PDF paper and document colours stay intact.
- The section rail has static subject icons, expands on hover or keyboard focus,
  and supports a touch interaction. Its close control leaves a thin usable rail.
  There is no expand/collapse button. Bookmarks keep their vertical click positions
  when the rail changes width. Section previews attach to the matching bookmark;
  low-positioned previews are bounded by the screen and retain their connecting edge.
- In explicit Study focus, campus navigation is hidden and inert and has no
  reveal button, edge hint or hover trigger. Exit study focus or Back to courses
  restores the normal workspace controls. Upward reading scroll never reveals
  campus navigation. Normal campus folding and scrolling behaviour stays intact.
- A small movable timer/notes/GPA strip uses pointer capture on its grip. Drag with
  mouse or touch, or focus the grip and use arrows (Shift for larger steps).
  Home, double-clicking the grip, or Reset position returns it to the lower centre.
  Its drawer stays attached to it. Position is bounded and restored per study key.
- Section reading positions are internal notebook positions rather than document
  scroll positions. File selection and individual PDF pages still restore independently.
- Interactive paper surfaces now have a bent outer strip, front/back content and
  crease lighting. The paper is clipped to the notebook's reading frame. Half-turns
  show actual upcoming PDF pages; file/section boundary previews use the target's
  remembered page, or real section resources when no file is selected. A limited
  low-resolution preview cache prepares a target at a boundary. Loading and unavailable
  files remain explicit. Overview previews use actual course text and outcomes.
- The fold remains a CSS 3D effect, not a Blender model or physical paper simulation.
  Mouse/touch gestures, short-drag return, explicit Previous/Next, arrow keys,
  Arabic direction and reduced-motion alternatives remain available.

## Student notes and GPA

Notes are available only to signed-in users. Both types are private:

| Type | Association |
| --- | --- |
| General | No course; useful for planning or personal study notes |
| Course | Course picker; attached to the chosen course and still private |

Create and choose multiple notes, give them titles, write and save, insert a current
PDF page reference, download a plain-text copy or confirm deletion. Notes autosave
and are isolated by account in device-local storage. Course attachments do not
publish them. Old signed-in course scratch notes migrate once and remain recoverable
without reappearing after deletion. Storage errors retain the draft and offer download.
Notes waiting for a course are not silently converted into general notes.

The GPA calculator accepts actual credits and numeric grade points on an editable
maximum-point scale. It weights points by credits, permits valid zero grades,
optionally combines earlier cumulative credits/GPA, and explicitly excludes
pass/fail or withdrawn rows. Empty and invalid calculations do not show plausible
scores. No institution-specific percentage-to-grade conversion is assumed; the
previous supplied text did not contain a recoverable grading policy. It is a
planning estimate, not an official transcript. Signed-in inputs persist privately
on this device; guests may try the calculator without saved account inputs.

Notes and GPA also appear in the existing `/my/focus` and `/utilities` tools area.
The original focus timer and checklist remain included.

## Section and batch artwork

Seven generated static scenes appear in Learning, Community, Mentorship, Join the
team, Get involved and Store, plus the academic batch gate. Events, Opportunities
and Contributions share the Get involved scene because they belong to that main
section. The supplied Home image remains the default. Gate cards retain working
links, batch colours, year, term and progress data, with a small optional image zoom.

The assets are 640px and 1280px WebPs in `assets/section-art/`, about 1.29 MB combined.
Only the displayed image variant is fetched. The asset manifest records the built-in
image-generation method, scene prompt summaries and filenames. No generated image
contains UI text; headings and controls remain live, localized HTML.

Users with existing `content.publish` or `builder.manage` capabilities can use
Edit image directly on a page hero or on the batch page. They can choose a validated
PNG/JPEG/WebP, supply English and Arabic descriptions, save a compressed image and
restore the original. Writes check authentication and capability inside the local
service, including a second check after image processing. Images reject unsupported
formats, MIME spoofing, oversize input and unavailable storage. The optional typed
`ArtworkService` is a replacement boundary for a future shared CMS adapter.

These hero edits remain device-local in the current preview. They do not deploy,
sync to visitors' devices or replace the existing Admin Page Builder. Production
requires a server/storage implementation with equivalent authorization. Notes and
GPA are also device-local; the ZIP does not contain user-created notes or PDFs.

## Verification and practical limits

- Full V0.1–V0.13.13 regression: 313 passing checks; strict TypeScript and a clean
  production build pass. The complete source contains 655 files: 604 original
  files unchanged, 23 modified, 28 added and no deletions.
- Browser checks use a real five-page PDF, actual artwork replacement/reset,
  persisted general/course notes, file-boundary previews, touch tool dragging,
  restored tool position, mouse page turns and mirrored Arabic touch turns.
- Rendered checks include 1440×1000 desktop, 390×844 phone, 320×720 Arabic dark
  mode and 844×390 landscape, with no document-level study overflow at those sizes.
  Fonts are checked after loading. The section rail, real image assets, attached
  tools and paper frames are visually inspected. Reduced motion removes spatial folds.
- Local headless Chromium is the checked browser. Physical phones, Safari,
  software-keyboard variations, sustained frame rate and a complete accessibility
  audit remain unverified. Arbitrary PDF compatibility still has the limits documented
  in V0.13.12; the original-file link remains available.
- The existing shared bundle warning remains (approximately 1,018 kB / 315 kB gzip).
  Course, tools and PDF renderer/core remain separately loaded chunks; the PDF.js
  worker and auxiliary rendering assets are retained unchanged. No animation, 3D,
  upload or calculator package was added.

Back up your current project before replacing `src/`, then run your project's
TypeScript and build commands. Preserve the complete `src/vendor/pdfjs/` folder.
Keep device-local notes/PDFs backed up separately from this source archive.
