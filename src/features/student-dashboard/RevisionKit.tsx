import {
  Bookmark,
  FileText,
  MessageSquareText,
  X,
  ArrowUpRight,
} from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "../../components/navigation/AppLink";
import { useLocalCoursePdfs } from "../courses/useLocalCoursePdfs";
import { normalizeStudyTools } from "../courses/study-tools-state";
import { studyStorageKey } from "../courses/study-state";
import { useHubQuery, useStudyHub } from "../study-hub/useStudyHub";
import { resourceResumeHref } from "./personal-home-model";
import type { PersonalHomeData } from "./usePersonalHome";
import { personalCoursePath } from "../../constants/routes";

export function RevisionKit({
  data,
  selected,
  setSelected,
  close,
}: {
  data: PersonalHomeData;
  selected: string;
  setSelected: (id: string) => void;
  close: () => void;
}) {
  const { t } = useLocale(),
    hub = useStudyHub();
  const course = data.myCourses.find((c) => c.id === selected);
  const local = useLocalCoursePdfs(selected);
  const margins = useHubQuery(
    "margins",
    (signal) => hub.service.listMargins(undefined, { signal }),
    "all",
  );
  const resources = [
    ...data.myResources.filter((r) => r.courseId === selected),
    ...local.resources,
  ];
  const saved = data.workspace.state.savedIds;
  const ranking = (kind: string) =>
    ["summary", "questions", "notes", "slides", "book"].indexOf(kind);
  const materials = [...resources]
    .sort(
      (a, b) =>
        Number(saved.includes(b.id)) - Number(saved.includes(a.id)) ||
        (ranking(a.kind) < 0 ? 9 : ranking(a.kind)) -
          (ranking(b.kind) < 0 ? 9 : ranking(b.kind)),
    )
    .slice(0, 6);
  let bookmarks: Record<string, number[]> = {};
  try {
    bookmarks = normalizeStudyTools(
      JSON.parse(
        localStorage.getItem(
          studyStorageKey(data.owner, selected) + ":tools:v1",
        ) || "null",
      ),
    ).bookmarks;
  } catch {}
  const pages = resources
    .flatMap((resource) =>
      (bookmarks[resource.id] || []).map((page) => ({ resource, page })),
    )
    .slice(0, 6);
  const notes = (margins.data || [])
    .filter(
      (note) =>
        note.courseId === selected &&
        resources.some(
          (r) =>
            r.id === note.anchor.resourceId &&
            r.updatedAt === note.anchor.resourceRevision,
        ),
    )
    .slice(0, 3);
  const href = (resource: (typeof resources)[number], page = 1) =>
    course
      ? resource.fileUrl
        ? resourceResumeHref(course, resource, page)
        : `${personalCoursePath(course.slug)}?section=${resource.kind}`
      : "/my/learning";
  return (
    <section
      className="personal-revision-kit"
      id="personal-revision-kit"
      aria-labelledby="revision-kit-heading"
    >
      <header>
        <div>
          <span className="home-kicker">
            {t({
              en: "Everything close, nothing to hunt for",
              ar: "كل شيء قريب دون بحث طويل",
            })}
          </span>
          <h2 id="revision-kit-heading" tabIndex={-1}>
            {t({ en: "Your revision kit", ar: "حقيبة مراجعتك" })}
          </h2>
        </div>
        <button
          className="home-icon-control"
          type="button"
          onClick={close}
          aria-label={t({
            en: "Close revision kit",
            ar: "إغلاق حقيبة المراجعة",
          })}
        >
          <X size={19} />
        </button>
      </header>
      <label className="revision-course">
        <span>{t({ en: "Reviewing", ar: "تراجع" })}</span>
        <select
          id="revision-course"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {!selected && (
            <option value="">
              {t({ en: "Choose a course", ar: "اختر مساقاً" })}
            </option>
          )}
          {data.myCourses.map((c) => (
            <option key={c.id} value={c.id}>
              {t(c.title)}
            </option>
          ))}
        </select>
      </label>
      <div className="revision-columns">
        <div>
          <h3>
            <FileText size={17} />
            {t({ en: "Course materials", ar: "مواد المساق" })}
          </h3>
          {materials.map((r) => (
            <AppLink className="revision-resource" href={href(r)} key={r.id}>
              <span>
                <strong>{t(r.title)}</strong>
                <small>
                  {r.kind === "summary"
                    ? t({ en: "Summary", ar: "ملخص" })
                    : t(r.format)}
                  {saved.includes(r.id)
                    ? t({ en: " · Saved", ar: " · محفوظ" })
                    : ""}
                </small>
              </span>
              <ArrowUpRight className="directional" size={16} />
            </AppLink>
          ))}
          {!materials.length && (
            <p>
              {t(
                local.loading
                  ? { en: "Loading your files…", ar: "جارٍ تحميل ملفاتك…" }
                  : {
                      en: "Choose a course or open its materials to prepare your kit.",
                      ar: "اختر مساقاً أو افتح مواده لتجهيز حقيبتك.",
                    },
              )}
            </p>
          )}
          {local.error && (
            <p role="status">
              {t({
                en: "Device PDFs could not load. You can still open the course materials.",
                ar: "تعذر تحميل ملفات الجهاز. يمكنك فتح مواد المساق الأخرى.",
              })}
            </p>
          )}
        </div>
        <div>
          <h3>
            <Bookmark size={17} />
            {t({ en: "Bookmarked pages", ar: "الصفحات المحددة" })}
          </h3>
          {pages.map(({ resource, page }) => (
            <AppLink
              className="revision-resource"
              href={href(resource, page)}
              key={resource.id + page}
            >
              <span>
                <strong>{t(resource.title)}</strong>
                <small>
                  {t({ en: "Page", ar: "صفحة" })} {page}
                </small>
              </span>
              <ArrowUpRight className="directional" size={16} />
            </AppLink>
          ))}
          {!pages.length && (
            <p>
              {t({
                en: "Bookmark important PDF pages during your next study session. They will appear here.",
                ar: "حدد صفحات PDF المهمة أثناء دراستك لتظهر هنا.",
              })}
            </p>
          )}
          <h3>
            <MessageSquareText size={17} />
            {t({ en: "Course notes", ar: "ملاحظات المساق" })}
          </h3>
          {margins.isError && (
            <p role="status">
              {t({
                en: "Course notes could not load.",
                ar: "تعذر تحميل ملاحظات المساق.",
              })}{" "}
              <button
                type="button"
                className="text-link"
                onClick={() => void margins.refetch()}
              >
                {t({ en: "Try again", ar: "حاول مجدداً" })}
              </button>
            </p>
          )}
          {notes.map((note) => (
            <AppLink
              className="revision-note"
              key={note.id}
              href={href(
                resources.find((r) => r.id === note.anchor.resourceId)!,
                note.anchor.page,
              )}
              data-note-color={note.color}
            >
              <small>
                {t({ en: "Page", ar: "صفحة" })} {note.anchor.page}
              </small>
              <p>{note.body.slice(0, 150)}</p>
            </AppLink>
          ))}
          <AppLink
            className="text-link"
            href={`/my/focus?tool=notes${selected ? `&course=${encodeURIComponent(selected)}` : ""}`}
          >
            {t({ en: "Open my notes", ar: "فتح ملاحظاتي" })}{" "}
            <ArrowUpRight className="directional" size={16} />
          </AppLink>
        </div>
      </div>
      <footer>
        <AppLink href={`/my/exams${selected ? `?course=${encodeURIComponent(selected)}` : ""}`} className="button button-secondary">{t({ en: "Practice course questions", ar: "التدرب على أسئلة المساق" })}<ArrowUpRight className="directional" size={16} /></AppLink>
        <AppLink
          href={`/my/study/recall${selected ? `?course=${encodeURIComponent(selected)}` : ""}`}
          className="button button-secondary"
        >
          {t({ en: "Review my recall cards", ar: "مراجعة بطاقاتي" })}
        </AppLink>
        {course && (
          <AppLink href={personalCoursePath(course.slug)} className="text-link">
            {t({ en: "Open the course", ar: "فتح المساق" })}{" "}
            <ArrowUpRight className="directional" size={16} />
          </AppLink>
        )}
      </footer>
    </section>
  );
}
