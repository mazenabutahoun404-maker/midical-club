import type { Course } from "../../types/content";
export const courses: Course[] = [
  {
    id: "anatomy",
    slug: "human-anatomy",
    title: {
      en: "Human Anatomy",
      ar: "تشريح الإنسان",
    },
    code: "MED 201",
    track: "basic",
    year: 2,
    batch: {
      en: "Shifaa",
      ar: "شفاء",
    },
    description: {
      en: "Explore the structure of the human body, organized by region and system.",
      ar: "تعرّف إلى بنية جسم الإنسان من خلال مصادر منظّمة حسب المنطقة والجهاز.",
    },
    accent: "russet",
    icon: "bone",
  },
  {
    id: "physiology",
    slug: "cardiovascular-physiology",
    title: {
      en: "Cardiovascular Physiology",
      ar: "فسيولوجيا القلب والأوعية الدموية",
    },
    code: "MED 302",
    track: "basic",
    year: 3,
    batch: {
      en: "Shifaa",
      ar: "شفاء",
    },
    description: {
      en: "A course collection for cardiovascular function and its underlying mechanisms.",
      ar: "مجموعة مساق عن وظائف القلب والأوعية الدموية وآليات عملها.",
    },
    accent: "red",
    icon: "heart",
  },
  {
    id: "biochemistry",
    slug: "medical-biochemistry",
    title: {
      en: "Medical Biochemistry",
      ar: "الكيمياء الحيوية الطبية",
    },
    code: "MED 203",
    track: "basic",
    year: 2,
    batch: {
      en: "Wareed",
      ar: "وريد",
    },
    description: {
      en: "Molecular foundations, metabolism and cellular processes.",
      ar: "الأسس الجزيئية والأيض والعمليات الخلوية.",
    },
    accent: "olive",
    icon: "flask",
  },
  {
    id: "neurology",
    slug: "clinical-neurology",
    title: {
      en: "Clinical Neurology",
      ar: "طب الأعصاب السريري",
    },
    code: "MED 501",
    track: "clinical",
    year: 5,
    batch: {
      en: "Clinical",
      ar: "المرحلة السريرية",
    },
    description: {
      en: "Your neurology rotation resources, seminar notes and revision materials.",
      ar: "مصادر تدريب طب الأعصاب وملاحظات الندوات ومواد المراجعة.",
    },
    accent: "purple",
    icon: "brain",
  },
  {
    id: "medicine",
    slug: "internal-medicine",
    title: {
      en: "Internal Medicine",
      ar: "الطب الباطني",
    },
    code: "MED 401",
    track: "clinical",
    year: 4,
    batch: {
      en: "Clinical",
      ar: "المرحلة السريرية",
    },
    description: {
      en: "Study collections to support your internal medicine rotation.",
      ar: "مجموعات دراسية لدعم تدريبك في الطب الباطني.",
    },
    accent: "red",
    icon: "heart",
  },
  {
    id: "pediatrics",
    slug: "pediatrics",
    title: {
      en: "Pediatrics",
      ar: "طب الأطفال",
    },
    code: "MED 601",
    track: "clinical",
    year: 6,
    batch: {
      en: "Clinical",
      ar: "المرحلة السريرية",
    },
    description: {
      en: "Teaching sessions, rotation notes and exam preparation.",
      ar: "جلسات تعليمية وملاحظات التدريب والتحضير للامتحانات.",
    },
    accent: "russet",
    icon: "bone",
  },
];
