// Bundled site identity, navigation and presentation copy.
import type { SiteContent } from "../types/content";
import { text as t } from "../lib/localize";
import { routes } from "../constants/routes";
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
          "Practice questions, review explanations and build a focused exam session.",
          "تدرب على الأسئلة وراجع الشرح وأنشئ جلسة مركزة.",
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
    title: t("Find your", "ابدأ رحلتك"),
    accent: t("rhythm.", "بنبضٍ جديد."),
    description: t("Learn together. Go further.", "نتعلّم معاً. ونصل أبعد."),
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
      id: "courses",
      label: t("Courses", "المساقات"),
      description: t("Find your course", "اعثر على مساقك"),
      href: routes.learn,
      icon: "book",
    },
    {
      id: "exams",
      label: t("Exams", "الامتحانات"),
      description: t("Practice and recall", "تدرّب واستذكر"),
      href: routes.exams,
      icon: "exam",
    },
    {
      id: "tools",
      label: t("Study Tools", "أدوات الدراسة"),
      description: t("Plan a focused session", "خطّط لجلسة مركّزة"),
      href: routes.utilities,
      icon: "timer",
    },
    {
      id: "library",
      label: t("Saved library", "المكتبة المحفوظة"),
      description: t("Return to your saved items", "ارجع إلى محفوظاتك"),
      href: routes.library,
      icon: "library",
    },
  ],
  headings: {
    announcement: {
      eyebrow: t("Latest update", "آخر المستجدات"),
      title: t("From the club", "من النادي"),
    },
    pathways: {
      eyebrow: t("Your study desk", "مكتبك الدراسي"),
      title: t("Study shortcuts", "اختصارات الدراسة"),
    },
    resources: {
      eyebrow: t("The student library", "مكتبة الطالب"),
      title: t("Courses", "المساقات"),
    },
    events: {
      eyebrow: t("Beyond the classroom", "خارج قاعة المحاضرات"),
      title: t("Get involved", "شارك"),
      description: t(
        "Events, opportunities and ways to contribute.",
        "فعاليات وفرص ومسارات للمساهمة.",
      ),
    },
    opportunities: {
      eyebrow: t("Your next step", "خطوتك القادمة"),
      title: t("Opportunities", "الفرص"),
    },
    journal: {
      eyebrow: t("Student writing", "كتابات الطلبة"),
      title: t("Medical Journal", "المجلة الطبية"),
    },
    community: {
      eyebrow: t("This is your community", "هذا مجتمعك"),
      title: t("Community & mentorship", "المجتمع والإرشاد"),
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
      label: t("Explore the community", "استكشف المجتمع"),
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
