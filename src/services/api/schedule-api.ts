import { createApiClient, type ApiClient, type ApiInput } from "./client";
import { createApiSession } from "./session";
import { requireVersion } from "./accounts";
import { assertOwner } from "./mapping";
import { createRecordId } from "../../lib/record-id";
import {
  calendarRequest,
  checkedCalendar,
  checkedCalendarId,
  checkedPage,
  checkedNotifications,
  calendarText,
  checkedUnread,
  checkedPreferences,
  checkedSubscriptions,
  checkedFollows,
  checkedPreview,
} from "./schedule-contracts";
export function createHttpScheduleApi(api: ApiClient, fetcher?: typeof fetch) {
  const publicApi = createApiClient({
    baseUrl: api.baseUrl,
    session: createApiSession(null),
    fetch: fetcher,
  });
  const exchange = publicApi.call;
  const keys = new Map<string, string>();
  let session = api.session.get()?.sessionId;
  api.session.subscribe(() => {
    if (session !== api.session.get()?.sessionId) {
      keys.clear();
      session = api.session.get()?.sessionId;
    }
  });
  async function command<T>(
    id: string,
    input: { idempotencyKey?: string },
    work: (key: string) => Promise<T>,
  ) {
    const signature = JSON.stringify([session, id, input], (key, v) =>
        key === "signal" || key === "idempotencyKey" ? undefined : v,
      ),
      key = input.idempotencyKey || keys.get(signature) || createRecordId();
    keys.set(signature, key);
    try {
      const result = await work(key);
      keys.delete(signature);
      return result;
    } catch (e) {
      if (
        e instanceof Error &&
        "status" in e &&
        Number(e.status) >= 400 &&
        Number(e.status) < 500 &&
        ![408, 429].includes(Number(e.status))
      )
        keys.delete(signature);
      throw e;
    }
  }
  return {
    get_api_v1_calendar: async (input: ApiInput<"get_api_v1_calendar">) => {
      return checkedPage(
        await api.call("get_api_v1_calendar", input),
        checkedCalendar,
      );
    },
    get_api_v1_calendar_by_id: async (
      input: ApiInput<"get_api_v1_calendar_by_id">,
    ) => {
      return checkedCalendarId(
        await api.call("get_api_v1_calendar_by_id", input),
        input.path.id,
      );
    },
    post_api_v1_calendar_personal_entries: async (
      input: ApiInput<"post_api_v1_calendar_personal_entries">,
    ) => {
      calendarRequest(input.body);
      return checkedCalendar(
        await api.call("post_api_v1_calendar_personal_entries", input),
      );
    },
    put_api_v1_calendar_personal_entries_by_id: async (
      input: ApiInput<"put_api_v1_calendar_personal_entries_by_id">,
    ) => {
      calendarRequest(input.body);
      requireVersion(input.body.version);
      return checkedCalendarId(
        await api.call("put_api_v1_calendar_personal_entries_by_id", input),
        input.path.id,
      );
    },
    delete_api_v1_calendar_personal_entries_by_id: async (
      input: ApiInput<"delete_api_v1_calendar_personal_entries_by_id">,
    ) => {
      requireVersion(input.query?.version);
      return api.call("delete_api_v1_calendar_personal_entries_by_id", input);
    },
    get_api_v1_admin_calendar_entries: async (
      input: ApiInput<"get_api_v1_admin_calendar_entries">,
    ) => {
      return checkedPage(
        await api.call("get_api_v1_admin_calendar_entries", input),
        checkedCalendar,
      );
    },
    post_api_v1_admin_calendar_entries: async (
      input: ApiInput<"post_api_v1_admin_calendar_entries">,
    ) => {
      calendarRequest(input.body);
      return checkedCalendar(
        await command("post_api_v1_admin_calendar_entries", input, (key) =>
          api.call("post_api_v1_admin_calendar_entries", {
            ...input,
            idempotencyKey: key,
          }),
        ),
      );
    },
    put_api_v1_admin_calendar_entries_by_id: async (
      input: ApiInput<"put_api_v1_admin_calendar_entries_by_id">,
    ) => {
      calendarRequest(input.body);
      requireVersion(input.body.version);
      return checkedCalendarId(
        await command("put_api_v1_admin_calendar_entries_by_id", input, (key) =>
          api.call("put_api_v1_admin_calendar_entries_by_id", {
            ...input,
            idempotencyKey: key,
          }),
        ),
        input.path.id,
      );
    },
    delete_api_v1_admin_calendar_entries_by_id: async (
      input: ApiInput<"delete_api_v1_admin_calendar_entries_by_id">,
    ) => {
      requireVersion(input.query?.version);
      return command(
        "delete_api_v1_admin_calendar_entries_by_id",
        input,
        (key) =>
          api.call("delete_api_v1_admin_calendar_entries_by_id", {
            ...input,
            idempotencyKey: key,
          }),
      );
    },
    put_api_v1_admin_calendar_entries_by_id_audience: async (
      input: ApiInput<"put_api_v1_admin_calendar_entries_by_id_audience">,
    ) => {
      requireVersion(input.body.version);
      return command(
        "put_api_v1_admin_calendar_entries_by_id_audience",
        input,
        (key) =>
          api.call("put_api_v1_admin_calendar_entries_by_id_audience", {
            ...input,
            idempotencyKey: key,
          }),
      );
    },
    get_api_v1_calendar_export_ics: async (
      input: ApiInput<"get_api_v1_calendar_export_ics">,
    ) => {
      return calendarText(
        await api.call("get_api_v1_calendar_export_ics", input),
      );
    },
    get_api_v1_calendar_subscription_tokens: async (
      input: ApiInput<"get_api_v1_calendar_subscription_tokens">,
    ) => {
      return checkedSubscriptions(
        await api.call("get_api_v1_calendar_subscription_tokens", input),
      );
    },
    post_api_v1_calendar_subscription_tokens: async (
      input: ApiInput<"post_api_v1_calendar_subscription_tokens">,
    ) => {
      return api.call("post_api_v1_calendar_subscription_tokens", input);
    },
    post_api_v1_calendar_subscription_tokens_by_id_rotate: async (
      input: ApiInput<"post_api_v1_calendar_subscription_tokens_by_id_rotate">,
    ) => {
      return api.call(
        "post_api_v1_calendar_subscription_tokens_by_id_rotate",
        input,
      );
    },
    delete_api_v1_calendar_subscription_tokens_by_id: async (
      input: ApiInput<"delete_api_v1_calendar_subscription_tokens_by_id">,
    ) => {
      return api.call(
        "delete_api_v1_calendar_subscription_tokens_by_id",
        input,
      );
    },
    get_api_v1_calendar_subscriptions_by_rawToken_ics: async (
      input: ApiInput<"get_api_v1_calendar_subscriptions_by_rawToken_ics">,
    ) => {
      return calendarText(
        await exchange(
          "get_api_v1_calendar_subscriptions_by_rawToken_ics",
          input,
        ),
      );
    },
    get_api_v1_notifications: async (
      input: ApiInput<"get_api_v1_notifications">,
    ) => {
      return checkedNotifications(
        await api.call("get_api_v1_notifications", input),
      );
    },
    get_api_v1_notifications_unread_count: async (
      input: ApiInput<"get_api_v1_notifications_unread_count">,
    ) => {
      return checkedUnread(
        await api.call("get_api_v1_notifications_unread_count", input),
      );
    },
    patch_api_v1_notifications_by_id_read: async (
      input: ApiInput<"patch_api_v1_notifications_by_id_read">,
    ) => {
      return api.call("patch_api_v1_notifications_by_id_read", input);
    },
    post_api_v1_notifications_read_all: async (
      input: ApiInput<"post_api_v1_notifications_read_all">,
    ) => {
      return api.call("post_api_v1_notifications_read_all", input);
    },
    get_api_v1_notification_preferences: async (
      input: ApiInput<"get_api_v1_notification_preferences">,
    ) => {
      return checkedPreferences(
        await api.call("get_api_v1_notification_preferences", input),
      );
    },
    put_api_v1_notification_preferences: async (
      input: ApiInput<"put_api_v1_notification_preferences">,
    ) => {
      return api.call("put_api_v1_notification_preferences", input);
    },
    get_api_v1_admin_notification_campaigns: async (
      input: ApiInput<"get_api_v1_admin_notification_campaigns">,
    ) => {
      return checkedPage(
        await api.call("get_api_v1_admin_notification_campaigns", input),
      );
    },
    post_api_v1_admin_notification_campaigns: async (
      input: ApiInput<"post_api_v1_admin_notification_campaigns">,
    ) => {
      return command("post_api_v1_admin_notification_campaigns", input, (key) =>
        api.call("post_api_v1_admin_notification_campaigns", {
          ...input,
          idempotencyKey: key,
        }),
      );
    },
    get_api_v1_admin_notification_campaigns_by_id: async (
      input: ApiInput<"get_api_v1_admin_notification_campaigns_by_id">,
    ) => {
      return api.call("get_api_v1_admin_notification_campaigns_by_id", input);
    },
    post_api_v1_admin_notification_campaigns_by_id_preview_audience: async (
      input: ApiInput<"post_api_v1_admin_notification_campaigns_by_id_preview_audience">,
    ) => {
      return checkedPreview(
        await command(
          "post_api_v1_admin_notification_campaigns_by_id_preview_audience",
          input,
          (key) =>
            api.call(
              "post_api_v1_admin_notification_campaigns_by_id_preview_audience",
              { ...input, idempotencyKey: key },
            ),
        ),
      );
    },
    post_api_v1_admin_notification_campaigns_by_id_publish: async (
      input: ApiInput<"post_api_v1_admin_notification_campaigns_by_id_publish">,
    ) => {
      requireVersion(input.body.version);
      return command(
        "post_api_v1_admin_notification_campaigns_by_id_publish",
        input,
        (key) =>
          api.call("post_api_v1_admin_notification_campaigns_by_id_publish", {
            ...input,
            idempotencyKey: key,
          }),
      );
    },
    post_api_v1_admin_notification_campaigns_by_id_cancel: async (
      input: ApiInput<"post_api_v1_admin_notification_campaigns_by_id_cancel">,
    ) => {
      requireVersion(input.body.version);
      return command(
        "post_api_v1_admin_notification_campaigns_by_id_cancel",
        input,
        (key) =>
          api.call("post_api_v1_admin_notification_campaigns_by_id_cancel", {
            ...input,
            idempotencyKey: key,
          }),
      );
    },
    get_api_v1_student_followed_subjects: async (
      input: ApiInput<"get_api_v1_student_followed_subjects">,
    ) => {
      return checkedFollows(
        await api.call("get_api_v1_student_followed_subjects", input),
      );
    },
    post_api_v1_student_followed_subjects: async (
      input: ApiInput<"post_api_v1_student_followed_subjects">,
    ) => {
      return api.call("post_api_v1_student_followed_subjects", input);
    },
    delete_api_v1_student_followed_subjects_by_id: async (
      input: ApiInput<"delete_api_v1_student_followed_subjects_by_id">,
    ) => {
      return api.call("delete_api_v1_student_followed_subjects_by_id", input);
    },
    post_api_v1_study_plans_by_id_calendar_sync: async (
      input: ApiInput<"post_api_v1_study_plans_by_id_calendar_sync">,
    ) => {
      return api.call("post_api_v1_study_plans_by_id_calendar_sync", input);
    },
  };
}
export type ScheduleApi = ReturnType<typeof createHttpScheduleApi>;
export function bindScheduleSession(api: ApiClient, service: ScheduleApi) {
  const owner = api.session.get()?.sessionId;
  return new Proxy(service, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);
      return typeof value === "function"
        ? (...args: unknown[]) => {
            assertOwner(api, owner);
            return value(...args);
          }
        : value;
    },
  });
}
