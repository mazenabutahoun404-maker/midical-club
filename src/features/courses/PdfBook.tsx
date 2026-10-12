import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  Bookmark,
  BookOpen,
  MessageSquareText,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
  ZoomIn,
  ZoomOut,
  SunMoon,
} from "lucide-react";
import { getAppearancePalette } from "../../app/providers/appearance-palettes";
import { appearancePreviewColors } from "../../app/providers/appearance-preview-colors";
import { useAppearance } from "../../app/providers/AppearanceProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import type { Resource } from "../../types/content";
import type {
  PDFDocumentLoadingTask,
  PdfRasterPool as RasterPool,
  PageRaster,
} from "./pdf-engine";
import { pdfViewGeometry } from "./pdf-view-geometry";
import { yieldPdfTask } from "./pdf-text-stream";
import { nextSpread, spreadStart, type TurnDirection } from "./page-turn";
import { TurnLeaf, usePageTurn } from "./usePageTurn";
import { pdfPanLimit, pdfPanOffset } from "./pdf-pan";
import type { usePdfMargins } from "../study-hub/PdfMarginNotes";
import type { MarginNote, PageAnchor } from "../../types/study-hub";
import { useStudyTools } from "./StudyTools";
import { PdfToolButton } from "./PdfToolButton";
import { toast } from "sonner";
import "../../styles/course-reading-v1334.css";
import "../../vendor/pdfjs/text-layer.css";
import "./pdf-reader-base.css";
import "./pdf-controls.css";
import "../../styles/reader-layout-v1337.css";

const emptyMargins = {
  owner: null, open: false, placing: false, panel: null, notes: [] as MarginNote[],
  add: (_anchor: PageAnchor, _pageCount?: number) => {},
  place: (_anchor: PageAnchor) => {}, toggle: () => {},
};

