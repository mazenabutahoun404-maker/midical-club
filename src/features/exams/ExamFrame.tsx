import { useState, type ReactNode } from "react";
import { Modal } from "../../components/ui/Modal";
import {
  ArrowUpRight,
  BookOpen,
  Bookmark,
  History,
  Search,
  Layers,
  FileQuestion,
} from "lucide-react";
import { AppLink } from "../../components/navigation/AppLink";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useLocation } from "react-router-dom";
import { useExams } from "./useExams";
import "./exams.css";
import "./exam-experience.css";
import "./exam-studio.css";
import "./exam-design-v1349.css";
import { isExamSessionPath } from "./session-layout";
export function ExamFrame({ children }: { children: ReactNode }) {
  const { t } = useLocale(),
    { base, service } = useExams(),
    { pathname } = useLocation();
  const playing =
    pathname.includes("/attempt/") &&
    !pathname.endsWith("/results") &&
    !pathname.endsWith("/recall");
  const [toolsOpen, setToolsOpen] = useState(false);
  const immersive = isExamSessionPath(pathname);
  const links = [
    { path: "", label: { en: "Browse", ar: "تصفح" }, icon: BookOpen },
    {
      path: "/history",
      label: { en: "My attempts", ar: "محاولاتي" },
      icon: History,
    },
    {
      path: "/notebook",
      label: { en: "Saved questions", ar: "الأسئلة المحفوظة" },
      icon: Bookmark,
    },
    {
      path: "/wrong",
      label: { en: "Revisit mistakes", ar: "مراجعة الأخطاء" },
      icon: Layers,
    },
    { path: "/search", label: { en: "Search", ar: "بحث" }, icon: Search },
  ];
  return (
    <section
      className={`container exam-platform${playing ? " exam-platform-playing" : ""}${immersive ? " studio-exam-frame" : ""}`}
      data-exam-source={service.source}
    >
      {immersive && (
        <AppLink className="studio-frame-exit text-link" href={base}>
          {t({ en: "Back to exams", ar: "العودة إلى الامتحانات" })}
        </AppLink>
      )}
      {!immersive && (
        <nav
          className="exam-navigation"
          aria-label={t({ en: "Exam navigation", ar: "تنقل الامتحانات" })}
        >
          {links.map(({ path, label, icon: Icon }) => (
            <AppLink
              href={base + path}
              key={path}
              className={
                path === "" || path === "/search"
                  ? "exam-nav-primary"
                  : "exam-nav-secondary"
              }
              aria-current={pathname === base + path ? "page" : undefined}
            >
              <Icon size={17} />
              <span>{t(label)}</span>
            </AppLink>
          ))}
          <button
            type="button"
            className="exam-nav-tools"
            onClick={() => setToolsOpen(true)}
          >
            <Layers size={17} />
            <span>{t({ en: "Exam tools", ar: "أدوات الامتحانات" })}</span>
          </button>
        </nav>
      )}
      {service.source === "preview" && !immersive && (
        <div className="exam-preview-note">
          <FileQuestion size={15} />
          <span>
            {t({
              en: "Interface preview · Sample questions · Saved on this device",
              ar: "معاينة الواجهة · أسئلة توضيحية · تحفظ على هذا الجهاز",
            })}
          </span>
        </div>
      )}
      {service.persistent === false && (
        <p className="exam-error" role="status">
          {t({
            en: "Device storage is full or unavailable. Changes are available for this session only.",
            ar: "تخزين الجهاز ممتلئ أو غير متاح. التغييرات متاحة لهذه الجلسة فقط.",
          })}
        </p>
      )}
      {children}
      {toolsOpen && (
        <Modal
          open
          onClose={() => setToolsOpen(false)}
          title={t({ en: "Your exam tools", ar: "أدوات امتحاناتك" })}
          description=""
          className="exam-tools-dialog"
        >
          <nav>
            {links
              .filter((item) => item.path !== "" && item.path !== "/search")
              .map(({ path, label, icon: Icon }) => (
                <AppLink
                  href={base + path}
                  key={path}
                  onClick={() => setToolsOpen(false)}
                >
                  <Icon size={20} />
                  {t(label)}
                </AppLink>
              ))}
          </nav>
        </Modal>
      )}
    </section>
  );
}
export function ExamHeading({
  eyebrow,
  title,
  body,
  children,
  heading = "h1",
}: {
  eyebrow: string;
  title: string;
  body?: string;
  children?: ReactNode;
  heading?: "h1" | "h2";
}) {
  const Heading = heading;
  return (
    <header className="exam-page-heading">
      <div>
        <span className="exam-kicker">{eyebrow}</span>
        <Heading
          data-page-heading={heading === "h1" ? "" : undefined}
          tabIndex={-1}
        >
          {title}
        </Heading>
        {body && <p>{body}</p>}
      </div>
      {children}
    </header>
  );
}
export function ExamEmpty({
  title,
  body,
  href,
  action,
}: {
  title: string;
  body: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="exam-empty">
      <BookOpen size={38} strokeWidth={1} />
      <h2>{title}</h2>
      <p>{body}</p>
      {href && (
        <AppLink className="button button-secondary" href={href}>
          {action}
          <ArrowUpRight className="directional" size={17} />
        </AppLink>
      )}
    </div>
  );
}
export function ExamFailure({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  const { t } = useLocale();
  return (
    <div className="exam-empty" role="alert">
      <p>{message}</p>
      {retry && (
        <button
          type="button"
          className="button button-secondary"
          onClick={retry}
        >
          {t({ en: "Try again", ar: "حاول مجدداً" })}
        </button>
      )}
    </div>
  );
}
