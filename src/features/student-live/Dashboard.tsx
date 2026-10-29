import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "../../components/navigation/AppLink";
import { Button } from "../../components/ui/button";
import { PersonalWelcomeHero } from "../student-dashboard/PersonalWelcomeHero";
import {
  Panel,
  Pager,
  QueryStatus,
  Empty,
  rows,
  useStudentConnection,
  useStudentQuery,
  useStudentAction,
} from "./shared";
import { record, string, number } from "../../services/api/mapping";
import { useCourses, useResources } from "../../hooks/useContent";
import { ContentAsset } from "../resources/PublishedContent";
import { resourceId } from "../../lib/resource-identity";

export default function LiveDashboard() {
  const { owner } = useStudentConnection();
  return <Dashboard key={owner} />;
}
function Dashboard() {
  const { api } = useStudentConnection(),
    { t, locale } = useLocale(),
    action = useStudentAction();
  const [progressPage, setProgressPage] = useState(1),
    [recentPage, setRecentPage] = useState(1),
    [priorityPage, setPriorityPage] = useState(1),
    [upcomingPage, setUpcomingPage] = useState(1),
    [followed, setFollowed] = useState(false),
    [confirm, setConfirm] = useState("");
  const home = useStudentQuery("dashboard", (signal) =>
    api.get_api_v1_student_dashboard({ signal }),
  );
  const progress = useStudentQuery(
    "progress",
    (signal) =>
      api.get_api_v1_student_learning_progress({
        query: { Page: progressPage, PageSize: 20 },
        signal,
      }),
    progressPage,
  );
  const recent = useStudentQuery(
    "recent",
    (signal) =>
      api.get_api_v1_student_recent_items({
        query: { Page: recentPage, PageSize: 20 },
        signal,
      }),
    recentPage,
  );
  const priority = useStudentQuery(
    "priority",
    (signal) =>
      api.get_api_v1_student_dashboard_priority_updates({
        query: { Page: priorityPage, PageSize: 20, followedOnly: followed },
        signal,
      }),
    [priorityPage, followed],
  );
  const upcoming = useStudentQuery(
    "upcoming",
    (signal) =>
      api.get_api_v1_student_dashboard_upcoming({
        query: { Page: upcomingPage, PageSize: 20 },
        signal,
      }),
    upcomingPage,
  );
  const courses = useCourses(),
    resources = useResources();
  function href(contentId: unknown) {
    const resource = resources.data?.find((r) => resourceId(r) === contentId),
      course = courses.data?.find(
        (c) => c.id === (resource?.courseId || contentId),
      );
    return course
      ? `/my/learning/${course.slug}` +
          (resource ? `?pdf=${encodeURIComponent(resource.id)}&resume=1` : "")
      : null;
  }
  const dashboard = record(home.data),
    summary = record(dashboard.studentSummary),
    context = record(dashboard.currentAcademicContext),
    year = record(context.academicYear),
    semester = record(context.semester),
    savedPreview = record(dashboard.savedItemsPreview),
    savedRows = rows(record(savedPreview.items).items),
    newFiles = rows(dashboard.newFilesAndResources),
    subjectUpdates = rows(record(dashboard.followedSubjectUpdates).items);
  const progressRows = rows(record(progress.data).items),
    recentRows = rows(record(recent.data).items),
    priorityRows = rows(record(priority.data).items),
    upcomingRows = rows(record(upcoming.data).items);
  const date = (v: unknown) => {
    const d = new Date(string(v));
    return Number.isNaN(d.getTime())
      ? ""
      : new Intl.DateTimeFormat(locale === "ar" ? "ar-JO" : "en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(d);
  };
  return (
    <div className="container student-connected personal-home">
      <PersonalWelcomeHero
        firstName={
          string(summary.fullName).split(" ")[0] ||
          t({ en: "Student", ar: "الطالب" })
        }
        levels={{
          learning: 0,
          media: 0,
          community: 0,
          mentorship: 0,
          contribution: 0,
          journals: 0,
        }}
        openRevision={() =>
          document
            .getElementById("live-continue")
            ?.scrollIntoView({ behavior: "smooth" })
        }
      />
      <QueryStatus query={home} />
      <nav className="student-connected-actions">
        <AppLink href="/my/library">
          {t({ en: "Your library", ar: "مكتبتك" })}
        </AppLink>
        <AppLink href="/my/study/plans">
          {t({ en: "Study plans", ar: "خطط الدراسة" })}
        </AppLink>
        <AppLink href="/my/study/roadmaps">
          {t({ en: "Roadmaps", ar: "المسارات" })}
        </AppLink>
        <AppLink href="/utilities">
          {t({ en: "Study tools", ar: "أدوات الدراسة" })}
        </AppLink>
      </nav>
      {home.data && (
        <section
          className="student-connected-panel"
          aria-label={t({
            en: "Current academic context",
            ar: "الوضع الأكاديمي الحالي",
          })}
        >
          <h2>{t({ en: "Your current semester", ar: "فصلك الحالي" })}</h2>
          <p>
            {[
              string(summary.batchName),
              summary.studyYear
                ? t({
                    en: `Study year ${summary.studyYear}`,
                    ar: `السنة الدراسية ${summary.studyYear}`,
                  })
                : "",
              string(year.name),
              (
                {
                  First: t({ en: "First semester", ar: "الفصل الأول" }),
                  Second: t({ en: "Second semester", ar: "الفصل الثاني" }),
                  Summer: t({ en: "Summer semester", ar: "الفصل الصيفي" }),
                } as Record<string, string>
              )[string(semester.semesterType)],
            ]
              .filter(Boolean)
              .join(" · ") ||
              t({
                en: "No current academic context is available.",
                ar: "لا تتوفر بيانات الفصل الحالي.",
              })}
          </p>
          {!!semester.endDate && (
            <p>
              {t({ en: "Semester ends", ar: "نهاية الفصل" })}:{" "}
              <time dateTime={string(semester.endDate)}>
                {string(semester.endDate)}
              </time>
            </p>
          )}
        </section>
      )}
      <div className="student-connected-grid">
        {home.data && (
          <>
            <Panel
              title={t({
                en: "New files and resources",
                ar: "الملفات والمصادر الجديدة",
              })}
            >
              <Empty items={newFiles} />
              {newFiles.map((file) => (
                <div className="student-connected-row" key={string(file.id)}>
                  <div>
                    <strong>{string(file.originalFileName)}</strong>
                    <small>
                      {string(file.assetType)} · {date(file.updatedAt)}
                    </small>
                    <ContentAsset
                      assetId={string(file.id)}
                      label={t({ en: "Prepare file", ar: "تجهيز الملف" })}
                    />
                  </div>
                </div>
              ))}
            </Panel>
            <Panel title={t({ en: "Saved items", ar: "العناصر المحفوظة" })}>
              <p>{string(record(savedPreview.collection).name)}</p>
              <Empty items={savedRows} />
              {savedRows.map((row) => {
                const item = record(row.item),
                  link = href(item.itemId);
                return (
                  <div className="student-connected-row" key={string(item.id)}>
                    <strong>{string(row.title)}</strong>
                    {link && (
                      <AppLink href={link}>
                        {t({ en: "Open", ar: "فتح" })}
                      </AppLink>
                    )}
                  </div>
                );
              })}
              <AppLink href="/my/library">
                {t({ en: "Open your library", ar: "فتح مكتبتك" })}
              </AppLink>
            </Panel>
            <Panel
              title={t({
                en: "Updates to followed courses",
                ar: "تحديثات المساقات المتابعة",
              })}
            >
              <Empty items={subjectUpdates} />
              {subjectUpdates.map((row) => {
                const link = href(row.offeringId);
                return (
                  <div className="student-connected-row" key={string(row.id)}>
                    <div>
                      <strong>{string(row.title)}</strong>
                      <small>{date(row.publishedAt)}</small>
                    </div>
                    {link && (
                      <AppLink href={link}>
                        {t({ en: "Open course", ar: "فتح المساق" })}
                      </AppLink>
                    )}
                  </div>
                );
              })}
            </Panel>
          </>
        )}
        <div id="live-continue">
          <Panel title={t({ en: "Continue learning", ar: "تابع التعلم" })}>
            <QueryStatus query={progress} />
            {!progress.isPending && !progress.error && (
              <Empty items={progressRows} />
            )}
            {progressRows.map((row) => {
              const p = record(row.progress),
                path = {
                  contentType: string(p.contentType),
                  contentId: string(p.contentId),
                },
                link = href(p.contentId);
              return (
                <div key={string(p.id)} className="student-connected-row">
                  <div>
                    <strong>{string(row.title)}</strong>
                    <small>
                      {p.isCompleted
                        ? t({ en: "Completed", ar: "مكتمل" })
                        : `${number(p.lastPositionPercent)}%`}
                    </small>
                    {row.contentChanged === true && (
                      <p>
                        {t({
                          en: "The published content changed. Open its current revision before continuing.",
                          ar: "تغير المحتوى المنشور. افتح الإصدار الحالي قبل المتابعة.",
                        })}
                      </p>
                    )}
                    {link && (
                      <AppLink href={link}>
                        {t({ en: "Open", ar: "فتح" })}
                      </AppLink>
                    )}
                  </div>
                  <div className="student-connected-actions">
                    <Button
                      variant="outline"
                      disabled={action.busy || row.contentChanged === true}
                      onClick={() =>
                        void action.run(() =>
                          api.post_api_v1_student_learning_progress_by_contentType_by_contentId_complete(
                            {
                              path,
                              body: {
                                completed: !p.isCompleted,
                                expectedVersion: string(p.version),
                              },
                            },
                          ),
                        )
                      }
                    >
                      {t(
                        p.isCompleted
                          ? { en: "Mark incomplete", ar: "غير مكتمل" }
                          : { en: "Mark complete", ar: "مكتمل" },
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setConfirm(string(p.id))}
                    >
                      {t({ en: "Reset", ar: "إعادة تعيين" })}
                    </Button>
                    {confirm === p.id && (
                      <>
                        <span>
                          {t({
                            en: "Reset this progress?",
                            ar: "إعادة تعيين التقدم؟",
                          })}
                        </span>
                        <Button
                          disabled={action.busy}
                          onClick={() =>
                            void action.run(
                              () =>
                                api.delete_api_v1_student_learning_progress_by_contentType_by_contentId(
                                  {
                                    path,
                                    query: { reset: true, confirm: true },
                                  },
                                ),
                              () => setConfirm(""),
                            )
                          }
                        >
                          {t({ en: "Confirm reset", ar: "تأكيد" })}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setConfirm("")}
                        >
                          {t({ en: "Cancel", ar: "إلغاء" })}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            <Pager
              page={progressPage}
              total={number(record(progress.data).total)}
              onChange={setProgressPage}
            />
          </Panel>
        </div>
        <Panel title={t({ en: "Recently opened", ar: "فُتحت مؤخراً" })}>
          <QueryStatus query={recent} />
          {!recent.isPending && !recent.error && <Empty items={recentRows} />}
          {recentRows.map((row) => {
            const item = record(row.item),
              link = href(item.itemId);
            return (
              <div className="student-connected-row" key={string(item.id)}>
                <div>
                  <strong>{string(row.title)}</strong>
                  <small>{date(item.lastOpenedAt)}</small>
                </div>
                {link && (
                  <AppLink href={link}>{t({ en: "Open", ar: "فتح" })}</AppLink>
                )}
              </div>
            );
          })}
          <Pager
            page={recentPage}
            total={number(record(recent.data).total)}
            onChange={setRecentPage}
          />
          {!!recentRows.length &&
            (confirm === "recent" ? (
              <>
                <p>
                  {t({
                    en: "Clear recently opened items?",
                    ar: "مسح العناصر المفتوحة مؤخراً؟",
                  })}
                </p>
                <Button
                  disabled={action.busy}
                  onClick={() =>
                    void action.run(
                      () => api.delete_api_v1_student_recent_items({}),
                      () => setConfirm(""),
                    )
                  }
                >
                  {t({ en: "Confirm clear", ar: "تأكيد المسح" })}
                </Button>
                <Button variant="outline" onClick={() => setConfirm("")}>
                  {t({ en: "Cancel", ar: "إلغاء" })}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setConfirm("recent")}>
                {t({ en: "Clear history", ar: "مسح السجل" })}
              </Button>
            ))}
        </Panel>
        <Panel title={t({ en: "Priority updates", ar: "التحديثات المهمة" })}>
          <label>
            <span>
              <input
                type="checkbox"
                checked={followed}
                onChange={(e) => {
                  setFollowed(e.target.checked);
                  setPriorityPage(1);
                }}
              />{" "}
              {t({ en: "Followed subjects only", ar: "المواد المتابعة فقط" })}
            </span>
          </label>
          <QueryStatus query={priority} />
          {!priority.isPending && !priority.error && (
            <Empty items={priorityRows} />
          )}
          {priorityRows.map((row) => (
            <div className="student-connected-row" key={string(row.id)}>
              <strong>{string(row.title)}</strong>
              <small>{date(row.publishedAt)}</small>
            </div>
          ))}
          <Pager
            page={priorityPage}
            total={number(record(priority.data).total)}
            onChange={setPriorityPage}
          />
        </Panel>
        <Panel title={t({ en: "Coming up", ar: "القادم" })}>
          <QueryStatus query={upcoming} />
          {!upcoming.isPending && !upcoming.error && (
            <Empty items={upcomingRows} />
          )}
          {upcomingRows
            .filter((r) => !r.isDeleted && !r.isCancelled)
            .map((row) => (
              <div className="student-connected-row" key={string(row.id)}>
                <div>
                  <strong>{string(row.title)}</strong>
                  <small>{date(row.startsAt)}</small>
                  <p>{string(row.description)}</p>
                </div>
              </div>
            ))}
          <Pager
            page={upcomingPage}
            total={number(record(upcoming.data).total)}
            onChange={setUpcomingPage}
          />
        </Panel>
      </div>
      {action.feedback}
    </div>
  );
}
