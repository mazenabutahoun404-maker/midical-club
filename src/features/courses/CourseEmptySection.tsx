import { useLocale } from "../../app/providers/LocaleProvider";

export function CourseEmptySection() {
  const { t } = useLocale();
  return <div className="notebook-empty-section" role="status">
    <svg viewBox="0 0 220 132" width="220" height="132" aria-hidden="true">
      <path className="empty-book-cover" d="M14 25h84l12 8 12-8h84v86h-84l-12 7-12-7H14Z" />
      <path className="empty-book-paper" d="M23 17h73l14 13 14-13h73v85h-73l-14 9-14-9H23Z" />
      <path className="empty-book-fold" d="M110 31v80M37 32h18M37 85h45M183 32h-18M183 85h-45" />
      <path className="empty-book-rule" d="M38 53h41M38 65h41M141 53h41M141 65h41" />
    </svg>
    <strong>{t({ en: "A blank chapter", ar: "فصل فارغ" })}</strong>
    <p>{t({ en: "There are no materials in this section yet.", ar: "لا توجد مواد في هذا القسم بعد." })}</p>
  </div>;
}
