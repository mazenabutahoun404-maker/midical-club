import type { ApiClient } from "../api/client";
import type { StudentApi } from "../api/student-api";
import {
  assertOwner,
  collectApiPages,
  requireId,
  record,
  string,
} from "../api/mapping";
import {
  StudyError,
  type MarginNote,
  type StudyHubService,
} from "../../types/study-hub";
import { unavailableStudyService } from "./unavailable-study.service";
import { ApiError } from "../api/client";

/** Native Swagger note contract. Other study features keep their own phase boundary. */
export function createApiMargins(
  api: ApiClient,
  service: StudentApi,
  actor: () => Promise<string>,
): StudyHubService {
  const tombstones = new Map<
    string,
    { session: string | undefined; version: string }
  >();
  api.session.subscribe(() =>
    tombstones.forEach((value, key) => {
      if (value.session !== api.session.get()?.sessionId)
        tombstones.delete(key);
    }),
  );
  function mapped(value: unknown, owner: string): MarginNote {
    const row = record(value),
      anchor = record(row.anchor);
    if (row.ownerId !== owner) throw new StudyError("FORBIDDEN", 403);
    if (
      !Number.isInteger(anchor.page) ||
      Number(anchor.page) < 1 ||
      ![anchor.x, anchor.y].every(
        (v) => typeof v === "number" && v >= 0 && v <= 1,
      ) ||
      !["amber", "mint", "rose"].includes(string(row.color))
    )
      throw new StudyError("INVALID", 502);
    return {
      id: requireId(row.id),
      version: requireId(row.version),
      ownerId: owner,
      courseId: requireId(row.offeringId),
      updatedAt: string(row.updatedAt),
      body: string(row.body),
      color: row.color as MarginNote["color"],
      deleted: row.deleted === true,
      anchor: {
        resourceId: requireId(anchor.resourceId),
        resourceRevision: requireId(anchor.resourceRevision),
        page: Number(anchor.page),
        x: Number(anchor.x),
        y: Number(anchor.y),
        quote: string(anchor.quote) || undefined,
      },
    };
  }
  async function run<T>(task: (guard: () => void) => Promise<T>): Promise<T> {
    const session = api.session.get()?.sessionId;
    const guard = () => assertOwner(api, session);
    try {
      guard();
      const result = await task(guard);
      guard();
      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        if ([409, 412].includes(error.status))
          throw new StudyError("CONFLICT", error.status);
        if (error.status === 401) throw new StudyError("UNAUTHORIZED", 401);
        if (error.status === 403) throw new StudyError("FORBIDDEN", 403);
      }
      throw error;
    }
  }
  const version = (v: string | number) => {
    if (typeof v !== "string" || !v) throw new StudyError("CONFLICT", 409);
    return v;
  };
  return {
    ...unavailableStudyService(),
    source: "api",
    listMargins: (resourceId, c) =>
      run(async (guard) => {
        const owner = await actor();
        guard();
        return (
          await collectApiPages(api, (Page) =>
            service.get_api_v1_me_margin_notes({
              query: {
                ResourceId: resourceId,
                IncludeDeleted: false,
                Page,
                PageSize: 100,
              },
              signal: c?.signal,
            }),
          )
        )
          .map((row) => mapped(row, owner))
          .filter((row) => !row.deleted);
      }),
    saveMargin: (input, existing) =>
      run(async (guard) => {
        const owner = await actor(),
          body = {
            offeringId: input.courseId,
            anchor: input.anchor,
            body: input.body,
            color: input.color,
            version: existing ? version(existing.version) : undefined,
          };
        guard();
        const row = existing
          ? await service.patch_api_v1_me_margin_notes_by_id({
              path: { id: existing.id },
              body,
              headers: { "If-Match": `"${body.version}"` },
            })
          : await service.post_api_v1_me_margin_notes({ body });
        return mapped(row, owner);
      }),
    deleteMargin: (id, v) =>
      run(async (guard) => {
        await actor();
        guard();
        const row = record(
          await service.delete_api_v1_me_margin_notes_by_id({
            path: { id },
            body: { version: version(v) },
            headers: { "If-Match": `"${v}"` },
          }),
        );
        if (row.id !== id || row.deleted !== true)
          throw new StudyError("INVALID", 502);
        tombstones.set(id, {
          session: api.session.get()?.sessionId,
          version: requireId(row.version),
        });
      }),
    restoreMargin: (note) =>
      run(async (guard) => {
        const owner = await actor();
        guard();
        // Read the actual tombstone. A pre-delete version must never be reused for restore.
        const deleted = tombstones.get(note.id);
        if (!deleted || deleted.session !== api.session.get()?.sessionId)
          throw new StudyError("CONFLICT", 409);
        const rows = await collectApiPages(api, (Page) =>
          service.get_api_v1_me_margin_notes({
            query: {
              OfferingId: note.courseId,
              ResourceId: note.anchor.resourceId,
              IncludeDeleted: true,
              Page,
              PageSize: 100,
            },
          }),
        );
        const tombstone = rows
          .map((row) => mapped(row, owner))
          .find((row) => row.id === note.id);
        if (
          !tombstone?.deleted ||
          tombstone.version !== deleted.version ||
          tombstone.body !== note.body ||
          JSON.stringify([
            tombstone.anchor.resourceId,
            tombstone.anchor.resourceRevision,
            tombstone.anchor.page,
            tombstone.anchor.x,
            tombstone.anchor.y,
            tombstone.anchor.quote,
          ]) !==
            JSON.stringify([
              note.anchor.resourceId,
              note.anchor.resourceRevision,
              note.anchor.page,
              note.anchor.x,
              note.anchor.y,
              note.anchor.quote,
            ])
        )
          throw new StudyError("CONFLICT", 409);
        guard();
        const restored = record(
          await service.post_api_v1_me_margin_notes_by_id_restore({
            path: { id: note.id },
            body: { version: version(tombstone.version) },
            headers: { "If-Match": `"${tombstone.version}"` },
          }),
        );
        if (restored.id !== note.id || restored.deleted !== false)
          throw new StudyError("INVALID", 502);
        tombstones.delete(note.id);
        return {
          ...tombstone,
          version: requireId(restored.version),
          updatedAt: string(restored.updatedAt),
          deleted: false,
        };
      }),
  };
}
