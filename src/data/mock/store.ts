import { text as t } from "../../lib/localize";
import type { StoreOrder, StoreProduct } from "../../types/content";

export const storeProducts: StoreProduct[] = [
  {
    id: "p-atlas-notebook",
    slug: "anatomy-atlas-notebook",
    name: t("Anatomy Atlas Notebook", "دفتر أطلس التشريح"),
    shortDescription: t(
      "A5 study notebook with structured anatomy spreads.",
      "دفتر دراسة بحجم A5 مع صفحات منظمة للتشريح.",
    ),
    description: t(
      "A practical notebook for labeled sketches, relations and rapid review. The interior alternates dot-grid pages with structured anatomy prompts.",
      "دفتر عملي للرسومات المسماة والعلاقات والمراجعة السريعة. يجمع بين الصفحات المنقطة وقوالب منظمة للتشريح.",
    ),
    category: "stationery",
    priceFils: 6500,
    visual: "notebook",
    accent: "red",
    materials: [
      t("120 gsm paper", "ورق 120 غرام"),
      t("Recycled hard cover", "غلاف صلب معاد التدوير"),
      t("160 pages", "160 صفحة"),
    ],
    variants: [
      {
        id: "atlas-red",
        sku: "MC-NB-RED",
        label: t("Clinical red", "أحمر سريري"),
        stock: 18,
      },
      {
        id: "atlas-russet",
        sku: "MC-NB-RUS",
        label: t("Warm russet", "خمري دافئ"),
        stock: 7,
      },
    ],
    featured: true,
  },
  {
    id: "p-club-hoodie",
    slug: "medclub-embroidered-hoodie",
    name: t("MedClub Embroidered Hoodie", "هودي النادي الطبي المطرز"),
    shortDescription: t(
      "A heavyweight layer with a restrained club mark.",
      "قطعة ثقيلة بطابع هادئ وشعار النادي.",
    ),
    description: t(
      "A relaxed university hoodie with the compact MedClub mark embroidered at the chest. Sample product details require supplier confirmation before launch.",
      "هودي جامعي مريح مع شعار النادي الطبي المطرز على الصدر. تفاصيل المنتج توضيحية وتحتاج تأكيد المورد قبل الإطلاق.",
    ),
    category: "apparel",
    priceFils: 26000,
    compareAtFils: 30000,
    visual: "hoodie",
    accent: "ink",
    materials: [
      t("Cotton-rich fleece", "نسيج غني بالقطن"),
      t("Embroidered mark", "شعار مطرز"),
      t("Relaxed fit", "قصة مريحة"),
    ],
    variants: [
      { id: "hoodie-s", sku: "MC-HD-S", label: t("Small", "صغير"), stock: 4 },
      { id: "hoodie-m", sku: "MC-HD-M", label: t("Medium", "متوسط"), stock: 9 },
      { id: "hoodie-l", sku: "MC-HD-L", label: t("Large", "كبير"), stock: 6 },
      {
        id: "hoodie-xl",
        sku: "MC-HD-XL",
        label: t("X-Large", "كبير جداً"),
        stock: 0,
      },
    ],
    featured: true,
  },
  {
    id: "p-scrub-cap",
    slug: "anatomy-line-scrub-cap",
    name: t("Anatomy Line Scrub Cap", "قبعة طبية بخطوط تشريحية"),
    shortDescription: t(
      "A breathable cap with an abstract anatomy-line pattern.",
      "قبعة خفيفة بنمط تجريدي مستوحى من التشريح.",
    ),
    description: t(
      "A reusable club accessory designed for simulation labs and supervised clinical environments where local policy permits it.",
      "قطعة قابلة لإعادة الاستخدام لمختبرات المحاكاة والبيئات السريرية المشرفة عندما تسمح سياسة المكان بذلك.",
    ),
    category: "apparel",
    priceFils: 9000,
    visual: "cap",
    accent: "russet",
    materials: [
      t("Breathable cotton blend", "خليط قطني جيد التهوية"),
      t("Adjustable tie", "رباط قابل للتعديل"),
      t(
        "Follow institutional dress policy",
        "يُستخدم وفق سياسة اللباس المؤسسية",
      ),
    ],
    variants: [
      {
        id: "cap-red",
        sku: "MC-CAP-RED",
        label: t("Arterial red", "أحمر شرياني"),
        stock: 12,
      },
      {
        id: "cap-russet",
        sku: "MC-CAP-RUS",
        label: t("Russet", "خمري"),
        stock: 8,
      },
    ],
  },
  {
    id: "p-tumbler",
    slug: "night-rounds-tumbler",
    name: t("Night Rounds Tumbler", "كوب المناوبات الليلية"),
    shortDescription: t(
      "An insulated tumbler for long study days.",
      "كوب معزول لأيام الدراسة الطويلة.",
    ),
    description: t(
      "A reusable insulated tumbler with a low-key pulse-line engraving and a leak-resistant lid.",
      "كوب معزول قابل لإعادة الاستخدام مع نقش نبض هادئ وغطاء مقاوم للتسرب.",
    ),
    category: "drinkware",
    priceFils: 11500,
    visual: "tumbler",
    accent: "olive",
    materials: [
      t("500 ml", "500 مل"),
      t("Stainless steel", "فولاذ مقاوم للصدأ"),
      t("Hand wash recommended", "يفضل الغسل اليدوي"),
    ],
    variants: [
      {
        id: "tumbler-ink",
        sku: "MC-TMB-INK",
        label: t("Graphite", "غرافيتي"),
        stock: 15,
      },
      {
        id: "tumbler-red",
        sku: "MC-TMB-RED",
        label: t("Deep red", "أحمر داكن"),
        stock: 3,
      },
    ],
  },
  {
    id: "p-badge-set",
    slug: "medical-symbol-badge-set",
    name: t("Medical Symbol Badge Set", "مجموعة شارات طبية"),
    shortDescription: t(
      "Three enamel pins inspired by learning and service.",
      "ثلاث شارات مستوحاة من التعلم والخدمة.",
    ),
    description: t(
      "A three-piece badge set for bags and lanyards: knowledge, community and service. Decorative only; not clinical identification.",
      "مجموعة من ثلاث شارات للحقائب والحبال: المعرفة والمجتمع والخدمة. للزينة فقط وليست تعريفاً سريرياً.",
    ),
    category: "accessories",
    priceFils: 4000,
    visual: "badge",
    accent: "red",
    materials: [
      t("Three enamel pins", "ثلاث شارات معدنية"),
      t("Rubber backs", "مثبتات مطاطية"),
      t("Decorative use", "للاستخدام الزخرفي"),
    ],
    variants: [
      {
        id: "badge-standard",
        sku: "MC-BDG-SET",
        label: t("Set of three", "مجموعة من ثلاث"),
        stock: 24,
      },
    ],
  },
];

export const demoStoreOrders: StoreOrder[] = [
  {
    id: "order-demo-1042",
    number: "MC-1042",
    studentId: "demo-student",
    status: "ready",
    lines: [
      {
        productId: "p-atlas-notebook",
        variantId: "atlas-russet",
        name: t("Anatomy Atlas Notebook", "دفتر أطلس التشريح"),
        variantLabel: t("Warm russet", "خمري دافئ"),
        unitPriceFils: 6500,
        quantity: 1,
      },
    ],
    subtotalFils: 6500,
    discountFils: 0,
    totalFils: 6500,
    reservedAt: "2026-09-01T11:30:00+03:00",
    pickupLocation: t("Student Activities Office", "مكتب الأنشطة الطلابية"),
  },
];
