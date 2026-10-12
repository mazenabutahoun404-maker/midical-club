# MedClub V0.13.27 — backend additions and integration handoff

The five requested features are implemented in the frontend. This handoff separates new requirements from the original scope and defines the connection boundary. The included OpenAPI document is a **proposal**, not a claim that the existing 600+ APIs use these paths or payloads. Reuse matching endpoints before creating new ones.

**Arabic summary / ملخص:** أُضيفت ملاحظات مرتبطة بصفحات PDF، بطاقات استرجاع مع جدولة مراجعات، حزم مساقات للقراءة دون اتصال، ملف إنجازات مع اعتماد ومشاركة اختيارية، وغرف دراسة هادئة بمؤقت مشترك. يجب ربطها بحساب المستخدم وصلاحياته على الخادم. المؤقت، حاسبة المعدل، التحليلات، الشهادات، وساعات التطوع موجودة أصلاً في وثيقة المتطلبات؛ لا تُنشئ أنظمة مكررة لها.

## Baseline used for the comparison

Reviewed **متطلبات منصة النادي الطبي.pdf**, all 12 pages, sections 1–23. No backend OpenAPI/Swagger specification was found in the available files. A mapping review against the backend's current specification is still required.

| Feature | Original requirements | Delta to support |
|---|---|---|
| PDF margin notes | §3 supports course PDF files; no personal page annotations specified | Private notes attached to a resource revision, page and normalized point; quote, color, version, delete/restore |
| Recall desk | §8 extensible tools; no recall-card scheduler specified | Owned questions/answers, optional PDF source anchor, due dates, grade history, deduplicated review attempts |
| Offline course packs | §3 downloadable files and §11 cross-device saves; no offline manifests specified | Permission-aware manifests, resource rights, immutable revision and hash, expiry, actual device storage, offline app shell |
| Verified campus portfolio | §17 verifiable certificates/volunteer hours; §18 internal member roles/hours | A combined student-facing record for activities/publications/leadership/volunteering, evidence review, verification revocation, opt-in public profile |
| Quiet study rooms | §8 Pomodoro and §16 group mentorship; no quiet co-study rooms specified | Invite-only membership, seats, study goals, shared server deadline, presence, host actions, leave/end behavior |

## Additional implemented features outside the explicit original scope

These predate V0.13.27. They are listed separately so the backend can cover them without assuming that every visual enhancement needs an endpoint.

| Existing frontend addition | Suggested backend work | Existing frontend location / boundary |
|---|---|---|
| General and course-attached private notes | Reuse/extend owned notes CRUD; title/body/courseId/null, versions, tombstone restore; account sync | `features/utilities/student-notes.ts`, `StudentNotes.tsx`; still device-local, not converted by the new Study Hub adapter |
| Private confidence ratings and practice history | Course/topic confidence CRUD, self-reported practice attempts; distinguish subjective ratings from recorded activity | `types/insights.ts`, `services/local-insights.service.ts`; replace the existing `insights` registry entry |
| Full study state | Extend §9 Continue Learning with per-section/resource page, scroll, playback position, split pane and selected companion | `features/courses/study-state.ts`, `useStudyState.ts`; currently local helpers, requires a future sync adapter |
| Personal review flags and PDF page bookmarks | Extend library/study preferences, private per resource/page; do not mark content scientifically reviewed | `ResourceReviewButton.tsx`, `StudyTools.tsx`, existing `workspace` registry |
| Relaxation mode, focus/rest state and timer preferences | §8 already covers Pomodoro/rest duration; additions are relaxation mode, saved session state/deadline and optional reminders | `study-tools-state.ts`, `StudyTools.tsx`; timing must be based on a deadline, not tick counts |
| Multiple appearance palettes and navigation preferences | Extend existing user preferences with palette/colorMode/system, locale, nav pin state and tool-dock position | `AppearanceProvider`, `WorkspaceProvider`; UI previews need no image-generation API |
| Temporary personal PDFs | Private file ownership/storage and authorized read URLs; never publish a course file | The new `/me/study-files` proposal and `usePersonalPdf` HTTP branch cover the owned-file upload boundary |
| Undo beyond the page builder | Soft deletion/tombstone retention, compare-and-swap updates, conditional restore; keep immutable audit history | Global `undo-action.ts`; the new adapter supports margin/card/claim restoration; older helpers still need corresponding backend mapping |
| Two-person approval for high-risk role changes | Extend §§19–21 with two **distinct** approvers, no requester self-approval, server-side application after quorum | Existing `governance` registry and `types/governance.ts`; five protected founders already belong to original §20 |
| Merged activity destinations, leather books, shelves, page transitions, hero blends, icon morphs, sticky sections, responsive theme previews | No separate API | Presentation changes; continue using courses, resources, content builder and settings APIs |

