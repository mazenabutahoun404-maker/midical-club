import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ArrowLeft, Stethoscope } from "lucide-react";
import { RouteViewport } from "../router/RouteJourney";
import { AppearanceSettings } from "../../components/navigation/AppearanceSettings";
import logo from "../../assets/brand/medclub-logo.png";
import { useLocale } from "../providers/LocaleProvider";
import { useAuth } from "../providers/AuthProvider";
import { AppLink } from "../../components/navigation/AppLink";
import { HeaderNotes } from "../../components/navigation/HeaderNotes";
import {
  AuthJourneyProvider,
  useAuthJourney,
} from "../../features/auth/AuthJourney";
import { AnatomyScene } from "../../features/auth/anatomy/AnatomyScene";
import { authMilestones } from "../../features/auth/auth-progress";
import "../../features/auth/auth-lab.css";

function AuthLab() {
  const { label, t, dir } = useLocale();
  const { pathname } = useLocation();
  const { snapshot } = useAuth();
  const journey = useAuthJourney();
  const root = useRef<HTMLDivElement>(null);
  const registering = pathname === "/auth/register";
  const verifying = pathname === "/auth/verify";
  useEffect(() => {
    journey.stopWelcome();
    journey.setFeedback("idle");
    journey.setFocused(null);
    if (!verifying) journey.setProgress([]);
  }, [
    pathname,
    verifying,
    journey.stopWelcome,
    journey.setFeedback,
    journey.setFocused,
    journey.setProgress,
  ]);
  useEffect(() => {
    if (verifying && snapshot.status === "verification-required") {
      journey.setProgress([...authMilestones]);
      journey.finishRestoration();
    }
  }, [
    verifying,
    snapshot.status,
    journey.setProgress,
    journey.finishRestoration,
  ]);
  useEffect(() => {
    const viewport = window.visualViewport;
    const measure = () => {
      const height = Math.round(viewport?.height || window.innerHeight);
      root.current?.style.setProperty("--auth-view-height", `${height}px`);
      if (root.current) root.current.dataset.compact = String(height < 580);
    };
    measure();
    viewport?.addEventListener("resize", measure);
    window.addEventListener("resize", measure);
    return () => {
      viewport?.removeEventListener("resize", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);
  return (
    <div
      className="auth-shell auth-lab"
      ref={root}
      dir={dir}
      data-auth-mode={
        registering ? "register" : verifying ? "verify" : "signin"
      }
      data-auth-feedback={journey.feedback}
    >
      <a className="skip-link" href="#main">
        {label("skip")}
      </a>
      <header className="auth-topbar">
        <AppLink
          href="/"
          className="auth-brand"
          aria-label={label("authBackHome")}
        >
          <img src={logo} alt="" width={42} height={42} />
          <span>
            <strong>MedClub</strong>
            <small>
              {t({
                en: "The medical student community",
                ar: "مجتمع طلبة الطب",
              })}
            </small>
          </span>
        </AppLink>
        <div className="auth-top-actions">
          <AppLink href="/" className="auth-home-link">
            <ArrowLeft size={16} className="directional" />
            <span>{label("authBackHome")}</span>
          </AppLink>
          <HeaderNotes />
          <AppearanceSettings compact />
        </div>
      </header>
      <main id="main" className="auth-main" tabIndex={-1}>
        <section className="auth-lab-visual" aria-labelledby="auth-lab-title">
          <div className="auth-lab-copy">
            <p className="auth-lab-kicker">
              <Stethoscope size={16} aria-hidden="true" />
              {t({ en: "A LIFE IN MEDICINE", ar: "رحلة في عالم الطب" })}
            </p>
            <h1 id="auth-lab-title">
              {t(
                registering
                  ? {
                      en: "Your journey.\nComing to life.",
                      ar: "رحلتك..\nتنبض بالحياة.",
                    }
                  : {
                      en: "At the heart\nof your journey.",
                      ar: "في قلب\nرحلتك الطبية.",
                    },
              )}
            </h1>
            <p>
              {t(
                registering
                  ? {
                      en: "Build your space, one detail at a time.",
                      ar: "ابنِ مساحتك، خطوة بخطوة.",
                    }
                  : {
                      en: "Learn, connect, and become the doctor you want to be.",
                      ar: "تعلّم وتواصل واصنع مستقبلك في الطب.",
                    },
              )}
            </p>
          </div>
          <AnatomyScene registering={registering} verifying={verifying} />
        </section>
        <div
          className="auth-panel-frame"
          onFocusCapture={(event) => {
            const target = event.target;
            if (
              target instanceof HTMLInputElement ||
              target instanceof HTMLSelectElement
            )
              journey.setFocused(target.id);
          }}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
              journey.setFocused(null);
          }}
        >
          <div className="auth-form-surface">
            <RouteViewport>
              <Outlet />
            </RouteViewport>
          </div>
        </div>
      </main>
      <footer className="auth-lab-footer">
        <span>
          {t({
            en: "Made for medical students. Built around you.",
            ar: "لطلبة الطب. ومن أجل رحلتك.",
          })}
        </span>
        <span className="auth-lab-footer-mark" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </footer>
    </div>
  );
}
export function AuthLayout() {
  return (
    <AuthJourneyProvider>
      <AuthLab />
    </AuthJourneyProvider>
  );
}
