import { text } from "../../lib/localize";
import type {
  BuilderBlock,
  BuilderPageDocument,
  BuilderTemplate,
  BuilderVersion,
} from "../../types/builder";

const visibility = { audience: "public", locale: "all" } as const;
const schedule = {};

export const homepageBlocks: BuilderBlock[] = [
  {
    id: "block-home-hero",
    type: "hero",
    name: text("Opening pulse", "نبضة البداية"),
    enabled: true,
    visibility,
    schedule,
    data: {
      eyebrow: text("MADE FOR MEDICAL MINDS", "مصمم للعقول الطبية"),
      title: text(
        "Your medical journey, finally in one place.",
        "رحلتك الطبية، أخيراً في مكان واحد.",
      ),
      body: text(
        "Courses, opportunities and a community that moves with you from the first lecture to clinical practice.",
        "مساقات وفرص ومجتمع يرافقك من المحاضرة الأولى إلى الممارسة السريرية.",
      ),
      primaryLabel: text("Explore learning", "استكشف التعلّم"),
      primaryHref: "/learn",
      secondaryLabel: text("Enter My MedClub", "ادخل مساحتي"),
      secondaryHref: "/my",
      align: "start",
      tone: "red",
    },
  },
  {
    id: "block-home-announcement",
    type: "announcement",
    name: text("Clinical skills announcement", "إعلان المهارات السريرية"),
    enabled: true,
    visibility: { audience: "students", locale: "all" },
    schedule: {
      startsAt: "2026-09-08T08:00:00+03:00",
      endsAt: "2026-09-25T23:59:00+03:00",
    },
    data: {
      eyebrow: text("REGISTRATION OPEN", "التسجيل مفتوح"),
      title: text(
        "Clinical Skills Week begins September 20",
        "أسبوع المهارات السريرية يبدأ في 20 سبتمبر",
      ),
      body: text(
        "Small-group stations, reviewed checklists and guided practice.",
        "محطات بمجموعات صغيرة وقوائم مراجعة معتمدة وتدريب موجّه.",
      ),
      primaryLabel: text("Reserve a station", "احجز محطة"),
      primaryHref: "/events/clinical-skills-week",
      tone: "russet",
    },
  },
  {
    id: "block-home-quick-links",
    type: "quick-links",
    name: text("Student shortcuts", "اختصارات الطالب"),
    enabled: true,
    visibility,
    schedule,
    data: {
      eyebrow: text("START WHERE YOU ARE", "ابدأ من موقعك"),
      title: text("One step, no searching.", "خطوة واحدة، دون بحث طويل."),
      items: [
        {
          id: "quick-basic",
          title: text("Basic Sciences", "العلوم الأساسية"),
          body: text("Current batch courses", "مساقات دفعتك الحالية"),
          href: "/learn/basic-sciences",
          icon: "book",
        },
        {
          id: "quick-clinical",
          title: text("Clinical Sciences", "العلوم السريرية"),
          body: text("Years four to six", "السنوات الرابعة إلى السادسة"),
          href: "/learn/clinical-sciences",
          icon: "heart",
        },
        {
          id: "quick-events",
          title: text("Medical events", "الفعاليات الطبية"),
          body: text("Workshops and conferences", "ورش ومؤتمرات"),
          href: "/events",
          icon: "calendar",
        },
      ],
      columns: 3,
      tone: "cream",
    },
  },
  {
    id: "block-home-course-grid",
    type: "course-grid",
    name: text("Current courses", "المساقات الحالية"),
    enabled: true,
    visibility: { audience: "students", locale: "all" },
    schedule,
    data: {
      eyebrow: text("ACADEMIC PULSE", "النبض الأكاديمي"),
      title: text("Continue from your current term.", "تابع من فصلك الحالي."),
      body: text(
        "This dynamic source will connect to the academic API.",
        "سيتصل هذا المصدر الديناميكي بواجهة البيانات الأكاديمية.",
      ),
      source: "current-courses",
      columns: 3,
    },
  },
  {
    id: "block-home-metrics",
    type: "metrics",
    name: text("Community signal", "إشارة المجتمع"),
    enabled: true,
    visibility,
    schedule,
    data: {
      eyebrow: text("ONE CLUB · MANY PATHS", "نادٍ واحد · مسارات عديدة"),
      title: text("A living medical campus.", "حرم طبي نابض."),
      items: [
        {
          id: "metric-resources",
          title: text("Resources", "المصادر"),
          value: "240+",
        },
        {
          id: "metric-events",
          title: text("Events", "الفعاليات"),
          value: "18",
        },
        {
          id: "metric-mentors",
          title: text("Mentors", "المرشدون"),
          value: "32",
        },
      ],
      tone: "ink",
    },
  },
  {
    id: "block-home-cta",
    type: "call-to-action",
    name: text("Closing invitation", "دعوة الختام"),
    enabled: true,
    visibility,
    schedule,
    data: {
      eyebrow: text("YOUR NEXT STEP", "خطوتك التالية"),
      title: text(
        "Find what moves your medical journey forward.",
        "اعثر على ما يدفع رحلتك الطبية للأمام.",
      ),
      body: text(
        "Search across courses, resources, events and opportunities.",
        "ابحث في المساقات والمصادر والفعاليات والفرص.",
      ),
      primaryLabel: text("Search MedClub", "ابحث في النادي"),
      primaryHref: "/search",
      tone: "red",
      align: "center",
    },
  },
];

