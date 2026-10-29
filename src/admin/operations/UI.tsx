import { record } from "../../services/api/mapping";
import { useLocale } from "../../app/providers/LocaleProvider";
import { metric } from "./model";
import { Empty } from "./shared";
const hidden = (key: string) => /token|hash|^version$|downloadUrl/i.test(key);
const arabic: Record<string, string> = {
  score: "التقييم",
  critical: "حرج",
  attention: "يحتاج انتباهاً",
  healthy: "سليم",
  unknown: "غير معروف",
  pendingReviews: "المراجعات المعلقة",
  approvedWaiting: "معتمد بانتظار النشر",
  publishedThisWeek: "نشر هذا الأسبوع",
  staleContent: "محتوى قديم",
  openRecruitmentRoles: "فرص التوظيف المتاحة",
  upcomingEvents: "الفعاليات القادمة",
  generatedAt: "وقت الإنشاء",
  activeStudents: "الطلاب النشطون",
  resourceOpens: "فتح الموارد",
  searches: "عمليات البحث",
  saves: "الحفظ",
  saveRate: "معدل الحفظ",
  date: "التاريخ",
  timezone: "المنطقة الزمنية",
  minimumCohort: "الحد الأدنى للمجموعة",
  mode: "النمط",
  from: "من",
  through: "حتى",
  module: "القسم",
  suppression: "الحجب",
  metric: "المقياس",
  value: "القيمة",
  unit: "الوحدة",
  basis: "الأساس",
  metricName: "اسم المقياس",
  metricValue: "قيمة المقياس",
  kind: "النوع",
  severity: "الخطورة",
  updatedAt: "آخر تحديث",
  createdAt: "تاريخ الإنشاء",
  status: "الحالة",
  format: "الصيغة",
  expiresAt: "انتهاء الصلاحية",
  action: "الإجراء",
  actor: "المنفذ",
  actorRolesSnapshot: "أدوار المنفذ وقت الإجراء",
  permissionUsed: "الصلاحية المستخدمة",
  entityType: "نوع السجل",
  entityId: "معرّف السجل",
  result: "النتيجة",
  occurredAt: "وقت الإجراء",
  type: "النوع",
  readAt: "وقت القراءة",
  versionNumber: "رقم النسخة",
  reason: "السبب",
  remove: "إزالة",
  add: "إضافة",
  protectedFounders: "المؤسسون المحميون",
  activeUsers: "المستخدمون النشطون",
  roles: "الأدوار",
  pendingRequests: "الطلبات المعلقة",
  highRiskRequests: "الطلبات عالية المخاطر",
  database: "قاعدة البيانات",
  pendingMigrations: "الترحيلات المعلقة",
  outboxBacklog: "قائمة الانتظار",
  key: "المفتاح",
  min: "الحد الأدنى",
  max: "الحد الأعلى",
  defaultValue: "القيمة الافتراضية",
  settingKey: "مفتاح الإعداد",
  category: "الفئة",
  valueJson: "القيمة (JSON)",
  valueType: "نوع القيمة",
  scheduler: "المجدول",
  executor: "المنفذ",
  backupIdentifier: "معرّف النسخة الاحتياطية",
  canonicalTerm: "المصطلح الأساسي",
  language: "اللغة",
  scope: "النطاق",
  resourceType: "نوع المورد",
  query: "الاستعلام",
  count: "العدد",
  processedCount: "العدد المعالج",
  failedCount: "العدد الفاشل",
  startedAt: "وقت البدء",
  completedAt: "وقت الاكتمال",
  errorSummary: "ملخص الخطأ",
  scopeType: "نوع النطاق",
  abbreviation: "الاختصار",
  approved: "معتمد",
  id: "المعرّف",
};
const title = (k: string, locale: string) =>
  locale === "ar" && arabic[k]
    ? arabic[k]
    : k
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/^./, (c) => c.toUpperCase());
export function Facts({ value }: { value: unknown }) {
  const { locale } = useLocale();
  const v = record(value);
  return (
    <dl className="operations-facts">
      {Object.entries(v)
        .filter(([k, x]) => !hidden(k) && (x == null || typeof x !== "object"))
        .map(([k, x]) => (
          <div key={k}>
            <dt>{title(k, locale)}</dt>
            <dd>{typeof x === "boolean" ? String(x) : metric(x)}</dd>
          </div>
        ))}
    </dl>
  );
}
export function Table({ value }: { value: unknown }) {
  const { locale } = useLocale();
  if (!Array.isArray(value)) return <Facts value={value} />;
  if (!value.length) return <Empty items={[]} />;
  const keys = [
    ...new Set(value.flatMap((v) => Object.keys(record(v)))),
  ].filter((k) => !hidden(k));
  return (
    <div className="operations-table">
      <table>
        <thead>
          <tr>
            {keys.map((k) => (
              <th key={k}>{title(k, locale)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {value.map((v, i) => (
            <tr key={i}>
              {keys.map((k) => (
                <td key={k}>
                  {record(v)[k] != null && typeof record(v)[k] === "object"
                    ? JSON.stringify(record(v)[k])
                    : typeof record(v)[k] === "boolean"
                      ? String(record(v)[k])
                      : metric(record(v)[k])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function JsonDetails({
  value,
  label,
}: {
  value: unknown;
  label: string;
}) {
  return (
    <details>
      <summary>{label}</summary>
      <pre dir="ltr">
        {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
      </pre>
    </details>
  );
}
export function CountCards({ value }: { value: unknown }) {
  const { locale } = useLocale();
  return (
    <div className="operations-counts">
      {Object.entries(record(value))
        .filter(([, v]) => typeof v === "number" || v === null)
        .map(([k, v]) => (
          <article key={k}>
            <span>{title(k, locale)}</span>
            <strong>{metric(v)}</strong>
          </article>
        ))}
    </div>
  );
}
export function ObservedTrend({
  points,
}: {
  points: { date: string; resourceOpens: number | null }[];
}) {
  const { t } = useLocale();
  const max = Math.max(1, ...points.map((v) => v.resourceOpens ?? 0));
  const segments: string[] = [];
  let path = "";
  points.forEach((p, i) => {
    if (p.resourceOpens == null) {
      if (path) segments.push(path);
      path = "";
      return;
    }
    path += `${path ? "L" : "M"}${20 + (i * 660) / Math.max(1, points.length - 1)},${150 - (p.resourceOpens * 130) / max} `;
  });
  if (path) segments.push(path);
  return (
    <figure>
      <figcaption>
        {t({
          en: "Resource opens · unavailable days create gaps",
          ar: "فتح الموارد · الأيام غير المتاحة تظهر كفجوات",
        })}
      </figcaption>
      <svg
        viewBox="0 0 700 180"
        role="img"
        aria-label={t({
          en: "Resource opens by day",
          ar: "فتح الموارد حسب اليوم",
        })}
      >
        {segments.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
        ))}
        {points.map((p, i) =>
          p.resourceOpens == null ? null : (
            <circle
              key={p.date}
              cx={20 + (i * 660) / Math.max(1, points.length - 1)}
              cy={150 - (p.resourceOpens * 130) / max}
              r="4"
              fill="currentColor"
            />
          ),
        )}
      </svg>
    </figure>
  );
}
