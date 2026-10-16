import { useEffect, useRef } from "react";
import { RouteViewport } from "../router/RouteJourney";
import { AppearanceSettings } from "../../components/navigation/AppearanceSettings";
import { Outlet, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "../../assets/brand/medclub-logo.png";
import { useLocale } from "../providers/LocaleProvider";
import { useAuth } from "../providers/AuthProvider";
import { AppLink } from "../../components/navigation/AppLink";
import { HeaderNotes } from "../../components/navigation/HeaderNotes";
import { AuthCampus } from "../../features/auth/AuthCampus";
import {
  AuthJourneyProvider,
  useAuthJourney,
} from "../../features/auth/AuthJourney";
import { campusDestinations } from "../../features/homepage/living-campus";
import "../../features/auth/auth-planet.css";

function AuthPlanet() {
  const { label, t, dir } = useLocale();
  const { pathname } = useLocation();
  const { snapshot } = useAuth();
  const journey = useAuthJourney();
  const root = useRef<HTMLDivElement>(null);
  const starting =
    (pathname === "/auth/register" || pathname === "/auth/verify") &&
    snapshot.status !== "authenticated";
  useEffect(() => {
    if (pathname === "/auth/register" || pathname === "/auth/sign-in")
      journey.setProgress([]);
  }, [pathname, journey.setProgress]);
  useEffect(() => {
    if (
      pathname === "/auth/verify" &&
      snapshot.status === "verification-required"
    )
      { journey.setProgress(campusDestinations.map((destination) => destination.id)); journey.finishRestoration(); }
  }, [pathname, snapshot.status, journey.setProgress, journey.finishRestoration]);
  useEffect(() => {
    const viewport = window.visualViewport;
    const measure = () =>
      root.current?.style.setProperty(
        "--auth-view-height",
        `${Math.round(viewport?.height || window.innerHeight)}px`,
      );
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
      className="auth-shell auth-planet"
      ref={root}
      dir={dir}
      data-auth-world={starting ? "awaiting" : "active"}
    >
      <a className="skip-link" href="#main">
        {label("skip")}
      </a>
      <AuthCampus dormant={starting} />
      <header className="auth-topbar">
        <AppLink
          href="/"
          className="auth-brand"
          aria-label={label("authBackHome")}
        >
          <img src={logo} alt="" width={42} height={42} />
          <span>
            <strong>MedClub</strong>
            <small>{label("authPreview")}</small>
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
        <h1 className="sr-only">
          {t(
            starting
              ? { en: "Bring your world to life", ar: "امنح عالمك حياةً" }
              : {
                  en: "Welcome to your MedClub world",
                  ar: "مرحباً بك في عالم ميدكلب",
                },
          )}
        </h1>
        <div className="auth-panel-frame">
          <RouteViewport>
            <Outlet />
          </RouteViewport>
        </div>
        <div className="auth-main-footnote">
          <p>
            {t(
              starting
                ? journey.progress.length
                  ? {
                      en: "Your space is taking shape.",
                      ar: "مساحتك تنبض بالحياة.",
                    }
                  : {
                      en: "Your first chapter starts here.",
                      ar: "هنا يبدأ فصلك الأول.",
                    }
                : {
                    en: "A global home for medical students.",
                    ar: "بيت عالمي لطلبة الطب.",
                  },
            )}
          </p>
          {starting && (
            <div className="auth-renewal-track" aria-hidden="true">
              <span
                style={{ width: `${(journey.progress.length / 6) * 100}%` }}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
export function AuthLayout() {
  return (
    <AuthJourneyProvider>
      <AuthPlanet />
    </AuthJourneyProvider>
  );
}
