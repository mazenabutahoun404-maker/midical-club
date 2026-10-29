import { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServices } from "../../app/providers/ServicesProvider";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { bindEngagementSession } from "../../services/api/engagement-api";
import { ApiError } from "../../services/api/client";
import { ApiActionError } from "../../components/feedback/ApiActionError";
export { Panel, Empty, Pager, rows, objectJson } from "../student-live/shared";
export { QueryStatus, Confirm } from "../schedule/shared";
import "../../styles/engagement.css";
export function useEngagementConnection() {
  const services = useServices(),
    { snapshot } = useAuth(),
    session = services.api?.session.get()?.sessionId;
  const api = useMemo(
    () =>
      services.api && services.engagementApi
        ? bindEngagementSession(services.api, services.engagementApi)
        : services.engagementApi,
    [services.api, services.engagementApi, session],
  );
  return { services, api: api!, owner: snapshot.user?.id, session };
}
export function useEngagementQuery<T>(
  name: string,
  load: (signal: AbortSignal) => Promise<T>,
  extra: unknown = "",
  enabled = true,
  admin = false,
) {
  const { owner, session } = useEngagementConnection();
  return useQuery({
    queryKey: ["engagements", owner, session, name, extra],
    queryFn: ({ signal }) => load(signal),
    enabled: enabled && (!admin || !!owner),
    retry: false,
  });
}
export function useEngagementAction() {
  const { services, owner, session } = useEngagementConnection(),
    client = useQueryClient(),
    { t } = useLocale(),
    lock = useRef(false);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null),
    [notice, setNotice] = useState("");
  async function run<T>(
    work: () => Promise<T>,
    done?: (result: T) => void,
    success = t({ en: "Changes saved", ar: "حُفظت التغييرات" }),
    refresh = true,
  ) {
    if (lock.current) return false;
    lock.current = true;
    setBusy(true);
    setError(null);
    setNotice("");
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
      if (refresh)
        await Promise.all([
          client.invalidateQueries({ queryKey: ["engagements"] }),
          client.invalidateQueries({ queryKey: ["events"] }),
          client.invalidateQueries({ queryKey: ["opportunities"] }),
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
      lock.current = false;
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
              queryKey: ["engagements", owner, session],
            })
          }
        />
        <p role="status">{notice}</p>
      </>
    ),
  };
}
