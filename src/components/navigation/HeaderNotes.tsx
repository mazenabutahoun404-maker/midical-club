import { useRef, useEffect } from "react";
import { useOverlays } from "../../app/providers/OverlayProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { NavigationHint } from "./NavigationHint";
import "../../styles/floating-notebook.css";
export function HeaderNotes({ hint = true }: { hint?: boolean } = {}) {
  const { notesOpen, toggleNotes } = useOverlays();
  const glyph = useRef<HTMLSpanElement>(null);
  const motion = useRef<Animation | null>(null);
  useEffect(() => () => motion.current?.cancel(), []);
  function animate(pressed = false) {
    if (!glyph.current || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    motion.current?.cancel();
    motion.current = glyph.current.animate([
      { transform: "perspective(80px) rotateY(0deg) rotate(0deg) scale(1)" },
      { transform: `perspective(80px) rotateY(${pressed ? -32 : -20}deg) rotate(-12deg) scale(${pressed ? .86 : 1.08})`, offset: .35 },
      { transform: "perspective(80px) rotateY(12deg) rotate(5deg) scale(1.04)", offset: .7 },
      { transform: "perspective(80px) rotateY(0deg) rotate(0deg) scale(1)" },
    ], { duration: pressed ? 420 : 500, easing: "cubic-bezier(.2,.7,.2,1)" });
  }
  const { t } = useLocale();
  const title = t({ en: "My notes", ar: "ملاحظاتي" });
  const button = (
    <button
      type="button"
      className="workspace-icon header-notes"
      data-notes-trigger
      aria-label={title}
      aria-expanded={notesOpen}
      aria-controls="global-notebook"
      onPointerEnter={(e) => { if (e.pointerType === "mouse") animate(); }}
      onFocus={() => animate()}
      onClick={() => { animate(true); toggleNotes(); }}
    >
      <span ref={glyph} className="notes-glyph" aria-hidden="true">
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 14V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7l7-7Z" />
          <path className="notes-glyph-fold" d="M13 21v-5a2 2 0 0 1 2-2h5" />
          <path className="notes-glyph-lines" d="M8 8h8M8 12h5" />
        </svg>
      </span>
    </button>
  );
  return hint ? (
    <NavigationHint label={title}>{button}</NavigationHint>
  ) : (
    button
  );
}
