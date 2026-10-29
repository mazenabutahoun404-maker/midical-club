import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { useLocale } from "../providers/LocaleProvider";
import { useServices } from "../providers/ServicesProvider";
import { needsSignIn } from "../../lib/access-policy";
import { signInPath, routes } from "../../constants/routes";
import { BackLink } from "../../components/navigation/BackLink";
import { ContentPlaceholder } from "../../components/feedback/ContentPlaceholder";
export function VisitorBoundary({ children }: { children: ReactNode }) {
  const auth = useAuth(),
    { t } = useLocale(),
    location = useLocation(),
    live = useServices().contentSnapshot?.kind === "live";
  const unverified = auth.snapshot.status === "verification-required";
  if (
    !needsSignIn(location.pathname, live) ||
    auth.snapshot.status === "authenticated"
  )
    return <>{children}</>;
  return (
    <div className="container section">
      <BackLink
        href={location.pathname.startsWith("/learn") ? "/learn" : "/"}
      />
      <ContentPlaceholder
        icon={auth.isPending ? "loading" : "lock"}
        loading={auth.isPending}
        title={t({
          en: auth.isPending
            ? "Checking your access"
            : unverified
              ? "Verify your email to unlock this section"
              : "Sign in to unlock this section",
          ar: auth.isPending
            ? "جارٍ التحقق من الوصول"
            : unverified
              ? "أكّد بريدك لفتح هذا القسم"
              : "سجّل الدخول لفتح هذا القسم",
        })}
        description={t({
          en: "Your courses, saved items and shopping cart are linked to your account.",
          ar: "ترتبط المساقات والعناصر المحفوظة وسلة التسوق بحسابك.",
        })}
        href={
          auth.isPending
            ? undefined
            : unverified
              ? routes.verify +
                "?returnTo=" +
                encodeURIComponent(
                  location.pathname + location.search + location.hash,
                )
              : signInPath(location.pathname + location.search + location.hash)
        }
        actionLabel={t({
          en: unverified ? "Verify email" : "Sign in",
          ar: unverified ? "تأكيد البريد" : "تسجيل الدخول",
        })}
      />
    </div>
  );
}
