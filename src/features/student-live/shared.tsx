import { ContentPlaceholder } from "../../components/feedback/ContentPlaceholder";
import { ReadFeedback } from "../../components/feedback/ReadFeedback";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { bindStudentSession } from "../../services/api/student-api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServices } from "../../app/providers/ServicesProvider";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { ApiActionError } from "../../components/feedback/ApiActionError";
import { Button } from "../../components/ui/button";
import { ApiError } from "../../services/api/client";
import { record, string } from "../../services/api/mapping";
import "../../styles/student-connect.css";
import "../../styles/academic-admin.css";

export function useStudentConnection() {
  const services = useServices(),
    { snapshot } = useAuth();
  const session = services.api?.session.get()?.sessionId;
  const studentApi = useMemo(
    () =>
      services.api && services.studentApi
        ? bindStudentSession(services.api, services.studentApi)
        : services.studentApi,
    [services.api, services.studentApi, session],
  );
  return {
    services,
    api: studentApi!,
    owner: snapshot.user?.id,
    authenticated: snapshot.status === "authenticated",
  };
}
export function useStudentQuery<T>(
  name: string,
  load: (signal: AbortSignal) => Promise<T>,
  extra: unknown = "",
  enabled = true,
) {
  const { owner } = useStudentConnection();
  return useQuery({
    queryKey: ["student-live", owner, name, extra],
    queryFn: ({ signal }) => load(signal),
    enabled,
    retry: false,
  });
}
export function useStudentAction() {
  const { services, owner } = useStudentConnection(),
    client = useQueryClient();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null),
    [notice, setNotice] = useState("");
  const writing = useRef(false);
  const { t } = useLocale();
  async function run(
    work: () => Promise<unknown>,
    done?: () => void,
    success = t({ en: "Changes saved", ar: "حُفظت التغييرات" }),
  ) {
    if (writing.current) return false;
    writing.current = true;
    const session = services.api?.session.get()?.sessionId;
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
      await work();
      if (services.api?.session.get()?.sessionId !== session) return false;
      await Promise.all([
        client.invalidateQueries({ queryKey: ["student-live", owner] }),
        client.invalidateQueries({ queryKey: ["workspace", owner] }),
      ]);
      done?.();
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
    setError,
    feedback: (
      <>
        <ApiActionError
          error={error}
          onReload={() =>
            void client.invalidateQueries({ queryKey: ["student-live", owner] })
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

export function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="student-connected-panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
export function Empty({ items }: { items: unknown[] }) {
  return items.length ? null : <ContentPlaceholder compact />;
}

export function Pager({
  page,
  total,
  onChange,
}: {
  page: number;
  total: number;
  onChange: (page: number) => void;
}) {
  const { t } = useLocale();
  if (total <= 0) return null;
  return (
    <div className="student-connected-actions">
      <Button
        variant="outline"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        {t({ en: "Previous", ar: "السابق" })}
      </Button>
      <span>{page}</span>
      <Button
        variant="outline"
        disabled={page * 20 >= total}
        onClick={() => onChange(page + 1)}
      >
        {t({ en: "Next", ar: "التالي" })}
      </Button>
    </div>
  );
}
export function objectJson(value: string) {
  try {
    const v = JSON.parse(value);
    if (!v || typeof v !== "object" || Array.isArray(v)) throw new Error();
    return v as Record<string, unknown>;
  } catch {
    throw new ApiError("Enter a valid JSON object.", 422, "INVALID_JSON");
  }
}
export const rows = (v: unknown): Record<string, unknown>[] =>
  Array.isArray(v) ? v.map(record) : [];
export const title = (v: unknown) =>
  string(record(v).title || record(v).name || record(v).originalFileName);
export { canonicalPath } from "../../services/api/learning-target";