**Already required, not new systems:** analytics/content freshness (§23), GPA and Pomodoro (§8), saved collections and syncing (§11), customized dashboard/resume (§9), permissions/founders (§§19–20), certificates/attendance/volunteering (§17), editor versions/rollback (§§3,22), and team recruitment (§18). Connected Learning Materials remains excluded from the frontend as requested; do not enable it through this change.

## Implemented connection boundary

- Types: `src/types/study-hub.ts`.
- Interface: `StudyHubService`, exposed through `MedClubServices.studyHub`.
- API adapter: `src/services/study/http-study.service.ts`.
- Integration helper: `src/integration/connect-study-hub.ts`.
- Proposed schema: `src/integration/medclub-study-additions.openapi.json` — **33 operations / 35 schemas**.
- Local preview service: `src/services/study/local-study.service.ts`. This is a preview, **not production authorization**.
- A registry declaring `contentSnapshot.kind = "live"` cannot silently fall back to the local Study Hub store. Missing integration produces an explicit unavailable-service error.
- Existing service adapters are preserved. Supplying the new registry entry does not replace the other 600+ endpoint integrations.

```tsx
import App from "./App";
import { connectStudyHub } from "./integration/connect-study-hub";

const services = connectStudyHub(existingBackendServices, {
  baseUrl: "/api/v1", // Replace with the backend's real base URL.
  credentials: "same-origin", // Use include only for an approved cookie/CORS setup.
  token: getSessionAccessToken, // Optional; obtain from the existing auth provider.
  csrfToken: getCsrfToken, // Required by the server when using cookie-based mutations.
  mapPath: mapExistingStudyEndpoint, // Optional. Receives the full path and query.
  encodeRequest: mapExistingRequestBody, // Optional; JSON requests only.
  decodeResponse: mapExistingResponse, // Optional. Must return the typed resource/page.
  onUnauthorized: refreshOrEndSession,
});

// Render using the existing application bootstrap:
<App services={services} />;
```

The placeholder functions above are integration responsibilities, not imports supplied by this release. Do not place tokens into localStorage or the source bundle. Route/schema mappers must be tested against the real backend before deployment.

### Shared transport rules

| Rule | Frontend contract |
|---|---|
| Owner | Derive from the authenticated session. `/me` requests never accept an owner ID from the browser. |
| Authentication | Existing secure cookie or bearer token; configurable fetch/CSRF/auth callbacks |
| Lists | `{ items: T[], nextCursor: string \| null }`; `limit=100`, opaque cursor; maximum 50 fetched pages with repeated-cursor detection; no guessed envelope |
| Resource response | Return the typed resource directly. Existing envelopes may be normalized with `decodeResponse`. |
| Versions | Numeric monotonically increasing `version`; updates/actions use `If-Match: "<version>"`; stale state gets 412/409 and requires a reload |
| Review deduplication | `Idempotency-Key` identifies one recall attempt. Repeat returns the original result; reuse with different body/card conflicts. |
| Deletion/Undo | DELETE returns 204. Retain a tombstone and original server-owned record; restore receives only its tombstone version, never a replacement owner/body from the client. |
| Dates | ISO UTC timestamps; date-only achievement dates; server owns scheduling and verification timestamps |
| Failure/cancellation | AbortSignal propagated for reads/downloads; 401/403/404/409/410/412/429/5xx remain failures, never sample success |
| Validation | Runtime response checks precede UI use; server must independently validate inputs/permissions. No automatic retries for mutations. |
| Large collections | Adapter capacity guards; cursor APIs must provide stable ordering. Recall collection rendering should be paged further for very large production accounts. |

