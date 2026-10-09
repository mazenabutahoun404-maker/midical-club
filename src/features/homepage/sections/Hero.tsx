import { ArtworkEditor, usePageArtwork } from "../../../components/data-display/HeroArtwork";
import { useEffect, useRef } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Search } from "lucide-react";
import type { SiteContent } from "../../../types/content";
import { useLocale } from "../../../app/providers/LocaleProvider";
import { useOverlays } from "../../../app/providers/OverlayProvider";
import { ActionLink } from "../../../components/ui/ActionLink";
import { AppLink } from "../../../components/navigation/AppLink";
import campus from "../../../assets/home/home-campus-1448.webp";
import campusSmall from "../../../assets/home/home-campus-768.webp";
import "../sky-home.css";

/** The scroll effect only updates two decorative layers, once per scroll frame. */
export function Hero({
  hero,
}: {
  hero: SiteContent["hero"];
  brand: SiteContent["brand"];
}) {
  const { t } = useLocale();
  const artwork = usePageArtwork("home");
  const { openSearch } = useOverlays();
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = true;
    const update = () => {
      frame = 0;
      if (!visible || document.hidden) return;
      const rect = node.getBoundingClientRect();
      const distance = reduced.matches
        ? 0
        : Math.min(rect.height, Math.max(0, -rect.top));
      node.style.setProperty("--cloud-rise", `${distance * 0.65}px`);
      node.style.setProperty("--cloud-near-rise", `${distance * 0.92}px`);
      node.style.setProperty(
        "--cloud-opacity",
        String(reduced.matches ? 0 : Math.min(0.9, distance / 380)),
      );
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible) queue();
          });
    observer?.observe(node);
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    document.addEventListener("visibilitychange", queue);
    reduced.addEventListener?.("change", queue);
    queue();
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      document.removeEventListener("visibilitychange", queue);
      reduced.removeEventListener?.("change", queue);
    };
  }, []);
  return (
    <section
      ref={root}
      className="sky-home"
      aria-labelledby="home-welcome-heading"
    >
      <picture className="sky-home-art">
        {!artwork.data && <source
          srcSet={`${campusSmall} 768w, ${campus} 1448w`}
          sizes="(max-width: 767px) 100vw, (max-width: 1100px) 90vw, 85vw"
        />}
        <img
          src={artwork.data?.dataUrl || campus}
          width={1448}
          height={1086}
          fetchPriority="high"
          decoding="async"
          alt={t(artwork.data?.alt || {
            en: "A medical student campus around a blue planet, with Learning, Media, Community, Mentorship, Contribution and Journals buildings.",
            ar: "حرم لطلبة الطب حول كوكب أزرق، يضم مباني التعلّم والإعلام والمجتمع والإرشاد والمساهمات والمجلات.",
          })}
        />
      </picture>
      <ArtworkEditor section="home" />
      <div className="sky-home-copy">
        <span className="sky-home-eyebrow">{t(hero.eyebrow)}</span>
        <h1 id="home-welcome-heading" data-page-heading tabIndex={-1}>
          {t(hero.title).replace(/\n/g, " ")}
          <span>{t(hero.accent)}</span>
        </h1>
        <p>{t(hero.description)}</p>
        <div className="sky-home-actions">
          <ActionLink href={hero.primary.href}>
            {t(hero.primary.label)}
            <ArrowUpRight className="directional" size={18} />
          </ActionLink>
          <AppLink href={hero.secondary.href} className="sky-home-secondary">
            {t(hero.secondary.label)}
            <ArrowRight className="directional" size={17} />
          </AppLink>
        </div>
        <button
          type="button"
          className="sky-home-search"
          data-search-trigger
          onClick={openSearch}
        >
          <Search size={18} />
          <span>{t(hero.searchTitle)}</span>
          <kbd>/</kbd>
        </button>
        <span className="sky-home-descent" aria-hidden="true">
          <ArrowDown size={16} />
          {t({ en: "Explore your campus", ar: "اكتشف حرمك" })}
        </span>
      </div>
      <div className="sky-home-clouds" aria-hidden="true">
        <svg
          className="sky-cloud sky-cloud-far"
          viewBox="0 0 1440 260"
          preserveAspectRatio="none"
        >
          <path d="M0 180C80 100 150 160 220 105C285 35 370 80 410 125C500 30 585 65 645 115C735 40 800 90 855 120C945 55 1020 55 1080 120C1170 40 1280 90 1320 140C1370 115 1410 135 1440 165V260H0Z" />
        </svg>
        <svg
          className="sky-cloud sky-cloud-near"
          viewBox="0 0 1440 260"
          preserveAspectRatio="none"
        >
          <path d="M0 195C80 120 190 155 260 110C350 45 425 115 480 145C590 55 685 90 750 155C860 90 970 100 1045 155C1150 75 1240 125 1300 160C1370 120 1420 150 1440 180V260H0Z" />
        </svg>
      </div>
    </section>
  );
}
