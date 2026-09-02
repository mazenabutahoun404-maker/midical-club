import type { Opportunity } from "../../types/content";
export const opportunities: Opportunity[] = [
  {
    id: "o1",
    title: {
      en: "Student research assistant",
      ar: "مساعد بحث من الطلبة",
    },
    organization: {
      en: "University research group",
      ar: "مجموعة بحثية جامعية",
    },
    type: {
      en: "Research",
      ar: "بحث علمي",
    },
    location: {
      en: "Amman",
      ar: "عمّان",
    },
    deadline: "2026-09-16T23:59:00+03:00",
    eligibility: {
      en: "Medical students · Years 3–6",
      ar: "طلبة الطب · السنوات ٣–٦",
    },
    description: {
      en: "An illustrative opportunity to support literature organization and a supervised student research project. No real applications are accepted in this preview.",
      ar: "فرصة توضيحية للمساعدة في تنظيم المراجع ومشروع بحثي طلابي بإشراف أكاديمي. لا تُستقبل طلبات فعلية في هذه المعاينة.",
    },
  },
  {
    id: "o2",
    title: {
      en: "Medical education exchange",
      ar: "تبادل في التعليم الطبي",
    },
    organization: {
      en: "Student exchange program",
      ar: "برنامج تبادل طلابي",
    },
    type: {
      en: "Exchange",
      ar: "تبادل",
    },
    location: {
      en: "International",
      ar: "دولي",
    },
    deadline: "2026-09-30T23:59:00+03:00",
    eligibility: {
      en: "Medical students · Years 4–6",
      ar: "طلبة الطب · السنوات ٤–٦",
    },
    description: {
      en: "An illustrative exchange listing. Official eligibility, funding and application links will accompany verified listings.",
      ar: "إعلان توضيحي لبرنامج تبادل. سترافق الفرص المعتمدة شروط الأهلية والتمويل وروابط التقديم الرسمية.",
    },
  },
];
