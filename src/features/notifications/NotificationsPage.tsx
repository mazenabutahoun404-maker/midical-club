import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  BookOpen,
  Clock3,
  Sparkles,
  ArrowUpRight,
  CheckCheck,
} from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useWorkspace } from "../../app/providers/WorkspaceProvider";
import { useOverlays } from "../../app/providers/OverlayProvider";
import { useResources } from "../../hooks/useContent";
import { useNotifications } from "./useNotifications";
import { PageIntro } from "../../components/data-display/PageIntro";
import { Button } from "../../components/ui/button";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { formatDate } from "../../lib/dates";
import type { StudentNotification } from "../../types/workspace";
export default function NotificationsPage() {
  const { label, t, locale } = useLocale(),
    { state, send } = useWorkspace();
  const notifications = useNotifications(),
    resources = useResources();
  const { openDetail } = useOverlays(),
    navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  if (notifications.isError || resources.isError)
    return (
      <ErrorState
        retry={() => {
          notifications.retry();
          void resources.refetch();
        }}
      />
    );
  if (notifications.isPending || resources.isPending) return <LoadingState />;
  const items = notifications.items.filter(
    (n) =>
      filter === "all" ||
      (filter === "read") === state.readNotificationIds.includes(n.id),
  );
  const firstUnreadId = items.find(
    (item) => !state.readNotificationIds.includes(item.id),
  )?.id;
  const view = (n: StudentNotification) => {
    void send({ type: "read-notifications", ids: [n.id], read: true });
    const resource = resources.data?.find((r) => r.id === n.resourceId);
    if (resource) openDetail({ kind: "resource", item: resource });
    else if (n.href) navigate(n.href);
  };
  return (
    <div className="container notifications-v3">
      <PageIntro
        eyebrow={label("notificationEyebrow")}
        title={label("notificationTitle")}
        description={label("notificationBody")}
      />
      <div className="notifications-toolbar">
        <div className="segmented-pills">
          {(["all", "unread", "read"] as const).map((key) => (
            <button
              key={key}
              aria-label={
                label(key === "all" ? "allNotifications" : key) +
                (key === "unread" ? " " + notifications.unread : "")
              }
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
            >
              {label(key === "all" ? "allNotifications" : key)}
              {key === "unread" && <b>{notifications.unread}</b>}
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          disabled={!notifications.unread}
          onClick={() =>
            void send({
              type: "read-notifications",
              ids: notifications.items.map((n) => n.id),
              read: true,
            })
          }
        >
          <CheckCheck size={17} />
          {label("markAllRead")}
        </Button>
      </div>
      <div className="notification-stream">
        {items.map((n) => {
          const read = state.readNotificationIds.includes(n.id);
          const Icon =
            n.kind === "course"
              ? BookOpen
              : n.kind === "reminder"
                ? Clock3
                : Sparkles;
          return (
            <article
              className="notification-entry"
              data-read={read}
              data-motion-state={read ? "settled" : "unread"}
              data-primary-unread={!read && n.id === firstUnreadId ? "true" : undefined}
              key={n.id}
            >
              <span className="notification-icon">
                <Icon size={22} />
              </span>
              <div className="notification-copy">
                <span className="notification-date">
                  {formatDate(n.createdAt, locale, {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {!read && (
                    <span className="unread-dot" aria-label={label("unread")} />
                  )}
                </span>
                <h2>{t(n.title)}</h2>
                <p>{t(n.body)}</p>
                <div className="notification-actions">
                  {(n.href || n.resourceId) && (
                    <button className="text-link" onClick={() => view(n)}>
                      {label("notificationAction")}
                      <ArrowUpRight className="directional" size={16} />
                    </button>
                  )}
                  <button
                    className="quiet-button"
                    onClick={() =>
                      void send({
                        type: "read-notifications",
                        ids: [n.id],
                        read: !read,
                      })
                    }
                  >
                    {label(read ? "markUnread" : "markRead")}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
        {!items.length && (
          <div className="notifications-empty">
            <Bell size={40} />
            <h2>{label("noNotifications")}</h2>
            <p>{label("noNotificationsBody")}</p>
          </div>
        )}
      </div>
      <p className="workspace-note">{label("notificationNote")}</p>
    </div>
  );
}
