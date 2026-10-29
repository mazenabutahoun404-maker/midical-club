import type { ApiClient, ApiInput } from "./client";
import { ApiError } from "./client";
import { requireVersion } from "./accounts";
import { createRecordId } from "../../lib/record-id";
import { assertOwner } from "./mapping";
export function createHttpStudentApi(api: ApiClient) {
  const pendingKeys = new Map<string, string>();
  let owner = api.session.get()?.sessionId;
  api.session.subscribe(() => {
    if (api.session.get()?.sessionId !== owner) {
      pendingKeys.clear();
      owner = api.session.get()?.sessionId;
    }
  });
  async function command<T>(
    id: string,
    input: unknown,
    work: (key: string) => Promise<T>,
  ): Promise<T> {
    const value = input as { idempotencyKey?: string; signal?: AbortSignal };
    const fingerprint = JSON.stringify([owner, id, input], (key, v) =>
      key === "signal" || key === "idempotencyKey" ? undefined : v,
    );
    const key =
      value.idempotencyKey || pendingKeys.get(fingerprint) || createRecordId();
    pendingKeys.set(fingerprint, key);
    try {
      const result = await work(key);
      pendingKeys.delete(fingerprint);
      return result;
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status >= 400 &&
        error.status < 500 &&
        ![408, 429].includes(error.status)
      )
        pendingKeys.delete(fingerprint);
      throw error;
    }
  }

  return {
    get_api_v1_search_files: (input: ApiInput<"get_api_v1_search_files">) => {
      return api.call("get_api_v1_search_files", input);
    },
    get_api_v1_student_learning_progress: (
      input: ApiInput<"get_api_v1_student_learning_progress">,
    ) => {
      return api.call("get_api_v1_student_learning_progress", input);
    },
    get_api_v1_student_learning_progress_by_contentType_by_contentId: (
      input: ApiInput<"get_api_v1_student_learning_progress_by_contentType_by_contentId">,
    ) => {
      return api.call(
        "get_api_v1_student_learning_progress_by_contentType_by_contentId",
        input,
      );
    },
    put_api_v1_student_learning_progress_by_contentType_by_contentId: (
      input: ApiInput<"put_api_v1_student_learning_progress_by_contentType_by_contentId">,
    ) => {
      return command(
        "put_api_v1_student_learning_progress_by_contentType_by_contentId",
        input,
        (key) =>
          api.call(
            "put_api_v1_student_learning_progress_by_contentType_by_contentId",
            { ...input, idempotencyKey: key },
          ),
      );
    },
    delete_api_v1_student_learning_progress_by_contentType_by_contentId: (
      input: ApiInput<"delete_api_v1_student_learning_progress_by_contentType_by_contentId">,
    ) => {
      if (input.query?.reset && !input.query.confirm)
        throw new ApiError(
          "Confirm before resetting progress.",
          422,
          "CONFIRM_REQUIRED",
        );
      return api.call(
        "delete_api_v1_student_learning_progress_by_contentType_by_contentId",
        input,
      );
    },
    post_api_v1_student_learning_progress_by_contentType_by_contentId_complete:
      (
        input: ApiInput<"post_api_v1_student_learning_progress_by_contentType_by_contentId_complete">,
      ) => {
        requireVersion(input.body.expectedVersion);
        return api.call(
          "post_api_v1_student_learning_progress_by_contentType_by_contentId_complete",
          input,
        );
      },
    get_api_v1_student_recent_items: (
      input: ApiInput<"get_api_v1_student_recent_items">,
    ) => {
      return api.call("get_api_v1_student_recent_items", input);
    },
    delete_api_v1_student_recent_items: (
      input: ApiInput<"delete_api_v1_student_recent_items">,
    ) => {
      return api.call("delete_api_v1_student_recent_items", input);
    },
    post_api_v1_student_recent_items_by_itemType_by_itemId_opened: (
      input: ApiInput<"post_api_v1_student_recent_items_by_itemType_by_itemId_opened">,
    ) => {
      return command(
        "post_api_v1_student_recent_items_by_itemType_by_itemId_opened",
        input,
        (key) =>
          api.call(
            "post_api_v1_student_recent_items_by_itemType_by_itemId_opened",
            { ...input, idempotencyKey: key },
          ),
      );
    },
    get_api_v1_library_collections: (
      input: ApiInput<"get_api_v1_library_collections">,
    ) => {
      return api.call("get_api_v1_library_collections", input);
    },
    post_api_v1_library_collections: (
      input: ApiInput<"post_api_v1_library_collections">,
    ) => {
      return api.call("post_api_v1_library_collections", input);
    },
    get_api_v1_library_collections_by_id: (
      input: ApiInput<"get_api_v1_library_collections_by_id">,
    ) => {
      return api.call("get_api_v1_library_collections_by_id", input);
    },
    put_api_v1_library_collections_by_id: (
      input: ApiInput<"put_api_v1_library_collections_by_id">,
    ) => {
      requireVersion(input.body.version);
      return api.call("put_api_v1_library_collections_by_id", input);
    },
    delete_api_v1_library_collections_by_id: (
      input: ApiInput<"delete_api_v1_library_collections_by_id">,
    ) => {
      requireVersion(input.query?.version);
      return api.call("delete_api_v1_library_collections_by_id", input);
    },
    put_api_v1_library_collections_reorder: (
      input: ApiInput<"put_api_v1_library_collections_reorder">,
    ) => {
      requireVersion(input.body.version);
      return api.call("put_api_v1_library_collections_reorder", input);
    },
    post_api_v1_library_collections_by_id_items: (
      input: ApiInput<"post_api_v1_library_collections_by_id_items">,
    ) => {
      return api.call("post_api_v1_library_collections_by_id_items", input);
    },
    delete_api_v1_library_collections_by_id_items_by_itemId: (
      input: ApiInput<"delete_api_v1_library_collections_by_id_items_by_itemId">,
    ) => {
      return api.call(
        "delete_api_v1_library_collections_by_id_items_by_itemId",
        input,
      );
    },
    put_api_v1_library_collections_by_id_items_reorder: (
      input: ApiInput<"put_api_v1_library_collections_by_id_items_reorder">,
    ) => {
      requireVersion(input.body.version);
      return api.call(
        "put_api_v1_library_collections_by_id_items_reorder",
        input,
      );
    },
    get_api_v1_roadmaps: (input: ApiInput<"get_api_v1_roadmaps">) => {
      return api.call("get_api_v1_roadmaps", input);
    },
    get_api_v1_roadmaps_by_id: (
      input: ApiInput<"get_api_v1_roadmaps_by_id">,
    ) => {
      return api.call("get_api_v1_roadmaps_by_id", input);
    },
    get_api_v1_roadmaps_by_id_progress: (
      input: ApiInput<"get_api_v1_roadmaps_by_id_progress">,
    ) => {
      return api.call("get_api_v1_roadmaps_by_id_progress", input);
    },
    put_api_v1_roadmaps_by_id_items_by_itemId_progress: (
      input: ApiInput<"put_api_v1_roadmaps_by_id_items_by_itemId_progress">,
    ) => {
      return api.call(
        "put_api_v1_roadmaps_by_id_items_by_itemId_progress",
        input,
      );
    },
    get_api_v1_admin_roadmaps: (
      input: ApiInput<"get_api_v1_admin_roadmaps">,
    ) => {
      return api.call("get_api_v1_admin_roadmaps", input);
    },
    post_api_v1_admin_roadmaps: (
      input: ApiInput<"post_api_v1_admin_roadmaps">,
    ) => {
      return command("post_api_v1_admin_roadmaps", input, (key) =>
        api.call("post_api_v1_admin_roadmaps", {
          ...input,
          idempotencyKey: key,
        }),
      );
    },
    get_api_v1_admin_roadmaps_by_id: (
      input: ApiInput<"get_api_v1_admin_roadmaps_by_id">,
    ) => {
      return api.call("get_api_v1_admin_roadmaps_by_id", input);
    },
    put_api_v1_admin_roadmaps_by_id: (
      input: ApiInput<"put_api_v1_admin_roadmaps_by_id">,
    ) => {
      requireVersion(input.body.version);
      return command("put_api_v1_admin_roadmaps_by_id", input, (key) =>
        api.call("put_api_v1_admin_roadmaps_by_id", {
          ...input,
          idempotencyKey: key,
        }),
      );
    },
    post_api_v1_admin_roadmaps_by_id_publish: (
      input: ApiInput<"post_api_v1_admin_roadmaps_by_id_publish">,
    ) => {
      requireVersion(input.body.version);
      return command("post_api_v1_admin_roadmaps_by_id_publish", input, (key) =>
        api.call("post_api_v1_admin_roadmaps_by_id_publish", {
          ...input,
          idempotencyKey: key,
        }),
      );
    },
    post_api_v1_admin_roadmaps_by_id_archive: (
      input: ApiInput<"post_api_v1_admin_roadmaps_by_id_archive">,
    ) => {
      requireVersion(input.body.version);
      return command("post_api_v1_admin_roadmaps_by_id_archive", input, (key) =>
        api.call("post_api_v1_admin_roadmaps_by_id_archive", {
          ...input,
          idempotencyKey: key,
        }),
      );
    },
    get_api_v1_admin_roadmaps_by_id_versions: (
      input: ApiInput<"get_api_v1_admin_roadmaps_by_id_versions">,
    ) => {
      return api.call("get_api_v1_admin_roadmaps_by_id_versions", input);
    },
    get_api_v1_student_dashboard: (
      input: ApiInput<"get_api_v1_student_dashboard">,
    ) => {
      return api.call("get_api_v1_student_dashboard", input);
    },
    get_api_v1_student_dashboard_priority_updates: (
      input: ApiInput<"get_api_v1_student_dashboard_priority_updates">,
    ) => {
      return api.call("get_api_v1_student_dashboard_priority_updates", input);
    },
    get_api_v1_student_dashboard_upcoming: (
      input: ApiInput<"get_api_v1_student_dashboard_upcoming">,
    ) => {
      return api.call("get_api_v1_student_dashboard_upcoming", input);
    },
    get_api_v1_me_margin_notes: (
      input: ApiInput<"get_api_v1_me_margin_notes">,
    ) => {
      return api.call("get_api_v1_me_margin_notes", input);
    },
    post_api_v1_me_margin_notes: (
      input: ApiInput<"post_api_v1_me_margin_notes">,
    ) => {
      return command("post_api_v1_me_margin_notes", input, (key) =>
        api.call("post_api_v1_me_margin_notes", {
          ...input,
          idempotencyKey: key,
        }),
      );
    },
    patch_api_v1_me_margin_notes_by_id: (
      input: ApiInput<"patch_api_v1_me_margin_notes_by_id">,
    ) => {
      requireVersion(input.body.version);
      if (
        input.headers?.["If-Match"] &&
        input.headers["If-Match"].replace(/^"|"$/g, "") !== input.body.version
      )
        throw new ApiError(
          "The note version and If-Match header differ.",
          422,
          "VERSION_MISMATCH",
        );
      return command("patch_api_v1_me_margin_notes_by_id", input, (key) =>
        api.call("patch_api_v1_me_margin_notes_by_id", {
          ...input,
          idempotencyKey: key,
        }),
      );
    },
    delete_api_v1_me_margin_notes_by_id: (
      input: ApiInput<"delete_api_v1_me_margin_notes_by_id">,
    ) => {
      requireVersion(input.body.version);
      if (
        input.headers?.["If-Match"] &&
        input.headers["If-Match"].replace(/^"|"$/g, "") !== input.body.version
      )
        throw new ApiError(
          "The note version and If-Match header differ.",
          422,
          "VERSION_MISMATCH",
        );
      return command("delete_api_v1_me_margin_notes_by_id", input, (key) =>
        api.call("delete_api_v1_me_margin_notes_by_id", {
          ...input,
          idempotencyKey: key,
        }),
      );
    },
    post_api_v1_me_margin_notes_by_id_restore: (
      input: ApiInput<"post_api_v1_me_margin_notes_by_id_restore">,
    ) => {
      requireVersion(input.body.version);
      if (
        input.headers?.["If-Match"] &&
        input.headers["If-Match"].replace(/^"|"$/g, "") !== input.body.version
      )
        throw new ApiError(
          "The note version and If-Match header differ.",
          422,
          "VERSION_MISMATCH",
        );
      return command(
        "post_api_v1_me_margin_notes_by_id_restore",
        input,
        (key) =>
          api.call("post_api_v1_me_margin_notes_by_id_restore", {
            ...input,
            idempotencyKey: key,
          }),
      );
    },
    get_api_v1_study_plans: (input: ApiInput<"get_api_v1_study_plans">) => {
      return api.call("get_api_v1_study_plans", input);
    },
    post_api_v1_study_plans: (input: ApiInput<"post_api_v1_study_plans">) => {
      return api.call("post_api_v1_study_plans", input);
    },
    post_api_v1_study_plans_generate_preview: (
      input: ApiInput<"post_api_v1_study_plans_generate_preview">,
    ) => {
      return api.call("post_api_v1_study_plans_generate_preview", input);
    },
    get_api_v1_study_plans_by_id: (
      input: ApiInput<"get_api_v1_study_plans_by_id">,
    ) => {
      return api.call("get_api_v1_study_plans_by_id", input);
    },
    put_api_v1_study_plans_by_id: (
      input: ApiInput<"put_api_v1_study_plans_by_id">,
    ) => {
      requireVersion(input.body.version);
      return api.call("put_api_v1_study_plans_by_id", input);
    },
    delete_api_v1_study_plans_by_id: (
      input: ApiInput<"delete_api_v1_study_plans_by_id">,
    ) => {
      requireVersion(input.query?.version);
      return api.call("delete_api_v1_study_plans_by_id", input);
    },
    post_api_v1_study_plans_by_id_regenerate_remaining: (
      input: ApiInput<"post_api_v1_study_plans_by_id_regenerate_remaining">,
    ) => {
      requireVersion(input.body.version);
      return api.call(
        "post_api_v1_study_plans_by_id_regenerate_remaining",
        input,
      );
    },
    post_api_v1_study_plans_by_id_items: (
      input: ApiInput<"post_api_v1_study_plans_by_id_items">,
    ) => {
      return api.call("post_api_v1_study_plans_by_id_items", input);
    },
    put_api_v1_study_plans_by_id_items_by_itemId: (
      input: ApiInput<"put_api_v1_study_plans_by_id_items_by_itemId">,
    ) => {
      requireVersion(input.body.version);
      return api.call("put_api_v1_study_plans_by_id_items_by_itemId", input);
    },
    delete_api_v1_study_plans_by_id_items_by_itemId: (
      input: ApiInput<"delete_api_v1_study_plans_by_id_items_by_itemId">,
    ) => {
      requireVersion(input.query?.version);
      return api.call("delete_api_v1_study_plans_by_id_items_by_itemId", input);
    },
    post_api_v1_study_plans_by_id_items_by_itemId_complete: (
      input: ApiInput<"post_api_v1_study_plans_by_id_items_by_itemId_complete">,
    ) => {
      return api.call(
        "post_api_v1_study_plans_by_id_items_by_itemId_complete",
        input,
      );
    },
    get_api_v1_search: (input: ApiInput<"get_api_v1_search">) => {
      return api.call("get_api_v1_search", input);
    },
    get_api_v1_search_suggestions: (
      input: ApiInput<"get_api_v1_search_suggestions">,
    ) => {
      return api.call("get_api_v1_search_suggestions", input);
    },
    get_api_v1_search_resources_by_type_by_id_explain: (
      input: ApiInput<"get_api_v1_search_resources_by_type_by_id_explain">,
    ) => {
      return api.call(
        "get_api_v1_search_resources_by_type_by_id_explain",
        input,
      );
    },
    post_api_v1_search_interactions_click: (
      input: ApiInput<"post_api_v1_search_interactions_click">,
    ) => {
      return api.call("post_api_v1_search_interactions_click", input);
    },
    get_api_v1_utilities: (input: ApiInput<"get_api_v1_utilities">) => {
      return api.call("get_api_v1_utilities", input);
    },
    get_api_v1_utilities_pomodoro_settings: (
      input: ApiInput<"get_api_v1_utilities_pomodoro_settings">,
    ) => {
      return api.call("get_api_v1_utilities_pomodoro_settings", input);
    },
    put_api_v1_utilities_pomodoro_settings: (
      input: ApiInput<"put_api_v1_utilities_pomodoro_settings">,
    ) => {
      return api.call("put_api_v1_utilities_pomodoro_settings", input);
    },
    post_api_v1_utilities_gpa_calculate: (
      input: ApiInput<"post_api_v1_utilities_gpa_calculate">,
    ) => {
      return api.call("post_api_v1_utilities_gpa_calculate", input);
    },
    get_api_v1_utilities_gpa_active_scale: (
      input: ApiInput<"get_api_v1_utilities_gpa_active_scale">,
    ) => {
      return api.call("get_api_v1_utilities_gpa_active_scale", input);
    },
    get_api_v1_admin_gpa_scales: (
      input: ApiInput<"get_api_v1_admin_gpa_scales">,
    ) => {
      return api.call("get_api_v1_admin_gpa_scales", input);
    },
    post_api_v1_admin_gpa_scales: (
      input: ApiInput<"post_api_v1_admin_gpa_scales">,
    ) => {
      return command("post_api_v1_admin_gpa_scales", input, (key) =>
        api.call("post_api_v1_admin_gpa_scales", {
          ...input,
          idempotencyKey: key,
        }),
      );
    },
    get_api_v1_admin_gpa_scales_by_id: (
      input: ApiInput<"get_api_v1_admin_gpa_scales_by_id">,
    ) => {
      return api.call("get_api_v1_admin_gpa_scales_by_id", input);
    },
    put_api_v1_admin_gpa_scales_by_id: (
      input: ApiInput<"put_api_v1_admin_gpa_scales_by_id">,
    ) => {
      requireVersion(input.body.version);
      return command("put_api_v1_admin_gpa_scales_by_id", input, (key) =>
        api.call("put_api_v1_admin_gpa_scales_by_id", {
          ...input,
          idempotencyKey: key,
        }),
      );
    },
    post_api_v1_admin_gpa_scales_by_id_activate: (
      input: ApiInput<"post_api_v1_admin_gpa_scales_by_id_activate">,
    ) => {
      requireVersion(input.body.version);
      return command(
        "post_api_v1_admin_gpa_scales_by_id_activate",
        input,
        (key) =>
          api.call("post_api_v1_admin_gpa_scales_by_id_activate", {
            ...input,
            idempotencyKey: key,
          }),
      );
    },
    post_api_v1_admin_gpa_scales_by_id_archive: (
      input: ApiInput<"post_api_v1_admin_gpa_scales_by_id_archive">,
    ) => {
      requireVersion(input.body.version);
      return command(
        "post_api_v1_admin_gpa_scales_by_id_archive",
        input,
        (key) =>
          api.call("post_api_v1_admin_gpa_scales_by_id_archive", {
            ...input,
            idempotencyKey: key,
          }),
      );
    },
    get_api_v1_admin_utilities: (
      input: ApiInput<"get_api_v1_admin_utilities">,
    ) => {
      return api.call("get_api_v1_admin_utilities", input);
    },
    put_api_v1_admin_utilities_by_id: (
      input: ApiInput<"put_api_v1_admin_utilities_by_id">,
    ) => {
      requireVersion(input.body.version);
      return command("put_api_v1_admin_utilities_by_id", input, (key) =>
        api.call("put_api_v1_admin_utilities_by_id", {
          ...input,
          idempotencyKey: key,
        }),
      );
    },
    put_api_v1_admin_utilities_reorder: (
      input: ApiInput<"put_api_v1_admin_utilities_reorder">,
    ) => {
      requireVersion(input.body.version);
      return command("put_api_v1_admin_utilities_reorder", input, (key) =>
        api.call("put_api_v1_admin_utilities_reorder", {
          ...input,
          idempotencyKey: key,
        }),
      );
    },
  };
}
export type StudentApi = ReturnType<typeof createHttpStudentApi>;

/** Each rendered workflow retains the session that started it across all awaits. */
export function bindStudentSession(api: ApiClient, student: StudentApi) {
  const session = api.session.get()?.sessionId;
  return new Proxy(student, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);
      return typeof value === "function"
        ? (...args: unknown[]) => {
            assertOwner(api, session);
            return value(...args);
          }
        : value;
    },
  });
}
