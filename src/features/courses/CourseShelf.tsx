import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "../../components/navigation/AppLink";
import {
  useBatches,
  useClinicalYears,
  useCourses,
} from "../../hooks/useContent";
import { useWorkspacePaths } from "../../hooks/useWorkspacePaths";
import type { Course } from "../../types/content";
import { shelfCourses } from "./course-shelf";

/** A bounded shelf: native touch scrolling, mouse dragging, arrows and link keys. */
export function CourseShelf({
  course,
  showCaption = true,
}: {
  course: Course;
  showCaption?: boolean;
}) {
  const { t, dir } = useLocale(),
    paths = useWorkspacePaths();
  const courses = useCourses(),
    batches = useBatches(),
    years = useClinicalYears();
  const available = shelfCourses(
    course,
    courses.data || [course],
    batches.data || [],
    years.data || [],
  );
  const viewport = useRef<HTMLDivElement>(null);
  const gesture = useRef<{
    pointer: number;
    x: number;
    y: number;
    scroll: number;
    dragging: boolean;
  } | null>(null);
  const suppressClickUntil = useRef(0);
  const [edges, setEdges] = useState({ before: false, after: false });
  const [dragging, setDragging] = useState(false);
  const measure = () => {
    const node = viewport.current;
    if (!node) return;
    const position = Math.max(
      0,
      dir === "rtl" ? -node.scrollLeft : node.scrollLeft,
    );
    const next = {
      before: position > 2,
      after: position < node.scrollWidth - node.clientWidth - 2,
    };
    setEdges((previous) =>
      previous.before === next.before && previous.after === next.after
        ? previous
        : next,
    );
  };
  const reveal = (item: HTMLElement | null) => {
    const node = viewport.current;
    if (!node || !item) return;
    const area = node.getBoundingClientRect(),
      bounds = item.getBoundingClientRect();
    const delta =
      bounds.left < area.left
        ? bounds.left - area.left
        : bounds.right > area.right
          ? bounds.right - area.right
          : 0;
    if (delta) node.scrollLeft += delta;
    measure();
  };
  useLayoutEffect(() => {
    const node = viewport.current;
    if (!node) return;
    reveal(node.querySelector('[aria-current="page"]'));
    const resized = () => {
      reveal(node.querySelector('[aria-current="page"]'));
      measure();
    };
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(resized)
        : null;
    observer?.observe(node);
    window.addEventListener("resize", resized);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", resized);
    };
  }, [course.id, available.map((item) => item.id).join("|"), dir]);
  const browse = (forward: boolean) => {
    const node = viewport.current;
    if (!node) return;
    const max = Math.max(0, node.scrollWidth - node.clientWidth);
    const current = dir === "rtl" ? -node.scrollLeft : node.scrollLeft;
    const next = Math.max(
      0,
      Math.min(
        max,
        current + (forward ? 1 : -1) * Math.max(84, node.clientWidth * 0.8),
      ),
    );
    const left = dir === "rtl" ? -next : next;
    if (typeof node.scrollTo === "function")
      node.scrollTo({
        left,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    else node.scrollLeft = left;
    measure();
  };
  const finish = (pointer: number) => {
    if (gesture.current?.pointer !== pointer) return;
    if (gesture.current.dragging)
      suppressClickUntil.current = performance.now() + 450;
    gesture.current = null;
    setDragging(false);
    if (viewport.current?.hasPointerCapture?.(pointer))
      viewport.current.releasePointerCapture(pointer);
    measure();
  };
  return (
    <nav
      className="course-shelf"
      data-dragging={dragging || undefined}
      data-overflow={edges.before || edges.after || undefined}
      style={
        {
          "--shelf-content-width": `${Math.max(84, available.length * 92 - 8)}px`,
        } as CSSProperties
      }
      aria-label={t({ en: "Courses on this shelf", ar: "مساقات هذا الرف" })}
    >
      {showCaption && (
        <div className="course-shelf-caption">
          <bdi>{course.code}</bdi>
          <strong>{t(course.title)}</strong>
        </div>
      )}
      <div className="course-shelf-window">
        <button
          type="button"
          className="shelf-browse shelf-browse-before"
          disabled={!edges.before}
          aria-label={t({ en: "Previous books", ar: "الكتب السابقة" })}
          onClick={() => browse(false)}
        >
          {dir === "rtl" ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
        </button>
        <div
          ref={viewport}
          className="course-shelf-scroll"
          onScroll={measure}
          onPointerDown={(event) => {
            if (event.pointerType === "touch" || event.button !== 0) return;
            gesture.current = {
              pointer: event.pointerId,
              x: event.clientX,
              y: event.clientY,
              scroll: event.currentTarget.scrollLeft,
              dragging: false,
            };
          }}
          onPointerMove={(event) => {
            const start = gesture.current;
            if (!start || start.pointer !== event.pointerId) return;
            const delta = event.clientX - start.x;
            if (!start.dragging) {
              if (
                Math.abs(delta) < 6 ||
                Math.abs(delta) < Math.abs(event.clientY - start.y)
              )
                return;
              start.dragging = true;
              setDragging(true);
              event.currentTarget.setPointerCapture?.(event.pointerId);
            }
            event.preventDefault();
            event.currentTarget.scrollLeft = start.scroll - delta;
            measure();
          }}
          onPointerUp={(event) => finish(event.pointerId)}
          onPointerCancel={(event) => finish(event.pointerId)}
          onLostPointerCapture={(event) => finish(event.pointerId)}
          onClickCapture={(event) => {
            if (
              event.detail > 0 &&
              performance.now() < suppressClickUntil.current
            ) {
              event.preventDefault();
              event.stopPropagation();
            }
          }}
          onKeyDown={(event) => {
            const links = [
              ...event.currentTarget.querySelectorAll<HTMLAnchorElement>(
                ".shelf-book",
              ),
            ];
            const index = links.indexOf(
              document.activeElement as HTMLAnchorElement,
            );
            if (index < 0) return;
            const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight",
              back = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
            const next =
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? links.length - 1
                  : event.key === forward
                    ? Math.min(index + 1, links.length - 1)
                    : event.key === back
                      ? Math.max(index - 1, 0)
                      : undefined;
            if (next !== undefined) {
              event.preventDefault();
              links[next]?.focus({ preventScroll: true });
              reveal(links[next]);
            }
          }}
        >
          <div className="course-shelf-books">
            {available.map((item) => (
              <AppLink
                key={item.id}
                href={paths.course(item.slug)}
                className={`shelf-book shelf-book-${item.accent}`}
                data-course-id={item.id}
                aria-label={`${t(item.title)} · ${item.code}`}
                title={t(item.title)}
                aria-current={item.id === course.id ? "page" : undefined}
                draggable={false}
                onDragStart={(event) => event.preventDefault()}
                onFocus={(event) => reveal(event.currentTarget)}
                onClick={(event) => {
                  if (item.id === course.id) event.preventDefault();
                }}
              >
                <span className="shelf-book-cover" aria-hidden="true">
                  <bdi>{item.code}</bdi>
                  <strong>{t(item.title)}</strong>
                  <i />
                </span>
              </AppLink>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="shelf-browse shelf-browse-after"
          disabled={!edges.after}
          aria-label={t({ en: "Next books", ar: "الكتب التالية" })}
          onClick={() => browse(true)}
        >
          {dir === "rtl" ? (
            <ChevronLeft size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
        </button>
        <span className="course-shelf-lip" aria-hidden="true">
          <i />
          <i />
        </span>
      </div>
    </nav>
  );
}
