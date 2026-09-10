import { Outlet, useLocation } from "react-router-dom";
import { BookOpenCheck, Fingerprint, ShieldCheck } from "lucide-react";
import logo from "../../assets/brand/medclub-logo.png";
import { useLocale } from "../providers/LocaleProvider";
import { AppLink } from "../../components/navigation/AppLink";
import { LanguageMenu } from "../../components/navigation/LanguageMenu";
import { CampusScene } from "../../features/campus/CampusScene";

export function AuthLayout() {
  const { label, locale } = useLocale();
  const { pathname } = useLocation();
  const starting = pathname === "/auth/register" || pathname === "/auth/verify";
  const ar = locale === "ar";
  return (
    <div className="auth-shell auth-campus-shell">
      <a className="skip-link" href="#main">
        {label("skip")}
      </a>
      <header className="auth-topbar">
        <AppLink
          href="/"
          className="auth-brand"
          aria-label={label("authBackHome")}
        >
          <img src={logo} alt="" width={54} height={54} />
          <span>
            <strong>MedClub</strong>
            <small>{label("authPreview")}</small>
          </span>
        </AppLink>
        <div className="auth-top-actions">
          <AppLink href="/" className="auth-home-link">
            {label("authBackHome")}
          </AppLink>
          <LanguageMenu />
        </div>
      </header>
      <aside className="auth-visual" aria-label={label("authFieldTitle")}>
        <CampusScene mode={starting ? "dormant" : "active"} links={false} />
        <div className="auth-visual-copy">
          <p className="auth-kicker">{starting ? (ar ? "بدايتك في ميدكلب" : "YOUR MEDCLUB BEGINNING") : (ar ? "حرم ميدكلب" : "THE MEDCLUB CAMPUS")}</p>
          <h1>{starting ? (ar ? "لك مكان هنا." : "There is a place for you here.") : label("authFieldTitle")}</h1>
          <p>{starting ? (ar ? "حرمك في بدايته. ابدأ بالتعلّم، ثم انضم إلى نشاط أو شارك بمساهمة. كل مشاركة تصنع مجتمعنا." : "Your campus is at its beginning. Start learning, join an activity, or make a contribution. Our community takes shape through participation.") : label("authFieldBody")}</p>
          <ul className="auth-signals">
            <li>
              <Fingerprint />
              <span>{label("authSignalIdentity")}</span>
            </li>
            <li>
              <ShieldCheck />
              <span>{label("authSignalPrivate")}</span>
            </li>
            <li>
              <BookOpenCheck />
              <span>{label("authSignalContinue")}</span>
            </li>
          </ul>
        </div>
      </aside>
      <main id="main" className="auth-main" tabIndex={-1}>
        <div className="auth-panel-frame">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
