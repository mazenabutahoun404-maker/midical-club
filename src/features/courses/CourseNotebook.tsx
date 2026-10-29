import { resourceId, resourceRevision } from "../../lib/resource-identity";
import { bookMaterial } from "./book-material";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import type { PageAnchor } from "../../types/study-hub";
import { CourseEmptySection } from "./CourseEmptySection";
import "../../styles/course-reading-v1334.css";
import "../../styles/reader-layout-v1337.css";
import { CoursePublisherNotes } from "./CoursePublisherNotes";
import { StudentNotes } from "../utilities/StudentNotes";
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

export const studySectionKind = (kind: CourseSectionKind): CourseSectionKind =>
  kind === "guidance" || kind === "book" ? "notes" : kind;

export function CourseNotebook({
  course,
  resources,
  storageKey,
  canImportPdfs = false,
  importingPdfs = false,
  pdfImportError = false,
  onImportPdfs,
  onRemoveImportedPdf,
  fileSourcesPending = false,
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
  fileSourcesPending?: boolean;
}) {
  const { t, label, dir } = useLocale();
  const s = useStudyCopy();
  const paths = useWorkspacePaths();
  const { focus, setFocus, courseNavigationVisible } = useStudyChrome();
  const workspace = useWorkspace();
  const study = useStudyState(storageKey);
  const desk = useCourseDesk();
  const location = useLocation();
  const incomingNote = useRef("");
  const sectionLayout = resolveSectionLayout(
    study.state.sectionLayout,
    focus,
    courseNavigationVisible,
  );
  const ordered = useMemo(() => {
    const sections = course.sections.filter(
      (section) => !["guidance", "book"].includes(section.kind),
    );
    if (!sections.some((section) => section.kind === "notes"))
      sections.push({
        id: "notes",
        kind: "notes",
        title: { en: "Notes", ar: "الملاحظات" },
        description: {
          en: "Publisher and private course notes",
          ar: "ملاحظات الناشر وملاحظاتك الخاصة",
        },
        order: 3,
      });
    return sections.sort((a, b) => a.order - b.order);
  }, [course.sections]);
  const bySection = useMemo(
    () =>
      Object.fromEntries(
        ordered.map((section) => [
          section.kind,
          resources.filter(
            (resource) => studySectionKind(resource.kind) === section.kind,
          ),
        ]),
      ) as Partial<Record<CourseSectionKind, Resource[]>>,
    [ordered, resources],
  );
  const active =
    ordered.find(
      (section) => section.kind === studySectionKind(study.state.active),
    ) || ordered[0];
  useEffect(() => {
    const previousKind = study.current.current.active;
    if (["guidance", "book"].includes(previousKind))
      study.update((previous) => ({
        ...previous,
        active: "notes",
        sections: {
          ...previous.sections,
          notes: previous.sections[previousKind] || previous.sections.notes,
        },
      }));
  }, []);
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
      studySectionKind(resource.kind) === active?.kind &&
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
  const emptySection = !selected && active?.kind !== "overview" && active?.kind !== "notes" && visible.length === 0;
  const peekSection = ordered.find((section) => section.kind === peek);
  const peekResources = peek ? bySection[peek] || [] : [];
  const firstMaterial =
    resources.find((resource) => safeResourceUrl(resource.fileUrl)) ||
    resources[0];
  useEffect(() => {
    tools?.registerNoteOpener((anchor: PageAnchor, ownerCourse: string) => {
      const resource = resources.find((item) => resourceId(item) === anchor.resourceId);
      if (ownerCourse !== course.id || !resource || resourceRevision(resource) !== anchor.resourceRevision || (!resource.assetId && !safeResourceUrl(resource.fileUrl))) return false;
      open(resource, false);
      return true;
    });
    return () => tools?.registerNoteOpener(null);
  }, [tools?.registerNoteOpener, resources, course.id, active?.kind]);
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const id = query.get("pdf");
    if (!id || fileSourcesPending || incomingNote.current === location.search) return;
    const resource = resources.find((item) => item.id === id || resourceId(item) === id);
    const requested = Number(query.get("page"));
    const revision = query.get("revision");
    incomingNote.current = location.search;
    if (!resource || (!resource.assetId && !safeResourceUrl(resource.fileUrl)) || !Number.isSafeInteger(requested) || requested < 1 || (revision && revision !== resourceRevision(resource) && revision !== resource.updatedAt)) {
      toast.error(t(query.get("resume") === "1" ? { en: "This study file is unavailable or has changed. Open the course materials to choose another.", ar: "ملف الدراسة غير متاح أو تغيّر. افتح مواد المساق لاختيار ملف آخر." } : { en: "The note's PDF page is unavailable or its file has changed. The note is still saved.", ar: "صفحة PDF المرتبطة غير متاحة أو تغيّر الملف. الملاحظة ما زالت محفوظة." })); return;
    }
    study.update((previous) => ({ ...previous, resources: { ...previous.resources, [resource.id]: { scroll: 0, seconds: previous.resources[resource.id]?.seconds || 0, page: requested } } }));
    open(resource, false);
    if (query.get("resume") !== "1") tools?.openNote({ resourceId: resourceId(resource), resourceRevision: resourceRevision(resource), page: requested, x: .85, y: .1 }, course.id);
  }, [location.search, resources, fileSourcesPending]);

  const incomingSection = useRef("");
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const kind = query.get("section");
    if (query.has("pdf") || !kind || fileSourcesPending || incomingSection.current === location.search) return;
    if (ordered.some((section) => section.kind === kind)) {
      incomingSection.current = location.search;
      select(kind as CourseSectionKind, false);
    }
  }, [location.search, fileSourcesPending]);

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
    if (kind !== "notes" && kind !== active.kind && files.length === 1) {
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
    const kind = studySectionKind(resource.kind);
    rememberSection();
    switching.current = kind !== active.kind;
    if (animate) animateTo(kind);
    study.update((previous) => ({
      ...previous,
      active: kind,
      lastResourceId: resource.id,
      sections: {
        ...previous.sections,
        [kind]: {
          scroll: previous.sections[kind]?.scroll || 0,
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
    suppressed.current = kind;
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
    const timeout = setTimeout(() => setTurn(null), 560);
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
      data-leather={bookMaterial(course.id)}
      data-course-tone={course.accent}
      data-focus={focus || undefined}
      data-section-layout={sectionLayout}
      data-sections-hidden={railClosed || undefined}
      data-split={study.state.split || undefined}
      data-reading={selected ? "resource" : "section"}
      data-empty-section={emptySection || undefined}
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
            tabIndex={railClosed ? -1 : 0}
            aria-label={label("courseSections")}
            inert={railClosed || undefined}
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
                page.current?.focus({ preventScroll: true });
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
            tabIndex={-1}
            id="notebook-reading-page"
            className="notebook-reading-page"
            aria-labelledby="notebook-section-heading"
          >
            {!selected && railClosed && (
              <button
                type="button"
                className="notebook-sections-reopen"
                aria-label={t({
                  en: "Show course sections",
                  ar: "إظهار أقسام المساق",
                })}
                onClick={() => setRailClosed(false)}
              >
                <BookOpen size={16} />
                {t({ en: "Sections", ar: "الأقسام" })}
              </button>
            )}
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
                    onShowSections={
                      railClosed
                        ? () => {
                            setRailClosed(false);
                            requestAnimationFrame(() =>
                              rail.current
                                ?.querySelector<HTMLButtonElement>(
                                  "[data-notebook-section]",
                                )
                                ?.focus({ preventScroll: true }),
                            );
                          }
                        : undefined
                    }
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
                    {active.kind === "notes" && (
                      <CoursePublisherNotes
                        courseId={course.id}
                        initial={course.publisherNotes}
                        canEdit={canImportPdfs}
                      />
                    )}
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
                      <CourseEmptySection />
                    )}
                    {active.kind === "notes" && (
                      <div className="course-private-notes">
                        <StudentNotes
                          courseId={course.id}
                          legacyKey={storageKey}
                          onlyCourse
                          resources={resources}
                          reader={tools?.reader}
                          onOpenAnchor={tools?.openNote}
                        />
                      </div>
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
                data-transition="ribbon"
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
            {(!selected || resourceMediaType(selected) !== "pdf") && (
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
                <nav
                  className="notebook-section-turn-controls"
                  aria-label={t({ en: "Section navigation", ar: "التنقل بين الأقسام" })}
                >
                  <button
                    type="button"
                    className="notebook-section-turn-button"
                    disabled={!canStep(-1) || !!handTurn.turn}
                    aria-label={t({
                      en: "Previous section",
                      ar: "القسم السابق",
                    })}
                    onClick={() => {
                      if (handTurn.turn) return;
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
                    className="notebook-section-turn-button"
                    disabled={!canStep(1) || !!handTurn.turn}
                    aria-label={t({
                      en: "Next section",
                      ar: "القسم التالي",
                    })}
                    onClick={() => {
                      if (handTurn.turn) return;
                      handSnapshot.current = captureSectionPage(
                        page.current,
                        false,
                      );
                      handTurn.request(1);
                    }}
                  >
                    <ChevronRight className="directional" size={17} />
                  </button>
                </nav>
              </>
            )}
          </section>
        </div>
      </div>
      <StudyToolsPanel
        courseId={course.id}
        storageKey={storageKey}
        resources={resources}
        sectionLayout={study.state.sectionLayout}
        onSectionLayoutChange={(sectionLayout) => {
          closePeek();
          study.update((previous) => ({ ...previous, sectionLayout }));
        }}
      />
    </div>
  );
}
