import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Users,
  Heart,
  Search,
  Sparkles,
} from "lucide-react";
import logo from "../../../assets/brand/medclub-logo.png";
import type { SiteContent } from "../../../types/content";
import { useLocale } from "../../../app/providers/LocaleProvider";
import { useOverlays } from "../../../app/providers/OverlayProvider";
import { ActionLink } from "../../../components/ui/ActionLink";
import { AppLink } from "../../../components/navigation/AppLink";
export function Hero({
  hero,
  brand,
}: {
  hero: SiteContent["hero"];
  brand: SiteContent["brand"];
}) {
  const { t, label } = useLocale();
  const { openSearch } = useOverlays();
  return (
    <section className="hero container">
      <div className="hero-copy">
        <div className="hero-eyebrow">
          <span className="status-dot" />
          {t(hero.eyebrow)}
        </div>
        <h1 className="preserve-lines" data-page-heading tabIndex={-1}>
          {t(hero.title)}
          <span className="hero-accent">
            {t(hero.accent)}
            <Sparkles className="heading-spark" aria-hidden="true" />
          </span>
        </h1>
        <p>{t(hero.description)}</p>
        <div className="hero-actions">
          <ActionLink href={hero.primary.href}>
            {t(hero.primary.label)}
            <ArrowUpRight className="directional" size={18} />
          </ActionLink>
          <AppLink href={hero.secondary.href} className="hero-secondary">
            {t(hero.secondary.label)}
            <ArrowRight className="directional" size={17} />
          </AppLink>
        </div>
        <div className="hero-note">
          <span className="community-marks" aria-hidden="true">
            <span>
              <BookOpen size={16} />
            </span>
            <span>
              <Heart size={16} />
            </span>
            <span>
              <Users size={16} />
            </span>
          </span>
          <span>{t(hero.note)}</span>
        </div>
      </div>
      <div className="hero-artwork">
        <div className="artwork-top">
          <span className="artwork-label">{t(hero.panelLabel)}</span>
          <span className="artwork-star">
            <Sparkles size={21} />
          </span>
        </div>
        <div className="sculpture" aria-hidden="true">
          <div className="sculpture-petal petal-one" />
          <div className="sculpture-petal petal-two" />
          <div className="sculpture-petal petal-three" />
          <div className="sculpture-orbit orbit-one" />
          <div className="sculpture-orbit orbit-two" />
        </div>
        <div className="sculpture-logo">
          <img src={logo} width={263} height={263} alt={t(brand.logoAlt)} />
        </div>
        <span className="artwork-sticker">
          <Heart size={15} />
          {label("heroCommunity")}
        </span>
        <div className="artwork-caption">
          <div>
            <span>{t(hero.panelTitle)}</span>
            <strong>{t(hero.panelAccent)}</strong>
          </div>
          <AppLink
            href={hero.secondary.href}
            aria-label={t(hero.secondary.label)}
          >
            <ArrowUpRight size={27} className="directional" />
          </AppLink>
        </div>
      </div>
      <button className="hero-search" onClick={openSearch}>
        <span className="search-circle">
          <Search size={23} />
        </span>
        <span className="hero-search-copy">
          <strong>{t(hero.searchTitle)}</strong>
          <span>{t(hero.searchHint)}</span>
        </span>
        <span className="search-key">
          <kbd>/</kbd>
          <ArrowRight size={21} className="directional" />
        </span>
      </button>
    </section>
  );
}
