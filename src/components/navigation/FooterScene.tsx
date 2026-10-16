import { useLocation } from "react-router-dom";
import { useAppearance } from "../../app/providers/AppearanceProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { footerBuildingForPath, type FooterBuilding } from "./footer-scene";
import day from "../../assets/home/living-campus-1672.webp";
import night from "../../assets/home/living-campus-night-1672.webp";
import daySmall from "../../assets/home/living-campus-960.webp";
import nightSmall from "../../assets/home/living-campus-night-960.webp";
import "../../styles/campus-footer-v1351.css";
const assets = import.meta.glob<string>(
  "../../assets/campus-scenes-v1351/*.webp",
  { eager: true, query: "?url", import: "default" },
);
export function FooterScene({ building }: { building: FooterBuilding }) {
  const { resolvedTheme } = useAppearance();
  const source = (width: number) =>
    building === "campus"
      ? resolvedTheme === "dark"
        ? width === 768
          ? nightSmall
          : night
        : width === 768
          ? daySmall
          : day
      : assets[
          `../../assets/campus-scenes-v1351/${building}-${resolvedTheme}-${width}.webp`
        ];
  return (
    <figure className="campus-footer-scene" aria-hidden="true">
      <img
        src={source(1536)}
        srcSet={`${source(768)} ${building === "campus" ? 960 : 768}w, ${source(1536)} ${building === "campus" ? 1672 : 1536}w`}
        sizes="(max-width: 767px) 100vw, 1100px"
        width={1536}
        height={1024}
        loading="lazy"
        decoding="async"
        alt=""
      />
    </figure>
  );
}
export function PoweredByOctagram() {
  return (
    <a
      className="octagram-credit"
      href="https://www.instagram.com/octagram.jo/"
      target="_blank"
      rel="noopener noreferrer"
      dir="ltr"
    >
      Powered by <strong>Octagram</strong>
      <span aria-hidden="true">↗</span>
    </a>
  );
}
export function CampusFootnote() {
  const { pathname } = useLocation(),
    { label } = useLocale(),
    building = footerBuildingForPath(pathname);
  return (
    <footer
      className="personal-footnote campus-personal-footer container"
      data-footer-building={building}
    >
      <FooterScene building={building} />
      <div className="campus-personal-footer-copy">
        <p>{label("personalFootnote")}</p>
        <PoweredByOctagram />
      </div>
    </footer>
  );
}
