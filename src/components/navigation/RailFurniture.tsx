import { UserRound } from "lucide-react";
import { useLocation } from "react-router-dom";
import logo from "../../assets/brand/medclub-logo.png";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useAuth } from "../../app/providers/AuthProvider";
import { signInPath } from "../../constants/routes";
import { AppLink } from "./AppLink";
import { MorphIcon } from "../ui/MorphIcon";
import { NavigationHint } from "./NavigationHint";
import { AppearanceSettings } from "./AppearanceSettings";
import { useRef, type CSSProperties } from "react";
import { useAppearance } from "../../app/providers/AppearanceProvider";
import { useRailBrandDock } from "../../hooks/useRailBrandDock";

function BrandLetters({ text }: { text: string }) {
  // Arabic stays in whole words so the browser preserves its joined glyphs.
  const pieces = /[\u0600-\u06ff]/.test(text)
    ? text.split(/(\s+)/)
    : Array.from(text);
  return (
    <>
      {pieces.map((piece, index) => (
        <span
          className="rail-brand-letter"
          key={index}
          style={
            {
              "--letter-delay": `${Math.min(index, 20) * 9}ms`,
              "--letter-fall": `${18 + (index % 4) * 5}px`,
              "--letter-turn": `${((index % 5) - 2) * 7}deg`,
            } as CSSProperties
          }
        >
          {piece === " " ? "\u00a0" : piece}
        </span>
      ))}
    </>
  );
}

/** Independent of the rail surface, with the original workspace captions. */
export function RailBrand({
  title,
  caption,
}: {
  title: string;
  caption: string;
}) {
  const { label } = useLocale();
  const { navigation } = useAppearance();
  const root = useRef<HTMLAnchorElement>(null);
  useRailBrandDock(root, navigation === "vertical");
  return (
    <AppLink
      href="/"
      className="rail-brand"
      ref={root}
      aria-label={`MedClub · ${label("home")}`}
    >
      <span className="rail-brand-mark">
        <img src={logo} alt="" width={44} height={44} />
      </span>
      <span className="rail-brand-copy" aria-hidden="true">
        <strong dir="auto">
          <BrandLetters text={title} />
        </strong>
        <small dir="auto">
          <BrandLetters text={caption} />
        </small>
      </span>
    </AppLink>
  );
}

/** Pin/hide stay in Appearance; the rail's outer edge controls its width. */
export function RailSettings() {
  return (
    <div className="rail-settings">
      <AppearanceSettings />
    </div>
  );
}

export function RailProfile() {
  const { snapshot } = useAuth(),
    { label } = useLocale(),
    { pathname } = useLocation();
  const signedIn = snapshot.status === "authenticated";
  const title = label(signedIn ? "myProfile" : "signIn");
  return (
    <NavigationHint label={title}>
      <AppLink
        href={signedIn ? "/my" : signInPath("/my")}
        state={{ welcome: true }}
        className={`navigation-item profile-portal space-portal-link rail-profile${pathname === "/my" ? " active" : ""}`}
        aria-label={title}
        aria-current={pathname === "/my" ? "page" : undefined}
      >
        <MorphIcon icon={UserRound} size={20} />
        <span>{title}</span>
      </AppLink>
    </NavigationHint>
  );
}
