import { useEffect, useRef } from "react";
import {
  BookOpen,
  CalendarDays,
  FileText,
  HeartHandshake,
  LockKeyhole,
  Newspaper,
  Search,
  CloudOff,
  LoaderCircle,
  UsersRound,
} from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "../navigation/AppLink";
import "../../styles/content-states.css";

const icons = {
  books: BookOpen,
  calendar: CalendarDays,
  file: FileText,
  mentorship: HeartHandshake,
  lock: LockKeyhole,
  journal: Newspaper,
  search: Search,
  cloud: CloudOff,
  loading: LoaderCircle,
  people: UsersRound,
};
export type PlaceholderIcon = keyof typeof icons;
export function ContentPlaceholder({
  title,
  description,
  icon = "file",
  href,
  actionLabel,
  compact = false,
  loading = false,
  error = false,
}: {
  title?: string;
  description?: string;
  icon?: PlaceholderIcon;
  href?: string;
  actionLabel?: string;
  compact?: boolean;
  loading?: boolean;
  error?: boolean;
}) {
  const { t } = useLocale(),
    root = useRef<HTMLDivElement>(null),
    Icon = icons[icon];
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      node.dataset.visible = "true";
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        node.dataset.visible = String(entries[0]?.isIntersecting ?? false);
      },
      { threshold: 0.05 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={root}
      className={`content-placeholder ${compact ? "content-placeholder-compact" : ""}`}
      data-visible="false"
      aria-busy={loading || undefined}
      role={error ? "alert" : loading ? "status" : undefined}
    >
      <span className="content-placeholder-art" aria-hidden="true">
        <span />
        <Icon size={34} strokeWidth={1.5} />
        <i />
      </span>
      <div>
        <h3>
          {title || t({ en: "Nothing here yet", ar: "لا توجد عناصر بعد" })}
        </h3>
        <p>
          {description ||
            t({
              en: "When new content is published, it will appear right here.",
              ar: "سيظهر المحتوى الجديد هنا عند نشره.",
            })}
        </p>
      </div>
      {href && (
        <AppLink className="button button-secondary" href={href}>
          {actionLabel || t({ en: "Explore", ar: "استكشف" })}
        </AppLink>
      )}
    </div>
  );
}
