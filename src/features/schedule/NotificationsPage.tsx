import { useState } from "react";
import { Bell, CheckCheck, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLocale } from "../../app/providers/LocaleProvider";
import { PageIntro } from "../../components/data-display/PageIntro";
import { Button } from "../../components/ui/button";
import { canonicalPath } from "../../services/api/learning-target";
import { useInbox } from "./notifications";
import { NotificationPreferences } from "./NotificationPreferences";
import { FollowedSubjects } from "./FollowedSubjects";
import {
  Pager,
  QueryStatus,
  useScheduleConnection,
  useScheduleAction,
} from "./shared";
export default function LiveNotifications() {
  const { owner } = useScheduleConnection();
  return <Inbox key={owner} />;
}
function Inbox() {
  const { api } = useScheduleConnection(),
    { t, label, locale } = useLocale(),
    navigate = useNavigate(),
    action = useScheduleAction();
  const [page, setPage] = useState(1),
    [filter, setFilter] = useState<"all" | "unread" | "read">("all"),
    [settings, setSettings] = useState(false);
  const { inbox, unread } = useInbox(page),
    items = inbox.data?.items || [];
  const visible = items.filter(
      (v) => filter === "all" || (filter === "read") === !!v.readAt,
    ),
    firstUnread = visible.find((v) => !v.readAt)?.id;
  return (
    <div className="container notifications-v3">
      <PageIntro
        eyebrow={label("notificationEyebrow")}
        title={label("notificationTitle")}
        description={t({
          en: "Updates delivered to your account. Read status is saved by the server.",
          ar: "تحديثات تصل إلى حسابك. تُحفظ حالة القراءة على الخدمة.",
        })}
      />
      <div className="notifications-toolbar">
        <div className="segmented-pills">
          {(["all", "unread", "read"] as const).map((value) => (
            <button
              key={value}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {label(value === "all" ? "allNotifications" : value)}
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          disabled={action.busy || !unread.data?.unreadCount}
          onClick={() =>
            void action.run(() => api.post_api_v1_notifications_read_all({}))
          }
        >
          <CheckCheck size={17} />
          {label("markAllRead")}
        </Button>
        <Button variant="outline" onClick={() => setSettings((v) => !v)}>
          {t(
            settings
              ? { en: "Close preferences", ar: "إغلاق التفضيلات" }
              : { en: "Preferences & subjects", ar: "التفضيلات والمواد" },
          )}
        </Button>
      </div>
      <QueryStatus query={inbox} />
      <QueryStatus query={unread} />
      {unread.data && (
        <p className="workspace-note">
          {t({
            en: `${unread.data.unreadCount} unread across your account. Filters below apply to this page.`,
            ar: `${unread.data.unreadCount} إشعاراً غير مقروء في حسابك. تنطبق التصفية أدناه على هذه الصفحة.`,
          })}
        </p>
      )}
      {!inbox.isPending && !inbox.error && (
        <>
          <div className="notification-stream">
            {visible.map((n) => {
              const read = !!n.readAt,
                path = canonicalPath(n.deepLink);
              return (
                <article
                  className="notification-entry"
                  data-read={read}
                  data-motion-state={read ? "settled" : "unread"}
                  data-primary-unread={
                    !read && n.id === firstUnread ? "true" : undefined
                  }
                  key={n.id}
                >
                  <span className="notification-icon">
                    <Bell size={22} />
                  </span>
                  <div className="notification-copy">
                    <span className="notification-date">
                      {new Date(n.createdAt).toLocaleString(
                        locale === "ar" ? "ar-JO" : "en-GB",
                      )}
                      {!read && (
                        <span
                          className="unread-dot"
                          aria-label={label("unread")}
                        />
                      )}
                    </span>
                    <h2>{n.title}</h2>
                    <p>{n.body}</p>
                    <small>
                      {n.category} · {n.channel}
                    </small>
                    <div className="notification-actions">
                      {path && (
                        <Button
                          variant="link"
                          disabled={action.busy}
                          onClick={() =>
                            void action.run(
                              async () => {
                                if (!read)
                                  await api.patch_api_v1_notifications_by_id_read(
                                    { path: { id: n.id } },
                                  );
                              },
                              () => navigate(path),
                              "",
                            )
                          }
                        >
                          {label("notificationAction")}
                          <ArrowUpRight className="directional" size={16} />
                        </Button>
                      )}
                      {!read && (
                        <Button
                          variant="outline"
                          disabled={action.busy}
                          onClick={() =>
                            void action.run(() =>
                              api.patch_api_v1_notifications_by_id_read({
                                path: { id: n.id },
                              }),
                            )
                          }
                        >
                          {label("markRead")}
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
            {!visible.length && (
              <div className="notifications-empty">
                <Bell size={40} />
                <h2>{label("noNotifications")}</h2>
                <p>
                  {t({
                    en: "No notifications match this page's filter.",
                    ar: "لا تطابق إشعارات هذه الصفحة التصفية المحددة.",
                  })}
                </p>
              </div>
            )}
          </div>
          <Pager
            page={page}
            total={inbox.data?.total || 0}
            onChange={setPage}
          />
        </>
      )}
      {action.feedback}
      {settings && (
        <div className="student-connected-grid">
          <NotificationPreferences />
          <FollowedSubjects />
        </div>
      )}
    </div>
  );
}
