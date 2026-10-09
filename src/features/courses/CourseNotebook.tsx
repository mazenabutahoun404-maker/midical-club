import { ChevronLeft, ChevronRight } from "lucide-react";
import { StudyToolsPanel, useStudyTools } from "./StudyTools";
import { SectionTurnPreview } from "./SectionTurnPreview";
import { resourceMediaType } from "./StudyResourceViewer";
import { captureSectionPage, SectionSnapshot } from "./SectionSnapshot";
import { TurnLeaf, usePageTurn } from "./usePageTurn";
import type { TurnDirection } from "./page-turn";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  ArrowUpRight,
  BookMarked,
  BookOpen,
  CircleHelp,
  ClipboardList,
  Columns2,
  FileText,
  Film,
  Globe2,
  LayoutDashboard,
  Lightbulb,
  X,
} from "lucide-react";
import type { Course, CourseSectionKind, Resource } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useStudyChrome } from "../../app/providers/StudyChromeProvider";
import { useWorkspace } from "../../app/providers/WorkspaceProvider";
import { EmptyState } from "../../components/feedback/EmptyState";
import { AppLink } from "../../components/navigation/AppLink";
import { useWorkspacePaths } from "../../hooks/useWorkspacePaths";
import { useStudyCopy } from "./study-copy";
import { useStudyState } from "./useStudyState";
import { StudyResourceViewer } from "./StudyResourceViewer";
import { NotebookResourceCard } from "./NotebookResourceCard";
import { CoursePdfImporter } from "./CoursePdfImporter";
import type { PdfImportReporter } from "./pdf-import";
import { CourseDeskHeader, useCourseDesk } from "./CourseDeskHeader";
import {
  resolveSectionLayout,
  safeResourceUrl,
  type StudyPosition,
} from "./study-state";

const icons = {
  overview: LayoutDashboard,
  guidance: Lightbulb,
  slides: FileText,
  notes: ClipboardList,
  summary: BookMarked,
  recording: Film,
  book: BookOpen,
  questions: CircleHelp,
  external: Globe2,
} satisfies Record<CourseSectionKind, typeof FileText>;

