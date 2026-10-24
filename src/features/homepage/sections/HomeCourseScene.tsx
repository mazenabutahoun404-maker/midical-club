import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type { Course } from "../../../types/content";
import { CourseCard } from "../../../components/cards/CourseCard";
import { useLocale } from "../../../app/providers/LocaleProvider";
import { repel, springStep, type SpringAxis } from "../../../lib/spring-field";
import "../home-course-scene.css";
const mediaQuery = "(min-width: 820px) and (hover: hover) and (pointer: fine)";
import {
  bookPlacement as placement,
  constellationHit,
} from "../course-constellation";
import { Pill, Dna, CircleDot, Stethoscope } from "lucide-react";
const particleIcons = [Pill, Dna, CircleDot, Stethoscope];
type Body = {
  x: SpringAxis;
  y: SpringAxis;
  scale: SpringAxis;
  angle: SpringAxis;
};
const body = (scale = 1, angle = 0): Body => ({
  x: { position: 0, velocity: 0 },
  y: { position: 0, velocity: 0 },
  scale: { position: scale, velocity: 0 },
  angle: { position: angle, velocity: 0 },
});
export function HomeCourseScene({
  courses: suppliedCourses,
}: {
  courses: Course[];
}) {
  const courses = useMemo(() => suppliedCourses.slice(0, 8), [suppliedCourses]);
  const { dir, t } = useLocale();
  const [floating, setFloating] = useState(false);
  const preview = useRef<HTMLDivElement>(null),
    scene = useRef<HTMLDivElement>(null),
    books = useRef<(HTMLDivElement | null)[]>([]),
    particles = useRef<(HTMLSpanElement | null)[]>([]);
  const bodies = useRef<Body[]>([]),
    dust = useRef<Body[]>([]);
  const size = useRef({ width: 0, height: 0 }),
    bounds = useRef<DOMRect | null>(null),
    pointer = useRef<{ x: number; y: number } | null>(null);
  const selected = useRef(-1),
    visible = useRef(true),
    reduced = useRef(false),
    frame = useRef(0),
    last = useRef(0);
  function tick(time: number) {
    frame.current = 0;
    if (!visible.current || reduced.current || document.hidden || !floating)
      return;
    const dt = last.current
      ? Math.min((time - last.current) / 1000, 1 / 30)
      : 1 / 60;
    last.current = time;
    let moving = false;
    const paint = (
      node: HTMLElement | null,
      b: Body,
      target: { x: number; y: number; scale: number; angle?: number },
    ) => {
      if (!b) return;
      b.x = springStep(b.x, target.x, dt);
      b.y = springStep(b.y, target.y, dt);
      b.scale = springStep(b.scale, target.scale, dt, 170, 25);
      b.angle = springStep(b.angle, target.angle || 0, dt, 145, 23);
      moving ||=
        b.x.velocity !== 0 ||
        b.y.velocity !== 0 ||
        b.scale.velocity !== 0 ||
        b.angle.velocity !== 0 ||
        Math.abs(b.x.position - target.x) > 0.015 ||
        Math.abs(b.y.position - target.y) > 0.015 ||
        Math.abs(b.scale.position - target.scale) > 0.015 ||
        Math.abs(b.angle.position - (target.angle || 0)) > 0.015;
      node?.style.setProperty("--spring-x", `${b.x.position}px`);
      node?.style.setProperty("--spring-y", `${b.y.position}px`);
      node?.style.setProperty("--spring-scale", String(b.scale.position));
      node?.style.setProperty("--book-angle", `${b.angle.position}deg`);
    };
    const sign = dir === "rtl" ? -1 : 1;
    courses.forEach((_, i) => {
      const a = placement(i, courses.length),
        x = (dir === "rtl" ? 1 - a.x : a.x) * size.current.width,
        y = a.y * size.current.height;
      const push =
        pointer.current && selected.current !== i
          ? repel(x, y, pointer.current.x, pointer.current.y, 270, 23)
          : { x: 0, y: 0 };
      paint(books.current[i], bodies.current[i], {
        x: push.x,
        y: push.y + (selected.current === i ? -10 : 0),
        scale:
          selected.current === i
            ? 1.025
            : selected.current >= 0
              ? a.scale * 0.95
              : a.scale,
        angle: selected.current === i ? 0 : a.angle * sign,
      });
    });
    dust.current.forEach((b, i) => {
      const x = (0.07 + ((i * 37) % 89) / 100) * size.current.width,
        y = (0.13 + ((i * 23) % 71) / 100) * size.current.height;
      const push = pointer.current
        ? repel(x, y, pointer.current.x, pointer.current.y, 185, 76)
        : { x: 0, y: 0 };
      paint(particles.current[i], b, { ...push, scale: 1 });
    });
    if (moving) frame.current = requestAnimationFrame(tick);
    else last.current = 0;
  }
  function animate() {
    if (
      !frame.current &&
      floating &&
      visible.current &&
      !reduced.current &&
      !document.hidden
    )
      frame.current = requestAnimationFrame(tick);
  }
  function select(index: number) {
    if (selected.current === index) return;
    selected.current = index;
    books.current.forEach((node, i) =>
      node?.toggleAttribute("data-focused", i === index),
    );
    animate();
  }
  function reset() {
    pointer.current = null;
    select(-1);
    animate();
  }
  useLayoutEffect(() => {
    const container = preview.current;
    if (!container) return;
    const media = window.matchMedia(mediaQuery),
      sync = () => setFloating(media.matches && container.clientWidth >= 780);
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(sync);
    observer?.observe(container);
    sync();
    media.addEventListener("change", sync);
    window.addEventListener("resize", sync);
    return () => {
      observer?.disconnect();
      media.removeEventListener("change", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);
  useEffect(() => {
    const root = scene.current;
    if (!floating || !root) return;
    bodies.current = courses.map((_, i) =>
      body(
        placement(i, courses.length).scale,
        placement(i, courses.length).angle * (dir === "rtl" ? -1 : 1),
      ),
    );
    dust.current = Array.from({ length: 14 }, () => body());
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const preference = () => {
      reduced.current = motion.matches;
      root.toggleAttribute("data-reduced-motion", motion.matches);
      if (motion.matches) {
        cancelAnimationFrame(frame.current);
        frame.current = 0;
        last.current = 0;
        pointer.current = null;
        selected.current = -1;
        bodies.current = courses.map((_, i) =>
          body(
            placement(i, courses.length).scale,
            placement(i, courses.length).angle * (dir === "rtl" ? -1 : 1),
          ),
        );
        dust.current = Array.from({ length: 14 }, () => body());
        books.current.forEach((node, i) => {
          node?.removeAttribute("data-focused");
          node?.style.setProperty("--spring-x", "0px");
          node?.style.setProperty("--spring-y", "0px");
          node?.style.setProperty(
            "--book-angle",
            `${placement(i, courses.length).angle * (dir === "rtl" ? -1 : 1)}deg`,
          );
          node?.style.setProperty(
            "--spring-scale",
            String(placement(i, courses.length).scale),
          );
        });
        particles.current.forEach((node) => {
          node?.style.setProperty("--spring-x", "0px");
          node?.style.setProperty("--spring-y", "0px");
        });
      } else animate();
    };
    const measure = () => {
      size.current = { width: root.clientWidth, height: root.clientHeight };
      bounds.current = null;
      animate();
    };
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    observer?.observe(root);
    const visibility =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            (entries) => {
              visible.current = entries[0]?.isIntersecting ?? false;
              root.toggleAttribute(
                "data-running",
                visible.current && !document.hidden,
              );
              if (visible.current) {
                last.current = 0;
                animate();
              } else {
                cancelAnimationFrame(frame.current);
                frame.current = 0;
                last.current = 0;
              }
            },
            { threshold: 0.05 },
          );
    visibility?.observe(root);
    const hidden = () => {
      root.toggleAttribute("data-running", visible.current && !document.hidden);
      if (document.hidden) {
        cancelAnimationFrame(frame.current);
        frame.current = 0;
        last.current = 0;
      } else animate();
    };
    const invalidate = () => {
      bounds.current = null;
    };
    measure();
    preference();
    hidden();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", invalidate, {
      passive: true,
      capture: true,
    });
    motion.addEventListener("change", preference);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      last.current = 0;
      observer?.disconnect();
      visibility?.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", invalidate, true);
      motion.removeEventListener("change", preference);
      document.removeEventListener("visibilitychange", hidden);
      pointer.current = null;
      selected.current = -1;
    };
  }, [floating, courses, dir]);
  return (
    <div className="home-course-preview" ref={preview}>
      {!floating ? (
        <div
          className="home-books-touch"
          role="list"
          aria-label={t({ en: "Explore courses", ar: "استكشف المساقات" })}
        >
          {courses.map((course) => (
            <div
              className="home-book-touch"
              key={course.id}
              role="listitem"
              data-home-reveal="book"
            >
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      ) : (
        <div
          className="home-course-scene"
          ref={scene}
          dir={dir}
          data-book-count={courses.length}
          role="list"
          aria-label={t({
            en: "Explore medical courses",
            ar: "استكشف المساقات الطبية",
          })}
          onPointerEnter={() => {
            bounds.current = scene.current?.getBoundingClientRect() || null;
          }}
          onPointerMove={(event) => {
            if (event.pointerType !== "mouse") return;
            if (!bounds.current)
              bounds.current = event.currentTarget.getBoundingClientRect();
            pointer.current = {
              x: event.clientX - bounds.current.left,
              y: event.clientY - bounds.current.top,
            };
            select(
              constellationHit(
                pointer.current.x,
                pointer.current.y,
                size.current.width,
                size.current.height,
                courses.length,
                dir === "rtl",
                selected.current,
              ),
            );
            animate();
          }}
          onPointerLeave={reset}
          onFocusCapture={(event) => {
            const hit = (event.target as Element).closest<HTMLElement>(
              "[data-preview-book]",
            );
            if (hit) select(Number(hit.dataset.previewBook));
          }}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) reset();
          }}
        >
          <div className="home-book-orbit" aria-hidden="true">
            {Array.from({ length: 14 }, (_, i) => {
              const Icon = particleIcons[i % particleIcons.length];
              return (
                <span
                  className="home-book-particle"
                  key={i}
                  ref={(node) => {
                    particles.current[i] = node;
                  }}
                  style={{
                    left: `${7 + ((i * 37) % 89)}%`,
                    top: `${13 + ((i * 23) % 71)}%`,
                  }}
                >
                  <Icon size={i % 3 === 0 ? 26 : 18} strokeWidth={1.25} />
                </span>
              );
            })}
          </div>
          {courses.map((course, i) => {
            const a = placement(i, courses.length);
            return (
              <div
                className="home-book-spring"
                key={course.id}
                data-preview-book={i}
                ref={(node) => {
                  books.current[i] = node;
                }}
                role="listitem"
                style={
                  {
                    left: `${(dir === "rtl" ? 1 - a.x : a.x) * 100}%`,
                    top: `${a.y * 100}%`,
                    "--book-angle": `${a.angle * (dir === "rtl" ? -1 : 1)}deg`,
                    "--spring-scale": a.scale,
                  } as CSSProperties
                }
              >
                <div
                  className="home-book-arrival"
                  data-home-reveal="book"
                  data-home-step={i}
                >
                  <div className="home-book-hover">
                    <CourseCard course={course} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
