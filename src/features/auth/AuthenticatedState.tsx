import { CheckCircle2, LogOut } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { safeReturnTo } from "../../lib/auth";

export function AuthenticatedState() {
  const auth = useAuth();
  const { label } = useLocale();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const returnTo = safeReturnTo(search.get("returnTo"));
  const user = auth.snapshot.user;
  if (!user) return null;
  return (
    <section className="auth-panel auth-success-panel">
      <span className="auth-success-icon" aria-hidden="true">
        <CheckCircle2 />
      </span>
      <p className="auth-eyebrow">{label("verifiedAccount")}</p>
      <h2>{label("continueToMyMedClub")}</h2>
      <p>
        {label("signedInAs")} <strong>{user.email}</strong>
      </p>
      <div className="auth-action-stack">
        <Button
          type="button"
          className="button button-primary auth-submit"
          onClick={() => navigate(returnTo)}
        >
          {label("continueToMyMedClub")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="auth-quiet-action"
          onClick={() => void auth.signOut()}
        >
          <LogOut />
          {label("signOut")}
        </Button>
      </div>
    </section>
  );
}