export function CourseNotebook({
  course,
  resources,
  storageKey,
  canImportPdfs = false,
  importingPdfs = false,
  pdfImportError = false,
  onImportPdfs,
  onRemoveImportedPdf,
}: {
  course: Course;
  resources: Resource[];
  storageKey: string;
  canImportPdfs?: boolean;
  importingPdfs?: boolean;
  pdfImportError?: boolean;
  onImportPdfs?: (
    kind: CourseSectionKind,
    files: File[],
    report?: PdfImportReporter,
  ) => Promise<string[]>;
  onRemoveImportedPdf?: (id: string) => Promise<void>;
}) {
  const { t, label, dir } = useLocale();
  const s = useStudyCopy();
  const paths = useWorkspacePaths();
  const { focus, setFocus, courseNavigationVisible } = useStudyChrome();
  const workspace = useWorkspace();
  const study = useStudyState(storageKey);
  const desk = useCourseDesk();
  const sectionLayout = resolveSectionLayout(
    study.state.sectionLayout,
    focus,
    courseNavigationVisible,
  );
  const ordered = useMemo(
    () => [...course.sections].sort((a, b) => a.order - b.order),
    [course.sections],
  );
  const bySection = useMemo(
    () =>
      Object.fromEntries(
        ordered.map((section) => [
          section.kind,
          resources.filter((resource) => resource.kind === section.kind),
        ]),
      ) as Partial<Record<CourseSectionKind, Resource[]>>,
    [ordered, resources],
  );
  const active =
    ordered.find((section) => section.kind === study.state.active) ||
    ordered[0];
  const [peek, setPeek] = useState<CourseSectionKind | null>(null);
  const [turn, setTurn] = useState<{ id: number; backwards: boolean } | null>(
    null,
  );
  const [peekTop, setPeekTop] = useState(100);
  const [peekAnchor, setPeekAnchor] = useState(18);
  const [peekInline, setPeekInline] = useState(8);
  const [mobileIndex, setMobileIndex] = useState(false);
  const [railClosed, setRailClosed] = useState(false);
  const rail = useRef<HTMLElement>(null);
  const closingRail = useRef(false);
  const [openingCover, setOpeningCover] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setOpeningCover(false), 750);
    return () => window.clearTimeout(timer);
  }, []);
  const page = useRef<HTMLElement>(null);
  const primary = useRef<HTMLDivElement>(null);
  const tools = useStudyTools();
  const book = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const turnSnapshot = useRef<HTMLElement | null>(null);
  const handSnapshot = useRef<HTMLElement | null>(null);
  const initialOpened = useRef(false);
  const peekTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const suppressed = useRef<CourseSectionKind | null>(null);
  const visited = useRef(false);
  const switching = useRef(false);
  const restoring = useRef(false);
  const activeRef = useRef(active?.kind);
  activeRef.current = active?.kind;
  const selected = resources.find(
    (resource) =>
      resource.kind === active?.kind &&
      resource.id === study.state.sections[active?.kind]?.resourceId,
  );
  const companion = resources.find(
    (resource) =>
      resource.id === study.state.companionId && resource.id !== selected?.id,
  );
  const lastResource = resources.find(
    (resource) => resource.id === study.state.lastResourceId,
  );
  const visible = bySection[active?.kind] || [];
  const peekSection = ordered.find((section) => section.kind === peek);
  const peekResources = peek ? bySection[peek] || [] : [];
  const firstMaterial =
    resources.find((resource) => safeResourceUrl(resource.fileUrl)) ||
    resources.find((resource) => resource.kind === "guidance") ||
    resources[0];

  useEffect(() => {
    closePeek();
    setRailClosed(false);
    setMobileIndex(false);
  }, [sectionLayout]);

  function closePeek() {
    if (peekTimer.current) clearTimeout(peekTimer.current);
    setPeek(null);
  }
  function dismissPeek() {
    const kind = peek;
    suppressed.current = kind;
    const previewHasFocus = book.current
      ?.querySelector(".notebook-peek")
      ?.contains(document.activeElement);
    closePeek();
    if (previewHasFocus && kind)
      book.current
        ?.querySelector<HTMLButtonElement>(`[data-notebook-section="${kind}"]`)
        ?.focus({ preventScroll: true });
  }
  function preview(kind: CourseSectionKind, element: HTMLButtonElement) {
    if (peekTimer.current) clearTimeout(peekTimer.current);
    if (suppressed.current === kind || kind === active.kind) {
      setPeek(null);
      return;
    }
    suppressed.current = null;
    if (rail.current) {
      const railRect = rail.current.getBoundingClientRect();
      const bookmarkRect = element.getBoundingClientRect();
      const origin = railRect.top;
      const bookmarkTop = bookmarkRect.top - origin;
      const height = window.visualViewport?.height || window.innerHeight;
      const previewHeight = Math.min(
        window.innerWidth < 768 ? 260 : 300,
        height - 140,
      );
      const top =
        sectionLayout === "horizontal"
          ? railRect.height + 6
          : Math.max(
              0,
              Math.min(bookmarkTop, height - origin - previewHeight - 12),
            );
      setPeekTop(top);
      if (sectionLayout === "horizontal") {
        const previewWidth = Math.min(280, railRect.width - 16);
        const center =
          dir === "rtl"
            ? railRect.right - bookmarkRect.right + bookmarkRect.width / 2
            : bookmarkRect.left - railRect.left + bookmarkRect.width / 2;
        const start = Math.max(
          8,
          Math.min(
            center - previewWidth / 2,
            railRect.width - previewWidth - 8,
          ),
        );
        setPeekInline(start);
        setPeekAnchor(
          Math.max(14, Math.min(previewWidth - 20, center - start)),
        );
      } else {
        setPeekAnchor(
          Math.max(14, Math.min(previewHeight - 20, bookmarkTop - top + 18)),
        );
      }
    }
    peekTimer.current = setTimeout(() => setPeek(kind), 180);
  }
  function scheduleClosePeek() {
    if (peekTimer.current) clearTimeout(peekTimer.current);
    peekTimer.current = setTimeout(() => setPeek(null), 140);
  }
  function animateTo(kind: CourseSectionKind) {
    closePeek();
    if (kind === active.kind) return;
    const backwards =
      ordered.findIndex((section) => section.kind === kind) <
      ordered.findIndex((section) => section.kind === active.kind);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      turnSnapshot.current = captureSectionPage(page.current, backwards);
      setTurn((previous) => ({ id: (previous?.id || 0) + 1, backwards }));
    }
  }
  function rememberSection() {
    if (!primary.current || !activeRef.current || restoring.current) return;
    const scroll = primary.current.scrollTop;
    const kind = activeRef.current;
    study.update(
      (previous) => ({
        ...previous,
        sections: {
          ...previous.sections,
          [kind]: { ...previous.sections[kind], scroll },
        },
      }),
      false,
    );
  }
  function select(kind: CourseSectionKind, animate = true) {
    const files = (bySection[kind] || []).filter((item) =>
      safeResourceUrl(item.fileUrl),
    );
    if (kind !== active.kind && files.length === 1) {
      open(files[0], animate);
      return;
    }
    rememberSection();
    switching.current = kind !== active.kind;
    if (animate) animateTo(kind);
    suppressed.current = kind;
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches)
      setMobileIndex(false);
    study.update((previous) => ({ ...previous, active: kind }));
  }
  function open(resource: Resource, animate = true) {
    rememberSection();
    switching.current = resource.kind !== active.kind;
    if (animate) animateTo(resource.kind);
    study.update((previous) => ({
      ...previous,
      active: resource.kind,
      lastResourceId: resource.id,
      sections: {
        ...previous.sections,
        [resource.kind]: {
          scroll: previous.sections[resource.kind]?.scroll || 0,
          resourceId: resource.id,
        },
      },
    }));
    if (
      !resource.id.startsWith("personal-pdf-") &&
      !workspace.isPending &&
      !workspace.isError
    )
      void workspace.send({ type: "view-resource", id: resource.id });
    suppressed.current = resource.kind;
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches)
      setMobileIndex(false);
  }
  function canStep(direction: TurnDirection) {
    const files = visible.filter((resource) =>
      safeResourceUrl(resource.fileUrl),
    );
    const fileIndex = files.findIndex(
      (resource) => resource.id === selected?.id,
    );
    return (
      (fileIndex >= 0 && !!files[fileIndex + direction]) ||
      !!ordered[
        ordered.findIndex((section) => section.kind === active.kind) + direction
      ]
    );
  }
  function stepStudy(direction: TurnDirection, animate = true) {
    const files = visible.filter((resource) =>
      safeResourceUrl(resource.fileUrl),
    );
    const fileIndex = files.findIndex(
      (resource) => resource.id === selected?.id,
    );
    if (fileIndex >= 0 && files[fileIndex + direction]) {
      open(files[fileIndex + direction], animate);
      return;
    }
    const next =
      ordered[
        ordered.findIndex((section) => section.kind === active.kind) + direction
      ];
    if (next) select(next.kind, animate);
  }
  const handTurn = usePageTurn({
    rtl: dir === "rtl",
    canTurn: canStep,
    identity: active.kind + ":" + selected?.id,
    onCommit: (direction) => stepStudy(direction, false),
  });
  function upcoming(direction: TurnDirection) {
    const files = visible.filter((resource) =>
      safeResourceUrl(resource.fileUrl),
    );
    const fileIndex = files.findIndex(
      (resource) => resource.id === selected?.id,
    );
    const adjacent = fileIndex >= 0 ? files[fileIndex + direction] : undefined;
    const section = adjacent
      ? active
      : ordered[
          ordered.findIndex((item) => item.kind === active.kind) + direction
        ];
    if (!section) return null;
    const items = bySection[section.kind] || [];
    const available = items.filter((item) => safeResourceUrl(item.fileUrl));
    const resourceId =
      adjacent?.id ||
      study.state.sections[section.kind]?.resourceId ||
      (available.length === 1 ? available[0].id : undefined);
    return {
      section,
      items,
      resourceId,
      page: resourceId ? study.state.resources[resourceId]?.page || 1 : 1,
    };
  }
  function boundaryPreview(direction: TurnDirection) {
    const next = upcoming(direction);
    return next ? (
      <SectionTurnPreview
        course={course}
        section={next.section}
        resources={next.items}
        preferredResourceId={next.resourceId}
        preferredPage={next.page}
      />
    ) : null;
  }
  useEffect(() => {
    if (
      initialOpened.current ||
      study.current.current.lastResourceId ||
      study.current.current.active !== "overview"
    )
      return;
    const first = resources.find((resource) =>
      safeResourceUrl(resource.fileUrl),
    );
    if (first) {
      initialOpened.current = true;
      open(first, false);
    }
  }, [resources]);
  function closeResource() {
    study.update((previous) => ({
      ...previous,
      sections: {
        ...previous.sections,
        [active.kind]: {
          ...previous.sections[active.kind],
          scroll: 0,
          resourceId: undefined,
        },
      },
    }));
    requestAnimationFrame(() => title.current?.focus({ preventScroll: true }));
  }
  function savePosition(id: string, position: Partial<StudyPosition>) {
    study.update(
      (previous) => ({
        ...previous,
        resources: {
          ...previous.resources,
          [id]: {
            ...(previous.resources[id] || { scroll: 0, page: 1, seconds: 0 }),
            ...position,
          },
        },
      }),
      false,
    );
  }
  useEffect(() => {
    let frame = 0;
    const scroll = () => {
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          rememberSection();
        });
    };
    const surface = primary.current;
    surface?.addEventListener("scroll", scroll, { passive: true });
    return () => {
      surface?.removeEventListener("scroll", scroll);
      cancelAnimationFrame(frame);
      if (peekTimer.current) clearTimeout(peekTimer.current);
    };
    // This keyed component keeps the same account/course. The ref tracks its active section.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useLayoutEffect(() => {
    const offset = study.current.current.sections[active.kind]?.scroll || 0;
    const switched = switching.current;
    switching.current = false;
    const shouldRestore = offset > 0;
    visited.current = true;
    if (!shouldRestore) {
      if (primary.current) primary.current.scrollTop = 0;
      return;
    }
    restoring.current = true;
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => {
        if (primary.current) {
          primary.current.scrollTop = offset;
        }
        restoring.current = false;
      });
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
      restoring.current = false;
    };
  }, [active.kind]);
  useEffect(() => {
    if (focus) closePeek();
  }, [focus]);
  useEffect(() => {
    if (!turn) return;
    const timeout = setTimeout(() => setTurn(null), 380);
    return () => clearTimeout(timeout);
  }, [turn]);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        focus &&
        !document.querySelector('dialog[open], [role="dialog"]') &&
        !event.defaultPrevented
      )
        setFocus(false);
    };
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, [focus, setFocus]);
  useLayoutEffect(() => {
    if (!desk) return;
    desk.register({
      split: study.state.split,
      toggleSplit: () => {
        closePeek();
        study.update((previous) => ({ ...previous, split: !previous.split }));
      },
    });
    return () => desk.register(null);
  }, [desk?.register, study.state.split, study.update]);
  if (!active) return <EmptyState />;

  return (
    <div
      ref={book}
      className="study-notebook"
      data-course-tone={course.accent}
      data-focus={focus || undefined}
      data-section-layout={sectionLayout}
      data-split={study.state.split || undefined}
      data-reading={selected ? "resource" : "section"}
      dir={dir}
    >
      {focus && (
        <h1 className="sr-only" data-page-heading tabIndex={-1}>
          {t(course.title)}
        </h1>
      )}
      {!focus &&
        (desk ? (
          <div className="notebook-toolbar-space" aria-hidden="true" />
        ) : (
          <CourseDeskHeader
            course={course}
            controls={{
              split: study.state.split,
              toggleSplit: () => {
                closePeek();
                study.update((previous) => ({
                  ...previous,
                  split: !previous.split,
                }));
              },
            }}
          />
        ))}
      {!focus && (
        <h1 className="sr-only" data-page-heading tabIndex={-1}>
          {t(course.title)}
        </h1>
      )}
      <div className="notebook-object">
        {openingCover && (
          <div
            className="study-opening-cover"
            aria-hidden="true"
            onAnimationEnd={() => setOpeningCover(false)}
          >
            <span>
              MEDCLUB · <bdi>{course.code}</bdi>
            </span>
            <BookOpen size={44} />
            <strong>{t(course.title)}</strong>
          </div>
        )}
        <div className="notebook-back-cover" aria-hidden="true" />
        <div className="notebook-page-stack" aria-hidden="true" />
        <div className="notebook-spread">
          <aside
            ref={rail}
            className="notebook-index"
            tabIndex={0}
            aria-label={label("courseSections")}
            data-expanded={mobileIndex || undefined}
            data-closed={railClosed || undefined}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") {
                setRailClosed(false);
                setMobileIndex(true);
              }
            }}
            onPointerLeave={(event) => {
              if (
                event.pointerType === "mouse" &&
                !rail.current?.contains(document.activeElement)
              )
                setMobileIndex(false);
              scheduleClosePeek();
            }}
            onPointerDown={(event) => {
              if (
                event.pointerType !== "mouse" &&
                event.target === event.currentTarget
              ) {
                event.preventDefault();
                event.currentTarget.focus({ preventScroll: true });
                setRailClosed(false);
                setMobileIndex(true);
              }
            }}
            onFocusCapture={(event) => {
              if (closingRail.current) return;
              if (!railClosed || event.target !== event.currentTarget) {
                setRailClosed(false);
                setMobileIndex(true);
              }
            }}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setMobileIndex(false);
                scheduleClosePeek();
              }
            }}
            onKeyDown={(event) => {
              if (
                event.target === event.currentTarget &&
                ["Enter", " ", "ArrowDown"].includes(event.key)
              ) {
                event.preventDefault();
                setRailClosed(false);
                setMobileIndex(true);
                requestAnimationFrame(() =>
                  rail.current
                    ?.querySelector<HTMLButtonElement>(
                      "[data-notebook-section]",
                    )
                    ?.focus(),
                );
              }
            }}
          >
            <div className="notebook-index-heading">
              <BookOpen
                className="notebook-rail-mark"
                size={17}
                aria-hidden="true"
              />
              <span>{s("index")}</span>
              <bdi>{course.code}</bdi>
            </div>
            <button
              type="button"
              className="notebook-section-close notebook-icon-button"
              aria-label={t({
                en: "Close course sections",
                ar: "إغلاق أقسام المساق",
              })}
              onClick={() => {
                closePeek();
                closingRail.current = true;
                setMobileIndex(false);
                setRailClosed(true);
                rail.current?.focus({ preventScroll: true });
                requestAnimationFrame(() => {
                  closingRail.current = false;
                });
              }}
            >
              <X size={16} />
            </button>
            <nav
              id="notebook-bookmarks"
              className="notebook-bookmarks"
              aria-label={label("courseSections")}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.stopPropagation();
                  dismissPeek();
                }
                const buttons = [
                  ...event.currentTarget.querySelectorAll<HTMLButtonElement>(
                    "button",
                  ),
                ];
                const current = buttons.indexOf(
                  document.activeElement as HTMLButtonElement,
                );
                if (current < 0) return;
                const nextKey = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
                const previousKey = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
                let next: number | undefined;
                if (event.key === "ArrowDown" || event.key === nextKey)
                  next = (current + 1) % buttons.length;
                if (event.key === "ArrowUp" || event.key === previousKey)
                  next = (current - 1 + buttons.length) % buttons.length;
                if (event.key === "Home") next = 0;
                if (event.key === "End") next = buttons.length - 1;
                if (next !== undefined) {
                  event.preventDefault();
                  buttons[next].focus();
                }
              }}
            >
              {ordered.map((section, index) => {
                const Icon = icons[section.kind];
                const items = bySection[section.kind] || [];
                const count =
                  section.kind === "overview"
                    ? course.outcomes.length
                    : items.length;
                const hint =
                  section.kind === "overview"
                    ? course.outcomes[0]
                    : items[0]?.title;
                return (
                  <button
                    type="button"
                    key={section.id}
                    className="notebook-bookmark"
                    data-notebook-section={section.kind}
                    data-peeking={peek === section.kind || undefined}
                    aria-current={
                      active.kind === section.kind ? "page" : undefined
                    }
                    aria-label={t(section.title)}
                    aria-controls="notebook-reading-page"
                    aria-describedby={
                      peek === section.kind
                        ? "notebook-section-preview"
                        : undefined
                    }
                    onClick={() => select(section.kind)}
                    onPointerEnter={(event) => {
                      if (event.pointerType === "mouse")
                        preview(section.kind, event.currentTarget);
                    }}
                    onPointerLeave={scheduleClosePeek}
                    onFocus={(event) =>
                      preview(section.kind, event.currentTarget)
                    }
                    onBlur={scheduleClosePeek}
                  >
                    <span className="notebook-bookmark-top">
                      <Icon size={18} aria-hidden="true" />
                      <b>{t(section.title)}</b>
                      <small>{count}</small>
                    </span>
                    <span className="notebook-bookmark-glimpse">
                      {hint ? t(hint) : s("noResources")}
                    </span>
                    <span
                      className="notebook-bookmark-number"
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </button>
                );
              })}
            </nav>
            {peekSection && (
              <aside
                id="notebook-section-preview"
                className="notebook-peek"
                data-peek-section={peekSection.kind}
                style={
                  {
                    top: peekTop,
                    "--peek-anchor": `${peekAnchor}px`,
                    ...(sectionLayout === "horizontal"
                      ? { insetInlineStart: peekInline }
                      : {}),
                  } as CSSProperties
                }
                aria-label={s("peek")}
                onPointerEnter={() => {
                  if (peekTimer.current) clearTimeout(peekTimer.current);
                }}
                onPointerLeave={scheduleClosePeek}
                onFocusCapture={() => {
                  if (peekTimer.current) clearTimeout(peekTimer.current);
                }}
                onBlur={scheduleClosePeek}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.stopPropagation();
                    dismissPeek();
                  }
                }}
              >
                <div className="notebook-peek-head">
                  <span>{s("peek")}</span>
                  <button
                    type="button"
                    className="notebook-icon-button"
                    aria-label={label("close")}
                    onClick={dismissPeek}
                  >
                    <X size={16} />
                  </button>
                </div>
                <h3>{t(peekSection.title)}</h3>
                <p>{t(peekSection.description)}</p>
                {peekResources[0]?.preview?.thumbnailUrl &&
                  safeResourceUrl(peekResources[0].preview.thumbnailUrl) && (
                    <img
                      src={safeResourceUrl(
                        peekResources[0].preview.thumbnailUrl,
                      )}
                      alt={t(peekResources[0].title)}
                      loading="lazy"
                    />
                  )}
                <ul>
                  {peekSection.kind === "overview" ? (
                    course.outcomes
                      .slice(0, 2)
                      .map((outcome) => <li key={outcome.en}>{t(outcome)}</li>)
                  ) : peekResources.length ? (
                    peekResources.slice(0, 2).map((resource) => (
                      <li key={resource.id}>
                        <strong>{t(resource.title)}</strong>
                        <span>
                          {resource.durationMinutes
                            ? `${resource.durationMinutes} ${s("minutes")}`
                            : resource.localFile
                              ? t({ en: "PDF file", ar: "ملف PDF" })
                              : `${resource.pages} ${label("pages")}`}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li>{s("noResources")}</li>
                  )}
                </ul>
                <button
                  type="button"
                  className="notebook-button notebook-button-primary"
                  onClick={() => select(peekSection.kind)}
                >
                  {label("openSection")}
                  <ArrowUpRight size={16} className="directional" />
                </button>
              </aside>
            )}
          </aside>
          <div className="notebook-binding" aria-hidden="true">
            {Array.from({ length: 7 }, (_, index) => (
              <i key={index} />
            ))}
          </div>
          <section
            ref={page}
            id="notebook-reading-page"
            className="notebook-reading-page"
            aria-labelledby="notebook-section-heading"
          >
            <header
              className={
                selected
                  ? "notebook-section-heading sr-only"
                  : "notebook-section-heading"
              }
            >
              <h2 ref={title} id="notebook-section-heading" tabIndex={-1}>
                {t(active.title)}
              </h2>
            </header>
            <div
              className="notebook-study-layout"
              style={
                { "--reading-width": `${study.state.width}%` } as CSSProperties
              }
            >
              <div className="notebook-primary-pane" ref={primary}>
                {selected ? (
                  <StudyResourceViewer
                    key={`main:${selected.id}`}
                    item={selected}
                    position={study.state.resources[selected.id]}
                    onPosition={(position) =>
                      savePosition(selected.id, position)
                    }
                    onClose={closeResource}
                    canBoundary={canStep}
                    onBoundary={(direction) => stepStudy(direction, false)}
                    boundaryPreview={boundaryPreview}
                  />
                ) : active.kind === "overview" ? (
                  <div className="notebook-overview">
                    {(lastResource || firstMaterial) && (
                      <button
                        type="button"
                        className="notebook-resume"
                        onClick={() => open((lastResource || firstMaterial)!)}
                      >
                        <BookOpen size={22} />
                        <span>
                          <small>{s(lastResource ? "resume" : "start")}</small>
                          <strong>
                            {t((lastResource || firstMaterial)!.title)}
                          </strong>
                        </span>
                        <ArrowUpRight size={20} className="directional" />
                      </button>
                    )}
                    <details className="notebook-course-details">
                      <summary>{label("learningOutcomes")}</summary>
                      <p>{t(course.description)}</p>
                      <ol className="notebook-outcomes">
                        {course.outcomes.map((outcome, index) => (
                          <li key={outcome.en}>
                            <span>{String(index + 1).padStart(2, "0")}</span>
                            <p>{t(outcome)}</p>
                          </li>
                        ))}
                      </ol>
                    </details>
                  </div>
                ) : (
                  <>
                    {canImportPdfs &&
                      onImportPdfs &&
                      !["recording", "external"].includes(active.kind) && (
                        <CoursePdfImporter
                          section={active.kind}
                          pending={importingPdfs}
                          onImport={(files, report) =>
                            onImportPdfs(active.kind, files, report)
                          }
                        />
                      )}
                    {pdfImportError && (
                      <p className="pdf-import-service-error" role="alert">
                        {s("importError")}
                      </p>
                    )}
                    {visible.length ? (
                      <div className="resource-grid course-material-grid notebook-material-grid">
                        {visible.map((resource) => (
                          <NotebookResourceCard
                            key={resource.id}
                            resource={resource}
                            course={course}
                            seconds={
                              study.state.resources[resource.id]?.seconds
                            }
                            onOpen={() => open(resource)}
                            onRemove={
                              resource.localFile &&
                              canImportPdfs &&
                              onRemoveImportedPdf
                                ? () => onRemoveImportedPdf(resource.id)
                                : undefined
                            }
                          />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        title={label("emptyTitle")}
                        description={label("emptyBody")}
                      />
                    )}
                  </>
                )}
              </div>
              {study.state.split && (
                <aside className="notebook-companion">
                  <label className="notebook-companion-picker">
                    <span>{s("companion")}</span>
                    <select
                      value={companion?.id || ""}
                      onChange={(event) =>
                        study.update((previous) => ({
                          ...previous,
                          companionId: event.target.value || undefined,
                        }))
                      }
                    >
                      <option value="">{s("choose")}</option>
                      {resources
                        .filter((resource) => resource.id !== selected?.id)
                        .map((resource) => (
                          <option key={resource.id} value={resource.id}>
                            {label(resource.kind)} · {t(resource.title)}
                          </option>
                        ))}
                    </select>
                  </label>
                  {companion ? (
                    <StudyResourceViewer
                      key={`companion:${companion.id}`}
                      item={companion}
                      position={study.state.resources[companion.id]}
                      onPosition={(position) =>
                        savePosition(companion.id, position)
                      }
                      companion
                    />
                  ) : (
                    <div className="notebook-companion-empty">
                      <Columns2 size={30} aria-hidden="true" />
                      <p>{s("choose")}</p>
                    </div>
                  )}
                  <label className="notebook-width-control">
                    <span>
                      {s("width")} · {Math.round(study.state.width)}%
                    </span>
                    <input
                      type="range"
                      min={35}
                      max={65}
                      step={1}
                      value={study.state.width}
                      onChange={(event) =>
                        study.update((previous) => ({
                          ...previous,
                          width: Number(event.target.value),
                        }))
                      }
                    />
                  </label>
                  <p className="notebook-split-hint">{s("splitHint")}</p>
                </aside>
              )}
            </div>
            {turn && (
              <div
                key={turn.id}
                className="notebook-turn-sheet"
                data-backwards={turn.backwards || undefined}
                aria-hidden="true"
                onAnimationEnd={(event) => {
                  if (event.target === event.currentTarget) setTurn(null);
                }}
              >
                <div className="section-turn-front">
                  <SectionSnapshot snapshot={turnSnapshot.current} />
                </div>
                <i className="section-turn-back">
                  <SectionTurnPreview
                    course={course}
                    section={active}
                    resources={visible}
                    preferredResourceId={selected?.id}
                    preferredPage={
                      selected ? study.state.resources[selected.id]?.page : 1
                    }
                  />
                </i>
                <b />
              </div>
            )}
            {(!selected ||
              resourceMediaType(selected) !== "pdf" ||
              !safeResourceUrl(selected.fileUrl)) && (
              <>
                {handTurn.turn && (
                  <div
                    className="section-turn-underlay"
                    aria-hidden="true"
                    inert
                  >
                    {boundaryPreview(handTurn.turn.direction)}
                  </div>
                )}
                {handTurn.turn && (
                  <TurnLeaf
                    turn={handTurn.turn}
                    rtl={dir === "rtl"}
                    twoPages={false}
                    front={<SectionSnapshot snapshot={handSnapshot.current} />}
                    back={boundaryPreview(handTurn.turn.direction)}
                  />
                )}
                <button
                  type="button"
                  className="page-hand-edge page-hand-previous"
                  disabled={!canStep(-1)}
                  aria-label={t({
                    en: "Previous section",
                    ar: "القسم السابق",
                  })}
                  onClick={() => {
                    handSnapshot.current = captureSectionPage(
                      page.current,
                      true,
                    );
                    handTurn.request(-1);
                  }}
                >
                  <ChevronLeft className="directional" size={17} />
                </button>
                <button
                  type="button"
                  className="page-hand-edge page-hand-next"
                  disabled={!canStep(1)}
                  aria-label={t({
                    en: "Next section",
                    ar: "القسم التالي",
                  })}
                  onClick={() => {
                    handSnapshot.current = captureSectionPage(
                      page.current,
                      false,
                    );
                    handTurn.request(1);
                  }}
                >
                  <ChevronRight className="directional" size={17} />
                </button>
              </>
            )}
          </section>
        </div>
      </div>
      <StudyToolsPanel
        courseId={course.id}
        storageKey={storageKey}
        sectionLayout={study.state.sectionLayout}
        onSectionLayoutChange={(sectionLayout) => {
          closePeek();
          study.update((previous) => ({ ...previous, sectionLayout }));
        }}
      />
    </div>
  );
}
