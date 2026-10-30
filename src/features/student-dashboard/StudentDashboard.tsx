import { lazy, Suspense, useEffect, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Bookmark,
  CalendarClock,
  FileText,
  SlidersHorizontal,
  Timer,
  Brain,
} from "lucide-react";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "../../components/navigation/AppLink";
import { CourseCard } from "../../components/cards/CourseCard";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { APP_TIMEZONE } from "../../constants/config";
import { personalCoursePath } from "../../constants/routes";
import { usePersonalHome } from "./usePersonalHome";
import { useCampusGrowth } from "./useCampusGrowth";
import { shortcutChoices, resourceResumeHref } from "./personal-home-model";
import { HomeControls } from "./HomeControls";
import { RevisionKit } from "./RevisionKit";
import { PersonalWelcomeHero } from "./PersonalWelcomeHero";
import { VitalWelcome } from "../../components/medical/VitalWelcome";
import { AccountSettingsButton } from "../../components/navigation/AccountSettingsButton";
import "./personal-home.css";
const PersonalCampus = lazy(() => import("./PersonalCampus"));

export default function StudentDashboard() {
  const { snapshot } = useAuth();
  return <PersonalHome key={snapshot.user?.id || "guest"} />;
}
function PersonalHome() {
  const data = usePersonalHome(),
    growth = useCampusGrowth(data);
  const { t, label, locale } = useLocale();
  const [control, setControl] = useState<"exam" | "shortcuts" | null>(null);
  const [kitOpen, setKitOpen] = useState(false),
    [kitCourse, setKitCourse] = useState("");
  const examCourse = data.myCourses.find((c) => c.id === data.exam?.courseId);
  const saved = data.workspace.state.savedIds
    .slice()
    .reverse()
    .flatMap((id) => {
      const resource = data.myResources.find((r) => r.id === id);
      return resource ? [resource] : [];
    })
    .slice(0, 4);
  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(locale === "ar" ? "ar-JO" : "en-GB", {
      timeZone: APP_TIMEZONE,
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  useEffect(() => {
    if (!kitOpen) return;
    const frame = requestAnimationFrame(() => {
      document
        .getElementById("revision-kit-heading")
        ?.focus({ preventScroll: true });
      document.getElementById("personal-revision-kit")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "start",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [kitOpen]);
  function openKit(courseId?: string) {
    setKitCourse(
      data.myCourses.find((c) => c.id === courseId)?.id ||
        examCourse?.id ||
        data.resume?.course.id ||
        data.myCourses[0]?.id ||
        "",
    );
    setKitOpen(true);
  }
  if (data.criticalPending) return <LoadingState />;
  if (data.criticalError)
    return (
      <ErrorState
        retry={() => {
          void data.profile.refetch();
          void data.courses.refetch();
          void data.resources.refetch();
          data.workspace.retry();
        }}
      />
    );
  const student = data.profile.data!;
  const firstName = t(student.name).trim().split(/\s+/)[0];
  const minutes = data.exam
    ? Math.ceil((Date.parse(data.exam.startsAt) - data.now) / 60_000)
    : 0;
  const campus = (
    <div className="personal-campus-region">
      <div className="personal-campus-heading">
        <span className="home-kicker">
          {t({ en: "Your MedClub campus", ar: "حرم ميدكلب الخاص بك" })}
        </span>
        <small>{t({ en: "Built by your journey", ar: "يتطور برحلتك" })}</small>
      </div>
      <Suspense
        fallback={
          <div className="personal-campus-placeholder" aria-hidden="true" />
        }
      >
        <PersonalCampus levels={growth.levels} quiet={!!data.exam} />
      </Suspense>
    </div>
  );
  return (
    <div
      className="container personal-home personal-home-next"
      data-has-upcoming-exam={!!data.exam || undefined}
      data-home-mode={data.exam ? "exam" : data.resume ? "resume" : "start"}
    >
      {!data.exam && !data.calendarPending && (
        <PersonalWelcomeHero
          firstName={firstName}
          levels={growth.levels}
          resumeHref={data.resume?.href}
          openRevision={() => openKit()}
        />
      )}
      <section
        className="personal-next-hero"
        data-exam-priority={data.examSoon || undefined}
        aria-labelledby="personal-next-heading"
      >
        <div className="personal-next-copy">
          {data.exam ? (
            <>
              <div className="personal-home-greeting">
                <span>
                  {t({ en: "Welcome back", ar: "مرحباً بعودتك" })},{" "}
                  <strong>{firstName}</strong>
                </span>
                <small>
                  {label("year")} {student.year} · {t(student.batch)}
                </small>
                <AccountSettingsButton />
              </div>
              <span className="home-kicker">
                <CalendarClock size={17} />
                {t({
                  en: "Keep your next exam close",
                  ar: "امتحانك القادم بالقرب منك",
                })}
              </span>
              <h1 id="personal-next-heading" tabIndex={-1} data-page-heading>
                <VitalWelcome
                  identity="personal-exam-welcome"
                  lines={[{ text: t(data.exam!.title) }]}
                />
              </h1>
            </>
          ) : (
            <h2 id="personal-next-heading" className="personal-resume-heading">
              {t({
                en: "Keep your next step close",
                ar: "خطوتك التالية بالقرب منك",
              })}
            </h2>
          )}
          {data.exam ? (
            <>
              <p className="personal-next-description">
                {t({
                  en: "Your course materials, saved pages and notes — gathered for a quick review.",
                  ar: "مواد مساقك وصفحاتك المحددة وملاحظاتك مجتمعة لمراجعة سريعة.",
                })}
              </p>
              <div className="personal-exam-time">
                <CalendarClock size={17} />
                <time dateTime={data.exam!.startsAt}>
                  {minutes <= 60
                    ? t({
                        en: `Starts in ${minutes} min`,
                        ar: `يبدأ خلال ${minutes} دقيقة`,
                      })
                    : formatDate(data.exam!.startsAt)}
                </time>
                <small>{t({ en: "Amman time", ar: "بتوقيت عمّان" })}</small>
              </div>
            </>
          ) : data.resume ? (
            <div className="personal-resume-detail">
              <BookOpen size={20} />
              <span>
                <strong>
                  {data.resume.resource
                    ? t(data.resume.resource.title)
                    : t(data.resume.course.title)}
                </strong>
                <small>
                  {t(data.resume.course.title)} ·{" "}
                  {data.resume.resource && !data.resume.resource.fileUrl ? (
                    t(data.resume.resource.format)
                  ) : (
                    <>
                      {t({ en: "Page", ar: "صفحة" })} {data.resume.page}
                    </>
                  )}
                </small>
              </span>
            </div>
          ) : (
            <p className="personal-next-description">
              {t({
                en: "Start with your courses. Keep useful pages close, and let your own campus take shape as you study.",
                ar: "ابدأ بمساقاتك واحتفظ بالصفحات المهمة بالقرب منك. يتطور حرمك مع دراستك.",
              })}
            </p>
          )}
          {data.exam && (
            <div className="personal-next-actions">
              <button
                type="button"
                className="button button-primary personal-next-primary"
                onClick={() => openKit()}
              >
                {t({ en: "Open my exam revision", ar: "فتح مراجعة امتحاني" })}
                <ArrowUpRight className="directional" size={20} />
              </button>
            </div>
          )}
          {data.exam && (
            <nav
              className="personal-exam-quicklinks"
              aria-label={t({
                en: "Quick exam revision",
                ar: "مراجعة سريعة للامتحان",
              })}
            >
              <AppLink
                href={
                  examCourse
                    ? `${personalCoursePath(examCourse.slug)}?section=summary`
                    : "/my/learning"
                }
              >
                <BookOpen size={22} />
                <span>
                  <strong>
                    {t({ en: "Course materials", ar: "مواد المساق" })}
                  </strong>
                  <small>
                    {t({
                      en: "Go straight to your summaries",
                      ar: "انتقل مباشرة إلى ملخصاتك",
                    })}
                  </small>
                </span>
                <ArrowUpRight size={17} className="directional" />
              </AppLink>
              <button type="button" onClick={() => openKit()}>
                <Bookmark size={22} />
                <span>
                  <strong>
                    {t({ en: "Saved pages & notes", ar: "الصفحات والملاحظات" })}
                  </strong>
                  <small>
                    {t({
                      en: "Your course revision kit",
                      ar: "حقيبة مراجعة مساقك",
                    })}
                  </small>
                </span>
                <ArrowUpRight size={17} className="directional" />
              </button>
              <AppLink href="/my/study/recall">
                <Brain size={22} />
                <span>
                  <strong>
                    {t({ en: "Recall cards", ar: "بطاقات المراجعة" })}
                  </strong>
                  <small>
                    {t({
                      en: "Bring key ideas back to mind",
                      ar: "استرجع الأفكار الأساسية",
                    })}
                  </small>
                </span>
                <ArrowUpRight size={17} className="directional" />
              </AppLink>
              <AppLink href="/my/exams">
                <FileText size={22} />
                <span>
                  <strong>
                    {t({ en: "Exam practice", ar: "تدريب الامتحانات" })}
                  </strong>
                  <small>
                    {t({
                      en: "Put your knowledge to the test",
                      ar: "اختبر ما تعلمته",
                    })}
                  </small>
                </span>
                <ArrowUpRight size={17} className="directional" />
              </AppLink>
            </nav>
          )}
          <div className="personal-shortcut-heading">
            <span>{t({ en: "Keep close", ar: "بالقرب منك" })}</span>
            <button
              type="button"
              onClick={() => setControl("shortcuts")}
              aria-label={t({
                en: "Customize my shortcuts",
                ar: "تخصيص اختصاراتي",
              })}
            >
              <SlidersHorizontal size={15} />
              {t({ en: "Customize", ar: "تخصيص" })}
            </button>
          </div>
          <nav
            className="personal-pinned-shortcuts"
            aria-label={t({
              en: "Your pinned shortcuts",
              ar: "اختصاراتك المثبتة",
            })}
          >
            {data.preferences.shortcuts.map((id) => {
              const item = shortcutChoices.find((c) => c.id === id)!;
              return (
                <AppLink
                  key={id}
                  href={item.href}
                  data-home-shortcut={id}
                  className="paper-card"
                >
                  <span>{t(item.label)}</span>
                  <ArrowUpRight className="directional" size={15} />
                </AppLink>
              );
            })}
          </nav>
          <button
            type="button"
            className="personal-exam-edit"
            onClick={() => setControl("exam")}
          >
            <CalendarClock size={15} />
            {t(
              data.preferences.exam
                ? { en: "Edit my exam date", ar: "تعديل موعد امتحاني" }
                : { en: "Add my next exam", ar: "إضافة امتحاني القادم" },
            )}
          </button>
        </div>
      </section>
      {(!data.persistent || !growth.persistent) && (
        <p className="home-device-note" role="status">
          {t({
            en: "Changes are available for this session. Device storage is unavailable.",
            ar: "التغييرات متاحة لهذه الجلسة. التخزين على الجهاز غير متاح.",
          })}
        </p>
      )}
      {kitOpen && (
        <RevisionKit
          data={data}
          selected={kitCourse}
          setSelected={setKitCourse}
          close={() => setKitOpen(false)}
        />
      )}
      <section
        className="personal-home-today"
        aria-label={t({ en: "Your next few steps", ar: "خطواتك القادمة" })}
      >
        <div className="personal-next-up">
          <header>
            <div>
              <span className="home-kicker">
                {t({ en: "A little direction", ar: "خطوة واضحة" })}
              </span>
              <h2>{t({ en: "Up next", ar: "القادم" })}</h2>
            </div>
            <AppLink href="/my/calendar" className="text-link">
              {t({ en: "Calendar", ar: "التقويم" })}
              <ArrowUpRight className="directional" size={16} />
            </AppLink>
          </header>
          {data.upcoming.length ? (
            data.upcoming.map((item) => (
              <div className="home-upcoming-item" key={item.id}>
                <CalendarClock size={19} />
                <span>
                  <strong>{t(item.title)}</strong>
                  <small>{formatDate(item.startsAt)}</small>
                </span>
                {item.kind === "exam" ? (
                  <button
                    type="button"
                    onClick={() => openKit(item.courseId)}
                    aria-label={t({
                      en: "Open exam revision",
                      ar: "فتح مراجعة الامتحان",
                    })}
                  >
                    <ArrowUpRight className="directional" size={18} />
                  </button>
                ) : (
                  <AppLink
                    href="/my/calendar"
                    aria-label={t({ en: "Open calendar", ar: "فتح التقويم" })}
                  >
                    <ArrowUpRight className="directional" size={18} />
                  </AppLink>
                )}
              </div>
            ))
          ) : (
            <div className="home-upcoming-empty">
              <p>
                {t({
                  en: "A clear space for your next plan.",
                  ar: "مساحة لخطتك القادمة.",
                })}
              </p>
              <button
                type="button"
                className="text-link"
                onClick={() => setControl("exam")}
              >
                {t({ en: "Add an exam date", ar: "إضافة موعد امتحان" })}
              </button>
              <AppLink className="text-link" href="/my/calendar">
                {t({ en: "Plan a study session", ar: "تخطيط جلسة دراسة" })}
              </AppLink>
            </div>
          )}
        </div>
        <div className="personal-home-recall">
          <Brain size={29} />
          <span className="home-kicker">
            {t({ en: "Bring it back to mind", ar: "استرجع ما تعلمته" })}
          </span>
          <h2>
            {data.cards.isSuccess && data.dueCards.length
              ? t({
                  en: `${data.dueCards.length} cards to revisit.`,
                  ar: `${data.dueCards.length} بطاقة للمراجعة.`,
                })
              : t({
                  en: "A little recall goes a long way.",
                  ar: "مراجعة صغيرة تحدث فرقاً.",
                })}
          </h2>
          <p>
            {t({
              en: "Your own questions. A focused review. Pick up the cards that are due when you have time.",
              ar: "أسئلتك ومراجعة مركزة. عد إلى بطاقاتك المستحقة عندما يتاح لك الوقت.",
            })}
          </p>
          <AppLink href="/my/study/recall" className="button button-secondary">
            {t({ en: "Open recall", ar: "فتح المراجعة" })}
            <ArrowUpRight className="directional" size={17} />
          </AppLink>
        </div>
      </section>
      <section className="personal-home-books">
        <header className="personal-home-section-heading">
          <div>
            <span className="home-kicker">
              {t({ en: "Your next chapters", ar: "فصولك القادمة" })}
            </span>
            <h2>{t({ en: "On your study shelf", ar: "على رف دراستك" })}</h2>
          </div>
          <AppLink href="/my/learning" className="text-link">
            {label("viewAll")}
            <ArrowUpRight className="directional" size={17} />
          </AppLink>
        </header>
        <div className="personal-home-book-grid">
          {data.myCourses.slice(0, 3).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        {!data.myCourses.length && (
          <p>
            {t({
              en: "Your assigned courses will appear here. Explore the learning catalogue meanwhile.",
              ar: "ستظهر مساقاتك المخصصة هنا. يمكنك استكشاف دليل التعلم الآن.",
            })}{" "}
            <AppLink href="/learn" className="text-link">
              {t({ en: "Explore courses", ar: "استكشاف المساقات" })}
            </AppLink>
          </p>
        )}
      </section>
      <section className="personal-home-saved">
        <header className="personal-home-section-heading">
          <div>
            <span className="home-kicker">
              {t({ en: "Worth keeping close", ar: "تستحق أن تبقى قريبة" })}
            </span>
            <h2>
              {t({
                en: "Recently saved for studying",
                ar: "محفوظات الدراسة الأخيرة",
              })}
            </h2>
          </div>
          <AppLink href="/my/library" className="text-link">
            {label("openLibrary")}
            <ArrowUpRight className="directional" size={17} />
          </AppLink>
        </header>
        <div className="personal-home-saved-grid">
          {saved.map((resource) => {
            const course = data.myCourses.find(
              (c) => c.id === resource.courseId,
            )!;
            return (
              <AppLink
                className="personal-home-saved-item"
                href={
                  resource.fileUrl
                    ? resourceResumeHref(course, resource)
                    : `/my/library?course=${encodeURIComponent(course.id)}`
                }
                key={resource.id}
              >
                <FileText size={22} />
                <span>
                  <strong>{t(resource.title)}</strong>
                  <small>{t(course.title)}</small>
                </span>
                <ArrowUpRight className="directional" size={16} />
              </AppLink>
            );
          })}
          {!saved.length && (
            <div className="personal-saves-empty">
              <Bookmark size={25} />
              <p>
                {t({
                  en: "Save a useful summary or resource. It will be one step away here.",
                  ar: "احفظ ملخصاً أو مصدراً مفيداً ليكون على بعد خطوة هنا.",
                })}
              </p>
              <AppLink href="/my/library" className="text-link">
                {label("openLibrary")}
              </AppLink>
            </div>
          )}
        </div>
      </section>
      <footer className="personal-home-foot">
        <span>
          <BookOpen size={16} />
          {data.reviewed.length}{" "}
          {t({ en: "resources reviewed", ar: "مصادر تمت مراجعتها" })}
        </span>
        <AppLink href="/my/progress">
          {t({ en: "See my study progress", ar: "عرض تقدم دراستي" })}
          <ArrowUpRight className="directional" size={15} />
        </AppLink>
        <AppLink href="/my/focus">
          <Timer size={16} />
          {t({ en: "Make time to focus", ar: "وقت للتركيز" })}
        </AppLink>
      </footer>
      {data.exam && (
        <section
          className="personal-campus-finale"
          aria-label={t({
            en: "Your MedClub campus",
            ar: "حرم ميدكلب الخاص بك",
          })}
        >
          {campus}
        </section>
      )}
      {control && (
        <HomeControls
          data={data}
          kind={control}
          close={() => setControl(null)}
        />
      )}
    </div>
  );
}
