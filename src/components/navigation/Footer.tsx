import { useLocation } from "react-router-dom";
import { FooterScene, PoweredByOctagram } from "./FooterScene";
import { footerBuildingForPath } from "./footer-scene";
import { Heart } from "lucide-react";
import type { SiteContent } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Brand } from "./Brand";
import { AppLink } from "./AppLink";
export function Footer({ site }: { site: SiteContent }) {
  const { t, label } = useLocale();
  const { pathname } = useLocation();
  const building = footerBuildingForPath(pathname);
  return (
    <footer
      className="footer campus-scene-footer"
      data-footer-building={building}
    >
      <div className="container campus-footer-content">
        <FooterScene building={building} />
        <div className="footer-top">
          <div className="footer-brand">
            <Brand brand={site.brand} />
            <p>{t(site.footer.description)}</p>
          </div>
          <div>
            <h2>{label("learn")}</h2>
            <div className="footer-links">
              {[...site.navigation.academic, ...site.navigation.tools].map(
                (item) => (
                  <AppLink key={item.id} href={item.href}>
                    {t(item.label)}
                  </AppLink>
                ),
              )}
            </div>
          </div>
          <div>
            <h2>{label("discover")}</h2>
            <div className="footer-links">
              {site.navigation.footer.map((item) => (
                <AppLink key={item.id} href={item.href}>
                  {t(item.label)}
                </AppLink>
              ))}
            </div>
          </div>
          <div>
            <h2>{t(site.hero.panelAccent)}</h2>
            <p className="footer-message preserve-lines">
              {t(site.footer.message)}
            </p>
            <Heart className="footer-heart" size={21} aria-hidden="true" />
          </div>
        </div>
        <div className="footer-bottom">
          <span>{t(site.brand.copyright)}</span>
          <span>{label("footerPreview")}</span>
          <PoweredByOctagram />
        </div>
      </div>
    </footer>
  );
}
