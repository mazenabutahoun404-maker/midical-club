import { useQuery } from "@tanstack/react-query";
import { useServices } from "../../app/providers/ServicesProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { ApiError } from "../../services/api/client";
import type { HealthResponse } from "../../services/api/health-api";
import type { Text } from "../../types/content";
import { Panel } from "./shared";

const probes = [
  {
    name: "startup",
    title: { en: "Startup", ar: "بدء التشغيل" },
    description: {
      en: "Checks for pending database migrations.",
      ar: "يفحص وجود ترحيلات معلّقة لقاعدة البيانات.",
    },
  },
  {
    name: "live",
    title: { en: "Liveness", ar: "استجابة العملية" },
    description: {
      en: "The API process responds; dependencies are not checked.",
      ar: "تستجيب عملية الواجهة؛ لا يفحص هذا الاختبار الخدمات التابعة.",
    },
  },
  {
    name: "ready",
    title: { en: "Readiness", ar: "الجاهزية" },
    description: {
      en: "Checks configured database and asset readiness.",
      ar: "يفحص جاهزية قاعدة البيانات والأصول المُعدّة على الخادم.",
    },
  },
] as const;

export function ApiHealth() {
  const { healthApi, api } = useServices(),
    { t } = useLocale();
  if (!healthApi || !api) return null;
  return (
    <Panel title={t({ en: "API health checks", ar: "فحوص صحة الواجهة" })}>
      <p>
        {t({
          en: "Each check reports separately. These checks do not verify sign-in, permissions or complete workflows.",
          ar: "تظهر نتيجة كل فحص على حدة. لا تتحقق هذه الفحوص من تسجيل الدخول أو الصلاحيات أو سير العمل الكامل.",
        })}
      </p>
      <div className="operations-health-grid">
        {probes.map((probe) => (
          <Probe
            key={`${api.baseUrl}:${probe.name}`}
            {...probe}
            baseUrl={api.baseUrl}
            load={healthApi[probe.name]}
          />
        ))}
      </div>
    </Panel>
  );
}

function Probe({
  name,
  title,
  description,
  baseUrl,
  load,
}: {
  name: "startup" | "live" | "ready";
  title: Text;
  description: Text;
  baseUrl: string;
  load: (signal?: AbortSignal) => Promise<HealthResponse>;
}) {
  const { t, locale } = useLocale(),
    query = useQuery({
      queryKey: ["system-health", baseUrl, name],
      queryFn: ({ signal }) => load(signal),
      retry: false,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }),
    error = query.error instanceof ApiError ? query.error : null,
    unavailable = error?.status === 503 && name !== "live",
    observedAt = query.isError ? query.errorUpdatedAt : query.dataUpdatedAt;
  return (
    <article className="operations-card operations-health-card">
      <h3>{t(title)}</h3>
      <p>{t(description)}</p>
      <p role="status" aria-live="polite" aria-atomic="true">
        {query.isFetching
          ? t({ en: "Checking…", ar: "جارٍ الفحص…" })
          : query.isError
            ? unavailable
              ? t({ en: "Not ready (503)", ar: "غير جاهز (503)" })
              : t({ en: "Check failed", ar: "فشل الفحص" })
            : query.isSuccess
              ? t({ en: "Check passed", ar: "نجح الفحص" })
              : t({ en: "Not checked", ar: "لم يُفحص" })}
      </p>
      {!query.isFetching && query.isError && (
        <>
          <p>
            {error?.code === "INVALID_RESPONSE"
              ? t({
                  en: "Invalid server response.",
                  ar: "استجابة خادم غير صالحة.",
                })
              : error?.code === "API_TIMEOUT"
                ? t({ en: "The check timed out.", ar: "انتهت مهلة الفحص." })
                : error?.status === 0
                  ? t({
                      en: "The API could not be reached.",
                      ar: "تعذّر الوصول إلى الواجهة.",
                    })
                  : query.error.message}
          </p>
          {error &&
            error.status > 0 &&
            !unavailable &&
            error.code !== "INVALID_RESPONSE" && <p>HTTP {error.status}</p>}
          {error?.correlationId && (
            <p>
              {t({ en: "Reference", ar: "المرجع" })}:{" "}
              <bdi>{error.correlationId}</bdi>
            </p>
          )}
          {error?.retryAfter && (
            <p>
              {t({ en: "Retry-After", ar: "موعد إعادة المحاولة" })}:{" "}
              <bdi>{error.retryAfter}</bdi>
            </p>
          )}
        </>
      )}
      {!query.isFetching && !query.isError && query.data?.status && (
        <p>
          {t({ en: "Server status", ar: "حالة الخادم" })}:{" "}
          <bdi>{query.data.status}</bdi>
        </p>
      )}
      {observedAt > 0 && !query.isFetching && (
        <p>
          {t({ en: "Last checked", ar: "آخر فحص" })}:{" "}
          <time dateTime={new Date(observedAt).toISOString()}>
            {new Date(observedAt).toLocaleString(locale)}
          </time>
        </p>
      )}
      <Button
        variant="outline"
        disabled={query.isFetching}
        onClick={() => void query.refetch()}
      >
        {t({ en: "Check again", ar: "إعادة الفحص" })} — {t(title)}
      </Button>
    </article>
  );
}