## Feature-specific API work

### 1. PDF margin notes

Records: `ownerId`, `courseId`, `{resourceId, resourceRevision, page, x, y, quote?}`, `body`, `color`, `version`, `updatedAt`. `x/y` are normalized **physical page coordinates** regardless of UI RTL. They remain stable under zoom and are clamped visually away from page-turn controls. A quoted excerpt is optional; use opaque immutable file revisions or hashes from the server, not an expiring file URL as identity.

The current catalogue uses `Resource.updatedAt` as its revision token. Map it to a stable file revision or extend the resource contract when the backend supplies one. The server must check PDF ownership/access, actual page count, course/resource relationship and revision. Old-revision notes remain visible in a separate list, not silently moved onto a replacement PDF.

Personal PDFs uploaded through `/me/study-files` return a stable Resource ID, authorized HTTPS URL, and `personalFileOwnerId` equal to the session user. No course publishing permission is granted by this endpoint. Existing publisher PDF routes must still enforce content-review/publishing permissions and the contribution review workflow.

### 2. Recall desk

Records: owned course card (`prompt`, `answer`, optional source anchor), `dueAt`, `intervalDays`, review count, last grade; append-only review history (`cardId`, grade, reviewedAt, nextDueAt).

Current transparent starter schedule: Again = 10 minutes; Hard = at least 1 day / previous interval ×1.2; Good = at least 3 days / ×2; Easy = at least 7 days / ×2.5; maximum 365 days. The API must calculate the same schedule or return its authoritative replacement. Do not infer academic ability or convert a self-rating into an exam score. Future scheduler changes should carry an algorithm version so history stays interpretable.

### 3. Offline course packs

Manifest: course snapshot, manifest ID/revision, authorized PDF records, per-file offline permission/hash/bytes, `expiresAt`, `allowedOffline`. Issue read URLs that the browser can fetch with proper CORS; third-party storage URLs need signed access. The server grants rights; the browser cannot extend them.

Implemented on device: streaming download progress, cancellation, PDF signature checks, optional SHA-256 matching, account-scoped IndexedDB Blobs, complete-pack transactional replacement, remove/Undo, real offline PDF reader, and read-only snapshots of owned annotations/recall cards. Limits: 80 files, 80 MiB per file, 300 MiB per pack. Old complete pack remains if a new download fails. Signed URLs are stripped from stored metadata.

Offline edit synchronization is **not** implemented: downloaded notes/cards are read-only snapshots. Add an operation outbox and conflict resolution later if editable offline sync is desired. Packs may be reclaimed by browser storage policy; the user can request persistence. Offline expiry cannot provide immediate remote revocation without reconnecting; choose an appropriate TTL/licensing policy on the server.

Cold offline launch needs this **included build step**:

```bash
npm run build
node src/integration/offline-build.mjs dist
```

Serve the generated root `/medclub-sw.js` as `application/javascript`, over HTTPS (localhost permitted), with no SPA fallback for that file. The worker pre-caches the current build's static assets and root app shell; it does **not** cache API responses, private PDF endpoints, or third-party URLs. The download UI reports whether offline-shell installation actually succeeds. Include the step in CI; the source-only ZIP cannot change the project's root package scripts automatically.

The existing production auth adapter must separately support an approved offline session policy. The worker does not bypass login, persist access tokens, or manufacture a server session. Test cold launch, upgrades, quota failure and logout/account switching on real devices.

### 4. Verified campus portfolio

Kinds: activity, publication, leadership, volunteering. State machine: Draft → Pending → Verified or Rejected. Rejected returns to Draft on editing. A distinct authorized reviewer can revoke a Verified claim; it immediately disappears from public sharing. An owner cannot edit a verified claim or verify their own claim.

