import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { Popover } from "radix-ui";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useWorkspace } from "../../app/providers/WorkspaceProvider";
import { useOverlays } from "../../app/providers/OverlayProvider";
import { useNotifications } from "../../features/notifications/useNotifications";
import { useResources } from "../../hooks/useContent";
import type { StudentNotification } from "../../types/workspace";
import { AppLink } from "./AppLink";
import { useAuth } from "../../app/providers/AuthProvider";
import { signInPath } from "../../constants/routes";
import {
  noticeNotificationArrival,
  animateNotificationBell,
  type NotificationArrivalState,
} from "./notification-arrival";

function NotificationList({
  items,
  close,
}: {
  items: StudentNotification[];
  close: () => void;
}) {
  const { t, label, locale } = useLocale();
  const { state, send } = useWorkspace();
  const { openDetail } = useOverlays();
  const resources = useResources();
  const navigate = useNavigate();
  const view = (item: StudentNotification) => {
    const resource = resources.data?.find((r) => r.id === item.resourceId);
    if (item.resourceId && !resource && !item.href) {
      toast.error(
        t({
          en: "This material is not available. Try loading it again.",
          ar: "هذه المادة غير متاحة. حاول تحميلها مجددًا.",
        }),
      );
      void resources.refetch();
      return;
    }
    void send({ type: "read-notifications", ids: [item.id], read: true }).catch(
      () =>
        toast.error(
          t({
            en: "Could not update read status",
            ar: "تعذر تحديث حالة القراءة",
          }),
        ),
    );
    close();
    if (resource) openDetail({ kind: "resource", item: resource });
    else if (item.href) navigate(item.href);
  };
  return (
    <div className="notification-preview-list">
      {items.slice(0, 5).map((item) => (
        <button
          type="button"
          key={item.id}
          disabled={!!item.resourceId && resources.isPending}
          aria-busy={(!!item.resourceId && resources.isPending) || undefined}
          data-unread={
            !state.readNotificationIds.includes(item.id) || undefined
          }
          onClick={() => view(item)}
        >
          <span className="notification-preview-dot" aria-hidden="true" />
          <span>
            <strong>{t(item.title)}</strong>
            <span>{t(item.body)}</span>
            <time dateTime={item.createdAt}>
              {new Date(item.createdAt).toLocaleDateString(locale)}
            </time>
          </span>
          <ArrowUpRight size={16} className="directional" aria-hidden="true" />
        </button>
      ))}
      {!items.length && (
        <p className="notification-preview-empty">{label("noNotifications")}</p>
      )}
    </div>
  );
}

function useBellMotion() {
  const bell = useRef<HTMLSpanElement>(null);
  const bellAnimation = useRef<Animation | null>(null);
  const ringBell = useCallback((action: "hover" | "click" | "arrival") => {
    if (
      document.hidden ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    bellAnimation.current?.cancel();
    bellAnimation.current = animateNotificationBell(bell.current, action);
  }, []);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stop = () => {
      if (reduced.matches) bellAnimation.current?.cancel();
    };
    reduced.addEventListener("change", stop);
    return () => {
      reduced.removeEventListener("change", stop);
      bellAnimation.current?.cancel();
    };
  }, []);
  return { bell, ringBell, bellAnimation };
}
function BellIcon() {
  const gradient = `bell-gold-${useId().replace(/:/g, "")}`;
  return (
    <svg
      className="notification-bell-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={`url(#${gradient})`}
      stroke={`url(#${gradient})`}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <linearGradient
          id={gradient}
          x1="5"
          y1="3"
          x2="19"
          y2="19"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#aab1ba" />
          <stop offset=".38" stopColor="#727a85" />
          <stop offset=".7" stopColor="#d3ad3c" />
          <stop offset="1" stopColor="#ffe079" />
        </linearGradient>
      </defs>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
      <path className="notification-bell-clapper" d="M10 21h4" fill="none" />
      <g className="notification-bell-waves" fill="none">
        <path d="M2 5 1 8M22 5l1 3" />
      </g>
    </svg>
  );
}

