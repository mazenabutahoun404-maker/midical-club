import type { Batch, ClinicalYear } from "../../types/content";
import { text } from "../../lib/localize";

/** Illustrative academic structure. A future adapter can return the same models from an API. */
export const batches: Batch[] = [
  {
    id: "nabd",
    slug: "nabd",
    name: text("Nabd", "نبض"),
    classLabel: text("Class of 2032", "دفعة ٢٠٣٢"),
    tagline: text("Begin with wonder.", "ابدأ بالفضول."),
    description: text(
      "The first foundations: cells, tissues, genetics and the language of medicine.",
      "الأسس الأولى: الخلايا والأنسجة والوراثة ولغة الطب.",
    ),
    graduationYear: 2032,
    studyYear: 1,
    progress: 18,
    accent: "olive",
    terms: [
      {
        id: "nabd-1",
        label: text("Foundation semester", "فصل التأسيس"),
        academicYear: "2026/27",
        semester: 1,
        courseIds: ["cell-biology", "medical-genetics", "histology"],
        current: true,
      },
    ],
  },
  {
    id: "wareed",
    slug: "wareed",
    name: text("Wareed", "وريد"),
    classLabel: text("Class of 2031", "دفعة ٢٠٣١"),
    tagline: text("Connect the systems.", "اربط بين الأجهزة."),
    description: text(
      "Build the body system by system, from structure to molecular function.",
      "ابنِ فهمك للجسم جهازاً بعد جهاز، من البنية إلى الوظيفة الجزيئية.",
    ),
    graduationYear: 2031,
    studyYear: 2,
    progress: 42,
    accent: "russet",
    terms: [
      {
        id: "wareed-3",
        label: text("Systems semester", "فصل الأجهزة"),
        academicYear: "2026/27",
        semester: 3,
        courseIds: ["anatomy", "biochemistry", "immunology"],
        current: true,
      },
      {
        id: "wareed-2",
        label: text("Structure & function", "البنية والوظيفة"),
        academicYear: "2025/26",
        semester: 2,
        courseIds: ["cell-biology", "histology", "medical-genetics"],
        current: false,
      },
    ],
  },
  {
    id: "shifaa",
    slug: "shifaa",
    name: text("Shifaa", "شفاء"),
    classLabel: text("Class of 2030", "دفعة ٢٠٣٠"),
    tagline: text("Turn knowledge into insight.", "حوّل المعرفة إلى فهم."),
    description: text(
      "Mechanisms of disease, therapeutics and the bridge toward clinical practice.",
      "آليات المرض والعلاجات والجسر نحو الممارسة السريرية.",
    ),
    graduationYear: 2030,
    studyYear: 3,
    progress: 67,
    accent: "red",
    terms: [
      {
        id: "shifaa-5",
        label: text("Mechanisms of disease", "آليات المرض"),
        academicYear: "2026/27",
        semester: 5,
        courseIds: ["physiology", "pathology", "pharmacology", "microbiology"],
        current: true,
      },
      {
        id: "shifaa-4",
        label: text("Integrated systems", "الأجهزة المتكاملة"),
        academicYear: "2025/26",
        semester: 4,
        courseIds: ["anatomy", "biochemistry", "immunology"],
        current: false,
      },
      {
        id: "shifaa-3",
        label: text("Human structure", "بنية الإنسان"),
        academicYear: "2025/26",
        semester: 3,
        courseIds: ["cell-biology", "histology", "medical-genetics"],
        current: false,
      },
    ],
  },
];

export const clinicalYears: ClinicalYear[] = [
  {
    id: "clinical-4",
    slug: "fourth-year",
    year: 4,
    label: text("Fourth year", "السنة الرابعة"),
    tagline: text("Meet the patient.", "ابدأ مع المريض."),
    description: text(
      "Move from mechanisms to bedside thinking through medicine and surgery.",
      "انتقل من فهم الآليات إلى التفكير السريري عبر الباطني والجراحة.",
    ),
    currentBlock: text("Internal medicine foundations", "أساسيات الطب الباطني"),
    focusAreas: [
      text("History & examination", "القصة المرضية والفحص"),
      text("Clinical reasoning", "الاستدلال السريري"),
      text("Core procedures", "الإجراءات الأساسية"),
    ],
    courseIds: ["medicine", "surgery"],
    accent: "russet",
  },
  {
    id: "clinical-5",
    slug: "fifth-year",
    year: 5,
    label: text("Fifth year", "السنة الخامسة"),
    tagline: text("See the whole person.", "انظر إلى الإنسان كاملاً."),
    description: text(
      "Specialty rotations that sharpen pattern recognition and communication.",
      "دورات تخصصية تصقل تمييز الأنماط والتواصل السريري.",
    ),
    currentBlock: text("Neurology & child health", "الأعصاب وصحة الطفل"),
    focusAreas: [
      text("Neurological examination", "الفحص العصبي"),
      text("Child health", "صحة الطفل"),
      text("Women’s health", "صحة المرأة"),
    ],
    courseIds: ["neurology", "pediatrics", "obgyn"],
    accent: "purple",
  },
  {
    id: "clinical-6",
    slug: "sixth-year",
    year: 6,
    label: text("Sixth year", "السنة السادسة"),
    tagline: text("Think. Decide. Handover.", "فكّر. قرّر. سلّم."),
    description: text(
      "An integrated final year centered on readiness, prioritization and continuity.",
      "سنة ختامية متكاملة تركز على الجاهزية وترتيب الأولويات واستمرارية الرعاية.",
    ),
    currentBlock: text("Acute care & transition", "الرعاية الحادة والانتقال"),
    focusAreas: [
      text("Acute assessment", "التقييم الحاد"),
      text("Safe handover", "التسليم الآمن"),
      text("Community care", "الرعاية المجتمعية"),
    ],
    courseIds: ["emergency", "family-medicine", "pediatrics"],
    accent: "red",
  },
];
