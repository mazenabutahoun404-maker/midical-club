import { useServices } from "../../app/providers/ServicesProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useOverlays } from "../../app/providers/OverlayProvider";
import { useWorkspacePaths } from "../../hooks/useWorkspacePaths";
import { Modal } from "../../components/ui/Modal";
import { SearchGlyph } from "../../components/navigation/SearchGlyph";
import { SearchPanel } from "./SearchPanel";
import { useLayoutEffect, useState, type CSSProperties } from "react";
import { searchPlacement } from "./search-placement";
export function SearchDialog() {
  const { label, dir, t } = useLocale(),
    live = useServices().contentSnapshot?.kind === "live";
  const paths = useWorkspacePaths();
  const { searchOpen, closeSearch, searchTrigger } = useOverlays();
  const measure = () => {
    const viewport = window.visualViewport;
    const trigger = searchTrigger?.isConnected ? searchTrigger : null;
    const glyph = trigger?.querySelector("svg")?.getBoundingClientRect();
    const rect = glyph?.width ? glyph : trigger?.getBoundingClientRect();
    return searchPlacement(
      rect?.width ? rect : null,
      {
        width: viewport?.width ?? window.innerWidth,
        height: viewport?.height ?? window.innerHeight,
        left: viewport?.offsetLeft,
        top: viewport?.offsetTop,
      },
      dir === "rtl",
    );
  };
  const [placement, setPlacement] = useState(measure);
  useLayoutEffect(() => {
    if (!searchOpen) return;
    const sync = () => setPlacement(measure());
    sync();
    window.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("scroll", sync);
    return () => {
      window.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("scroll", sync);
    };
  }, [searchOpen, searchTrigger, dir]);
  const style = {
    left: placement.left,
    right: "auto",
    top: placement.top,
    bottom: "auto",
    width: placement.width,
    height: placement.height,
    maxHeight: placement.height,
    "--search-bar-left": `${placement.barLeft}px`,
    "--search-bar-top": `${placement.barTop}px`,
    "--search-bar-width": `${placement.barWidth}px`,
    "--search-icon-left": `${placement.iconLeft}px`,
    "--search-icon-top": `${placement.iconTop}px`,
    "--search-results-top": `${placement.resultsTop}px`,
    "--search-results-height": `${placement.resultsHeight}px`,
  } as CSSProperties;
  return (
    <Modal
      open={searchOpen}
      onClose={closeSearch}
      onEscapeKeyDown={closeSearch}
      title={label(paths.personal ? "personalSearch" : "searchLabel")}
      description={
        live
          ? t({
              en: "Search published content and resources available to you.",
              ar: "ابحث في المحتوى المنشور والمصادر المتاحة لك.",
            })
          : label("searchMetadataNote")
      }
      className={`search-modal search-anchored search-tethered ${placement.extendsLeft ? "search-opens-left" : "search-opens-right"} ${placement.above ? "search-results-above" : "search-results-below"}`}
      style={style}
      initialFocus="[data-search-input]"
      hideHeading
      hideClose
    >
      <div
        className="search-transparent-dismiss"
        aria-hidden="true"
        onClick={closeSearch}
      />
      <div className="search-anchor-glyph" aria-hidden="true">
        <SearchGlyph />
      </div>
      <SearchPanel compact anchored />
    </Modal>
  );
}
