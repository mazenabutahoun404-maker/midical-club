import { BookOpen, CalendarDays, HeartPulse, PenLine } from "lucide-react";
import { useLocale } from "../../../app/providers/LocaleProvider";
import { ContentPlaceholder } from "../../../components/feedback/ContentPlaceholder";
import { ReadFeedback } from "../../../components/feedback/ReadFeedback";
import { AppLink } from "../../../components/navigation/AppLink";
import { signInPath } from "../../../constants/routes";

type Kind = "courses" | "events" | "opportunities" | "journal" | "mentors";
type ReadState = {
  isPending: boolean;
  error: unknown;
  refetch: () => unknown;
  fetchStatus?: string;
};

/** Keep the original chapter's physical layout without manufacturing live records. */
export function HomeSectionState({
  kind,
  query,
  locked = false,
}: {
  kind: Kind;
  query?: ReadState;
  locked?: boolean;
}) {
  const { t } = useLocale();
  const copy = {
    courses: {
      title: {
        en: "Your course collection starts here",
        ar: "من هنا تبدأ مكتبة مساقاتك",
      },
      description: {
        en: "Published courses will take their place on this shelf. You can explore the basic and clinical learning paths now.",
        ar: "ستجد المساقات المنشورة على هذا الرف. يمكنك الآن استكشاف مسارات العلوم الأساسية والسريرية.",
      },
      icon: "books",
      href: "/learn",
    },
    events: {
      title: { en: "Space for the next gathering", ar: "مساحة للقاء القادم" },
      description: {
        en: "No events have been published yet. Workshops and student activities will appear here when available.",
        ar: "لا توجد فعاليات منشورة بعد. ستظهر الورش والأنشطة الطلابية هنا عند توفرها.",
      },
      icon: "calendar",
      href: "/events",
    },
    opportunities: {
      title: { en: "Room for your next step", ar: "مساحة لخطوتك القادمة" },
      description: {
        en: "Published opportunities will appear here. Return to discover ways to learn and contribute.",
        ar: "ستظهر الفرص المنشورة هنا. عُد لاكتشاف مسارات للتعلّم والمشاركة.",
      },
      icon: "mentorship",
      href: "/opportunities",
    },
    journal: {
      title: { en: "The reading room is open", ar: "غرفة القراءة مفتوحة" },
      description: {
        en: "No articles have been published yet. This is where the club’s published ideas and stories will live.",
        ar: "لا توجد مقالات منشورة بعد. هنا ستجد أفكار النادي وقصصه عند نشرها.",
      },
      icon: "journal",
      href: "/journal",
    },
    mentors: {
      title: { en: "More people to learn with", ar: "أشخاص نتعلّم معهم" },
      description: {
        en: "Mentor profiles will appear here when they are published.",
        ar: "ستظهر ملفات المرشدين هنا عند نشرها.",
      },
      icon: "people",
      href: "/mentorship",
    },
  } as const;
  const item = copy[kind];
  const state = locked ? (
    <ContentPlaceholder
      compact
      icon="lock"
      title={t({
        en: "Discover more with your account",
        ar: "اكتشف المزيد بحسابك",
      })}
      description={t({
        en: "Sign in to explore opportunities and the ways you can take part.",
        ar: "سجّل الدخول لاستكشاف الفرص ومسارات المشاركة.",
      })}
      href={signInPath("/")}
      actionLabel={t({ en: "Sign in to explore", ar: "سجّل الدخول للاستكشاف" })}
    />
  ) : query && (query.isPending || query.error) ? (
    <ReadFeedback query={query} />
  ) : (
    <ContentPlaceholder
      compact
      icon={item.icon}
      title={t(item.title)}
      description={t(item.description)}
      href={item.href}
      actionLabel={t({ en: "Explore", ar: "استكشف" })}
    />
  );
  if (kind === "courses")
    return (
      <div className="home-course-collection-empty" data-home-reveal="rise">
        <div className="home-empty-volumes" aria-hidden="true">
          {[0, 1, 2].map((index) => (
            <span key={index} className="home-empty-volume" data-volume={index}>
              <BookOpen size={30} />
              <i />
              <i />
              <i />
            </span>
          ))}
        </div>
        <div className="home-course-empty-copy">{state}</div>
      </div>
    );
  if (kind === "events")
    return (
      <div
        className="home-featured-event home-empty-ticket"
        data-home-reveal="ticket"
      >
        <div className="home-featured-date" aria-hidden="true">
          <CalendarDays size={40} />
        </div>
        <div className="home-featured-event-copy">{state}</div>
      </div>
    );
  if (kind === "journal")
    return (
      <div
        className="home-reading-desk home-empty-reading"
        data-home-reveal="page"
      >
        <article className="home-leading-story">
          <div className="home-story-cover-top">
            <HeartPulse size={27} aria-hidden="true" />
            <span>{t({ en: "The reading room", ar: "غرفة القراءة" })}</span>
            <BookOpen size={22} aria-hidden="true" />
          </div>
          {state}
        </article>
        <div className="home-story-list home-reading-invitation">
          <PenLine size={32} aria-hidden="true" />
          <h3>
            {t({ en: "Ideas worth sharing.", ar: "أفكار تستحق المشاركة." })}
          </h3>
          <p>
            {t({
              en: "A place for medical knowledge, student perspectives and the stories that connect our community.",
              ar: "مساحة للمعرفة الطبية ووجهات نظر الطلبة والقصص التي تجمع مجتمعنا.",
            })}
          </p>
          <AppLink href="/journal" className="text-link">
            {t({ en: "Visit the journal", ar: "تصفّح المجلة" })}
          </AppLink>
        </div>
      </div>
    );
  return (
    <div
      className={
        kind === "opportunities"
          ? "home-opening home-empty-opening"
          : "home-empty-mentors"
      }
      data-home-reveal="rise"
    >
      {state}
    </div>
  );
}