const PdfPage = memo(function PdfPage({
  pool,
  number,
  width,
  rasterWidth,
  selectable = true,
  allowText = true,
  query = "",
  onActivate,
  paperColors,
  margins = [],
  placing = false,
  onPlace,
}: {
  pool: RasterPool;
  number: number | null;
  width: number;
  rasterWidth: number;
  selectable?: boolean;
  allowText?: boolean;
  query?: string;
  onActivate?: (page: number) => void;
  paperColors?: { paper: string; ink: string };
  margins?: MarginNote[];
  placing?: boolean;
  onPlace?: (page: number, x: number, y: number, quote?: string) => void;
}) {
  const { t } = useLocale();
  const [stickerId, setStickerId] = useState<string | null>(null);
  const stickerTrigger = useRef<HTMLButtonElement | null>(null);
  const sticker = margins.find((note) => note.id === stickerId && note.anchor.page === number);
  const canvas = useRef<HTMLCanvasElement>(null),
    text = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    number ? "loading" : "ready",
  );
  const [ratio, setRatio] = useState(1 / 1.414);
  const queryRef = useRef(query);
  queryRef.current = query;
  function highlight() {
    const value = queryRef.current.toLocaleLowerCase();
    text.current
      ?.querySelectorAll<HTMLSpanElement>(value ? "span" : "[data-search-match]")
      .forEach((span) =>
        span.toggleAttribute(
          "data-search-match",
          !!value && !!span.textContent?.toLocaleLowerCase().includes(value),
        ),
      );
  }
  useEffect(() => {
    highlight();
  }, [query]);
  useLayoutEffect(() => {
    if (!number) return;
    let cancelled = false;
    const paint = (raster: PageRaster) => {
        if (cancelled || !canvas.current) return;
        const target = canvas.current,
          context = target.getContext("2d");
        if (!context || !raster.canvas.width)
          throw new Error("Page raster is unavailable");
        target.width = raster.canvas.width;
        target.height = raster.canvas.height;
        context.drawImage(raster.canvas, 0, 0);
        setRatio(raster.viewport.width / raster.viewport.height);
        if (!cancelled) setStatus("ready");
    };
    const ready = pool.peekDisplay(number, rasterWidth, paperColors);
    if (ready) paint(ready);
    else {
      setStatus("loading");
      void pool.getDisplay(number, rasterWidth, paperColors).then(paint)
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    }
    return () => { cancelled = true; };
  }, [pool, number, rasterWidth, paperColors?.paper, paperColors?.ink]);
  useEffect(() => {
    if (!number || !selectable || !allowText || !text.current) return;
    let cancelled = false;
    void pool.getTextLayer(number, rasterWidth).then((layer) => {
      if (!cancelled && text.current) { text.current.replaceChildren(layer); highlight(); }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [pool, number, rasterWidth, selectable, allowText]);
  return (
    <div
      className="pdf-paper-page"
      style={{ width, aspectRatio: ratio } as CSSProperties}
      data-page-number={number || undefined}
      data-page-status={status}
      data-placing-note={placing || undefined}
      onPointerUp={(event) => {
        if (
          !placing ||
          !number ||
          !onPlace ||
          (event.target as HTMLElement).closest("button")
        )
          return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const selection = window.getSelection();
        const quote =
          selection &&
          text.current?.contains(selection.anchorNode) &&
          text.current?.contains(selection.focusNode)
            ? selection.toString().slice(0, 1000)
            : undefined;
        onPlace(
          number,
          Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
          Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
          quote,
        );
      }}
      role={selectable ? "region" : undefined}
      aria-label={
        number ? t({ en: "PDF page ", ar: "صفحة PDF " }) + number : undefined
      }
      onPointerDown={
        number && onActivate ? () => onActivate(number) : undefined
      }
    >
      {number && (
        <>
          <canvas ref={canvas} aria-hidden="true" />
          {selectable && <div ref={text} className="pdf-text-stage" style={{ width: rasterWidth, height: rasterWidth / ratio, transform: `scale(${width / rasterWidth})` }} />}
        </>
      )}
      {selectable &&
        margins
          .filter((n) => n.anchor.page === number)
          .map((n) => (
            <button
              type="button"
              key={n.id}
              className="pdf-margin-pin"
              data-note-color={n.color}
              style={{
                left: `clamp(54px, ${n.anchor.x * 100}%, calc(100% - 54px))`,
                top: `${Math.min(0.92, Math.max(0.03, n.anchor.y)) * 100}%`,
              }}
              aria-label={
                t({
                  en: "Open margin note on page ",
                  ar: "افتح ملاحظة الهامش في صفحة ",
                }) + number
              }
              onPointerDown={(e) => e.stopPropagation()}
              aria-expanded={stickerId === n.id}
              title={t({ en: "Show note", ar: "عرض الملاحظة" })}
              onClick={(event) => { if (number) onActivate?.(number); stickerTrigger.current = event.currentTarget; setStickerId((id) => id === n.id ? null : n.id); }}
            >
              <MessageSquareText size={14} />
            </button>
          ))}
      {selectable && sticker && <aside className="pdf-note-sticker" data-note-color={sticker.color}
        style={{ left: `clamp(12px, calc(${sticker.anchor.x * 100}% - 120px), calc(100% - min(240px, 100% - 24px) - 12px))`, top: `clamp(12px, ${sticker.anchor.y * 100}%, calc(100% - 220px))` }}
        aria-label={t({ en: "Page note", ar: "ملاحظة الصفحة" })}
        onPointerDown={(event) => event.stopPropagation()} onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); setStickerId(null); stickerTrigger.current?.focus(); } }}>
        <header><strong>{t({ en: "Note", ar: "ملاحظة" })}</strong><button autoFocus type="button" aria-label={t({ en: "Close note", ar: "إغلاق الملاحظة" })} onClick={() => { setStickerId(null); stickerTrigger.current?.focus({ preventScroll: true }); }}><X size={15} /></button></header>
        {sticker.anchor.quote && <blockquote>{sticker.anchor.quote}</blockquote>}<p>{sticker.body}</p>
      </aside>}
      {status === "loading" && (
        <span className="pdf-page-loading">
          {t({ en: "Loading page…", ar: "جارٍ تحميل الصفحة…" })}
        </span>
      )}
      {status === "error" && (
        <span className="pdf-page-loading" role="status">
          {t({
            en: "This page could not be rendered. Open the original file.",
            ar: "تعذّر عرض هذه الصفحة. افتح الملف الأصلي.",
          })}
        </span>
      )}
    </div>
  );
});

