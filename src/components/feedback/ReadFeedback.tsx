import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useLocation } from "react-router-dom";
import {
  ApiError,
  requiresRecentAuthentication,
} from "../../services/api/client";
import { ContentPlaceholder } from "./ContentPlaceholder";
import { ApiActionError } from "./ApiActionError";
import { Button } from "../ui/button";
import { signInPath } from "../../constants/routes";

/** Read states are separate from command errors: a missing publication is not a failed mutation. */
export function ReadFeedback({
  query,
}: {
  query: {
    isPending: boolean;
    error: unknown;
    refetch: () => unknown;
    fetchStatus?: string;
  };
}) {
  const { t } = useLocale(),
    auth = useAuth(),
    location = useLocation();
  if (query.isPending)
    return query.fetchStatus === "idle" ? null : (
      <ContentPlaceholder
        compact
        loading
        icon="loading"
        title={t({ en: "Loading this section", ar: "جارٍ تحميل القسم" })}
        description={t({
          en: "Just a moment while we bring everything together.",
          ar: "لحظات حتى يكتمل تحميل المحتوى.",
        })}
      />
    );
  if (!query.error) return null;
  const status = query.error instanceof ApiError ? query.error.status : 0;
  if (requiresRecentAuthentication(query.error) || status === 409)
    return (
      <ApiActionError
        error={query.error}
        onReload={() => void query.refetch()}
      />
    );
  if (status === 401 || status === 403)
    return (
      <ContentPlaceholder
        compact
        icon="lock"
        title={t({
          en:
            status === 401
              ? "Sign in to continue"
              : "This section is restricted",
          ar: status === 401 ? "سجّل الدخول للمتابعة" : "هذا القسم مقيّد",
        })}
        description={t({
          en: "Only accounts with the required access can open this content.",
          ar: "هذا المحتوى متاح للحسابات التي تملك الصلاحية المناسبة.",
        })}
        href={
          auth.snapshot.status !== "authenticated"
            ? signInPath(location.pathname + location.search)
            : undefined
        }
        actionLabel={t({ en: "Sign in", ar: "تسجيل الدخول" })}
      />
    );
  if (status === 404 || status === 410)
    return (
      <ContentPlaceholder
        compact
        title={t({
          en: "Nothing available here yet",
          ar: "لا يوجد محتوى متاح هنا بعد",
        })}
        description={t({
          en: "There is no available page or publication to show here right now.",
          ar: "لا توجد صفحة أو مواد منشورة متاحة للعرض هنا حالياً.",
        })}
      />
    );
  return (
    <div>
      <ContentPlaceholder
        compact
        error
        icon="cloud"
        title={t({
          en: "We couldn’t load this section",
          ar: "تعذّر تحميل هذا القسم",
        })}
        description={t({
          en:
            status === 429
              ? "Please wait a moment before trying again."
              : "The service may be temporarily unavailable. Your other pages are still available.",
          ar:
            status === 429
              ? "انتظر قليلاً قبل إعادة المحاولة."
              : "قد تكون الخدمة غير متاحة مؤقتاً. يمكنك متابعة تصفّح الأقسام الأخرى.",
        })}
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => void query.refetch()}
      >
        {t({ en: "Try again", ar: "حاول مجدداً" })}
      </Button>
    </div>
  );
}
