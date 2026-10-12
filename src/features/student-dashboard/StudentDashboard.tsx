import {
  ArrowUpRight,
  BookOpen,
  Bookmark,
  Timer,
  Sparkles,
  FileText,
} from "lucide-react";
import { useStudentProfile } from "../../hooks/useContent";
import { useLibraryContent } from "../library/useLibraryContent";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useOverlays } from "../../app/providers/OverlayProvider";
import { AppLink } from "../../components/navigation/AppLink";
import { CourseCard } from "../../components/cards/CourseCard";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { StudyOverview } from "./StudyOverview";
import { StudyDeskLinks } from "../study-hub/StudyDeskPage";
export default function StudentDashboard() {
  const profile = useStudentProfile();
  const library = useLibraryContent();
  const { label, t } = useLocale();
  const { openDetail } = useOverlays();
  if (profile.isPending || library.isPending) return <LoadingState />;
  if (profile.isError || library.isError)
    return (
      <ErrorState
        retry={() => {
          void profile.refetch();
          library.retry();
        }}
      />
    );
  const student = profile.data;
  const courses = library.courses.filter((c) =>
    student.courseIds.includes(c.id),
  );
  return (
    <div className="container personal-home">
      <section className="personal-welcome">
        <div>
          <span className="personal-eyebrow">
            <Sparkles size={14} />
            {label("welcomeOwnSpace")}
          </span>
          <h1 tabIndex={-1} data-page-heading>
            {label("personalHeadline")}
            <span>{label("personalAccent")}</span>
          </h1>
          <p>{label("personalIntro")}</p>
          <AppLink href="/my/learning" className="button button-primary">
            {label("openMyLearning")}
            <ArrowUpRight size={17} className="directional" />
          </AppLink>
        </div>
        <div className="personal-orbit">
          <i aria-hidden="true" />
          <i aria-hidden="true" />
          <div className="personal-avatar">{t(student.initials)}</div>
          <div className="personal-name-tag">
            <strong>{t(student.name)}</strong>
            <span>
              {label("year")} {student.year} · {t(student.batch)}
            </span>
          </div>
          <span className="personal-sample-tag">{label("sampleProfile")}</span>
        </div>
      </section>
      <div className="personal-stats">
        <AppLink href="/my/learning">
          <BookOpen size={21} />
          <span>
            <b>{courses.length}</b>
            {label("myCourses")}
          </span>
          <ArrowUpRight size={16} className="directional" />
        </AppLink>
        <AppLink href="/my/library">
          <Bookmark size={21} />
          <span>
            <b>{library.count}</b>
            {label("savedShort")}
          </span>
          <ArrowUpRight size={16} className="directional" />
        </AppLink>
        <AppLink href="/my/focus">
          <Timer size={21} />
          <span>
            <b>
              {student.focusMinutes}
              <small>{label("minutesShort")}</small>
            </b>
            {label("focusSession")}
          </span>
          <ArrowUpRight size={16} className="directional" />
        </AppLink>
      </div>
      <StudyOverview />
      <section className="personal-study-desk">
        <div className="personal-section-heading">
          <h2>{t({ en: "Your study desk", ar: "مكتب دراستك" })}</h2>
          <AppLink href="/my/study" className="text-link">
            {label("viewAll")}
          </AppLink>
        </div>
        <StudyDeskLinks />
      </section>
      <div className="personal-dashboard-grid">
        <section>
          <div className="personal-section-heading">
            <div>
              <span className="eyebrow">{label("oneStepAtATime")}</span>
              <h2>{label("myLearning")}</h2>
            </div>
            <AppLink href="/my/learning" className="text-link">
              {label("viewAll")}
              <ArrowUpRight size={16} className="directional" />
            </AppLink>
          </div>
          <div className="personal-course-grid">
            {courses.slice(0, 2).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
            {courses.length === 0 && (
              <p className="personal-empty">{label("myCoursesEmpty")}</p>
            )}
          </div>
        </section>
        <section className="personal-focus-card">
          <span className="personal-focus-icon">
            <Timer size={27} />
          </span>
          <span className="eyebrow">{label("aMomentForYou")}</span>
          <h2>{label("focusInvitation")}</h2>
          <p>{label("focusInvitationBody")}</p>
          <AppLink href="/my/focus">
            {label("start")}
            <ArrowUpRight size={21} className="directional" />
          </AppLink>
        </section>
      </div>
      <section className="personal-saves">
        <div className="personal-section-heading">
          <div>
            <span className="eyebrow">{label("keepClose")}</span>
            <h2>{label("recentSaves")}</h2>
          </div>
          <AppLink href="/my/library" className="text-link">
            {label("openLibrary")}
            <ArrowUpRight size={16} className="directional" />
          </AppLink>
        </div>
        {library.items.length ? (
          <div className="personal-saved-list">
            {library.items.slice(0, 4).map((record) => (
              <button key={record.item.id} onClick={() => openDetail(record)}>
                <span className="saved-file-icon">
                  <FileText size={20} />
                </span>
                <span>
                  <strong>{t(record.item.title)}</strong>
                  <small>{label(record.kind)}</small>
                </span>
                <ArrowUpRight size={19} className="directional" />
              </button>
            ))}
          </div>
        ) : (
          <div className="personal-empty">
            <Bookmark size={24} />
            <p>{label("personalSavedEmpty")}</p>
            <AppLink href="/my/learning" className="text-link">
              {label("openMyLearning")}
              <ArrowUpRight size={16} className="directional" />
            </AppLink>
          </div>
        )}
      </section>
    </div>
  );
}
