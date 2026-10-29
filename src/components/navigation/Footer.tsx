import { useLocation } from "react-router-dom";
import { FooterScene, PoweredByOctagram } from "./FooterScene";
import { footerBuildingForPath } from "./footer-scene";
import { Heart, Sparkles, X } from "lucide-react";
import type { SiteContent } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Brand } from "./Brand";
import { AppLink } from "./AppLink";
import { useServices } from "../../app/providers/ServicesProvider";
import { useAuth } from "../../app/providers/AuthProvider";
import { needsSignIn } from "../../lib/access-policy";
export function Footer({ site }: { site: SiteContent }) {
  const { t, label } = useLocale();
  const preview = useServices().contentSnapshot?.kind !== "live";
  const { snapshot, hasNewlyUnlockedFeatures, dismissNewlyUnlockedFeatures } =
    useAuth();
  const authenticated = snapshot.status === "authenticated";
  const available = (item: { href: string }) =>
    authenticated || !needsSignIn(item.href, !preview);
  const newLink = (href: string) =>
    authenticated && hasNewlyUnlockedFeatures && needsSignIn(href, !preview);
  const { pathname } = useLocation();
  const building = footerBuildingForPath(pathname);
  return (
    <footer
      id="site-footer"
      className="footer campus-scene-footer"
      data-footer-building={building}
    >
      <div className="container campus-footer-content">
        <FooterScene building={building} />
        {authenticated && hasNewlyUnlockedFeatures && (
          <div className="footer-access-discovery" role="status">
            <Sparkles size={22} aria-hidden="true" />
            <div>
              <strong>
                {t({
                  en: "More to explore, now you’re signed in",
                  ar: "مسارات جديدة للاستكشاف بعد تسجيل الدخول",
                })}
              </strong>
              <p>
                {t({
                  en: "Your account links are now available below. Look for “Now available” to find them.",
                  ar: "أصبحت روابط حسابك متاحة أدناه. ابحث عن علامة «متاح الآن» لاكتشافها.",
                })}
              </p>
            </div>
            <button
              type="button"
              className="quiet-button"
              onClick={dismissNewlyUnlockedFeatures}
              aria-label={t({
                en: "Dismiss account feature highlights",
                ar: "إخفاء تمييز روابط الحساب",
              })}
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="footer-top">
          <div className="footer-brand">
            <Brand brand={site.brand} />
            <p>{t(site.footer.description)}</p>
          </div>
          <div>
            <h2>{label("learn")}</h2>
            <div className="footer-links">
              {[...site.navigation.academic, ...site.navigation.tools]
                .filter(available)
                .map((item) => (
                  <AppLink
                    key={item.id}
                    href={item.href}
                    className={
                      newLink(item.href) ? "footer-link-unlocked" : undefined
                    }
                  >
                    {t(item.label)}
                    {newLink(item.href) && (
                      <span className="footer-access-badge">
                        {t({ en: "Now available", ar: "متاح الآن" })}
                      </span>
                    )}
                  </AppLink>
                ))}
            </div>
          </div>
          <div>
            <h2>{label("discover")}</h2>
            <div className="footer-links">
              {site.navigation.footer.filter(available).map((item) => (
                <AppLink
                  key={item.id}
                  href={item.href}
                  className={
                    newLink(item.href) ? "footer-link-unlocked" : undefined
                  }
                >
                  {t(item.label)}
                  {newLink(item.href) && (
                    <span className="footer-access-badge">
                      {t({ en: "Now available", ar: "متاح الآن" })}
                    </span>
                  )}
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
          {preview && <span>{label("footerPreview")}</span>}
          <PoweredByOctagram />
        </div>
      </div>
    </footer>
  );
}
