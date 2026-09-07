import { text } from "../../lib/localize";
import type { BuilderBlock, BuilderBlockType } from "../../types/builder";

export const builderBlockTypes: BuilderBlockType[] = [
  "hero",
  "announcement",
  "rich-text",
  "quick-links",
  "course-grid",
  "metrics",
  "media",
  "call-to-action",
  "group",
  "spacer",
];

export function createBuilderBlock(
  type: BuilderBlockType,
  sequence: number,
): BuilderBlock {
  const id = `builder-block-${type}-${sequence}`;
  const base = {
    id,
    type,
    enabled: true,
    visibility: { audience: "public", locale: "all" } as const,
    schedule: {},
  };
  if (type === "hero")
    return {
      ...base,
      name: text("New hero", "واجهة رئيسية جديدة"),
      data: {
        eyebrow: text("MEDCLUB", "النادي الطبي"),
        title: text("A clear place to begin.", "مكان واضح للبداية."),
        body: text(
          "Introduce this page in one useful sentence.",
          "عرّف هذه الصفحة بجملة مفيدة واحدة.",
        ),
        primaryLabel: text("Explore", "استكشف"),
        primaryHref: "/learn",
        tone: "red",
        align: "start",
      },
    };
  if (type === "announcement")
    return {
      ...base,
      name: text("New announcement", "إعلان جديد"),
      data: {
        eyebrow: text("IMPORTANT UPDATE", "تحديث مهم"),
        title: text("Share one timely update.", "شارك تحديثاً مهماً واحداً."),
        body: text(
          "Add the context students need.",
          "أضف السياق الذي يحتاجه الطلبة.",
        ),
        tone: "russet",
      },
    };
  if (type === "rich-text")
    return {
      ...base,
      name: text("Text section", "قسم نصي"),
      data: {
        eyebrow: text("THE DETAILS", "التفاصيل"),
        title: text("Explain the idea clearly.", "اشرح الفكرة بوضوح."),
        body: text(
          "Write concise, reviewed copy here. Rich text rendering can connect to the production editor adapter later.",
          "اكتب هنا نصاً موجزاً ومراجعاً. يمكن ربط التنسيق بمحرر الإنتاج لاحقاً.",
        ),
        tone: "cream",
      },
    };
  if (type === "quick-links")
    return {
      ...base,
      name: text("Quick links", "روابط سريعة"),
      data: {
        title: text("Choose a direction.", "اختر وجهتك."),
        columns: 3,
        items: [
          {
            id: `${id}-1`,
            title: text("Learning", "التعلّم"),
            href: "/learn",
            icon: "book",
          },
          {
            id: `${id}-2`,
            title: text("Events", "الفعاليات"),
            href: "/events",
            icon: "calendar",
          },
          {
            id: `${id}-3`,
            title: text("Opportunities", "الفرص"),
            href: "/opportunities",
            icon: "research",
          },
        ],
      },
    };
  if (type === "course-grid")
    return {
      ...base,
      name: text("Dynamic course grid", "شبكة مساقات ديناميكية"),
      visibility: { audience: "students", locale: "all" },
      data: {
        eyebrow: text("ACADEMIC PULSE", "النبض الأكاديمي"),
        title: text("Current courses", "المساقات الحالية"),
        body: text(
          "Connected to structured academic data.",
          "متصل بالبيانات الأكاديمية المنظمة.",
        ),
        source: "current-courses",
        columns: 3,
      },
    };
  if (type === "metrics")
    return {
      ...base,
      name: text("Impact metrics", "مؤشرات الأثر"),
      data: {
        title: text("A useful signal.", "إشارة مفيدة."),
        tone: "ink",
        items: [
          {
            id: `${id}-1`,
            title: text("Resources", "المصادر"),
            value: "240+",
          },
          {
            id: `${id}-2`,
            title: text("Events", "الفعاليات"),
            value: "18",
          },
          {
            id: `${id}-3`,
            title: text("Mentors", "المرشدون"),
            value: "32",
          },
        ],
      },
    };
  if (type === "media")
    return {
      ...base,
      name: text("Media story", "قصة مرئية"),
      data: {
        title: text("A moment from MedClub", "لحظة من النادي الطبي"),
        body: text(
          "Use meaningful media with descriptive alternative text.",
          "استخدم وسائط هادفة مع نص بديل وصفي.",
        ),
        imageUrl: "",
        imageAlt: text("", ""),
        tone: "cream",
      },
    };
  if (type === "call-to-action")
    return {
      ...base,
      name: text("Call to action", "دعوة لاتخاذ إجراء"),
      data: {
        eyebrow: text("NEXT STEP", "الخطوة التالية"),
        title: text("Ready to continue?", "هل أنت مستعد للمتابعة؟"),
        body: text(
          "Give visitors one clear next action.",
          "امنح الزائر إجراءً تالياً واضحاً.",
        ),
        primaryLabel: text("Continue", "متابعة"),
        primaryHref: "/learn",
        align: "center",
        tone: "red",
      },
    };
  if (type === "group")
    return {
      ...base,
      name: text("Section group", "مجموعة أقسام"),
      data: {
        title: text("Connected ideas", "أفكار مترابطة"),
        columns: 2,
        children: [
          createBuilderBlock("rich-text", sequence * 10 + 1),
          createBuilderBlock("rich-text", sequence * 10 + 2),
        ],
      },
    };
  return {
    ...base,
    name: text("Breathing space", "مساحة تنفس"),
    data: { height: "medium" },
  };
}
