import type { SiteContent } from "../../types/content";
import { text as t } from "../../lib/localize";
import { routes } from "../../constants/routes";
export const siteContent: SiteContent = {
  brand: {
    name: "MedClub",
    caption: t("THE MEDICAL CLUB", "النادي الطبي"),
    logoAlt: t("The Medical Club logo", "شعار النادي الطبي"),
    copyright: t(
      "© 2026 MedClub. Built around your journey.",
      "© ٢٠٢٦ النادي الطبي. نرافق رحلتك.",
    ),
  },
  navigation: {
    main: [
      {
        id: "community",
        label: t("Community", "المجتمع"),
        href: routes.community,
      },
      {
        id: "mentorship",
        label: t("Mentorship", "الإرشاد"),
        href: routes.mentorship,
      },
      {
        id: "opportunities",
        label: t("Opportunities", "الفرص"),
        href: routes.opportunities,
      },
      { id: "events", label: t("Events", "الفعاليات"), href: routes.events },
      {
        id: "contributions",
        label: t("Contribute", "ساهم"),
        href: routes.contributions,
      },
      {
        id: "recruitment",
        label: t("Join the team", "انضم إلى الفريق"),
        href: routes.recruitment,
      },
      {
        id: "store",
        label: t("Store", "المتجر"),
        href: routes.store,
      },
    ],
    academic: [
      {
        id: "basic",
        label: t("Basic Sciences", "العلوم الأساسية"),
        description: t(
          "Your foundation, course by course.",
          "أساس معرفتك، مساقاً بعد مساق.",
        ),
        href: routes.basic,
        icon: "book",
      },
      {
        id: "clinical",
        label: t("Clinical Sciences", "العلوم السريرية"),
        description: t(
          "Resources for your clinical years.",
          "مصادر لمرحلتك السريرية.",
        ),
        href: routes.clinical,
        icon: "stethoscope",
      },
      {
        id: "exams",
        label: t("Electronic Exams", "الامتحانات الإلكترونية"),
        description: t(
          "The examination platform, in a later release.",
          "منصة الامتحانات ضمن إصدار لاحق.",
        ),
        href: routes.exams,
        icon: "exam",
      },
    ],
    tools: [
      {
        id: "tools",
        label: t("Study tools", "أدوات الدراسة"),
        description: t(
          "A little focus goes a long way.",
          "التركيز يصنع فرقاً.",
        ),
        href: routes.utilities,
        icon: "timer",
      },
      {
        id: "library",
        label: t("My library", "مكتبتي"),
        description: t(
          "Keep your useful finds together.",
          "اجمع مصادرك المهمة في مكان واحد.",
        ),
        href: routes.library,
        icon: "library",
      },
    ],
    footer: [
      {
        id: "events",
        label: t("Events & workshops", "الفعاليات والورش"),
        href: routes.events,
      },
      {
        id: "opportunities",
        label: t("Opportunities", "الفرص"),
        href: routes.opportunities,
      },
      {
        id: "journal",
        label: t("Medical journal", "المجلة الطبية"),
        href: routes.journal,
      },
      {
        id: "community",
        label: t("Our community", "مجتمعنا"),
        href: routes.community,
      },
      {
        id: "mentorship",
        label: t("Mentorship", "الإرشاد"),
        href: routes.mentorship,
      },
      {
        id: "contributions",
        label: t("Contribute", "ساهم"),
        href: routes.contributions,
      },
      {
        id: "recruitment",
        label: t("Join the team", "انضم إلى الفريق"),
        href: routes.recruitment,
      },
      {
        id: "store",
        label: t("Store", "المتجر"),
        href: routes.store,
      },
    ],
  },
  hero: {
    eyebrow: t("YOUR NEXT CHAPTER STARTS HERE", "هنا تبدأ مرحلتك القادمة"),
    title: t("Learn beyond.", "تعلّم بلا حدود."),
    accent: t("Belong anywhere.", "انتمِ أينما كنت."),
    description: t(
      "A global home for medical students.",
      "بيت عالمي لطلبة الطب.",
    ),
    primary: {
      id: "learn",
      label: t("Explore MedClub", "اكتشف ميدكلب"),
      href: routes.learn,
    },
    secondary: {
      id: "community",
      label: t("Discover the community", "اكتشف المجتمع"),
      href: routes.community,
    },
    note: t(
      "Driven by students. Connected by purpose.",
      "بجهود الطلبة، وبهدف يجمعنا.",
    ),
    panelLabel: t("THE FUTURE IS OURS TO SHAPE", "نصنع مستقبلنا معاً"),
    panelTitle: t("Different journeys.", "رحلات متعددة."),
    panelAccent: t("One community.", "مجتمع واحد."),
    knowledge: t("Knowledge, shared.", "معرفة نتشاركها."),
    community: t("Community, connected.", "مجتمع مترابط."),
    searchTitle: t("What will you learn today?", "ماذا ستتعلّم اليوم؟"),
    searchHint: t(
      "Search courses, topics and resources",
      "ابحث عن المساقات والمواضيع والمصادر",
    ),
  },
  announcement: {
    label: t("UP NEXT", "قريباً"),
    title: t("Your first step into research", "خطوتك الأولى في البحث العلمي"),
    description: t(
      "15 September · Research workshop",
      "١٥ أيلول · ورشة بحث علمي",
    ),
    eventId: "e1",
  },
  pathways: [
    {
      id: "basic",
      label: t("Basic Sciences", "العلوم الأساسية"),
      description: t(
        "Strong foundations. One course at a time.",
        "أساس قوي، مساقاً بعد مساق.",
      ),
      href: routes.basic,
      icon: "book",
    },
    {
      id: "clinical",
      label: t("Clinical Sciences", "العلوم السريرية"),
      description: t(
        "From the classroom to your clinical years.",
        "من قاعة المحاضرات إلى التدريب السريري.",
      ),
      href: routes.clinical,
      icon: "stethoscope",
    },
    {
      id: "exams",
      label: t("Electronic Exams", "الامتحانات الإلكترونية"),
      description: t(
        "Your examination hub, in a later release.",
        "مركز الامتحانات ضمن إصدار لاحق.",
      ),
      href: routes.exams,
      icon: "exam",
    },
    {
      id: "tools",
      label: t("Study Tools", "أدوات الدراسة"),
      description: t(
        "Find your focus. Make your time count.",
        "ركّز واستثمر وقتك.",
      ),
      href: routes.utilities,
      icon: "timer",
    },
  ],
  headings: {
    announcement: {
      eyebrow: t("Latest update", "آخر المستجدات"),
      title: t("From the club", "من النادي"),
    },
    pathways: {
      eyebrow: t("Find your way", "اختر طريقك"),
      title: t("Follow your curiosity.", "اتبع فضولك."),
    },
    resources: {
      eyebrow: t("Less searching. More learning.", "بحث أقل. تعلّم أكثر."),
      title: t("Your next great find.", "اكتشافك القادم."),
    },
    events: {
      eyebrow: t("Good things happen together", "معاً نصنع تجارب أفضل"),
      title: t("Step out. Get involved.", "شارك. واكتشف المزيد."),
      description: t(
        "A new skill. A fresh perspective. A chance to give back.",
        "مهارة جديدة، ورؤية مختلفة، وفرصة للعطاء.",
      ),
    },
    opportunities: {
      eyebrow: t("Your next step", "خطوتك القادمة"),
      title: t("Open a new door", "افتح باباً جديداً"),
    },
    journal: {
      eyebrow: t("The medical journal", "المجلة الطبية"),
      title: t("Ideas worth sharing", "أفكار تستحق المشاركة"),
    },
    community: {
      eyebrow: t("This is your community", "هذا مجتمعك"),
      title: t(
        "Medicine is a journey.\nLet’s take it together.",
        "الطب رحلة.\nلنخضها معاً.",
      ),
    },
  },
  sections: [
    { id: "announcement", type: "announcement", enabled: true, order: 1 },
    { id: "pathways", type: "pathways", enabled: true, order: 2 },
    { id: "resources", type: "resources", enabled: true, order: 3 },
    { id: "events", type: "events", enabled: true, order: 4 },
    { id: "opportunities", type: "opportunities", enabled: true, order: 5 },
    { id: "journal", type: "journal", enabled: true, order: 6 },
    { id: "community", type: "community", enabled: true, order: 7 },
  ],
  community: {
    body: t(
      "Beyond the lectures and exam halls, there’s a community to learn with, contribute to, and call your own.",
      "بعيداً عن المحاضرات والامتحانات، هناك مجتمع تتعلّم معه وتشارك فيه وتنتمي إليه.",
    ),
    action: {
      id: "event",
      label: t("Find your next club event", "اكتشف فعالية النادي القادمة"),
      href: routes.community,
    },
  },
  footer: {
    description: t(
      "A shared home for curious minds, future doctors, and a community that moves forward together.",
      "مساحة تجمع العقول الفضولية وأطباء المستقبل ومجتمعاً يتقدّم معاً.",
    ),
    message: t(
      "Learn together.\nGive back.\nMake your next step count.",
      "نتعلّم معاً.\nنعطي لمجتمعنا.\nونصنع أثر خطواتنا.",
    ),
  },
  study: {
    title: t("Make a little room for focus.", "خصّص مساحة للتركيز."),
    description: t(
      "A quiet place to start your next study session.",
      "مكان هادئ لبدء جلسة دراستك القادمة.",
    ),
    durationSeconds: 1500,
    checklist: [
      t("Choose one topic to work on", "اختر موضوعاً واحداً للدراسة"),
      t("Gather the resources you need", "جهّز المصادر التي تحتاجها"),
      t("Set aside distractions", "أبعد مصادر التشتيت"),
      t(
        "Write down one question to answer",
        "اكتب سؤالاً واحداً تريد الإجابة عنه",
      ),
    ],
  },
};
