import { useScheduleConnection, useScheduleQuery } from "./shared";
export function useInbox(page = 1, pageSize = 20, enabled = true) {
  const { api } = useScheduleConnection();
  const inbox = useScheduleQuery(
    "notifications",
    (signal) =>
      api.get_api_v1_notifications({
        query: { Page: page, PageSize: pageSize },
        signal,
      }),
    [page, pageSize],
    enabled,
  );
  const unread = useScheduleQuery(
    "unread-count",
    (signal) => api.get_api_v1_notifications_unread_count({ signal }),
    "",
    true,
    60000,
  );
  return { inbox, unread };
}
