import { ReadFeedback } from "../../components/feedback/ReadFeedback";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServices } from "../../app/providers/ServicesProvider";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { bindScheduleSession } from "../../services/api/schedule-api";
import { ApiError } from "../../services/api/client";
import { ApiActionError } from "../../components/feedback/ApiActionError";
export { Panel, Pager, Empty, rows } from "../student-live/shared";
import { Button } from "../../components/ui/button";
import "../../styles/student-connect.css";
import "../../styles/schedule-connect.css";
export function useScheduleConnection() {
  const services = useServices(),
    { snapshot } = useAuth(),
    session = services.api?.session.get()?.sessionId;
  const api = useMemo(
    () =>
      services.api && services.scheduleApi
        ? bindScheduleSession(services.api, services.scheduleApi)
        : services.scheduleApi,
    [services.api, services.scheduleApi, session],
  );
  return {
    api: api!,
    services,
    owner: snapshot.status === "authenticated" ? snapshot.user?.id : undefined,
  };
}
export function useScheduleQuery<T>(
  name: string,
  load: (signal: AbortSignal) => Promise<T>,
  extra: unknown = "",
  enabled = true,
  interval?: number,
) {
  const { owner } = useScheduleConnection();
  return useQuery({
    queryKey: ["schedule-live", owner, name, extra],
    queryFn: ({ signal }) => load(signal),
    enabled: !!owner && enabled,
    retry: false,
    refetchInterval: interval,
    refetchIntervalInBackground: false,
  });
}
export function useScheduleAction() {
  const { services, owner } = useScheduleConnection(),
    client = useQueryClient(),
    { t } = useLocale();
  const writing = useRef(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null),
    [notice, setNotice] = useState("");
  async function run(
    work: () => Promise<unknown>,
    done?: (result: unknown) => void,
    success = t({ en: "Changes saved", ar: "حُفظت التغييرات" }),
  ) {
    if (writing.current) return false;
    writing.current = true;
    setBusy(true);
    setError(null);
    setNotice("");
    const session = services.api?.session.get()?.sessionId;
    try {
      const fresh = await services.auth.getSnapshot();
      if (
        fresh.user?.id !== owner ||
        services.api?.session.get()?.sessionId !== session
      )
        throw new ApiError(
          "The account changed. Reopen this screen.",
          401,
          "SESSION_CHANGED",
        );
      const result = await work();
      if (services.api?.session.get()?.sessionId !== session) return false;
      await Promise.all([
        client.invalidateQueries({ queryKey: ["schedule-live", owner] }),
        client.invalidateQueries({ queryKey: ["student-live", owner] }),
      ]);
      if (services.api?.session.get()?.sessionId !== session) return false;
      done?.(result);
      setNotice(success);
      return true;
    } catch (e) {
      setError(e);
      return false;
    } finally {
      writing.current = false;
      setBusy(false);
    }
  }
  return {
    run,
    busy,
    error,
    setError,
    feedback: (
      <>
        <ApiActionError
          error={error}
          onReload={() =>
            void client.invalidateQueries({
              queryKey: ["schedule-live", owner],
            })
          }
        />
        <p role="status">{notice}</p>
      </>
    ),
  };
}
export function QueryStatus({
  query,
}: {
  query: { isPending: boolean; error: unknown; refetch: () => unknown };
}) {
  return <ReadFeedback query={query} />;
}

export function Confirm({
  children,
  onConfirm,
  onCancel,
  busy,
}: {
  children: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const { t } = useLocale();
  return (
    <div className="schedule-confirm" role="alert">
      <p>{children}</p>
      <button
        type="button"
        className="button button-primary"
        disabled={busy}
        onClick={onConfirm}
      >
        {t({ en: "Confirm", ar: "تأكيد" })}
      </button>
      <button
        type="button"
        className="quiet-button"
        disabled={busy}
        onClick={onCancel}
      >
        {t({ en: "Cancel", ar: "إلغاء" })}
      </button>
    </div>
  );
}
export function downloadCalendar(text: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/calendar;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "medclub-calendar.ics";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
