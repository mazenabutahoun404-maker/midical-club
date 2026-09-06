import { Outlet } from "react-router-dom";
import { BookOpenCheck, Fingerprint, ShieldCheck } from "lucide-react";
import logo from "../../assets/brand/medclub-logo.png";
import { useLocale } from "../providers/LocaleProvider";
import { AppLink } from "../../components/navigation/AppLink";
import { LanguageMenu } from "../../components/navigation/LanguageMenu";
import { MedicalFieldCanvas } from "../../features/auth/MedicalFieldCanvas";

export function AuthLayout() {
  const { label } = useLocale();
  return (
    <div className="auth-shell">
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
        <MedicalFieldCanvas />
        <div className="auth-visual-copy">
          <p className="auth-kicker">MEDCLUB IDENTITY FIELD</p>
          <h1>{label("authFieldTitle")}</h1>
          <p>{label("authFieldBody")}</p>
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
