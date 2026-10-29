import { forwardRef, type AnchorHTMLAttributes } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useServices } from "../../app/providers/ServicesProvider";
import { needsSignIn } from "../../lib/access-policy";
import "../../styles/content-states.css";
type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  state?: LinkProps["state"];
};
export const AppLink = forwardRef<HTMLAnchorElement, Props>(function AppLink(
  { href, children, state, ...props },
  ref,
) {
  const auth = useAuth(),
    { t } = useLocale(),
    services = useServices();
  const locked =
    needsSignIn(href, services.contentSnapshot?.kind === "live") &&
    auth.snapshot.status !== "authenticated";
  if (locked) {
    const hint = t({
      en: auth.isPending
        ? "Checking access"
        : auth.snapshot.status === "verification-required"
          ? "Verify your email"
          : "Sign in required",
      ar: auth.isPending
        ? "جارٍ التحقق"
        : auth.snapshot.status === "verification-required"
          ? "يتطلب تأكيد البريد"
          : "يتطلب تسجيل الدخول",
    });
    return (
      <a
        {...props}
        ref={ref}
        className={`${props.className || ""} auth-locked-link`}
        role="link"
        aria-label={
          props["aria-label"] ? props["aria-label"] + " · " + hint : undefined
        }
        aria-disabled="true"
        aria-description={hint}
        aria-busy={auth.isPending || undefined}
        data-auth-locked="true"
        tabIndex={props.tabIndex ?? 0}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
      >
        {children}
        <span className="auth-lock-badge">
          <LockKeyhole size={14} aria-hidden="true" />
          <span>{hint}</span>
        </span>
      </a>
    );
  }
  return (
    <Link ref={ref} to={href} state={state} {...props}>
      {children}
    </Link>
  );
});
