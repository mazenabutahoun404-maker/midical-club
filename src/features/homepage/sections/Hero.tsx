import { useId, useRef, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { ArtworkEditor, usePageArtwork } from "../../../components/data-display/HeroArtwork";
import { useLocale } from "../../../app/providers/LocaleProvider";
import { useAppearance } from "../../../app/providers/AppearanceProvider";
import { useOverlays } from "../../../app/providers/OverlayProvider";
import { AppLink } from "../../../components/navigation/AppLink";
import type { SiteContent } from "../../../types/content";
import campus from "../../../assets/home/living-campus-1672.webp";
import campusSmall from "../../../assets/home/living-campus-960.webp";
import campusNight from "../../../assets/home/living-campus-night-1672.webp";
import campusNightSmall from "../../../assets/home/living-campus-night-960.webp";
import { campusDestinations, type CampusDestination } from "../living-campus";
import { useCampusMotion } from "../useCampusMotion";
import "../living-campus.css";

/** Real links share the artwork's coordinates, including the responsive crop. */
export function Hero({ hero, brand }: { hero: SiteContent["hero"]; brand: SiteContent["brand"] }) {
  const { t, dir } = useLocale();
  const { resolvedTheme } = useAppearance();
  const { openSearch } = useOverlays();
  const artwork = usePageArtwork("home");
  const [active, setActive] = useState<CampusDestination | null>(null);
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, "");
  const custom = !!artwork.data;
  const night = resolvedTheme === "dark";
  const imageSource = artwork.data?.dataUrl || (night ? campusNight : campus);
  const failed = failedSource === imageSource;
  const mapped = !custom && !failed;
  useCampusMotion(stage);
  return (
    <section className="campus-hero" aria-labelledby="home-welcome-heading"
      data-direction={dir} data-campus-lighting={night ? "night" : "day"}
      data-custom-artwork={custom || undefined} data-artwork-failed={failed || undefined}>
      <div className="campus-hero-layout">
        <div className="campus-hero-copy" dir={dir}>
          <span className="campus-wordmark" lang="en">{brand.name}</span>
          <h1 id="home-welcome-heading" data-page-heading tabIndex={-1}>
            <span>{t(hero.title).replace(/\n/g, " ")}</span>
            <span className="campus-hero-accent">{t(hero.accent)}</span>
          </h1>
          <p>{t(hero.description)}</p>
          <div className="campus-hero-actions">
            <AppLink href={hero.primary.href} className="campus-primary-action">
              {t(hero.primary.label)}<ArrowRight size={20} className="directional" />
            </AppLink>
            <AppLink href={hero.secondary.href} className="campus-secondary-action">{t(hero.secondary.label)}</AppLink>
          </div>
        </div>
        <div className="campus-scene" ref={stage}>
          <div className="campus-scene-inner">
            <picture className="campus-picture">
              {!custom && <source srcSet={`${night ? campusNightSmall : campusSmall} 960w, ${night ? campusNight : campus} 1672w`} sizes="(max-width: 900px) 145vw, 100vw" />}
              <img key={imageSource} src={imageSource} width={1672} height={941} fetchPriority="high" decoding="async"
                alt={custom ? t(artwork.data!.alt) : ""}
                onLoad={() => setFailedSource(null)} onError={() => setFailedSource(imageSource)} />
            </picture>
            {mapped && (
              <svg className="campus-map" role="group" viewBox="0 0 1672 941" aria-label={t({ en: "Explore the MedClub campus", ar: "استكشف حرم ميدكلب" })}>
                <defs>
                  <linearGradient id={`${id}-light`} x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0" stopColor="var(--campus-path-color)" stopOpacity=".25" />
                    <stop offset="1" stopColor="var(--campus-path-color)" />
                  </linearGradient>
                </defs>
                <g className="campus-routes" aria-hidden="true">
                  {campusDestinations.map(destination => (
                    <path key={destination.id} className="campus-light-route" d={destination.route} pathLength={1}
                      stroke={`url(#${id}-light)`} data-active={active?.id === destination.id || undefined} />
                  ))}
                </g>
                {campusDestinations.map(destination => (
                  <AppLink key={destination.id} href={destination.href} className="campus-building"
                    data-campus-destination={destination.id} data-active={active?.id === destination.id || undefined}
                    aria-label={t(destination.label)} tabIndex={0}
                    onPointerEnter={() => setActive(destination)}
                    onPointerLeave={event => { if (!event.currentTarget.contains(document.activeElement)) setActive(null); }}
                    onFocus={() => setActive(destination)} onBlur={() => setActive(null)}>
                    <polygon className="campus-building-hit" points={destination.polygon} vectorEffect="non-scaling-stroke" />
                    {/* The scene mirrors in Arabic; counter-mirror only the labels so they stay readable. */}
                    <g transform={dir === "rtl" ? `translate(${destination.labelX * 2} 0) scale(-1 1)` : undefined}>
                      <rect className="campus-label-paper" x={destination.labelX - 82} y={destination.labelY - 23}
                        width={164} height={46} rx={4}
                        transform={`rotate(${dir === "rtl" ? -destination.rotation : destination.rotation} ${destination.labelX} ${destination.labelY})`} aria-hidden="true" />
                      <text className="campus-building-label" x={destination.labelX} y={destination.labelY}
                        transform={`rotate(${dir === "rtl" ? -destination.rotation : destination.rotation} ${destination.labelX} ${destination.labelY})`}
                        textAnchor="middle" dominantBaseline="middle" aria-hidden="true" lang={dir === "rtl" ? "ar" : "en"}>
                        {t(destination.label)}
                      </text>
                    </g>
                  </AppLink>
                ))}
              </svg>
            )}
          </div>
        </div>
      </div>
      <div className="campus-hero-footer" dir={dir}>
        <p className="campus-destination-caption">
          <span className="campus-caption-dot" aria-hidden="true" />
          {active && mapped ? <><strong>{t(active.label)}</strong><span>{t(active.description)}</span></> :
            <span>{t({ en: "Choose your next destination.", ar: "اختر وجهتك التالية." })}</span>}
        </p>
        <button type="button" className="campus-search" data-search-trigger onClick={openSearch} aria-label={t(hero.searchTitle)}>
          <Search size={17} /><span>{t(hero.searchTitle)}</span><kbd aria-hidden="true">/</kbd>
        </button>
      </div>
      <nav className="campus-destination-links" aria-label={t({ en: "Campus destinations", ar: "وجهات الحرم" })} dir={dir}>
        {campusDestinations.map(destination => (
          <AppLink key={destination.id} href={destination.href} data-campus-link={destination.id}>
            <span>{t(destination.label)}</span><ArrowRight className="directional" size={15} />
          </AppLink>
        ))}
      </nav>
      <ArtworkEditor section="home" />
    </section>
  );
}
