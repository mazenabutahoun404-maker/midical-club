import type { ClubEvent } from "../../types/content";
export const events: ClubEvent[] = [
  {
    id: "e1",
    title: {
      en: "Your first step into research",
      ar: "خطوتك الأولى في البحث العلمي",
    },
    type: {
      en: "WORKSHOP",
      ar: "ورشة عمل",
    },
    startDate: "2026-09-15T15:00:00+03:00",
    endDate: "2026-09-15T17:00:00+03:00",
    location: {
      en: "Faculty of Medicine · Hall A",
      ar: "كلية الطب · القاعة أ",
    },
    description: {
      en: "An illustrative introductory event on finding a research question and navigating a student project.",
      ar: "فعالية تعريفية توضيحية عن اختيار سؤال بحثي وخطوات تنفيذ مشروع طلابي.",
    },
    agenda: [
      {
        en: "Finding a research question",
        ar: "اختيار سؤال بحثي",
      },
      {
        en: "Understanding the research process",
        ar: "فهم خطوات البحث العلمي",
      },
      {
        en: "Student experiences and Q&A",
        ar: "تجارب الطلبة والأسئلة",
      },
    ],
  },
  {
    id: "e2",
    title: {
      en: "Beyond the white coat",
      ar: "ما وراء المعطف الأبيض",
    },
    type: {
      en: "STUDENT TALK",
      ar: "لقاء طلابي",
    },
    startDate: "2026-09-21T14:00:00+03:00",
    endDate: "2026-09-21T16:00:00+03:00",
    location: {
      en: "Student Hub · Main Auditorium",
      ar: "ملتقى الطلبة · المدرّج الرئيسي",
    },
    description: {
      en: "An illustrative conversation about the experiences, choices and people that shape a medical career.",
      ar: "لقاء توضيحي حول التجارب والخيارات والأشخاص الذين يسهمون في تشكيل المسيرة الطبية.",
    },
    agenda: [
      {
        en: "Stories from graduates",
        ar: "تجارب الخريجين",
      },
      {
        en: "Exploring career paths",
        ar: "استكشاف المسارات المهنية",
      },
      {
        en: "Questions from students",
        ar: "أسئلة من الطلبة",
      },
    ],
  },
  {
    id: "e3",
    title: {
      en: "Together for our community",
      ar: "معاً من أجل مجتمعنا",
    },
    type: {
      en: "VOLUNTEERING",
      ar: "تطوّع",
    },
    startDate: "2026-09-26T09:00:00+03:00",
    endDate: "2026-09-26T13:00:00+03:00",
    location: {
      en: "Campus · Community Center",
      ar: "الحرم الجامعي · مركز المجتمع",
    },
    description: {
      en: "An illustrative introduction to the club’s community outreach activities.",
      ar: "فعالية توضيحية للتعريف بأنشطة النادي لخدمة المجتمع.",
    },
    agenda: [
      {
        en: "Team introduction",
        ar: "التعريف بالفريق",
      },
      {
        en: "Volunteer orientation",
        ar: "تعريف المتطوعين بمهامهم",
      },
      {
        en: "Planning a community initiative",
        ar: "تخطيط مبادرة مجتمعية",
      },
    ],
  },
];