/** Guest bells never mount account queries. */
export function HeaderNotifications() {
  const { snapshot } = useAuth();
  return snapshot.status === "authenticated" ? (
    <AccountNotifications />
  ) : (
    <GuestNotifications />
  );
}
function GuestNotifications() {
  const { t, label, dir } = useLocale(),
    { key } = useLocation();
  const [open, setOpen] = useState(false);
  const { bell, ringBell } = useBellMotion();
  useEffect(() => setOpen(false), [key]);
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="workspace-icon notification-bell"
          aria-label={label("notifications")}
          onMouseEnter={() => ringBell("hover")}
          onClick={() => ringBell("click")}
          onFocus={(event) => {
            if (event.currentTarget.matches(":focus-visible"))
              ringBell("hover");
          }}
        >
          <span
            ref={bell}
            className="notification-bell-motion"
            aria-hidden="true"
          >
            <BellIcon />
          </span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="notification-preview notification-guest"
          dir={dir}
          side="bottom"
          align="end"
          sideOffset={8}
          collisionPadding={10}
          aria-label={label("notifications")}
        >
          <header>
            <h2>{label("notifications")}</h2>
            <Popover.Close aria-label={label("close")}>
              <X size={18} />
            </Popover.Close>
          </header>
          <p>
            {t({
              en: "Sign in to start receiving course updates, reminders and community notifications.",
              ar: "سجّل الدخول لتصلك مستجدات المساقات والتذكيرات وإشعارات المجتمع.",
            })}
          </p>
          <AppLink
            href={signInPath("/my/notifications")}
            className="notification-preview-all"
            onClick={() => setOpen(false)}
          >
            {label("signIn")}
            <ArrowUpRight size={16} className="directional" />
          </AppLink>
          <Popover.Arrow className="notification-preview-arrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function AccountNotifications() {
  const { label, t, dir } = useLocale();
  const notifications = useNotifications();
  const { snapshot } = useAuth();
  const accountId =
    snapshot.status === "authenticated" ? snapshot.user?.id || null : null;
  const arrival = useRef<NotificationArrivalState | null>(null);
  const { bell, ringBell, bellAnimation } = useBellMotion();
  const notificationKey = JSON.stringify(
    notifications.items.map((item) => item.id),
  );
  const ready = !notifications.isPending && !notifications.isError;
  useEffect(() => {
    const previous = arrival.current;
    const result = noticeNotificationArrival(
      previous,
      accountId,
      JSON.parse(notificationKey) as string[],
      ready,
    );
    arrival.current = result.state;
    if (previous?.accountId !== accountId) {
      bellAnimation.current?.cancel();
    }
    if (result.arrived) ringBell("arrival");
  }, [accountId, notificationKey, ready, ringBell]);
  const [open, setOpen] = useState(false);
  const { key } = useLocation();
  useEffect(() => setOpen(false), [key]);
  const unread =
    !notifications.isPending && !notifications.isError
      ? notifications.unread
      : 0;
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="workspace-icon notification-bell"
          aria-label={label("notifications")}
          onMouseEnter={() => ringBell("hover")}
          onFocus={(event) => {
            if (event.currentTarget.matches(":focus-visible"))
              ringBell("hover");
          }}
          onClick={() => ringBell("click")}
        >
          <span
            ref={bell}
            className="notification-bell-motion"
            aria-hidden="true"
          >
            <BellIcon />
          </span>
          {unread > 0 && (
            <span
              className="notification-badge"
              aria-label={`${unread} ${label("unreadUpdates")}`}
            >
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="notification-preview"
          dir={dir}
          side="bottom"
          align="end"
          sideOffset={8}
          collisionPadding={10}
          aria-label={label("notifications")}
        >
          <header>
            <h2>{label("notifications")}</h2>
            <Popover.Close aria-label={label("close")}>
              <X size={18} />
            </Popover.Close>
          </header>
          {notifications.isPending ? (
            <p role="status">
              {t({ en: "Loading updates…", ar: "جار تحميل المستجدات…" })}
            </p>
          ) : notifications.isError ? (
            <div role="alert">
              <p>
                {t({
                  en: "Updates could not be loaded",
                  ar: "تعذر تحميل المستجدات",
                })}
              </p>
              <button className="button" onClick={notifications.retry}>
                {t({ en: "Try again", ar: "حاول مجددًا" })}
              </button>
            </div>
          ) : (
            <NotificationList
              items={notifications.items}
              close={() => setOpen(false)}
            />
          )}
          <AppLink
            href="/my/notifications"
            className="notification-preview-all"
            onClick={() => setOpen(false)}
          >
            {t({ en: "View all notifications", ar: "عرض جميع الإشعارات" })}
            <ArrowUpRight size={16} className="directional" />
          </AppLink>
          <Popover.Arrow className="notification-preview-arrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