The preview reuses `content.review` for publications and `events.manage` for the other kinds, always checking `AccessSnapshot.actorId`. Confirm that this policy matches the backend's scoped verifier roles; scientific and activity reviewers must not gain unrelated privileges. Keep server-owned immutable audit entries and reviewer identity/timestamps.

Share is off by default and requires explicit consent. A shared link contains name plus verified achievement fields, **not** owner IDs, private notes, pending claims, reviewer IDs or evidence URLs. Revoking sharing invalidates the token. Public endpoint must not trust a client-supplied verification flag. Local preview attestations remain clearly labeled and are not institutional certificates.

Where records already exist under certificates, attendance, journal publication, recruitment or volunteer hours, reference those authoritative IDs rather than duplicating them. Evidence-link claims are an extension for records not already represented there. A public verification response should include issuer identity/verification proof when the backend supplies it.

### 5. Quiet study rooms

Records: host, invite, capacity, focus/rest durations, phase, server `endsAt`, membership and goals, presence timestamps, version. Valid phases: Waiting → Focus → Rest → Finished. Start/rest/finish are host-only. Only members can read a room. Joining twice is idempotent; seat allocation must be atomic. Host leaving ends the session and invalidates the invite.

Actual current synchronization: visible-tab room polling every 5 seconds, presence heartbeat every 30 seconds, 90-second “away” threshold, deadline-based local display. Hidden tabs do not run the clock animation or polling. The API owns deadlines; do not increment elapsed seconds per client. Offline clients should not be presented as live companions.

Optional production SSE/WebSocket upgrade: publish timer/membership snapshots with room version and server time, reconnect with last event ID, then fall back to polling. This release supplies polling, not a fictitious socket connection. Rate-limit invites/join attempts, keep invite codes opaque, and add moderation/block policy to the existing campus operations service before large public rollout. No chat, camera, microphone, screen-sharing or presence tracking outside the room is included.

## Routes and acceptance tasks

| Entry | Route |
|---|---|
| Combined Study Desk | `/my/study`; linked from dashboard and existing Focus page |
| Recall | `/my/study/recall` |
| Offline packs | `/my/study/offline` |
| Quiet rooms | `/my/study/rooms` |
| Owned campus portfolio | `/my/portfolio` |
| Public verified view | `/portfolio/:shareToken` |
| PDF margin notes | PDF tools → Margin notes; inside the existing course reader |

Personal routes retain RequireAuth. The personal sidebar remains at 12 destinations; Study Desk routes highlight the existing Focus destination. No five-tab sidebar expansion was added.

Backend acceptance: two accounts must never read/mutate each other's private notes/cards/packs; stale versions must conflict; repeating a recall request must not double-grade; a failed pack download must preserve the old pack; users cannot self-verify; revocation removes public records; full rooms cannot admit another seat; non-hosts cannot control the shared timer; host departure ends the session. Test actual API mappings and cookie/CORS/CSRF behavior on staging before asserting production compatibility.

## Verification limits and references

Automated source/DOM checks, strict TypeScript and production build are run for this release. These do not prove real PDF rasterization, mobile geometry, cold offline launch, network timing or frame rate on a real device. Live-browser QA was not available in this workflow; perform an acceptance pass on iOS/Android and desktop against the actual backend.

Technical references: [MDN: service workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers), [storage quotas and eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria), [storage estimates](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/estimate).

## Release gate

- 190/190 automated checks passed.
- Strict TypeScript passed.
- Production build and offline-worker generation passed.
- Source cascade audit: 240 inherited geometry scenarios and 176 readable color pairs.
- Complete source tree: 747 files; all 725 baseline files retained, 712 unchanged, 13 modified, 22 added.
- New route chunks remain split (about 1.85–13.07 kB raw). Existing shared entry warning remains at about 1,057 kB raw / 327 kB gzip.
- Real-browser/device rendering and actual backend integration are unverified.
