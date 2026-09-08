import { useLocale } from "../../app/providers/LocaleProvider";

const copy = {
  notebook: ["Study notebook", "دفتر الدراسة"],
  index: ["Notebook index", "فهرس الدفتر"],
  peek: ["Section preview", "معاينة القسم"],
  contents: ["Inside this section", "داخل هذا القسم"],
  noResources: ["No materials yet", "لا توجد مواد بعد"],
  focus: ["Study focus", "تركيز الدراسة"],
  exitFocus: ["Exit study focus", "إنهاء تركيز الدراسة"],
  split: ["Split study view", "عرض الدراسة المقسّم"],
  single: ["Single study view", "عرض دراسة واحد"],
  companion: ["Companion material", "المادة الجانبية"],
  choose: ["Choose a material", "اختر مادة"],
  reading: ["Reading material", "مادة القراءة"],
  resume: ["Resume studying", "متابعة الدراسة"],
  start: ["Start studying", "ابدأ الدراسة"],
  open: ["Open in notebook", "افتح في الدفتر"],
  close: ["Close material", "إغلاق المادة"],
  return: ["Back to section", "العودة إلى القسم"],
  preview: ["Resource preview", "معاينة المصدر"],
  description: ["About this material", "حول هذه المادة"],
  excerpt: ["Content excerpt", "مقتطف من المحتوى"],
  unavailable: [
    "The file has not been supplied yet. Its description and details are available below.",
    "لم يُرفق الملف بعد. الوصف والتفاصيل متاحان أدناه.",
  ],
  unpreviewable: [
    "This file opens in its own viewer.",
    "يُفتح هذا الملف في عارضه الخاص.",
  ],
  openFile: ["Open original file", "فتح الملف الأصلي"],
  fileError: [
    "This file could not be loaded. You can try opening the original.",
    "تعذّر تحميل الملف. يمكنك محاولة فتح الملف الأصلي.",
  ],
  provenance: ["Source details", "تفاصيل المصدر"],
  reviewer: ["Reviewed by", "راجعه"],
  noReviewer: ["Reviewer not supplied", "لم يُحدّد المراجع"],
  references: ["References", "المراجع"],
  noReferences: ["References not supplied", "لم تُرفق مراجع"],
  page: ["Page bookmark", "علامة الصفحة"],
  pageHelp: [
    "Set your page here to restore it next time. PDF viewer scrolling cannot update this bookmark automatically.",
    "حدّد صفحتك هنا لاستعادتها لاحقاً. التمرير داخل عارض PDF لا يحدّث العلامة تلقائياً.",
  ],
  minutes: ["min", "دقيقة"],
  resumeAt: ["Resume at", "المتابعة من"],
  previewOnly: ["Description available", "الوصف متاح"],
  fileReady: ["File available", "الملف متاح"],
  width: ["Reading pane width", "عرض مساحة القراءة"],
  splitHint: [
    "The two materials stack on smaller screens.",
    "تُعرض المادتان رأسياً على الشاشات الصغيرة.",
  ],
  saved: [
    "Study position saved on this device",
    "حُفظ موضع الدراسة على هذا الجهاز",
  ],
  session: [
    "Study position is kept for this session only",
    "يُحفظ موضع الدراسة لهذه الجلسة فقط",
  ],
  updated: ["Updated", "آخر تحديث"],
  details: ["Details and review status", "التفاصيل وحالة المراجعة"],
  collapse: ["Hide navigation", "إخفاء التنقل"],
  showMenu: ["Show MedClub navigation", "إظهار تنقل النادي الطبي"],
  menu: ["MedClub menu", "قائمة النادي الطبي"],
  personalMenu: ["My MedClub menu", "قائمة مساحتي"],
  pin: ["Keep navigation visible", "إبقاء التنقل ظاهراً"],
  unpin: ["Allow navigation to hide", "السماح بإخفاء التنقل"],
  outline: ["Learning outcomes", "نواتج التعلم"],
} as const;
export function useStudyCopy() {
  const { locale } = useLocale();
  return (key: keyof typeof copy) => copy[key][locale === "ar" ? 1 : 0];
}
