import {
  cloneElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { Settings2 } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";

export function ShelfPaperControl({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactElement<{ "aria-describedby"?: string }>;
  className?: string;
}) {
  const id = useId();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hovered = useRef(false),
    focused = useRef(false);
  const [visible, setVisible] = useState(false);
  const hide = () => {
    clearTimeout(timer.current);
    setVisible(false);
  };
  const reveal = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(true), 500);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <span
      className={`shelf-paper-control ${className}`}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") {
          hovered.current = true;
          reveal();
        }
      }}
      onPointerLeave={() => {
        hovered.current = false;
        if (!focused.current) hide();
      }}
      onFocusCapture={(event) => {
        focused.current = event.target.matches(":focus-visible");
        if (focused.current) reveal();
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          focused.current = false;
          if (!hovered.current) hide();
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && visible) {
          event.stopPropagation();
          hide();
        }
      }}
    >
      <span className="shelf-control-paper" aria-hidden="true" />
      {cloneElement(children, { "aria-describedby": visible ? id : undefined })}
      <span className="shelf-control-caption" aria-hidden="true">
        {label}
      </span>
      <span
        id={id}
        role="tooltip"
        className="shelf-control-tooltip"
        hidden={!visible}
      >
        {label}
      </span>
    </span>
  );
}

export function CourseShelfControls({ children }: { children: ReactNode }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);
  return (
    <div
      ref={root}
      className="course-shelf-controls notebook-tools"
      data-open={open || undefined}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.stopPropagation();
          setOpen(false);
          trigger.current?.focus({ preventScroll: true });
        }
      }}
    >
      <ShelfPaperControl
        className="shelf-mobile-control"
        label={t({ en: "Course controls", ar: "خيارات المساق" })}
      >
        <button
          ref={trigger}
          type="button"
          className="notebook-icon-button"
          aria-label={t({ en: "Course controls", ar: "خيارات المساق" })}
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((value) => !value)}
        >
          <Settings2 size={18} aria-hidden="true" />
        </button>
      </ShelfPaperControl>
      <div
        id={id}
        className="shelf-controls-content"
        role="group"
        aria-label={t({
          en: "Appearance and study layout",
          ar: "المظهر وتخطيط الدراسة",
        })}
      >
        {children}
      </div>
    </div>
  );
}
