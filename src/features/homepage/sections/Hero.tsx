import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Users,
  Heart,
  Search,
  Sparkles,
} from "lucide-react";
import { CampusScene } from "../../campus/CampusScene";
import type { SiteContent } from "../../../types/content";
import { useLocale } from "../../../app/providers/LocaleProvider";
import { useOverlays } from "../../../app/providers/OverlayProvider";
import { ActionLink } from "../../../components/ui/ActionLink";
import { AppLink } from "../../../components/navigation/AppLink";
export function Hero({
  hero,
}: {
  hero: SiteContent["hero"];
  brand: SiteContent["brand"];
}) {
  const { t } = useLocale();
  const { openSearch } = useOverlays();
  return (
    <section className="campus-home container">
      <CampusScene mode="active" />
      <div className="campus-home-copy">
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
      <button className="hero-search" data-search-trigger onClick={openSearch}>
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
