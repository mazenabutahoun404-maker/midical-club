import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Brain, Pencil, Trash2 } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import type { StudentNote } from "./student-notes";

export function noteSwipeResult(
  distance: number,
  width: number,
): "closed" | "reveal" | "delete" {
  if (distance >= Math.max(140, width * 0.8)) return "delete";
  return distance >= 32 ? "reveal" : "closed";
}
export function NoteCard({
  note,
  courseTitle,
  onEdit,
  onDelete,
  removing,
  onOpen,
  linked = false,
  color,
  fileTitle,
  outdated,
  onRecall,
  busy = false,
}: {
  note: StudentNote;
  courseTitle?: string;
  onEdit: () => void;
  onDelete: () => void | Promise<void>;
  removing: boolean;
  onOpen?: () => void;
  linked?: boolean;
  color?: "amber" | "mint" | "rose";
  fileTitle?: string;
  outdated?: boolean;
  onRecall?: () => void | Promise<void>;
  busy?: boolean;
}) {
  const { t, locale } = useLocale();
  const [offset, setOffset] = useState(0),
    [dragging, setDragging] = useState(false);
  const gesture = useRef<{
    id: number;
    x: number;
    y: number;
    width: number;
    start: number;
    horizontal: boolean;
  } | null>(null);
  const suppress = useRef(0),
    wasRemoving = useRef(removing);
  useEffect(() => {
    if (wasRemoving.current && !removing) setOffset(0);
    wasRemoving.current = removing;
  }, [removing]);
  return (
    <article
      className="student-note-row"
      data-note-id={note.id}
      tabIndex={onOpen ? undefined : 0}
      data-note-type={linked ? "course" : "general"}
      data-note-color={color}
      data-removing={removing || undefined}
      data-swiping={dragging || undefined}
      style={{ "--note-swipe": `${offset}px` } as CSSProperties}
      onClickCapture={(event) => {
        if (event.detail > 0 && Date.now() < suppress.current) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
      onPointerDown={(event) => {
        if (
          event.pointerType !== "touch" ||
          removing ||
          (event.target as HTMLElement).closest(".note-swipe-delete")
        )
          return;
        gesture.current = {
          id: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          width: event.currentTarget.getBoundingClientRect().width || 280,
          start: offset,
          horizontal: false,
        };
      }}
      onPointerMove={(event) => {
        const current = gesture.current;
        if (!current || current.id !== event.pointerId) return;
        const dx = event.clientX - current.x,
          dy = event.clientY - current.y;
        if (!current.horizontal) {
          if (window.getSelection()?.isCollapsed === false) {
            gesture.current = null;
            return;
          }
          if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
            gesture.current = null;
            return;
          }
          if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
          current.horizontal = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          setDragging(true);
        }
        event.preventDefault();
        setOffset(Math.max(-current.width, Math.min(0, current.start + dx)));
      }}
      onPointerUp={(event) => {
        const current = gesture.current;
        if (!current || current.id !== event.pointerId) return;
        gesture.current = null;
        setDragging(false);
        if (!current.horizontal) return;
        event.currentTarget.releasePointerCapture(event.pointerId);
        suppress.current = Date.now() + 300;
        const result = noteSwipeResult(
          Math.max(0, -(current.start + event.clientX - current.x)),
          current.width,
        );
        if (result === "delete") {
          setOffset(-current.width);
          Promise.resolve(onDelete()).then(
            () => setOffset(0),
            () => setOffset(0),
          );
        } else setOffset(result === "reveal" ? -72 : 0);
      }}
      onPointerCancel={() => {
        gesture.current = null;
        setDragging(false);
        setOffset(0);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOffset(0);
        }
      }}
    >
      <button
        type="button"
        className="note-swipe-delete"
        hidden={offset === 0}
        disabled={removing || busy}
        aria-label={t({ en: "Delete note", ar: "حذف الملاحظة" })}
        onClick={onDelete}
      >
        <Trash2 size={18} />
      </button>
      <div className="student-note-face">
        <div className="student-note-copy">
        {onOpen ? <button type="button" className="student-note-open" onClick={onOpen}>
          <strong>
            {note.title || t({ en: "Untitled note", ar: "ملاحظة بلا عنوان" })}
          </strong>
          <p>{note.body || t({ en: "No description", ar: "لا يوجد وصف" })}</p>
          <small>{fileTitle}</small>
          <small>
            {courseTitle || t({ en: "General", ar: "عامة" })} ·{" "}
            {new Intl.DateTimeFormat(locale, {
              month: "short",
              day: "numeric",
            }).format(new Date(note.updatedAt))}
          </small>
        </button> : <div className="student-note-text">
          {note.title && <strong>{note.title}</strong>}
          <p tabIndex={note.body.length > 500 ? 0 : undefined}>{note.body || t({ en: "No description", ar: "لا يوجد وصف" })}</p>
          <small>{courseTitle || t({ en: "General note", ar: "ملاحظة عامة" })}</small>
        </div>}
        {outdated && <small className="note-revision-warning">{t({ en: "Earlier PDF revision", ar: "إصدار PDF سابق" })}</small>}
        </div>
        <div className="student-note-item-actions">
        <button
          type="button"
          className="student-note-edit"
          onClick={onEdit}
          disabled={removing || busy}
          title={t({ en: "Edit note", ar: "تعديل الملاحظة" })}
          aria-label={
            t({ en: "Edit note", ar: "تعديل الملاحظة" }) +
            ": " +
            (note.title || t({ en: "Untitled note", ar: "ملاحظة بلا عنوان" }))
          }
        >
          <Pencil size={16} />
        </button>
        <button type="button" className="student-note-item-delete" disabled={removing || busy} onClick={onDelete}
          aria-label={t({ en: "Delete note", ar: "حذف الملاحظة" })} title={t({ en: "Delete note", ar: "حذف الملاحظة" })}><Trash2 size={16} /></button>
        {onRecall && <button type="button" disabled={removing || busy} onClick={onRecall} aria-label={t({ en: "Create recall card", ar: "إنشاء بطاقة استرجاع" })} title={t({ en: "Create recall card", ar: "إنشاء بطاقة استرجاع" })}><Brain size={16} /></button>}
        </div>
      </div>
    </article>
  );
}
