import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BookMarked,
  BookOpen,
  CircleHelp,
  ClipboardList,
  Columns2,
  FileText,
  Film,
  Focus,
  Globe2,
  LayoutDashboard,
  Lightbulb,
  Maximize2,
  X,
} from "lucide-react";
import type { Course, CourseSectionKind, Resource } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useStudyChrome } from "../../app/providers/StudyChromeProvider";
import { useWorkspace } from "../../app/providers/WorkspaceProvider";
import { EmptyState } from "../../components/feedback/EmptyState";
import { AppLink } from "../../components/navigation/AppLink";
import { useWorkspacePaths } from "../../hooks/useWorkspacePaths";
import { formatDate } from "../../lib/dates";
import { useStudyCopy } from "./study-copy";
import { useStudyState } from "./useStudyState";
import { StudyResourceViewer } from "./StudyResourceViewer";
import { NotebookResourceCard } from "./NotebookResourceCard";
import { safeResourceUrl, type StudyPosition } from "./study-state";

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
}: {
  course: Course;
  resources: Resource[];
  storageKey: string;
}) {
  const { t, label, locale, dir } = useLocale();
  const s = useStudyCopy();
  const paths = useWorkspacePaths();
  const { focus, setFocus } = useStudyChrome();
  const workspace = useWorkspace();
  const study = useStudyState(storageKey);
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
  const [mobileIndex, setMobileIndex] = useState(false);
  const page = useRef<HTMLElement>(null);
  const book = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
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
    resources.find((resource) => resource.kind === "guidance") || resources[0];

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
    if (suppressed.current === kind || kind === active.kind || focus) {
      setPeek(null);
      return;
    }
    suppressed.current = null;
    const spread = book.current?.querySelector(".notebook-spread");
    if (spread) {
      const bounds = element.getBoundingClientRect();
      const top = Math.min(bounds.top, Math.max(80, window.innerHeight - 380));
      setPeekTop(Math.max(20, top - spread.getBoundingClientRect().top));
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
    if (
      !focus &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      setTurn((previous) => ({ id: (previous?.id || 0) + 1, backwards }));
  }
  function rememberSection() {
    if (!page.current || !activeRef.current || restoring.current) return;
    const top = page.current.getBoundingClientRect().top + window.scrollY;
    const scroll = Math.max(0, window.scrollY - top);
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
  function select(kind: CourseSectionKind) {
    rememberSection();
    switching.current = kind !== active.kind;
    animateTo(kind);
    suppressed.current = kind;
    setMobileIndex(false);
    study.update((previous) => ({ ...previous, active: kind }));
  }
  function open(resource: Resource) {
    rememberSection();
    switching.current = resource.kind !== active.kind;
    animateTo(resource.kind);
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
    if (!workspace.isPending && !workspace.isError)
      void workspace.send({ type: "view-resource", id: resource.id });
    setMobileIndex(false);
  }
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
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", scroll);
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
    const shouldRestore = offset > 0 || (visited.current && switched);
    visited.current = true;
    if (!shouldRestore) return;
    restoring.current = true;
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => {
        if (page.current) {
          const top = page.current.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: Math.max(0, top + offset - (offset ? 0 : 76)),
            behavior: "instant",
          });
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
  if (!active) return <EmptyState />;

  return (
    <div
      ref={book}
      className="study-notebook"
      data-course-tone={course.accent}
      data-focus={focus || undefined}
      data-split={study.state.split || undefined}
      dir={dir}
    >
      <div className="notebook-toolbar">
        <div className="notebook-current-course">
          <BookOpen size={20} aria-hidden="true" />
          <div>
            <span>
              {s("notebook")} · <bdi>{course.code}</bdi>
            </span>
            <strong>{t(course.title)}</strong>
          </div>
        </div>
        <div className="notebook-tools">
          <button
            type="button"
            className="notebook-button"
            aria-pressed={focus}
            onClick={() => setFocus(!focus)}
          >
            {focus ? <Maximize2 size={17} /> : <Focus size={17} />}
            {s(focus ? "exitFocus" : "focus")}
          </button>
          <button
            type="button"
            className="notebook-button"
            aria-pressed={study.state.split}
            onClick={() => {
              closePeek();
              study.update((previous) => ({
                ...previous,
                split: !previous.split,
              }));
            }}
          >
            <Columns2 size={17} />
            {s(study.state.split ? "single" : "split")}
          </button>
        </div>
      </div>
      <div className="notebook-object">
        <div className="notebook-back-cover" aria-hidden="true" />
        <div className="notebook-page-stack" aria-hidden="true" />
        <div className="notebook-spread">
          <aside
            className="notebook-index"
            data-mobile-open={mobileIndex || undefined}
          >
            <div className="notebook-index-heading">
              <span>{s("index")}</span>
              <bdi>{course.code}</bdi>
            </div>
            <button
              type="button"
              className="notebook-mobile-index"
              aria-expanded={mobileIndex}
              aria-controls="notebook-bookmarks"
              onClick={() => setMobileIndex((value) => !value)}
            >
              <BookMarked size={17} />
              {t(active.title)}
              <span>{s("contents")}</span>
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
                    aria-current={
                      active.kind === section.kind ? "page" : undefined
                    }
                    aria-controls="notebook-reading-page"
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
            <div className="notebook-colophon">
              <span>{label("batch")}</span>
              <strong>{t(course.batch)}</strong>
              <span>
                {s("updated")} {formatDate(course.lastUpdated, locale)}
              </span>
              <AppLink href={paths.learning}>
                {label("allCoursesLink")}
                <ArrowUpRight size={14} className="directional" />
              </AppLink>
            </div>
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
            <div className="notebook-page-running">
              <span>{s("notebook")}</span>
              <span aria-live="polite" aria-atomic="true">
                {t(active.title)} ·{" "}
                {ordered.findIndex((section) => section.kind === active.kind) +
                  1}{" "}
                / {ordered.length}
              </span>
            </div>
            <header className="notebook-section-heading">
              <div>
                <span>
                  {label(
                    active.kind === "overview" ? "beginHere" : "materials",
                  )}
                </span>
                <h2 ref={title} id="notebook-section-heading" tabIndex={-1}>
                  {t(active.title)}
                </h2>
                <p>{t(active.description)}</p>
              </div>
              <BookMarked size={26} aria-hidden="true" />
            </header>
            {selected && (
              <button
                type="button"
                className="notebook-return"
                onClick={closeResource}
              >
                <ArrowLeft size={16} className="directional" />
                {s("return")}
              </button>
            )}
            <div
              className="notebook-study-layout"
              style={
                { "--reading-width": `${study.state.width}%` } as CSSProperties
              }
            >
              <div className="notebook-primary-pane">
                {selected ? (
                  <StudyResourceViewer
                    key={`main:${selected.id}`}
                    item={selected}
                    position={study.state.resources[selected.id]}
                    onPosition={(position) =>
                      savePosition(selected.id, position)
                    }
                    onClose={closeResource}
                  />
                ) : active.kind === "overview" ? (
                  <div className="notebook-overview">
                    <div className="notebook-orientation">
                      <Lightbulb size={22} aria-hidden="true" />
                      <p>{label("overviewBody")}</p>
                    </div>
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
                    <h3>{label("learningOutcomes")}</h3>
                    <ol className="notebook-outcomes">
                      {course.outcomes.map((outcome, index) => (
                        <li key={outcome.en}>
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          <p>{t(outcome)}</p>
                        </li>
                      ))}
                    </ol>
                    <button
                      type="button"
                      className="notebook-button notebook-button-quiet"
                      onClick={() =>
                        select(
                          ordered.find((section) => section.kind === "guidance")
                            ?.kind ||
                            ordered[1]?.kind ||
                            "overview",
                        )
                      }
                    >
                      {label("openSection")}
                      <ArrowUpRight size={16} className="directional" />
                    </button>
                  </div>
                ) : visible.length ? (
                  <div className="resource-grid course-material-grid notebook-material-grid">
                    {visible.map((resource) => (
                      <NotebookResourceCard
                        key={resource.id}
                        resource={resource}
                        course={course}
                        seconds={study.state.resources[resource.id]?.seconds}
                        onOpen={() => open(resource)}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title={label("emptyTitle")}
                    description={label("emptyBody")}
                  />
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
            <footer className="notebook-page-footer">
              <span>
                {courseResourcesLabel(
                  resources.length,
                  label("resourcesCount"),
                )}
              </span>
              <span>{s(study.persistent ? "saved" : "session")}</span>
            </footer>
            {turn && (
              <div
                key={turn.id}
                className="notebook-turn-sheet"
                data-backwards={turn.backwards || undefined}
                aria-hidden="true"
                onAnimationEnd={() => setTurn(null)}
              >
                <div />
                <i />
                <b />
              </div>
            )}
          </section>
          {peekSection && (
            <aside
              className="notebook-peek"
              style={{ top: peekTop }}
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
                    src={safeResourceUrl(peekResources[0].preview.thumbnailUrl)}
                    alt={t(peekResources[0].title)}
                    loading="lazy"
                  />
                )}
              <ul>
                {peekSection.kind === "overview" ? (
                  course.outcomes
                    .slice(0, 3)
                    .map((outcome) => <li key={outcome.en}>{t(outcome)}</li>)
                ) : peekResources.length ? (
                  peekResources.slice(0, 3).map((resource) => (
                    <li key={resource.id}>
                      <strong>{t(resource.title)}</strong>
                      <span>
                        {resource.durationMinutes
                          ? `${resource.durationMinutes} ${s("minutes")}`
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
        </div>
      </div>
    </div>
  );
}

function courseResourcesLabel(count: number, label: string) {
  return `${count} ${label}`;
}
