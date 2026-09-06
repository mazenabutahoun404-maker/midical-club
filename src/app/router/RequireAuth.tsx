import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { routes, signInPath } from "../../constants/routes";
import { useLocale } from "../providers/LocaleProvider";

export function RequireAuth() {
  const auth = useAuth();
  const location = useLocation();
  const { label } = useLocale();
  const returnTo = `${location.pathname}${location.search}${location.hash}`;

  if (auth.isPending)
    return (
      <div className="auth-gate" role="status" aria-live="polite">
        <span className="auth-gate-pulse" aria-hidden="true" />
        {label("authLoading")}
      </div>
    );
  if (auth.snapshot.status === "verification-required")
    return (
      <Navigate
        replace
        to={`${routes.verify}?returnTo=${encodeURIComponent(returnTo)}`}
      />
    );
  if (auth.snapshot.status !== "authenticated")
    return <Navigate replace to={signInPath(returnTo)} />;
  return <Outlet />;
}
