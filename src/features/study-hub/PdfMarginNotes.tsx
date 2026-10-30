import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useHubQuery, useStudyHub } from "./useStudyHub";
import { useStudyTools } from "../courses/StudyTools";
import { StudentNotes } from "../utilities/StudentNotes";
import type { CourseNoteRequest } from "../utilities/course-note-model";
import type { Resource } from "../../types/content";
import type { MarginNote, PageAnchor } from "../../types/study-hub";
import "./study-hub.css";

/** The PDF and the shared Notes desk read the same versioned course-note records. */
export function usePdfMargins(item: Resource, page: number) {
  const { owner, service } = useStudyHub(), { t } = useLocale();
  const tools = useStudyTools();
  const notes = useHubQuery("margins", (signal) => service.listMargins(item.id, { signal }), item.id);
  const records = useMemo(() => (notes.data || []).filter((note: MarginNote) => note.anchor.resourceRevision === item.updatedAt), [notes.data, item.updatedAt]);
  const [open, setOpen] = useState(false);
  const [request, setRequest] = useState<CourseNoteRequest | null>(null);
  const sequence = useRef(0);
  useEffect(() => { setOpen(false); setRequest(null); }, [owner, item.id]);
  const add = useCallback((anchor: PageAnchor, pageCount?: number) => {
    const value = { courseId: item.courseId, resource: item, anchor, pageCount };
    if (tools) tools.addNote(value);
    else { setRequest({ ...value, token: ++sequence.current }); setOpen(true); }
  }, [item, tools?.addNote]);
  return {
    owner,
    open: tools ? tools.open && tools.tool === "notes" : open,
    placing: false,
    notes: records,
    add,
    place: add,
    toggle: () => {
      if (tools) { tools.setTool("notes"); tools.setOpen(!(tools.open && tools.tool === "notes")); }
      else setOpen((value) => !value);
    },
    panel: !tools && open && owner ? <aside className="pdf-margin-panel unified-notes-panel" aria-label={t({ en: "Private notes", ar: "ملاحظات خاصة" })}>
      <header><strong>{t({ en: "Notes", ar: "الملاحظات" })}</strong><button type="button" aria-label={t({ en: "Close notes", ar: "إغلاق الملاحظات" })} onClick={() => setOpen(false)}><X size={18} /></button></header>
      <StudentNotes courseId={item.courseId} resources={[item]} request={request} reference={t({ en: `Page ${page}`, ar: `صفحة ${page}` })} />
    </aside> : null,
  };
}
