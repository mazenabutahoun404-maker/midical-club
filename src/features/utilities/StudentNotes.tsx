import { memo, useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowLeft, Download, Plus, Save, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";
import { useServices } from "../../app/providers/ServicesProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useCourses, useResources } from "../../hooks/useContent";
import { useWorkspacePaths } from "../../hooks/useWorkspacePaths";
import { AppLink } from "../../components/navigation/AppLink";
import { signInPath } from "../../constants/routes";
import { ActionReceipt, useActionReceipt } from "../../components/feedback/ActionReceipt";
import { throwToTrash } from "../../components/feedback/action-flight";
import { offerUndo } from "../../components/feedback/undo-action";
import { useHubQuery, useStudyError, useStudyHub } from "../study-hub/useStudyHub";
import { useLocalCoursePdfs } from "../courses/useLocalCoursePdfs";
import type { Course, Resource } from "../../types/content";
import type { MarginNote, PageAnchor } from "../../types/study-hub";
import { StudyError } from "../../types/study-hub";
import { NoteCard } from "./NoteCard";
import { migrateCourseNote, notesKey, readNotes, removeNote, saveNote, type StudentNote } from "./student-notes";
import { courseNoteError, isNotePdf, noteLocation, sameSimpleNote, type CourseNoteRequest, type NotesReader } from "./course-note-model";
import { useNotePdfCount } from "./useNotePdfCount";
import "../../styles/student-tools.css";
import "../../styles/notes-workspace.css";
import "../../styles/course-notes-v1334.css";

interface NotesProps {
  courseId?: string;
  legacyKey?: string;
  reference?: string;
  onlyCourse?: boolean;
  resources?: Resource[];
  reader?: NotesReader | null;
  request?: CourseNoteRequest | null;
  onOpenAnchor?: (anchor: PageAnchor, courseId: string) => boolean;
}
type Draft = {
  key: string;
  kind: "general" | "course";
  title: string;
  body: string;
  courseId: string;
  resourceId: string;
  revision: string;
  page: string;
  color: MarginNote["color"];
  anchor?: PageAnchor;
  original?: StudentNote | MarginNote;
  dirty: boolean;
};
const isMargin = (note: StudentNote | MarginNote): note is MarginNote => "anchor" in note;
const contents = (draft: Draft) => JSON.stringify([draft.kind, draft.title, draft.body, draft.courseId, draft.resourceId, draft.revision, draft.page, draft.color]);

export const StudentNotes = memo(function StudentNotes(props: NotesProps) {
  const { snapshot } = useAuth(), { t } = useLocale();
  if (snapshot.status !== "authenticated" || !snapshot.user)
    return <div className="student-tool-sign-in"><LockKeyhole size={24} /><h3>{t({ en: "Your private notebook", ar: "دفتر ملاحظاتك الخاص" })}</h3>
      <p>{t({ en: "Sign in to save general notes or attach a note to a PDF page.", ar: "سجّل الدخول لحفظ ملاحظات عامة أو ربط ملاحظة بصفحة PDF." })}</p>
      <AppLink className="button button-primary" href={signInPath(window.location.pathname)}>{t({ en: "Sign in for notes", ar: "تسجيل الدخول للملاحظات" })}</AppLink>
    </div>;
  return <NotesWorkspace key={snapshot.user.id} {...props} userId={snapshot.user.id} />;
});

function NotesWorkspace({ userId, courseId, legacyKey, reference, onlyCourse = false, resources: supplied = [], reader, request, onOpenAnchor }: NotesProps & { userId: string }) {
  const { t } = useLocale(), courses = useCourses(), resources = useResources();
  const services = useServices(), hub = useStudyHub(), errorText = useStudyError();
  const paths = useWorkspacePaths(), navigate = useNavigate(), feedback = useActionReceipt();
  const fieldId = useId();
  const courseItems: Course[] = courses.data || [];
  const remoteItems: Resource[] = resources.data || [];
  const margins = useHubQuery("margins", (signal) => hub.service.listMargins(undefined, { signal }), "all");
  const [notes, setNotes] = useState(() => readNotes(userId));
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false), [removing, setRemoving] = useState<string | null>(null);
  const [query, setQuery] = useState(""), [limit, setLimit] = useState(20);
  const [message, setMessage] = useState(""), [discard, setDiscard] = useState(false);
  const [storageError, setStorageError] = useState(false), [errors, setErrors] = useState<Record<string, string>>({});
  const root = useRef<HTMLElement>(null), alive = useRef(true), writing = useRef(false);
  const failedAutosave = useRef("");
  const currentDraft = useRef(draft); currentDraft.current = draft;
  const previousEditor = useRef<string | null>(null);
  const local = useLocalCoursePdfs(draft?.courseId || courseId || "");
  const candidates = [...new Map([
    ...(request ? [request.resource] : []), ...(reader ? [reader.resource] : []),
    ...remoteItems, ...local.resources, ...supplied,
  ].map((item) => [item.id, item])).values()];
  const selected = draft?.kind === "course" ? candidates.find((item) => item.id === draft.resourceId && item.courseId === draft.courseId) : undefined;
  const knownCount = selected && reader && reader.id === selected.id && reader.resource.updatedAt === selected.updatedAt
    ? reader.pageCount : selected && request && request.resource.id === selected.id && request.resource.updatedAt === selected.updatedAt ? request.pageCount : undefined;
  const pdf = useNotePdfCount(selected, knownCount);
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);
  useEffect(() => {
    const refresh = () => {
      try { localStorage.getItem(notesKey(userId)); setStorageError(false); }
      catch { setStorageError(true); }
      setNotes(readNotes(userId));
    };
    try { if (courseId && legacyKey) migrateCourseNote(userId, courseId, legacyKey); }
    catch { setStorageError(true); }
    refresh();
    const storage = (event: StorageEvent) => { if (event.key === notesKey(userId) || event.key === null) refresh(); };
    const updated = (event: Event) => { if ((event as CustomEvent).detail === notesKey(userId)) refresh(); };
    window.addEventListener("storage", storage); window.addEventListener("medclub:notes-updated", updated);
    return () => { window.removeEventListener("storage", storage); window.removeEventListener("medclub:notes-updated", updated); };
  }, [userId, courseId, legacyKey]);
  useEffect(() => {
    if (!request) return;
    if (currentDraft.current?.dirty) {
      setMessage(t({ en: "Save or cancel your current draft, then press Add note again. Your draft has been kept.", ar: "احفظ المسودة الحالية أو ألغها ثم اضغط إضافة ملاحظة مجدداً. احتفظنا بمسودتك." }));
      return;
    }
    setDraft({ key: crypto.randomUUID(), kind: "course", title: "", body: "", courseId: request.courseId,
      resourceId: request.anchor.resourceId, revision: request.anchor.resourceRevision, page: String(request.anchor.page),
      anchor: request.anchor, color: "amber", dirty: false });
    setErrors({}); setDiscard(false); setMessage("");
  }, [request?.token]);
  useEffect(() => {
    const previous = previousEditor.current;
    previousEditor.current = draft?.key || null;
    if (!draft) {
      if (!previous) return;
      const frame = requestAnimationFrame(() => {
        const row = [...(root.current?.querySelectorAll<HTMLElement>(".student-note-row") || [])].find((item) => item.dataset.noteId === previous);
        (row?.querySelector<HTMLButtonElement>(".student-note-open") || row || root.current?.querySelector<HTMLButtonElement>(".student-note-add"))?.focus({ preventScroll: true });
      });
      return () => cancelAnimationFrame(frame);
    }
    const frame = requestAnimationFrame(() => root.current?.querySelector<HTMLTextAreaElement>("textarea")?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [draft?.key]);

  async function ensureOwner() {
    const auth = await services.auth.getSnapshot();
    if (auth.status !== "authenticated" || auth.user?.id !== userId) throw new Error("NOTE_ACCOUNT_CHANGED");
  }
  function patch(change: Partial<Draft>) {
    failedAutosave.current = "";
    setDraft((old) => old ? { ...old, ...change, dirty: true } : old);
    setErrors({}); setMessage("");
  }
  function create(kind: Draft["kind"] = "general") {
    if (draft?.dirty) { setMessage(t({ en: "Save or cancel your draft first.", ar: "احفظ المسودة أو ألغها أولاً." })); return; }
    setDraft({ key: crypto.randomUUID(), kind, title: "", body: "", courseId: courseId || "", resourceId: "", revision: "", page: "1", color: "amber", dirty: false });
    setErrors({}); setDiscard(false); setMessage("");
  }
  function edit(note: StudentNote | MarginNote) {
    if (draft?.dirty) { setMessage(t({ en: "Save or cancel your draft first.", ar: "احفظ المسودة أو ألغها أولاً." })); return; }
    const attached = isMargin(note);
    setDraft({ key: note.id, original: structuredClone(note), kind: attached ? "course" : "general",
      title: attached ? "" : note.title, body: note.body, courseId: note.courseId || courseId || "",
      resourceId: attached ? note.anchor.resourceId : "", revision: attached ? note.anchor.resourceRevision : "",
      page: attached ? String(note.anchor.page) : "1", anchor: attached ? note.anchor : undefined,
      color: attached ? note.color : "amber", dirty: false });
    setErrors({}); setDiscard(false); setMessage("");
  }
  function validation(snapshot: Draft) {
    const result: Record<string, string> = {};
    if (snapshot.body.length > (snapshot.kind === "course" ? 3000 : 25000)) result.body = t({ en: `Keep this note within ${snapshot.kind === "course" ? 3000 : 25000} characters. Your text has not been shortened.`, ar: `اجعل الملاحظة ضمن ${snapshot.kind === "course" ? 3000 : 25000} حرفاً. لم نختصر نصك.` });
    if (!snapshot.body.trim() && (snapshot.kind === "course" || !snapshot.title.trim())) result.body = t({ en: "Write a note before saving.", ar: "اكتب الملاحظة قبل الحفظ." });
    if (snapshot.kind === "course") {
      const problem = courseNoteError(snapshot.courseId, selected, snapshot.page, pdf.count, snapshot.revision || undefined);
      const text = problem === "course" ? t({ en: "Choose a course.", ar: "اختر مساقاً." })
        : problem === "pdf" ? t({ en: "Choose an available PDF from this course.", ar: "اختر ملف PDF متاحاً من هذا المساق." })
        : problem === "revision" ? t({ en: "This PDF has changed. Select its current version before saving.", ar: "تغيّر ملف PDF. اختر الإصدار الحالي قبل الحفظ." })
        : problem === "page" ? t({ en: "Enter a whole page number starting at 1.", ar: "أدخل رقم صفحة صحيحاً يبدأ من 1." })
        : problem === "range" ? t({ en: `Choose a page from 1 to ${Math.min(pdf.count || 1, 20000)}.`, ar: `اختر صفحة من 1 إلى ${Math.min(pdf.count || 1, 20000)}.` })
        : problem === "loading" ? t({ en: "Wait for the PDF page count, or retry if the file could not be opened.", ar: "انتظر عدد صفحات PDF أو أعد المحاولة إذا تعذر فتح الملف." }) : "";
      if (problem) result[problem === "course" ? "course" : problem === "page" || problem === "range" ? "page" : "pdf"] = text;
      if (!courseItems.some((item) => item.id === snapshot.courseId)) result.course = t({ en: "The selected course is unavailable. Reload the courses and choose again.", ar: "المساق المحدد غير متاح. أعد تحميل المساقات واختر مجدداً." });
    }
    return result;
  }
  async function save(close = true) {
    const snapshot = currentDraft.current;
    if (!snapshot || writing.current) return;
    const invalid = validation(snapshot);
    if (Object.keys(invalid).length) { setErrors(invalid); return; }
    writing.current = true; setBusy(true);
    try {
      await ensureOwner();
      const before = snapshot.original;
      let saved: StudentNote | MarginNote;
      if (snapshot.kind === "course") {
        const old = before && isMargin(before) ? before : undefined;
        const sameAnchor = snapshot.anchor && snapshot.anchor.resourceId === selected!.id && snapshot.anchor.resourceRevision === selected!.updatedAt && snapshot.anchor.page === Number(snapshot.page);
        saved = await hub.service.saveMargin({ courseId: snapshot.courseId, body: snapshot.body, color: snapshot.color,
          anchor: sameAnchor ? snapshot.anchor! : { resourceId: selected!.id, resourceRevision: selected!.updatedAt, page: Number(snapshot.page), x: .85, y: .1 } },
          old ? { id: old.id, version: old.version } : undefined);
        await hub.refresh();
      } else {
        if (before && !isMargin(before)) {
          const latest = readNotes(userId).find((item) => item.id === before.id);
          if (!latest || !sameSimpleNote(latest, before)) throw new Error("NOTE_CHANGED");
        }
        saved = { id: before?.id || snapshot.key, title: snapshot.title.trim(), body: snapshot.body,
          ...(before?.courseId || (onlyCourse && courseId) ? { courseId: before?.courseId || courseId } : {}), updatedAt: new Date().toISOString() };
        saveNote(userId, saved);
        if (alive.current) setNotes(readNotes(userId));
      }
      if (before) {
        const expected = saved;
        offerUndo({ message: t({ en: "Note updated", ar: "حُدثت الملاحظة" }), label: t({ en: "Undo", ar: "تراجع" }),
          restored: t({ en: "Previous note restored", ar: "استعيدت الملاحظة" }), failed: t({ en: "The note changed; it could not be restored.", ar: "تغيّرت الملاحظة؛ تعذّر التراجع." }),
          undo: async () => {
            await ensureOwner();
            if (isMargin(before) && isMargin(expected)) {
              await hub.service.saveMargin(before, { id: expected.id, version: expected.version }); await hub.refresh();
            } else if (!isMargin(before) && !isMargin(expected)) {
              const latest = readNotes(userId).find((item) => item.id === expected.id);
              if (!latest || !sameSimpleNote(latest, expected)) throw new Error("NOTE_CHANGED");
              saveNote(userId, before);
            }
          } });
      }
      if (alive.current) {
        feedback.flash("saved"); setMessage(t({ en: "Note saved", ar: "حُفظت الملاحظة" })); setErrors({});
        setDraft((current) => {
          if (!current || current.key !== snapshot.key) return current;
          const changed = contents(current) !== contents(snapshot);
          return close && !changed ? null : { ...current, original: saved, dirty: changed };
        });
      }
    } catch (error) {
      failedAutosave.current = contents(snapshot);
      if (error instanceof StudyError && error.code === "CONFLICT") void hub.refresh();
      if (alive.current) setNotes(readNotes(userId));
      if (alive.current) setMessage(error instanceof Error && /NOTE_CHANGED/.test(error.message)
        ? t({ en: "This note changed elsewhere. Your draft is kept; reload the saved note before editing it again.", ar: "تغيّرت الملاحظة في مكان آخر. احتفظنا بمسودتك؛ أعد تحميل الملاحظة المحفوظة قبل تعديلها مجدداً." })
        : error instanceof Error && error.message === "NOTE_ACCOUNT_CHANGED" ? t({ en: "Your account changed. Sign in again before saving.", ar: "تغير حسابك. سجّل الدخول مجدداً قبل الحفظ." })
        : error instanceof StudyError ? errorText(error) + " " + t({ en: "Your draft is kept.", ar: "احتفظنا بمسودتك." })
        : t({ en: "Could not save this note. Your draft is kept. Check the file and available storage, then retry.", ar: "تعذر حفظ الملاحظة. احتفظنا بمسودتك. تحقق من الملف والمساحة المتاحة ثم أعد المحاولة." }));
    } finally { writing.current = false; if (alive.current) setBusy(false); }
  }
  // Existing plain notes retain their quiet autosave; new notes and page attachments use Save.
  useEffect(() => {
    if (!draft?.dirty || !draft.original || draft.kind !== "general" || busy || failedAutosave.current === contents(draft)) return;
    const timer = setTimeout(() => void save(false), 600);
    return () => clearTimeout(timer);
  }, [draft, busy]);
  async function erase(note: StudentNote | MarginNote) {
    if (writing.current) return;
    writing.current = true; setBusy(true); setRemoving(note.id);
    const face = [...(root.current?.querySelectorAll<HTMLElement>("[data-note-id]") || [])].find((item) => item.dataset.noteId === note.id) || null;
    try {
      await ensureOwner();
      if (isMargin(note)) await hub.service.deleteMargin(note.id, note.version);
      else {
        const latest = readNotes(userId).find((item) => item.id === note.id);
        if (!latest || !sameSimpleNote(latest, note)) throw new Error("NOTE_CHANGED");
        removeNote(userId, note.id);
      }
      void throwToTrash(face, isMargin(note) ? note.body.slice(0,80) : note.title || note.body.slice(0,80));
      offerUndo({ message: t({ en: "Note deleted", ar: "حُذفت الملاحظة" }), label: t({ en: "Undo", ar: "تراجع" }),
        restored: t({ en: "Note restored", ar: "استعيدت الملاحظة" }), failed: t({ en: "Could not restore the note.", ar: "تعذرت استعادة الملاحظة." }),
        undo: async () => { await ensureOwner(); if (isMargin(note)) { await hub.service.restoreMargin(note); await hub.refresh(); }
          else { if (readNotes(userId).some((item) => item.id === note.id)) throw new Error("NOTE_CHANGED"); saveNote(userId, note); } } });
      await hub.refresh();
      if (alive.current) setNotes(readNotes(userId));
    } catch (error) { toast.error(errorText(error)); }
    finally { writing.current = false; if (alive.current) { setRemoving(null); setBusy(false); } }
  }
  function open(note: MarginNote) {
    const resource = candidates.find((item) => item.id === note.anchor.resourceId);
    if (resource && !isNotePdf(resource)) {
      toast.error(t({ en: "This PDF is no longer available. The note is still saved.", ar: "ملف PDF لم يعد متاحاً. الملاحظة ما زالت محفوظة." })); return;
    }
    if (resource && (resource.courseId !== note.courseId || resource.updatedAt !== note.anchor.resourceRevision)) {
      toast.error(t({ en: "This note belongs to an earlier PDF revision. Its text is preserved; edit the attachment to use the current file.", ar: "ترتبط الملاحظة بإصدار PDF سابق. النص محفوظ؛ عدّل الربط لاستخدام الملف الحالي." })); return;
    }
    const course = courseItems.find((item) => item.id === note.courseId);
    if (!course) { toast.error(t({ en: "This course is unavailable.", ar: "هذا المساق غير متاح." })); return; }
    if (!resource && !/^(local-pdf-|personal-pdf-)/.test(note.anchor.resourceId)) {
      toast.error(t({ en: "This PDF is no longer available. The note is still saved.", ar: "ملف PDF لم يعد متاحاً. الملاحظة ما زالت محفوظة." })); return;
    }
    if (onOpenAnchor?.(note.anchor, note.courseId)) return;
    navigate(noteLocation(course.slug, note.anchor, paths.course));
  }
  const attached: MarginNote[] = margins.data || [];
  const all = useMemo(() => [...notes, ...attached].sort((a,b) => b.updatedAt.localeCompare(a.updatedAt)), [notes, margins.data]);
  const visible = useMemo(() => all.filter((note) => (!onlyCourse || note.courseId === courseId) &&
    `${isMargin(note) ? "" : note.title} ${note.body}`.toLocaleLowerCase().includes(query.toLocaleLowerCase().trim())), [all, onlyCourse, courseId, query]);
  const fieldError = (key: string) => errors[key] ? <small id={`${fieldId}-${key}`} className="note-field-error" role="alert">{errors[key]}</small> : null;
  return <section ref={root} className="student-notes unified-notes" aria-label={t({ en: "Private notes", ar: "ملاحظات خاصة" })}>
    <div className="student-notes-top"><strong>{t({ en: "My notes", ar: "ملاحظاتي" })}</strong>
      <button type="button" className="student-note-add" aria-label={t({ en: "Add note", ar: "إضافة ملاحظة" })} title={t({ en: "Add note", ar: "إضافة ملاحظة" })} onClick={() => create()}><Plus size={19} className="note-add-plus" aria-hidden="true" /><svg className="note-add-sheet" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3H5v18h14V8zM14 3v5h5M8 11h5M8 15h3" /></svg></button>
      <ActionReceipt receipt={feedback.receipt} />
    </div>
    {message && <p className="student-notes-receipt" role="status">{message}</p>}
    {storageError && <p role="alert">{t({ en: "Device storage is unavailable. Existing notes have not been replaced.", ar: "تخزين الجهاز غير متاح. لم نستبدل الملاحظات الحالية." })}</p>}
    {draft ? <form className="student-note-editor" data-note-color={draft.kind === "course" ? draft.color : undefined} noValidate onSubmit={(event) => { event.preventDefault(); void save(); }}>
      <button type="button" className="student-note-back" disabled={busy} onClick={() => draft.dirty ? setDiscard(true) : setDraft(null)}><ArrowLeft size={16} />{t({ en: "All notes", ar: "كل الملاحظات" })}</button>
      {discard && <div className="note-discard-question" role="alert"><p>{t({ en: "Keep editing, save, or discard these unsaved changes?", ar: "متابعة التعديل أم الحفظ أم إلغاء التغييرات غير المحفوظة؟" })}</p>
        <button type="button" onClick={() => setDiscard(false)}>{t({ en: "Keep editing", ar: "متابعة التعديل" })}</button>
        <button type="button" onClick={() => { setDraft(null); setDiscard(false); }}>{t({ en: "Discard changes", ar: "إلغاء التغييرات" })}</button>
      </div>}
      {!draft.original && <div className="note-type-picker" role="group" aria-label={t({ en: "Note type", ar: "نوع الملاحظة" })}>
        <button type="button" disabled={busy} aria-pressed={draft.kind === "general"} onClick={() => patch({ kind: "general" })}>{t({ en: "General", ar: "عامة" })}</button>
        <button type="button" disabled={busy} aria-pressed={draft.kind === "course"} onClick={() => patch({ kind: "course", body: draft.title.trim() ? draft.title.trim() + (draft.body ? "\n\n" + draft.body : "") : draft.body, title: "" })}>{t({ en: "Course PDF", ar: "PDF المساق" })}</button>
      </div>}
      {draft.kind === "general" ? <label>{t({ en: "Title (optional)", ar: "العنوان (اختياري)" })}<input maxLength={150} value={draft.title} onChange={(event) => patch({ title: event.target.value })} /></label>
        : <div className="note-attachment-fields">
          <label>{t({ en: "Course", ar: "المساق" })}<select value={draft.courseId} aria-invalid={!!errors.course} aria-describedby={errors.course ? `${fieldId}-course` : undefined} onChange={(event) => patch({ courseId: event.target.value, resourceId: "", revision: "", page: "1", anchor: undefined })}>
            <option value="">{t({ en: "Choose a course", ar: "اختر مساقاً" })}</option>{courseItems.map((item) => <option key={item.id} value={item.id}>{t(item.title)}</option>)}
          </select>{fieldError("course")}</label>
          <label>{t({ en: "PDF", ar: "ملف PDF" })}<select value={draft.resourceId} disabled={!draft.courseId || local.loading} aria-invalid={!!errors.pdf} aria-describedby={errors.pdf ? `${fieldId}-pdf` : undefined} onChange={(event) => { const item = candidates.find((value) => value.id === event.target.value); patch({ resourceId: item?.id || "", revision: item?.updatedAt || "", page: "1", anchor: undefined }); }}>
            <option value="">{t({ en: "Choose a PDF", ar: "اختر ملف PDF" })}</option>{candidates.filter((item) => item.courseId === draft.courseId && isNotePdf(item)).map((item) => <option key={item.id} value={item.id}>{t(item.title)}</option>)}
          </select>{fieldError("pdf")}</label>
          <label>{t({ en: "Page", ar: "الصفحة" })}<input type="number" inputMode="numeric" min="1" max={pdf.count ? Math.min(pdf.count, 20000) : undefined} step="1" value={draft.page} aria-invalid={!!errors.page} aria-describedby={errors.page ? `${fieldId}-page` : undefined} onChange={(event) => patch({ page: event.target.value })} />{fieldError("page")}</label>
          <p className="note-file-status" role="status">{pdf.pending ? t({ en: "Checking PDF pages…", ar: "جارٍ التحقق من صفحات PDF…" }) : pdf.count ? t({ en: `${pdf.count} pages`, ar: `${pdf.count} صفحات` }) : ""}</p>
          {pdf.error && <p className="note-field-error" role="alert">{t({ en: "This PDF could not be opened. If it is password-protected, open it in the reader first.", ar: "تعذر فتح PDF. إذا كان محمياً بكلمة مرور فافتحه في القارئ أولاً." })}<button type="button" onClick={pdf.retry}>{t({ en: "Retry", ar: "أعد المحاولة" })}</button></p>}
          {draft.revision && selected && draft.revision !== selected.updatedAt && <p role="alert">{t({ en: "This attachment points to an older file. Select the current PDF again to reattach it.", ar: "يشير الربط إلى ملف سابق. اختر ملف PDF الحالي مجدداً لإعادة الربط." })}<button type="button" onClick={() => patch({ revision: selected.updatedAt, anchor: undefined })}>{t({ en: "Use current PDF", ar: "استخدم PDF الحالي" })}</button></p>}
        </div>}
      {draft.anchor?.quote && <blockquote>{draft.anchor.quote}</blockquote>}
      <label>{t({ en: "Note", ar: "الملاحظة" })}<textarea rows={5} maxLength={draft.kind === "course" ? 3000 : 25000} value={draft.body} aria-invalid={!!errors.body} aria-describedby={errors.body ? `${fieldId}-body` : undefined} placeholder={t({ en: "Write your note…", ar: "اكتب ملاحظتك…" })} onChange={(event) => patch({ body: event.target.value })} />{fieldError("body")}</label>
      {draft.kind === "course" && <fieldset className="note-color-picker"><legend>{t({ en: "Note color", ar: "لون الملاحظة" })}</legend>
        {(["amber", "mint", "rose"] as const).map((color) => <label key={color} data-note-color={color} data-selected={draft.color === color || undefined}><input type="radio" name={`${fieldId}-note-color`} value={color} checked={draft.color === color} onChange={() => patch({ color })} /><span aria-hidden="true" />{t(color === "amber" ? { en: "Amber", ar: "كهرماني" } : color === "mint" ? { en: "Mint", ar: "نعناعي" } : { en: "Rose", ar: "وردي" })}</label>)}
      </fieldset>}
      {reference && draft.kind === "course" && <small className="study-note-reference">{reference}</small>}
      <div className="student-note-actions"><button type="submit" className="student-tool-primary" disabled={busy}><Save size={16} />{t(busy ? { en: "Saving…", ar: "جارٍ الحفظ…" } : { en: "Save note", ar: "حفظ الملاحظة" })}</button>
        <button type="button" aria-label={t({ en: "Download note", ar: "تنزيل الملاحظة" })} title={t({ en: "Download note", ar: "تنزيل الملاحظة" })} onClick={() => { const url = URL.createObjectURL(new Blob([draft.title + "\n\n" + draft.body], { type: "text/plain;charset=utf-8" })); const link = document.createElement("a"); link.href = url; link.download = "medclub-note.txt"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }}><Download size={16} /></button>
      </div>
    </form> : <div className="student-notes-list">
      {all.length > 4 && <input aria-label={t({ en: "Find a note", ar: "البحث عن ملاحظة" })} placeholder={t({ en: "Find a note…", ar: "ابحث عن ملاحظة…" })} value={query} onChange={(event) => { setQuery(event.target.value); setLimit(20); }} />}
      {visible.slice(0,limit).map((note) => { const linked = isMargin(note); const source = linked ? candidates.find((item) => item.id === note.anchor.resourceId) : undefined;
        const display: StudentNote = linked ? { id: note.id, title: t({ en: `Page ${note.anchor.page}`, ar: `صفحة ${note.anchor.page}` }), body: note.body, courseId: note.courseId, updatedAt: note.updatedAt } : note;
        const title = note.courseId ? courseItems.find((item) => item.id === note.courseId)?.title : undefined;
        return <NoteCard key={`${linked ? "pdf" : "general"}:${note.id}`} note={display} courseTitle={title ? t(title) : undefined}
          linked={linked} color={linked ? note.color : undefined} fileTitle={linked ? source ? t(source.title) : t({ en: "PDF currently unavailable", ar: "PDF غير متاح حالياً" }) : undefined}
          outdated={linked && !!source && source.updatedAt !== note.anchor.resourceRevision}
          onOpen={linked ? () => open(note) : undefined} onEdit={() => edit(note)} onDelete={() => erase(note)} removing={removing === note.id} busy={busy}
          onRecall={linked ? async () => { if (writing.current) return; writing.current = true; setBusy(true); try { await hub.service.saveRecall({ courseId: note.courseId, prompt: note.anchor.quote ? `Explain: ${note.anchor.quote.slice(0,180)}` : t({ en: "What do you remember about this point?", ar: "ماذا تتذكر عن هذه النقطة؟" }), answer: note.body, source: note.anchor }); await hub.refresh(); toast.success(t({ en: "Recall card created", ar: "أُنشئت بطاقة استرجاع" })); } catch (error) { toast.error(errorText(error)); } finally { writing.current = false; if (alive.current) setBusy(false); } } : undefined} />;
      })}
      {margins.isPending && <p role="status">{t({ en: "Loading attached notes…", ar: "جارٍ تحميل الملاحظات المرتبطة…" })}</p>}
      {margins.isError && <p role="alert">{t({ en: "PDF notes could not be loaded. General notes remain available.", ar: "تعذر تحميل ملاحظات PDF. الملاحظات العامة ما زالت متاحة." })}<button type="button" onClick={() => void margins.refetch()}>{t({ en: "Reload notes", ar: "أعد تحميل الملاحظات" })}</button></p>}
      {!visible.length && !margins.isPending && <p className="student-tool-empty">{t({ en: "No notes here yet. Add a general note or attach one to a course PDF.", ar: "لا توجد ملاحظات هنا بعد. أضف ملاحظة عامة أو اربطها بملف PDF للمساق." })}</p>}
      {visible.length > limit && <button type="button" className="student-note-more" onClick={() => setLimit((value) => value + 20)}>{t({ en: "Show more notes", ar: "عرض المزيد من الملاحظات" })}</button>}
    </div>}
    {(courses.isError || resources.isError) && <p role="alert">{t({ en: "Course or file choices could not be loaded.", ar: "تعذر تحميل خيارات المساقات أو الملفات." })}<button type="button" onClick={() => { void courses.refetch(); void resources.refetch(); }}>{t({ en: "Reload choices", ar: "أعد تحميل الخيارات" })}</button></p>}
  </section>;
}
