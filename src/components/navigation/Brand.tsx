import logo from "../../assets/brand/medclub-logo.png";
import type { SiteContent } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "./AppLink";
export function Brand({ brand }: { brand: SiteContent["brand"] }) {
  const { t, label } = useLocale();
  return (
    <AppLink
      href="/"
      className="brand"
      aria-label={`${brand.name} · ${label("home")}`}
    >
      <img src={logo} width={49} height={49} alt="" />
      <span>
        <span className="brand-title">{brand.name}</span>
        <span className="brand-caption">{t(brand.caption)}</span>
      </span>
    </AppLink>
  );
}
