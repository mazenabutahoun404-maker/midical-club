# MedClub V0.13.12 — Study desk and shared navigation

Replace the complete `src/` directory while retaining the existing React,
TypeScript, Vite and Tailwind project configuration and manifest. This release
extends the verified 410-file V0.13.11 baseline and retains all previous routes,
features, permission boundaries, PDF import and save behavior.

## Changes

| Area | Behavior |
| --- | --- |
| Moving selection | One measured selection plate travels between destinations in Public, Personal and Admin navigation, including phone navigation. Existing labels, destination icons and layout remain in place. Reduced motion removes the travel. |
| Batch experience | An academic entrance with arched architecture, existing batch/semester counts, themed gate cards and readable year/graduation metadata. Cards enter with a short stagger. Opening a batch reveals its current/archive course area through two restrained doors. Links, term data and enrollment behavior remain unchanged. |
| Course entry | Public course routes and personal course routes enter the same course-themed study environment. A cover opens once, a compact toolbar replaces campus distractions, and Back to courses uses the current workspace. A supplied material opens directly when available; missing files remain honest empty states. |
| Reading surface | Actual PDF pages render on the book, with two pages and a central gutter when the available reader width is at least 860px. Phones and narrower/split readers use one page. PDF paper and document colors are preserved in dark mode. |
| Page turns | Drag inward from a page edge to control a hinged leaf with front/back PDF surfaces, crease and shadow. Short drags return; committed drags settle into the next spread. Touch, RTL, explicit Previous/Next controls and arrow keys are supported. At a file boundary, the next available file or section can be opened. Without an open PDF, the same edge gesture changes sections. |
| Study tools | Actual PDF text search, zoom, page jump, private page bookmarks, an optional notes drawer and a start/pause/reset focus timer. Notes, bookmarks, timer and reading positions use the existing account/course identity. Tools stay closed until requested. |
| Study navigation | Campus header and navigation start hidden. Upward scrolling and pointer proximity do not reveal them during study. The existing accessible edge hint can deliberately reopen navigation. Course controls provide language, theme, focus, split view and return access. |
| Shared folding | The public, personal and admin sidebars use the header's upward page-fold transform instead of a competing sideways slide. Existing manual hiding, pinning, hover/focus controls and 200px down/300px up behavior remain outside study. |
| Direct switches | Language toggles English/Arabic immediately. Theme cycles Light → Dark → System → Light and follows the device in System mode. These controls no longer open selection lists. Navigation-layout Appearance settings remain available. |
| Arabic typography | The body now uses the already bundled Arabic font in RTL, preventing the Latin body font rule from overriding it. Existing typography assets and palette are retained. |

## PDF and storage boundaries

- The source includes an attributed, locally bundled **PDF.js 6.4.299** core,
  worker, fonts, CMaps and image-decoding assets. No manifest or lockfile change
  is required. Keep the entire `src/vendor/pdfjs/` folder. The renderer and worker
  load only when opening a PDF; there are no CDN requests.
- Pages are rendered as needed, with nearby-page prefetching, at most two raster
  jobs and eight cached page rasters per document. Raster density is capped for
  phones. This bounds the page cache, not total memory for every possible PDF.
- The fold is an interactive CSS 3D paper effect with real page surfaces, not a
  physical cloth simulation or a Blender model. Reduced motion commits the same
  action without spatial animation.
- Text selection and search depend on the PDF's text layer. Scanned images do
  not gain OCR. Interactive PDF forms, ink annotations and document JavaScript
  are not part of this reader. PDF JavaScript actions are never requested.
- Remote PDFs must permit browser fetching through CORS. A clear error/retry
  state and the original-file link remain when a document cannot be rendered.
  Complex document compatibility and ICC color fidelity need broader PDF testing;
  the original file remains the reference for such documents.
- Permission-aware PDF importing/removal retains the existing IndexedDB and
  memory fallback. Uploads remain device-local; shared publishing needs a storage
  and API service. This release does not add a backend.
- Study notes and page bookmarks remain account/course-scoped on this device.
  Guests use a guest course key. They are not synced across devices. The timer
  derives elapsed time from timestamps rather than accumulating interval ticks.
- All inherited analytics/sample-data labels, governance limits and modules remain.
  Connected Learning Materials remains excluded.

## Verification

- The full **294-check** V0.1–V0.13.12 regression gate passes. The 14 new
  checks cover real navigation selection geometry, direct switches, study chrome
  locking, section gestures/cancellation, Arabic touch direction, notes/timer
  persistence, spread boundaries and account/course state isolation. The touch
  correction additionally verifies that vertical edge movement is not a tap.
- Strict TypeScript passes. A clean production Vite build passes. The original
  source tree remains complete: **388 original files unchanged, 22 modified,
  no deletions**, plus **217 added files**, for **627 source files**. Most added
  files are the attributed PDF rendering assets. The archive contains only `src/`
  and is compared byte-for-byte against the frozen tree.
- An actual five-page PDF renders on all five pages and supports text extraction
  and valid page bounds. Browser checks exercise real PDF text search, page-edge
  dragging, page bookmarks, private notes, timer start/pause, and study scrolling
  leaving navigation hidden. The clean production preview also passes these
  interactions without page errors.
- Rendered checks cover a 1440px desktop spread, 390px phone and 320px viewport,
  Arabic RTL, dark mode and reduced-motion batch pages. The phone reader has no
  document-level horizontal overflow at those widths. Arabic font rendering is
  checked after the bundled fonts load. This is a local software-rendered browser
  pass; physical phones, Safari compatibility, keyboard-resized layouts and
  sustained frame rate remain unverified. It is not a complete accessibility audit.
- The course page is roughly **58.1 kB / 18.4 kB gzip**. PDF loading adds separate
  renderer/core chunks of **151.6 kB / 56.0 kB gzip** and **485.3 kB / 147.3 kB
  gzip**, plus the **1.32 MB worker** and requested auxiliary assets. These do not
  load on Home. Home remains approximately **14.5 kB / 5.1 kB gzip**.
- The pre-existing shared-bundle advisory remains: roughly **1,015 kB / 313 kB
  gzip** of shared JavaScript. No launch-performance guarantee is implied.

Run your project's existing TypeScript check and build after replacing `src/`.
Supply actual PDF files through the existing permission-aware importer or a
CORS-enabled storage adapter. Keep the imported file and the source archive backed
up separately: the source ZIP does not contain the user's device-local PDFs.
