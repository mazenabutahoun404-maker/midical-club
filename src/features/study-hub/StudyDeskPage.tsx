import { StudyDeskArtwork } from "./StudyDeskArtwork";
import "./study-desk-cards.css";
import { AppLink } from "../../components/navigation/AppLink";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useStudyHub } from "./useStudyHub";
import { Brain, Download, ShieldCheck, UsersRound, Timer } from "lucide-react";
import "./study-hub.css";
export function StudyDeskLinks() {
  const { t } = useLocale();
  return (
    <div className="study-desk-links">
      {[
        {
          kind: "recall" as const,
          href: "/my/study/recall",
          icon: Brain,
          name: { en: "Active recall", ar: "المراجعة النشطة" },
          body: {
            en: "Make question cards. Answer from memory, reveal the answer, and plan your next review.",
            ar: "أنشئ بطاقات أسئلة. أجب من الذاكرة ثم اكشف الإجابة وحدد المراجعة التالية.",
          },
        },
        {
          kind: "offline" as const,
          href: "/my/study/offline",
          icon: Download,
          name: { en: "Offline course packs", ar: "حزم المساقات دون اتصال" },
          body: {
            en: "Keep real course PDFs on your device for the next study session.",
            ar: "احتفظ بملفات المساق على جهازك لجلسة الدراسة التالية.",
          },
        },
        {
          kind: "room" as const,
          href: "/my/study/rooms",
          icon: UsersRound,
          name: { en: "Study together", ar: "الدراسة معاً" },
          body: {
            en: "Invite classmates, set a goal, and study with one shared focus/rest timer.",
            ar: "ادعُ زملاءك وحدد هدفاً وادرسوا بمؤقت تركيز واستراحة مشترك.",
          },
        },
        {
          kind: "portfolio" as const,
          href: "/my/portfolio",
          icon: ShieldCheck,
          name: { en: "Verified achievements", ar: "الإنجازات المعتمدة" },
          body: {
            en: "Record activities, publications, and leadership with evidence. A reviewer verifies them before sharing.",
            ar: "وثق الأنشطة والمنشورات والقيادة بالأدلة. يعتمدها المراجع قبل مشاركتها.",
          },
        },
      ].map((c) => (
        <AppLink
          href={c.href}
          key={c.href}
          className="study-desk-card"
          data-desk-kind={c.kind}
        >
          <StudyDeskArtwork kind={c.kind} />
          <c.icon size={25} aria-hidden="true" />
          <strong>{t(c.name)}</strong>
          <p>{t(c.body)}</p>
          <span>{t({ en: "Open", ar: "افتح" })} →</span>
        </AppLink>
      ))}
    </div>
  );
}
export default function StudyDeskPage() {
  const { t } = useLocale();
  const { service } = useStudyHub();
  return (
    <main className="container study-hub">
      <header className="study-hub-heading">
        <span className="eyebrow">
          MedClub · {t({ en: "Your study desk", ar: "مكتب دراستك" })}
        </span>
        <h1 data-page-heading tabIndex={-1}>
          {t({ en: "A little more room to learn.", ar: "مساحة أوسع للتعلم." })}
        </h1>
        <p>
          {t({
            en: "Your margin notes live beside the PDF. Everything else starts here.",
            ar: "ملاحظات الهامش بجانب ملفك. وتبدأ الأدوات الأخرى من هنا.",
          })}
        </p>
        <AppLink href="/my/focus" className="text-link">
          <Timer size={18} />
          {t({ en: "Open timer and notes", ar: "افتح المؤقت والملاحظات" })}
        </AppLink>
      </header>
      <StudyDeskLinks />
      {service.source === "device-preview" && (
        <p className="study-source-note">
          {t({
            en: "Device-local preview · Your records stay in this browser. Shared rooms and cross-device sync become available when the API adapter is connected.",
            ar: "معاينة محلية · سجلاتك في هذا المتصفح. تتاح الغرف المشتركة والمزامنة بين الأجهزة عند ربط الخدمة.",
          })}
        </p>
      )}
    </main>
  );
}
