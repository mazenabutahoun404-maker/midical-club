# Exam frontend adapter

The frontend is API-ready through `ExamService` in `src/types/exams.ts`; this release does not connect exam APIs. Components obtain the service from the existing MedClub `ServicesProvider`. They contain no Supabase client, API URL, credential or Next.js dependency.

## Connecting later

Implement the complete `ExamService` interface against the intended backend, then supply that implementation as the optional `exams` property on the existing `MedClubServices` object. Preserve the other service implementations and the existing MedClub authentication provider.

```ts
import type { ExamService } from "./types/exams";
import type { MedClubServices } from "./services/contracts";

// `existingServices` is the application's existing service bundle.
// `examAdapter` is the future backend implementation of ExamService.
export function withExamAdapter(
  existingServices: MedClubServices,
  examAdapter: ExamService,
): MedClubServices {
  return { ...existingServices, exams: examAdapter };
}
```

`ServicesProvider` supplies a local preview only for the sample content configuration. With `contentSnapshot.kind === "live"` and no `exams` implementation, it supplies `unavailableExamService()`. A connected implementation should return `source: "live"` and honor optional `AbortSignal` arguments on read operations. The optional `persistent`/`subscribe` pair exists to expose preview storage availability; it is not a polling requirement for a live adapter.

## Contract mapping

| UI need                        | Service operations                                                                | Adapter behavior                                                                                                                                |
| ------------------------------ | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Course shelves and set details | `catalog`, `getExam`, `questions`                                                 | Use the same stable course IDs as MedClub academics; return localized `Text` values and only sets visible to the caller.                        |
| Focused set builder            | `customOptions`, `custom`                                                         | Return chapter/lecture/instructor facet IDs and labels plus the current matched count; select the requested question count on the service side. |
| Session lifecycle              | `start`, `attempt`, `attempts`, `save`, `finish`, `abandon`                       | Bind attempts to the authenticated MedClub account; return stable attempt IDs, canonical progress, status and monotonic numeric versions.       |
| Saved questions and mistakes   | `notebook`, `notebookQuestions`, `bookmark`                                       | Scope to the caller; page/filter the question results and return a total. The UI asks for 10 items per page.                                    |
| Question search                | `search`                                                                          | Apply course and text filters remotely, with a bounded result list; the frontend progressively displays the returned list.                      |
| Question reports               | `report`, `admin.reports`, `admin.resolveReport`                                  | Associate reports with the authenticated caller and enforce admin permissions on management.                                                    |
| Content editing                | `admin.saveSet`, `admin.saveQuestions`, `admin.deleteSet`, `admin.deleteQuestion` | Validate content, membership, versions and capabilities before atomic mutations. Return the canonical updated set and version.                  |
| Image attachments              | `admin.uploadImage`                                                               | Return a usable image URL. Apply the intended upload storage and access rules outside the UI.                                                   |

`questionBank` remains available for service implementations and explicit bank operations; the student saved-question and custom-set screens do not call it to load an entire bank. `attempts` currently returns an array and is displayed progressively in groups of 20; a very large live history would need a paginated contract extension. Set review/print intentionally loads the requested set.

## IDs, content and snapshots

- `Text` is MedClub's `{ en, ar }` content shape. Translate the returned records or provide an intentional language fallback; components choose the active language.
- Choice keys are stable `a` through `e`, independent of visual Arabic labels. `progress.answers` is keyed by question ID, not position. `progress.current` is a zero-based question index. Elapsed time is stored in seconds.
- V0.13.46 adds optional `progress.pendingAnswers` (unconfirmed practice selections) and `progress.confidence` (`confident`, `unsure`, `guessing`). Preserve them on save/resume; pending answers must not be graded. A confirmed practice answer remains immutable. Older records can omit both fields.
- Attempts carry ordered question IDs and frozen question snapshots. Editing or deleting a bank question must not rewrite an existing attempt's question order, explanations or grading context. A completed attempt returns its canonical summary.
- Published sets, drafts, private custom sets, guest preview records and account-owned records must remain distinct. MedClub's `content.review` route guard is a UI guard; the connected backend must enforce its own matching authorization.
- Questions support localized choices/explanations, chapter metadata, optional lecture/instructor IDs and question/explanation images. Image rendering accepts ordinary HTTP(S) image URLs and bounded raster data URLs; it does not render SVG/HTML input as application markup. The connected adapter should return HTTPS URLs.
- The ported MN syntax parser supports bold, italics, yellow/green/blue highlights, callouts, lists, tables and three explanation image slots. It renders React text/elements, without raw HTML insertion.

## Saves and errors

The session holds one ordered save queue. Answer, flag and page changes save after a short debounce; periodic saving and visibility/exit handling capture elapsed time. The isolated timer does not rerender the question panel. The UI keeps a private device recovery draft while saving, reports failures, and offers retry/reload for conflicts.

`save`, `finish` and `abandon` receive `expectedVersion`. Successful saves return the canonical attempt and its new version. Set editing uses an opaque string version. Reject stale writes as `ExamError("CONFLICT")` instead of overwriting a newer record. `finish` must be safe to repeat after a response is lost; return the already finished result rather than creating another result. Do not silently accept another account's attempt ID.

Map backend errors to `ExamError` codes: `UNAVAILABLE`, `NOT_FOUND`, `INVALID`, `CONFLICT`, `FORBIDDEN` or `STORAGE`. Return `null` for absent readable sets/attempts where the interface allows it. Let cancellation abort reads without performing mutations.

Practice locks a confirmed answer and can then show the answer key/explanation. Self test allows editing until submission. For a future assessed mode, withhold answer keys and explanations from active DTOs and return graded question snapshots/summary after finishing; the current self-test UI is a learning flow, not proctoring. Server-authoritative grading, deadlines and remote durability belong in that later adapter/backend implementation.

In V0.13.46 Practice uses explicit Check answer confirmation before writing `answers`; selecting a choice writes `pendingAnswers`. Course recall is a separate frontend learning view using readable set questions or finished attempt snapshots. It records self-ratings locally and does not change server exam scores. The personal recall desk continues to use the existing `StudyHubService` card/review methods.

## Preview storage

The sample adapter stores its device data under `medclub.exam-preview.v1`. Session drafts use `medclub.exam-draft.<owner>.<attemptId>`. Neither key is a production database or cross-device synchronization mechanism. The starter fixtures describe interface actions rather than clinical facts. They exercise the frontend without claiming a reviewed medical question bank or affecting student campus growth.

The preview implements owner scoping, serial mutations, version checks, frozen attempts and capped import/image validation to exercise the contract. A live backend should implement those semantics with server enforcement rather than rely on browser checks.
