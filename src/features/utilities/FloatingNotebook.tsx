import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Minus, StickyNote } from "lucide-react";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useOverlays } from "../../app/providers/OverlayProvider";
import { StudentNotes } from "./StudentNotes";
import { useFloatingNotebook } from "./useFloatingNotebook";
import "../../styles/floating-notebook.css";
export default function FloatingNotebook() {
  const { snapshot } = useAuth();
  const owner =
    snapshot.status === "authenticated"
      ? snapshot.user?.id || "guest"
      : "guest";
  return <Notebook key={owner} owner={owner} />;
}
function Notebook({ owner }: { owner: string }) {
  const { notesOpen, hideNotes } = useOverlays();
  const { t, dir } = useLocale();
  const dock = useFloatingNotebook(owner, notesOpen),
    heading = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    if (notesOpen) heading.current?.focus({ preventScroll: true });
  }, [notesOpen]);
  function hide() {
    hideNotes();
    requestAnimationFrame(() => {
      const trigger = [
        ...document.querySelectorAll<HTMLButtonElement>("[data-notes-trigger]"),
      ].find((node) => {
        const r = node.getBoundingClientRect();
        return r.width > 0 && r.top >= 0 && r.bottom <= innerHeight;
      });
      trigger?.focus({ preventScroll: true });
    });
  }
  return createPortal(
    <>
      <aside
        ref={dock.root}
        id="global-notebook"
        role="region"
        aria-labelledby="global-notebook-title"
        className="floating-notebook"
        hidden={!notesOpen}
        style={dock.style}
        dir={dir}
        onKeyDown={(e) => {
          if (e.key === "Escape" && !document.querySelector("dialog[open]")) {
            e.preventDefault();
            e.stopPropagation();
            hide();
          }
        }}
      >
        <button
          type="button"
          className="notebook-grip"
          {...dock.grip}
          aria-label={t({
            en: "Move notebook. Drag, or use arrow keys. Home resets position.",
            ar: "حرك الدفتر بالسحب أو مفاتيح الأسهم. Home يعيد موضعه.",
          })}
        ><span aria-hidden="true" /></button>
        <header className="floating-notebook-bar">
          <StickyNote size={18} aria-hidden="true" />
          <h2 id="global-notebook-title" tabIndex={-1} ref={heading}>
            {t({ en: "My notebook", ar: "دفتر ملاحظاتي" })}
          </h2>
          <button
            type="button"
            onClick={hide}
            aria-label={t({ en: "Hide notebook", ar: "إخفاء الدفتر" })}
          >
            <Minus size={20} />
          </button>
        </header>
        <div className="floating-notebook-body">
          <StudentNotes />
        </div>

      </aside>
    </>,
    document.body,
  );
}