interface SearchMatch {
  page: number;
  snippet: string;
}
export function PdfBook({
  item,
  url,
  initialPage,
  initialScroll = 0,
  onScroll,
  onPage,
  onCount,
  companion = false,
  onClose,
  marginNotes,
  onShowSections,
}: {
  marginNotes?: ReturnType<typeof usePdfMargins>;
  onShowSections?: () => void;
  item: Resource;
  url: string;
  initialPage: number;
  initialScroll?: number;
  onScroll?: (scroll: number) => void;
  onPage: (page: number) => void;
  companion?: boolean;
  onClose?: () => void;
  onCount?: (count: number) => void;
}) {
  const { t, dir } = useLocale(),
    tools = useStudyTools();
  const { resolvedTheme, colorMode, palette } = useAppearance();
  const [paperOverride, setPaperOverride] = useState<boolean | null>(null);
  const themedPaper = paperOverride ?? true;
  // Site appearance changes always return the document to its automatic tone.
  // The reader can then independently choose Original colors again.
  useLayoutEffect(
    () => setPaperOverride(null),
    [resolvedTheme, colorMode, palette],
  );
  const paletteDefinition = getAppearancePalette(palette);
  const paperColors = useMemo(
    () =>
      themedPaper
        ? resolvedTheme === "dark"
          ? {
              paper: paletteDefinition.darkPaper,
              ink: paletteDefinition.darkInk,
            }
          : {
              paper: appearancePreviewColors[`${palette}-light`].card,
              ink: appearancePreviewColors[`${palette}-light`].foreground,
            }
        : undefined,
    [themedPaper, resolvedTheme, palette, paletteDefinition],
  );
  const root = useRef<HTMLDivElement>(null),
    position = useRef(onPage);
  const viewportRef = useRef<HTMLDivElement>(null);
  const restoredScroll = useRef(false);
  const [pan, setPan] = useState(0),
    [panLimit, setPanLimit] = useState(0);
  position.current = onPage;
  const documentCount = useRef(onCount);
  documentCount.current = onCount;
  const [pool, setPool] = useState<RasterPool | null>(null),
    [error, setError] = useState(false),
    [retry, setRetry] = useState(0);
  const [width, setWidth] = useState(Math.max(280, window.innerWidth - 80)),
    [zoom, setZoom] = useState(1);
  const [readingWidth, setReadingWidth] = useState(Math.max(1, width - (width < 520 ? 0 : 104)));

  const [page, setPage] = useState(Math.max(1, initialPage)),
    [pageDraft, setPageDraft] = useState(String(Math.max(1, initialPage)));
  const [password, setPassword] = useState<{
      update: (value: string) => void;
      incorrect: boolean;
    } | null>(null),
    [passwordText, setPasswordText] = useState("");
  const [query, setQuery] = useState(""),
    [searched, setSearched] = useState(""),
    [matches, setMatches] = useState<SearchMatch[]>([]),
    [searching, setSearching] = useState(false),
    [searchError, setSearchError] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchToken = useRef(0),
    searchInput = useRef<HTMLInputElement>(null);
  const margins = marginNotes || emptyMargins;
  const placeMargin = useCallback((number: number, x: number, y: number, quote?: string) =>
    margins.place({
      resourceId: item.id,
      resourceRevision: item.updatedAt,
      page: number,
      x,
      y,
      quote,
    }), [margins.place, item.id, item.updatedAt]);
  const marginProps = {
    margins: margins.notes,
    placing: margins.placing,
    onPlace: placeMargin,
  };
  const count = pool?.document.numPages || 1;
  const twoPages = !companion && readingWidth >= 860;
  const compactControls = width < 760;
  const [optionsOpen, setOptionsOpen] = useState(false);
  const options = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (!optionsOpen || !compactControls) return;
    const dismiss = (event: PointerEvent) => {
      if (!options.current?.contains(event.target as Node))
        setOptionsOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [optionsOpen, compactControls]);
  const first = spreadStart(Math.min(page, count), twoPages);
  const { paperWidth, rasterWidth, spreadWidth } = pdfViewGeometry(readingWidth, twoPages, zoom);
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const measure = (viewportWidth: number) => {
      if (viewportWidth > 0) setReadingWidth(viewportWidth);
      const limit = pdfPanLimit(spreadWidth, viewportWidth);
      setPanLimit(limit);
      const offset = pdfPanOffset(viewport.scrollLeft, limit);
      if (viewport.scrollLeft !== offset) viewport.scrollLeft = offset;
      setPan(offset);
    };
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver((entries) => measure(entries[0].contentRect.width));
    observer?.observe(viewport);
    // ResizeObserver supplies layout without a synchronous post-render width read.
    let frame = 0;
    if (!observer) frame = requestAnimationFrame(() => measure(viewport.clientWidth));
    return () => { observer?.disconnect(); cancelAnimationFrame(frame); };
  }, [spreadWidth, !!pool]);
  const canTurn = (direction: TurnDirection) =>
    !!pool && nextSpread(first, count, twoPages, direction) !== null;
  const turner = usePageTurn({
    rtl: dir === "rtl",
    canTurn,
    identity: url + ":" + first + ":" + paperWidth + ":" + twoPages,
    onCommit: (direction) => {
      const next = nextSpread(first, count, twoPages, direction);
      if (next !== null) {
        setPage(next);
        if (viewportRef.current) viewportRef.current.scrollTop = 0;
      }
    },
  });
  const turn = turner.turn;
  const turnPreparation = useRef(0);
  const preparing = useRef(false);
  const [preparingTurn, setPreparingTurn] = useState(false);
  useEffect(() => {
    turnPreparation.current++;
    preparing.current = false;
    setPreparingTurn(false);
    return () => { turnPreparation.current++; preparing.current = false; };
  }, [pool, first, rasterWidth, paperColors?.paper, paperColors?.ink, twoPages]);
  function requestTurn(direction: TurnDirection) {
    if (!pool || turn || preparing.current) return;
    const target = nextSpread(first, count, twoPages, direction);
    if (target === null) return;
    const token = ++turnPreparation.current;
    preparing.current = true;
    setPreparingTurn(true);
    const pages = twoPages && target + 1 <= count ? [target, target + 1] : [target];
    // Keep the current spread on screen until all destination pixels are ready.
    void Promise.all(pages.map((number) => pool.getDisplay(number, rasterWidth, paperColors))).then(() => {
      if (token !== turnPreparation.current) return;
      preparing.current = false;
      setPreparingTurn(false);
      turner.request(direction);
    }).catch(() => {
      if (token !== turnPreparation.current) return;
      preparing.current = false;
      setPreparingTurn(false);
      toast.error(t({ en: "Could not prepare this page. Try again.", ar: "تعذّر تجهيز الصفحة. حاول مجدداً." }));
    });
  }
  const handledNoteJump = useRef<number | null>(null);
  useEffect(() => {
    const request = tools?.noteJump;
    if (turn || !pool || !request || handledNoteJump.current === request.token || request.anchor.resourceId !== item.id || request.anchor.resourceRevision !== item.updatedAt) return;
    handledNoteJump.current = request.token;
    if (request.anchor.page > count) { toast.error(t({ en: "This PDF does not have the note's page. The note is still saved.", ar: "لا يحتوي PDF على صفحة الملاحظة. الملاحظة ما زالت محفوظة." })); return; }
    jump(request.anchor.page);
    requestAnimationFrame(() => viewportRef.current?.focus({ preventScroll: true }));
  }, [tools?.noteJump?.token, pool, !!turn]);

  const next = turn ? nextSpread(first, count, twoPages, turn.direction) : null;
  const turningInside = !!turn && next !== null;
  const frontPage =
    turn?.direction === 1 && twoPages
      ? first + 1 <= count
        ? first + 1
        : null
      : first;
  const backPage =
    next === null
      ? null
      : turn?.direction === -1 && twoPages
        ? next + 1 <= count
          ? next + 1
          : null
        : next;
  let left = first,
    right: number | null = first + 1 <= count ? first + 1 : null;
  if (turningInside) {
    if (turn!.direction === 1) {
      left = turn!.progress >= 0.5 ? next! : first;
      right = next! + 1 <= count ? next! + 1 : null;
    } else {
      left = next!;
      right =
        turn!.progress >= 0.5 ? (next! + 1 <= count ? next! + 1 : null) : right;
    }
  }
  useEffect(() => {
    if (!pool || restoredScroll.current) return;
    const frame = requestAnimationFrame(() => {
      if (viewportRef.current) viewportRef.current.scrollTop = initialScroll;
      restoredScroll.current = true;
    });
    return () => cancelAnimationFrame(frame);
  }, [pool, paperWidth, initialScroll]);
  const activate = useCallback((number: number) => setPage(number), []);
  useEffect(() => {
    let active = true;
    const abort = new AbortController();
    let task: PDFDocumentLoadingTask | undefined,
      rasters: RasterPool | undefined;
    setError(false);
    setPool(null);
    setPassword(null);
    void import("./pdf-engine")
      .then(async (engine) => {
        if (!active) return;
        const opened = await engine.openPdf(url, (update, incorrect) => {
          if (active) setPassword({ update, incorrect });
        }, abort.signal);
        task = opened.task;
        if (!active) {
          await task.destroy();
          return;
        }
        const document = await task.promise;
        if (!active) {
          await task.destroy();
          return;
        }
        rasters = new engine.PdfRasterPool(document, opened.api);
        documentCount.current?.(document.numPages);
        setPassword(null);
        setPool(rasters);
        setPage((previous) =>
          Math.min(document.numPages, Math.max(1, previous)),
        );
      })
      .catch(() => {
        if (active) {
          setError(true);
          setPassword(null);
        }
      });
    return () => {
      active = false;
      abort.abort();
      searchToken.current++;
      rasters?.dispose();
      void task?.destroy().catch(() => {});
    };
  }, [url, retry]);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const measure = (nextWidth: number) => {
      if (nextWidth <= 0) return;
      setWidth(nextWidth);
      // Match the reserved 44px rails and 8px gaps until the viewport is mounted.
      if (!viewportRef.current)
        setReadingWidth(Math.max(1, nextWidth - (nextWidth < 520 ? 0 : 104)));
    };
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver((entries) => measure(entries[0].contentRect.width));
    observer?.observe(element);
    let frame = 0;
    const fallback = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => measure(element.clientWidth));
    };
    if (!observer) { window.addEventListener("resize", fallback); fallback(); }
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", fallback);
      cancelAnimationFrame(frame);
    };
  }, [!!pool]);
  useEffect(() => {
    if (pool) {
      position.current(page);
      setPageDraft(String(page));
    }
  }, [page, pool]);
  useEffect(() => {
    if (!companion && pool)
      tools?.setReader({ id: item.id, title: t(item.title), page, resource: item, pageCount: pool.document.numPages });
  }, [page, pool, companion, item.id, item.title, t, tools?.setReader]);
  useEffect(() => {
    if (!pool) return;
    const nearby = twoPages
      ? [first, first + 1, first + 2, first + 3, first - 2, first - 1]
      : [first, first + 1, first - 1];
    for (const number of nearby.filter((value) => value >= 1 && value <= count))
      void pool.getDisplay(number, rasterWidth, paperColors, true).catch(() => {});
  }, [pool, first, twoPages, rasterWidth, count, paperColors?.paper, paperColors?.ink]);
  function jump(number: number) {
    if (!pool || turn) return;
    setPage(Math.max(1, Math.min(count, Math.floor(number))));
  }
  async function findInFile() {
    const value = query.trim().slice(0, 160),
      token = ++searchToken.current;
    setMatches([]);
    setSearched(value);
    setSearchError(false);
    if (!value || !pool) {
      setSearching(false);
      return;
    }
    setSearching(true);
    const results: SearchMatch[] = [];
    try {
      for (let number = 1; number <= count; number++) {
        if (token !== searchToken.current) return;
        const text = (
          await pool.getText(number)
        ).items
          .map((item) => item.str || "")
          .join(" ");
        const index = text
          .toLocaleLowerCase()
          .indexOf(value.toLocaleLowerCase());
        if (index >= 0)
          results.push({
            page: number,
            snippet: text.slice(
              Math.max(0, index - 45),
              index + value.length + 90,
            ),
          });
        if (results.length >= 100) break;
        if (number % 4 === 0) await yieldPdfTask();
      }
      if (token === searchToken.current) setMatches(results);
    } catch {
      if (token === searchToken.current) setSearchError(true);
    } finally {
      if (token === searchToken.current) setSearching(false);
    }
  }
  const bookmarked = tools?.state.bookmarks[item.id] || [];
  return (
    <div
      ref={root}
      className="pdf-book pdf-controls-ready"
      style={
        {
          "--pdf-paper-color": paperColors?.paper || "#ffffff",
          "--pdf-ink-color": paperColors?.ink || "#000000",
        } as CSSProperties
      }
      data-paper-comfort={themedPaper ? resolvedTheme : "original"}
      data-two-pages={twoPages || undefined}
      data-turning={!!turn || undefined}
      aria-busy={preparingTurn || undefined}
      onKeyDown={(event) => {
        if (
          event.defaultPrevented ||
          event.ctrlKey ||
          event.metaKey ||
          event.altKey ||
          event.shiftKey ||
          window.getSelection()?.isCollapsed === false ||
          (event.target as HTMLElement).closest(
            "input,textarea,select,button,a",
          )
        )
          return;
        const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
        if (
          event.key === forward ||
          event.key === (dir === "rtl" ? "ArrowRight" : "ArrowLeft")
        ) {
          event.preventDefault();
          requestTurn(event.key === forward ? 1 : -1);
        }
        if (event.key === "Escape" && turn) {
          event.preventDefault();
          event.stopPropagation();
          turner.cancel();
        }
      }}
    >
      <div
        className="pdf-book-toolbar"
        data-compact={compactControls || undefined}
        data-narrow={width < 300 || undefined}
      >
        <PdfToolButton
          type="button"
          className="notebook-icon-button"
          disabled={!canTurn(-1) || !!turn || preparingTurn}
          aria-label={t({ en: "Previous page", ar: "الصفحة السابقة" })}
          onClick={() => requestTurn(-1)}
        >
          <ChevronLeft className="directional" size={18} />
        </PdfToolButton>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const number = Number(pageDraft);
            if (Number.isFinite(number)) jump(number);
            else setPageDraft(String(page));
          }}
          className="pdf-page-jump"
        >
          <input
            type="number"
            min={1}
            max={count}
            value={pageDraft}
            disabled={!pool || !!turn}
            aria-label={t({ en: "Page bookmark", ar: "علامة الصفحة" })}
            onChange={(event) => setPageDraft(event.target.value)}
            onBlur={() => {
              const number = Number(pageDraft);
              if (Number.isFinite(number)) jump(number);
            }}
          />
          <span aria-hidden="true">/ {pool ? count : "…"}</span>
        </form>
        <PdfToolButton
          type="button"
          className="notebook-icon-button"
          disabled={!canTurn(1) || !!turn || preparingTurn}
          aria-label={t({ en: "Next page", ar: "الصفحة التالية" })}
          onClick={() => requestTurn(1)}
        >
          <ChevronRight className="directional" size={18} />
        </PdfToolButton>
        <details
          ref={options}
          className="pdf-reader-options"
          open={!compactControls || optionsOpen}
          onToggle={(event) => {
            if (compactControls) setOptionsOpen(event.currentTarget.open);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape" && compactControls && optionsOpen) {
              event.stopPropagation();
              setOptionsOpen(false);
              options.current
                ?.querySelector("summary")
                ?.focus({ preventScroll: true });
            }
          }}
        >
          <summary aria-label={t({ en: "PDF tools", ar: "أدوات PDF" })}>
            <SlidersHorizontal size={18} aria-hidden="true" />
          </summary>
          <div className="pdf-reader-options-content">
            <strong className="pdf-options-label">
              {t({ en: "PDF tools", ar: "أدوات PDF" })}
            </strong>
            <span className="pdf-toolbar-divider" />
            <PdfToolButton
              type="button"
              className="notebook-icon-button pdf-paper-comfort"
              disabled={!pool || !!turn}
              title={t({
                en: "Choose Original colors when inspecting image detail",
                ar: "اختر الألوان الأصلية عند فحص تفاصيل الصور",
              })}
              aria-pressed={themedPaper}
              aria-label={t(
                themedPaper
                  ? {
                      en: "Show original page colors",
                      ar: "عرض ألوان الصفحة الأصلية",
                    }
                  : {
                      en: "Match PDF paper to theme",
                      ar: "مطابقة ورق PDF مع المظهر",
                    },
              )}
              onClick={() => setPaperOverride(!themedPaper)}
            >
              <SunMoon size={18} aria-hidden="true" />
              <span className="pdf-control-label">
                {t({ en: "Page colors", ar: "ألوان الصفحات" })}
              </span>
            </PdfToolButton>
            <PdfToolButton
              type="button"
              className="notebook-icon-button"
              disabled={zoom <= 0.75 || !!turn}
              aria-label={t({ en: "Zoom out", ar: "تصغير" })}
              onClick={() => setZoom((value) => Math.max(0.75, value - 0.25))}
            >
              <ZoomOut size={18} />
            </PdfToolButton>
            <PdfToolButton
              type="button"
              className="pdf-zoom-reset"
              disabled={!!turn}
              aria-label={t({
                en: "Reset PDF zoom",
                ar: "إعادة ضبط تكبير PDF",
              })}
              onClick={() => setZoom(1)}
            >
              {Math.round(zoom * 100)}%
            </PdfToolButton>
            <PdfToolButton
              type="button"
              className="notebook-icon-button"
              disabled={zoom >= 1.75 || !!turn}
              aria-label={t({ en: "Zoom in", ar: "تكبير" })}
              onClick={() => setZoom((value) => Math.min(1.75, value + 0.25))}
            >
              <ZoomIn size={18} />
            </PdfToolButton>
            <PdfToolButton
              type="button"
              className="notebook-icon-button pdf-find-toggle"
              disabled={!pool}
              aria-expanded={searchOpen}
              aria-label={t({
                en: "Search this PDF",
                ar: "البحث في هذا الملف",
              })}
              onClick={() => {
                setSearchOpen((value) => !value);
                if (compactControls) setOptionsOpen(false);
                requestAnimationFrame(() =>
                  searchInput.current?.focus({ preventScroll: true }),
                );
              }}
            >
              <Search size={18} />
              <span className="pdf-control-label">
                {t({ en: "Search this PDF", ar: "البحث في هذا الملف" })}
              </span>
            </PdfToolButton>
            {onShowSections && (
              <PdfToolButton
                type="button"
                className="notebook-icon-button"
                aria-label={t({
                  en: "Show course sections",
                  ar: "إظهار أقسام المساق",
                })}
                onClick={() => {
                  setOptionsOpen(false);
                  onShowSections();
                }}
              >
                <BookOpen size={18} />
                <span className="pdf-control-label">
                  {t({ en: "Course sections", ar: "أقسام المساق" })}
                </span>
              </PdfToolButton>
            )}
            {margins.owner && (
              <PdfToolButton
                type="button"
                className="notebook-icon-button"
                disabled={!pool}
                aria-label={t({
                  en: "Add note to this PDF page",
                  ar: "إضافة ملاحظة لصفحة PDF الحالية",
                })}
                onClick={() => margins.add({ resourceId: item.id, resourceRevision: item.updatedAt, page, x: .85, y: .1 }, count)}
              >
                <MessageSquareText size={18} />
                <span className="pdf-control-label">
                  {t({ en: "Add note", ar: "أضف ملاحظة" })}
                </span>
              </PdfToolButton>
            )}
            {tools && (
              <PdfToolButton
                type="button"
                className="notebook-icon-button pdf-page-bookmark"
                disabled={!pool}
                aria-pressed={bookmarked.includes(page)}
                aria-label={t(
                  bookmarked.includes(page)
                    ? { en: "Remove page bookmark", ar: "إزالة علامة الصفحة" }
                    : { en: "Bookmark this page", ar: "وضع علامة لهذه الصفحة" },
                )}
                onClick={() => tools.toggleBookmark(item.id, page)}
              >
                <Bookmark
                  size={18}
                  fill={bookmarked.includes(page) ? "currentColor" : "none"}
                />
                <span className="pdf-control-label">
                  {t(
                    bookmarked.includes(page)
                      ? { en: "Remove page bookmark", ar: "إزالة علامة الصفحة" }
                      : {
                          en: "Bookmark this page",
                          ar: "وضع علامة لهذه الصفحة",
                        },
                  )}
                </span>
              </PdfToolButton>
            )}
            {bookmarked.length > 0 && (
              <details className="pdf-bookmark-list">
                <summary>
                  {t({ en: "Bookmarks", ar: "العلامات" })}{" "}
                  <b>{bookmarked.length}</b>
                </summary>
                <div>
                  {bookmarked
                    .filter((value) => value <= count)
                    .map((number) => (
                      <PdfToolButton
                        key={number}
                        type="button"
                        onClick={() => jump(number)}
                      >
                        {t({ en: "Page ", ar: "صفحة " })}
                        {number}
                      </PdfToolButton>
                    ))}
                </div>
              </details>
            )}
          </div>
        </details>
        {onClose && (
          <PdfToolButton
            type="button"
            className="notebook-icon-button pdf-close-resource"
            onClick={onClose}
            aria-label={t({ en: "Close PDF", ar: "إغلاق PDF" })}
            title={t({
              en: "Back to course materials",
              ar: "العودة إلى ملفات المساق",
            })}
          >
            <X size={18} aria-hidden="true" />
          </PdfToolButton>
        )}
      </div>
      {searchOpen && (
        <div className="pdf-file-search">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void findInFile();
            }}
          >
            <input
              ref={searchInput}
              value={query}
              maxLength={160}
              onChange={(event) => setQuery(event.target.value)}
              aria-label={t({ en: "Search PDF text", ar: "البحث في نص PDF" })}
              placeholder={t({
                en: "Find a term in this file",
                ar: "ابحث عن مصطلح في الملف",
              })}
            />
            <button type="submit" disabled={!pool || searching}>
              {t({ en: "Find", ar: "ابحث" })}
            </button>
            <button
              type="button"
              className="notebook-icon-button"
              aria-label={t({ en: "Close PDF search", ar: "إغلاق البحث" })}
              onClick={() => {
                searchToken.current++;
                setSearching(false);
                setSearchOpen(false);
              }}
            >
              <X size={17} />
            </button>
          </form>
          {searched && (
            <p role="status">
              {t(
                searching
                  ? { en: "Searching…", ar: "جارٍ البحث…" }
                  : searchError
                    ? {
                        en: "Search could not finish.",
                        ar: "تعذّر إكمال البحث.",
                      }
                    : { en: "Matching pages: ", ar: "الصفحات المطابقة: " },
              )}
              {!searching &&
                !searchError &&
                matches.length + (matches.length >= 100 ? "+" : "")}
            </p>
          )}
          {matches.length > 0 && (
            <ol>
              {matches.map((match) => (
                <li key={match.page}>
                  <button type="button" onClick={() => jump(match.page)}>
                    <b>
                      {t({ en: "Page ", ar: "صفحة " })}
                      {match.page}
                    </b>
                    <span>{match.snippet}</span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
      {password && (
        <form
          className="pdf-password"
          onSubmit={(event) => {
            event.preventDefault();
            password.update(passwordText);
            setPasswordText("");
            setPassword(null);
          }}
        >
          <label>
            {t({ en: "PDF password", ar: "كلمة مرور PDF" })}
            <input
              type="password"
              autoComplete="off"
              value={passwordText}
              onChange={(event) => setPasswordText(event.target.value)}
            />
          </label>
          {password.incorrect && (
            <p role="alert">
              {t({
                en: "Incorrect password. Try again.",
                ar: "كلمة مرور غير صحيحة. حاول مجدداً.",
              })}
            </p>
          )}
          <button type="submit">
            {t({ en: "Unlock file", ar: "فتح الملف" })}
          </button>
        </form>
      )}
      {error ? (
        <div className="pdf-load-error" role="status">
          <p>
            {t({
              en: "This PDF could not be rendered here. You can open the original file.",
              ar: "تعذّر عرض هذا الملف هنا. يمكنك فتح الملف الأصلي.",
            })}
          </p>
          <a href={url} target="_blank" rel="noopener noreferrer">
            {t({ en: "Open original PDF", ar: "فتح ملف PDF الأصلي" })}
          </a>
          <button type="button" onClick={() => setRetry((value) => value + 1)}>
            {t({ en: "Try again", ar: "حاول مجدداً" })}
          </button>
        </div>
      ) : !pool ? (
        !password && (
          <div className="pdf-load-status" role="status">
            {t({ en: "Opening your document…", ar: "جارٍ فتح مستندك…" })}
          </div>
        )
      ) : (
        <div
          className="pdf-book-reading-surface"
          data-turn-layout={width < 520 ? "row" : "rails"}
          data-pannable={panLimit > 1 || undefined}
        >
          <div
            ref={viewportRef}
            className="pdf-book-viewport"
            dir="ltr"
            data-pannable={panLimit > 1 || undefined}
            onScroll={(event) => {
              onScroll?.(event.currentTarget.scrollTop);
              setPan(pdfPanOffset(event.currentTarget.scrollLeft, panLimit));
            }}
            tabIndex={0}
            aria-label={t({ en: "PDF reading spread", ar: "صفحتا قراءة PDF" })}
          >
            <div
              className="pdf-pan-canvas"
              style={{ minWidth: "100%", width: spreadWidth }}
            >
              <div
                dir={dir}
                className="pdf-book-pages"
                style={{
                  width: spreadWidth,
                }}
                data-two-pages={twoPages || undefined}
                data-turn-progress={turn?.progress}
                inert={!!turn || undefined}
              >
                <PdfPage
                  paperColors={paperColors}
                  pool={pool}
                  number={twoPages ? left : turningInside ? next! : first}
                  width={paperWidth}
                  rasterWidth={rasterWidth}
                  allowText={!turn}
                  query={searched}
                  {...marginProps}
                  onActivate={activate}
                />
                {twoPages && (
                  <>
                    <div className="pdf-spread-gutter" aria-hidden="true" />
                    <PdfPage
                      paperColors={paperColors}
                      pool={pool}
                      number={right}
                      width={paperWidth}
                      rasterWidth={rasterWidth}
                      allowText={!turn}
                      query={searched}
                      {...marginProps}
                      onActivate={activate}
                    />
                  </>
                )}
                {turn && (
                  <TurnLeaf
                    turn={turn}
                    rtl={dir === "rtl"}
                    twoPages={twoPages}
                    front={
                      <PdfPage
                        paperColors={paperColors}
                        pool={pool}
                        number={frontPage}
                        width={paperWidth}
                        rasterWidth={rasterWidth}
                        selectable={false}
                      />
                    }
                    back={
                      <PdfPage
                        paperColors={paperColors}
                        pool={pool}
                        number={backPage}
                        width={paperWidth}
                        rasterWidth={rasterWidth}
                        selectable={false}
                      />
                    }
                  />
                )}
              </div>
            </div>
          </div>
          {panLimit > 1 && (
            <label className="pdf-pan-control">
              <span>{t({ en: "Pan", ar: "تحريك" })}</span>
              <input
                type="range"
                min={0}
                max={Math.ceil(panLimit)}
                step={1}
                value={Math.round(pan)}
                aria-label={t({
                  en: "Scroll PDF horizontally",
                  ar: "تمرير PDF أفقياً",
                })}
                onChange={(event) => {
                  const offset = pdfPanOffset(
                    Number(event.target.value),
                    panLimit,
                  );
                  if (viewportRef.current)
                    viewportRef.current.scrollLeft = offset;
                  setPan(offset);
                }}
              />
            </label>
          )}
          <PdfToolButton
            type="button"
            className="page-hand-edge page-hand-previous"
            disabled={!canTurn(-1) || !!turn || preparingTurn}
            aria-label={t({
              en: "Turn previous page",
              ar: "قلب الصفحة السابقة",
            })}
            onClick={() => requestTurn(-1)}
          >
            <ChevronLeft className="directional" size={17} />
          </PdfToolButton>
          <PdfToolButton
            type="button"
            className="page-hand-edge page-hand-next"
            disabled={!canTurn(1) || !!turn || preparingTurn}
            aria-label={t({
              en: "Turn next page",
              ar: "قلب الصفحة التالية",
            })}
            onClick={() => requestTurn(1)}
          >
            <ChevronRight className="directional" size={17} />
          </PdfToolButton>
        </div>
      )}
      {margins.panel}
      {pool && (
        <span className="sr-only" role="status">
          {t({ en: "Page ", ar: "صفحة " })}
          {page} / {count}
        </span>
      )}
    </div>
  );
}
