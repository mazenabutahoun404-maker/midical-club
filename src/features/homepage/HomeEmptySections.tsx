import { useLocale } from "../../app/providers/LocaleProvider";
import {
  ContentPlaceholder,
  type PlaceholderIcon,
} from "../../components/feedback/ContentPlaceholder";
import type { Text } from "../../types/content";
const sections: {
  id: string;
  title: Text;
  message: Text;
  icon: PlaceholderIcon;
  href: string;
}[] = [
  {
    id: "courses",
    title: { en: "Learning resources", ar: "المصادر التعليمية" },
    message: {
      en: "New courses and study resources will appear here when they are published.",
      ar: "ستظهر المساقات والمصادر الدراسية الجديدة هنا عند نشرها.",
    },
    icon: "books",
    href: "/learn",
  },
  {
    id: "events",
    title: { en: "Events & activities", ar: "الفعاليات والأنشطة" },
    message: {
      en: "Published events and student activities will appear here.",
      ar: "ستظهر الفعاليات والأنشطة الطلابية هنا عند نشرها.",
    },
    icon: "calendar",
    href: "/events",
  },
  {
    id: "opportunities",
    title: { en: "Opportunities", ar: "الفرص" },
    message: {
      en: "New opportunities will appear here when they become available.",
      ar: "ستظهر الفرص الجديدة هنا عند توفرها.",
    },
    icon: "mentorship",
    href: "/opportunities",
  },
  {
    id: "journal",
    title: { en: "Medical journal", ar: "المجلة الطبية" },
    message: {
      en: "Published issues and reading materials will appear here.",
      ar: "ستظهر أعداد المجلة والمواد المقروءة هنا عند نشرها.",
    },
    icon: "journal",
    href: "/journal",
  },
  {
    id: "community",
    title: { en: "Our community", ar: "مجتمعنا" },
    message: {
      en: "Community stories and club updates will appear here.",
      ar: "ستظهر أخبار النادي وقصص المجتمع هنا عند نشرها.",
    },
    icon: "people",
    href: "/community",
  },
];
/** Public navigation scaffolding only: no preview records, private titles or invented counts. */
export function HomeEmptySections({
  unavailable = false,
}: {
  unavailable?: boolean;
}) {
  const { t } = useLocale();
  return (
    <div className="home-empty-sections home-empty-grid">
      {sections.map((section) => (
        <section
          key={section.id}
          className="home-empty-section"
          aria-labelledby={"empty-home-" + section.id}
        >
          <h2 id={"empty-home-" + section.id}>{t(section.title)}</h2>
          <ContentPlaceholder
            icon={unavailable ? "cloud" : section.icon}
            title={unavailable ? t({en:"Content is not available right now",ar:"المحتوى غير متاح حالياً"}) : t({
              en: "Nothing published here yet",
              ar: "لم يُنشر محتوى هنا بعد",
            })}
            description={unavailable ? t({en:"You can keep browsing other sections while this content is unavailable.",ar:"يمكنك متابعة تصفّح الأقسام الأخرى أثناء عدم توفر هذا المحتوى."}) : t(section.message)}
            href={section.href}
            actionLabel={t({
              en: "Explore this section",
              ar: "استكشف هذا القسم",
            })}
          />
        </section>
      ))}
    </div>
  );
}