const page = (
  id: string,
  slug: string,
  title: ReturnType<typeof text>,
  status: BuilderPageDocument["status"],
  blocks: BuilderBlock[],
  revision: number,
  audience: BuilderPageDocument["audience"] = "public",
): BuilderPageDocument => ({
  id,
  slug,
  title,
  status,
  theme: "pulse",
  audience,
  schedule:
    status === "scheduled" ? { startsAt: "2026-09-20T08:00:00+03:00" } : {},
  seo: {
    description: text(
      "MedClub at Hashemite University — learning, community and opportunity.",
      "النادي الطبي في الجامعة الهاشمية — تعلّم ومجتمع وفرص.",
    ),
    noIndex: false,
  },
  blocks,
  revision,
  createdAt: "2026-08-12T11:00:00+03:00",
  updatedAt: "2026-09-06T22:10:00+03:00",
  lastSavedAt: "2026-09-06T22:10:00+03:00",
  publishedAt: status === "published" ? "2026-09-01T09:00:00+03:00" : undefined,
});

export const builderPages: BuilderPageDocument[] = [
  page(
    "builder-home",
    "/",
    text("Homepage", "الصفحة الرئيسية"),
    "published",
    homepageBlocks,
    12,
  ),
  page(
    "builder-learn",
    "/learn",
    text("Learn gateway", "بوابة التعلّم"),
    "draft",
    [homepageBlocks[0], homepageBlocks[3]].map((block, index) => ({
      ...structuredClone(block),
      id: `learn-${index + 1}-${block.id}`,
    })),
    5,
    "students",
  ),
  page(
    "builder-community",
    "/community",
    text("Community hub", "مركز المجتمع"),
    "scheduled",
    [homepageBlocks[0], homepageBlocks[2], homepageBlocks[4]].map(
      (block, index) => ({
        ...structuredClone(block),
        id: `community-${index + 1}-${block.id}`,
      }),
    ),
    7,
  ),
  page(
    "builder-about",
    "/community/about",
    text("About MedClub", "عن النادي الطبي"),
    "draft",
    [
      {
        ...structuredClone(homepageBlocks[0]),
        id: "about-hero",
        data: {
          ...homepageBlocks[0].data,
          title: text(
            "Built by medical students, for medical students.",
            "بناه طلبة الطب، لطلبة الطب.",
          ),
        },
      },
      {
        ...structuredClone(homepageBlocks[4]),
        id: "about-metrics",
      },
    ],
    2,
  ),
];

export const builderTemplates: BuilderTemplate[] = [
  {
    id: "template-clinical-callout",
    name: text("Clinical callout", "إبراز سريري"),
    description: text(
      "A high-contrast reviewed medical notice.",
      "تنبيه طبي معتمد عالي الوضوح.",
    ),
    createdAt: "2026-09-02T12:00:00+03:00",
    block: structuredClone(homepageBlocks[1]),
  },
  {
    id: "template-student-cta",
    name: text("Student invitation", "دعوة الطالب"),
    description: text(
      "A centered final action for student journeys.",
      "دعوة ختامية لمسارات الطلبة.",
    ),
    createdAt: "2026-09-03T13:30:00+03:00",
    block: structuredClone(homepageBlocks[5]),
  },
];

export const builderVersions: BuilderVersion[] = [
  {
    id: "builder-version-home-12",
    pageId: "builder-home",
    versionNumber: 12,
    createdAt: "2026-09-01T09:00:00+03:00",
    createdBy: text("Technical Team Manager", "مدير الفريق التقني"),
    reason: text("Published homepage", "نشر الصفحة الرئيسية"),
    snapshot: structuredClone(builderPages[0]),
  },
  {
    id: "builder-version-home-11",
    pageId: "builder-home",
    versionNumber: 11,
    createdAt: "2026-08-30T18:20:00+03:00",
    createdBy: text("Homepage editor", "محرر الصفحة الرئيسية"),
    reason: text("Updated student shortcuts", "تحديث اختصارات الطلبة"),
    snapshot: {
      ...structuredClone(builderPages[0]),
      revision: 11,
      blocks: structuredClone(builderPages[0].blocks.slice(0, 5)),
    },
  },
];
