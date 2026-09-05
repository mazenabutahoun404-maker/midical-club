import type {
  ClubValue,
  CommunityActivity,
  ExecutiveBody,
  MediaStory,
  Recognition,
} from "../../types/content";

export const communityActivities: CommunityActivity[] = [
  {
    id: "activity-1",
    slug: "know-your-numbers",
    title: { en: "Know Your Numbers Day", ar: "يوم اعرف أرقامك" },
    kind: "health-campaign",
    summary: {
      en: "A supervised campus awareness station focused on explaining routine measurements and appropriate follow-up.",
      ar: "محطة توعوية جامعية بإشراف مختصين تركز على شرح القياسات الروتينية والمتابعة المناسبة.",
    },
    date: "2026-08-20T10:00:00+03:00",
    location: { en: "Hashemite University", ar: "الجامعة الهاشمية" },
    participantCount: 184,
    impact: {
      en: "184 visitors received approved educational material.",
      ar: "تلقى ١٨٤ زائراً مواد توعوية معتمدة.",
    },
    featured: true,
  },
  {
    id: "activity-2",
    slug: "anatomy-peer-table",
    title: { en: "Anatomy Peer Table", ar: "طاولة تعلم التشريح" },
    kind: "peer-learning",
    summary: {
      en: "A small-group review built around labeled structures, questions and course-approved references.",
      ar: "مراجعة ضمن مجموعات صغيرة تعتمد على التراكيب المسماة والأسئلة ومراجع المساق المعتمدة.",
    },
    date: "2026-08-14T14:00:00+03:00",
    location: { en: "Medical Library", ar: "المكتبة الطبية" },
    participantCount: 48,
    impact: {
      en: "Six peer-led stations completed with faculty-approved material.",
      ar: "اكتملت ست محطات يقودها الطلبة باستخدام مواد معتمدة أكاديمياً.",
    },
  },
  {
    id: "activity-3",
    slug: "community-care-packing-day",
    title: {
      en: "Community Care Packing Day",
      ar: "يوم تجهيز طرود العناية المجتمعية",
    },
    kind: "volunteering",
    summary: {
      en: "Students prepared and catalogued community-care materials with a local partner.",
      ar: "جهّز الطلبة مواد عناية مجتمعية وفهرسوها بالتعاون مع شريك محلي.",
    },
    date: "2026-07-28T09:30:00+03:00",
    location: { en: "Student Activities Hall", ar: "قاعة الأنشطة الطلابية" },
    participantCount: 72,
    impact: {
      en: "320 clearly labeled care packs prepared for partner distribution.",
      ar: "تجهيز ٣٢٠ طرد عناية بعلامات واضحة لتوزيعها عبر الجهة الشريكة.",
    },
  },
  {
    id: "activity-4",
    slug: "white-coat-stories",
    title: { en: "White Coat Stories", ar: "حكايات المعطف الأبيض" },
    kind: "student-life",
    summary: {
      en: "An evening of short student reflections on transitions, teamwork and asking for help.",
      ar: "أمسية لتأملات طلابية قصيرة حول الانتقال والعمل الجماعي وطلب المساعدة.",
    },
    date: "2026-07-17T17:00:00+03:00",
    location: { en: "Innovation Auditorium", ar: "مدرج الابتكار" },
    participantCount: 126,
    impact: {
      en: "Twelve student stories archived with contributor permission.",
      ar: "أرشفة اثنتي عشرة قصة طلابية بعد موافقة المساهمين.",
    },
  },
  {
    id: "activity-5",
    slug: "research-reading-circle",
    title: { en: "Research Reading Circle", ar: "حلقة قراءة بحثية" },
    kind: "peer-learning",
    summary: {
      en: "A guided session for identifying the question, method and limitations in one published paper.",
      ar: "جلسة موجهة لتحديد السؤال والمنهجية والقيود في ورقة علمية منشورة.",
    },
    date: "2026-06-30T15:30:00+03:00",
    location: { en: "Seminar Room 2", ar: "قاعة الندوات ٢" },
    participantCount: 35,
    impact: {
      en: "Seven groups completed a structured critical-reading worksheet.",
      ar: "أكملت سبع مجموعات نموذج قراءة نقدية منظماً.",
    },
  },
  {
    id: "activity-6",
    slug: "school-health-partnership",
    title: { en: "School Health Partnership", ar: "شراكة الصحة المدرسية" },
    kind: "health-campaign",
    summary: {
      en: "An approved, age-appropriate health-literacy activity delivered with school staff.",
      ar: "نشاط معتمد للتثقيف الصحي المناسب للعمر نُفذ بالتعاون مع كادر المدرسة.",
    },
    date: "2026-06-12T09:00:00+03:00",
    location: { en: "Zarqa partner school", ar: "مدرسة شريكة في الزرقاء" },
    participantCount: 96,
    impact: {
      en: "Four interactive stations delivered using reviewed learning objectives.",
      ar: "تقديم أربع محطات تفاعلية بأهداف تعليمية خضعت للمراجعة.",
    },
  },
];

export const mediaStories: MediaStory[] = [
  {
    id: "media-1",
    title: { en: "A campus day in service", ar: "يوم جامعي في الخدمة" },
    caption: { en: "Know Your Numbers Day", ar: "يوم اعرف أرقامك" },
    capturedAt: "2026-08-20T10:00:00+03:00",
    kind: "photo-story",
    accent: "red",
    relatedActivityId: "activity-1",
  },
  {
    id: "media-2",
    title: {
      en: "Six tables, one anatomy map",
      ar: "ست طاولات وخريطة تشريح واحدة",
    },
    caption: {
      en: "Peer learning in practice",
      ar: "تعلّم الأقران في التطبيق",
    },
    capturedAt: "2026-08-14T14:00:00+03:00",
    kind: "video",
    accent: "russet",
    relatedActivityId: "activity-2",
  },
  {
    id: "media-3",
    title: {
      en: "Small actions, carefully packed",
      ar: "خطوات صغيرة جُهزت بعناية",
    },
    caption: { en: "Community care", ar: "العناية المجتمعية" },
    capturedAt: "2026-07-28T09:30:00+03:00",
    kind: "campaign",
    accent: "olive",
    relatedActivityId: "activity-3",
  },
  {
    id: "media-4",
    title: { en: "Voices from the journey", ar: "أصوات من الرحلة" },
    caption: { en: "White Coat Stories", ar: "حكايات المعطف الأبيض" },
    capturedAt: "2026-07-17T17:00:00+03:00",
    kind: "photo-story",
    accent: "ink",
    relatedActivityId: "activity-4",
  },
  {
    id: "media-5",
    title: { en: "Reading evidence together", ar: "نقرأ الدليل معاً" },
    caption: { en: "Research Reading Circle", ar: "حلقة القراءة البحثية" },
    capturedAt: "2026-06-30T15:30:00+03:00",
    kind: "video",
    accent: "red",
    relatedActivityId: "activity-5",
  },
  {
    id: "media-6",
    title: { en: "Health literacy at school", ar: "الثقافة الصحية في المدرسة" },
    caption: { en: "Partnership field notes", ar: "ملاحظات من الشراكة" },
    capturedAt: "2026-06-12T09:00:00+03:00",
    kind: "campaign",
    accent: "russet",
    relatedActivityId: "activity-6",
  },
];

export const executiveBodies: ExecutiveBody[] = [
  {
    id: "body-2026",
    term: "2026–2027",
    title: { en: "Executive Body", ar: "الهيئة التنفيذية" },
    description: {
      en: "Illustrative public profiles for the current term. Real names and appointments require club verification.",
      ar: "ملفات عامة توضيحية للدورة الحالية. تتطلب الأسماء والتكليفات الفعلية اعتماد النادي.",
    },
    current: true,
    members: [
      {
        id: "member-1",
        name: { en: "Mira H.", ar: "ميرا هـ." },
        role: { en: "President", ar: "الرئيسة" },
        initials: { en: "MH", ar: "م هـ" },
        focus: {
          en: "Club direction and accountability",
          ar: "اتجاه النادي والمساءلة",
        },
      },
      {
        id: "member-2",
        name: { en: "Omar K.", ar: "عمر ك." },
        role: { en: "Vice President", ar: "نائب الرئيس" },
        initials: { en: "OK", ar: "ع ك" },
        focus: { en: "Cross-team delivery", ar: "تنسيق التنفيذ بين الفرق" },
      },
      {
        id: "member-3",
        name: { en: "Layan S.", ar: "ليان س." },
        role: { en: "Scientific Team Manager", ar: "مديرة الفريق العلمي" },
        initials: { en: "LS", ar: "ل س" },
        focus: {
          en: "Scientific review and learning",
          ar: "المراجعة العلمية والتعلّم",
        },
      },
      {
        id: "member-4",
        name: { en: "Tariq A.", ar: "طارق أ." },
        role: { en: "Activities Manager", ar: "مدير الأنشطة" },
        initials: { en: "TA", ar: "ط أ" },
        focus: {
          en: "Events and community service",
          ar: "الفعاليات وخدمة المجتمع",
        },
      },
      {
        id: "member-5",
        name: { en: "Dana R.", ar: "دانا ر." },
        role: { en: "Media Team Manager", ar: "مديرة الفريق الإعلامي" },
        initials: { en: "DR", ar: "د ر" },
        focus: {
          en: "Editorial identity and media rights",
          ar: "الهوية التحريرية وحقوق الإعلام",
        },
      },
      {
        id: "member-6",
        name: { en: "Sami N.", ar: "سامي ن." },
        role: { en: "Technical Team Manager", ar: "مدير الفريق التقني" },
        initials: { en: "SN", ar: "س ن" },
        focus: {
          en: "Platform reliability and access",
          ar: "موثوقية المنصة والوصول",
        },
      },
    ],
  },
  {
    id: "body-2025",
    term: "2025–2026",
    title: { en: "Previous Executive Body", ar: "الهيئة التنفيذية السابقة" },
    description: {
      en: "Archived structure retained for institutional memory.",
      ar: "هيكل مؤرشف للاحتفاظ بالذاكرة المؤسسية.",
    },
    current: false,
    members: [],
  },
];

export const recognitions: Recognition[] = [
  {
    id: "honor-1",
    kind: "honor-plate",
    name: { en: "Rama Q.", ar: "راما ق." },
    title: { en: "Academic Support", ar: "الدعم الأكاديمي" },
    contribution: {
      en: "Sustained peer-learning coordination",
      ar: "تنسيق مستمر لتعلّم الأقران",
    },
    year: 2026,
  },
  {
    id: "honor-2",
    kind: "honor-plate",
    name: { en: "Khaled M.", ar: "خالد م." },
    title: { en: "Community Service", ar: "خدمة المجتمع" },
    contribution: {
      en: "Reliable field-team leadership",
      ar: "قيادة موثوقة للفرق الميدانية",
    },
    year: 2026,
  },
  {
    id: "honor-3",
    kind: "honor-plate",
    name: { en: "Hala T.", ar: "هلا ت." },
    title: { en: "Scientific Review", ar: "المراجعة العلمية" },
    contribution: {
      en: "Consistent editorial and source checking",
      ar: "تدقيق تحريري ومراجعة مستمرة للمصادر",
    },
    year: 2026,
  },
  {
    id: "hall-1",
    kind: "hall-of-honor",
    name: { en: "Founding Collective", ar: "المجموعة المؤسسة" },
    title: { en: "Foundational service", ar: "خدمة تأسيسية" },
    contribution: {
      en: "Established the club’s long-term student-service model",
      ar: "أسست نموذج النادي طويل المدى لخدمة الطلبة",
    },
    year: 2018,
  },
  {
    id: "hall-2",
    kind: "hall-of-honor",
    name: { en: "Academic Archive Team", ar: "فريق الأرشيف الأكاديمي" },
    title: { en: "Institutional memory", ar: "الذاكرة المؤسسية" },
    contribution: {
      en: "Created a durable, reviewed academic archive",
      ar: "أنشأ أرشيفاً أكاديمياً مستداماً خاضعاً للمراجعة",
    },
    year: 2022,
  },
];

export const clubValues: ClubValue[] = [
  {
    id: "knowledge",
    title: {
      en: "Knowledge, shared responsibly",
      ar: "معرفة نتشاركها بمسؤولية",
    },
    description: {
      en: "Academic and clinical material should be clear, sourced and scientifically reviewed.",
      ar: "يجب أن يكون المحتوى الأكاديمي والسريري واضحاً وموثقاً وخاضعاً للمراجعة العلمية.",
    },
  },
  {
    id: "service",
    title: { en: "Service with a purpose", ar: "خدمة ذات غاية" },
    description: {
      en: "Activities state who they serve and the outcome they are designed to create.",
      ar: "توضح الأنشطة من تخدم وما النتيجة التي تسعى إلى تحقيقها.",
    },
  },
  {
    id: "people",
    title: { en: "People before titles", ar: "الناس قبل الألقاب" },
    description: {
      en: "Leadership is responsibility; platform permissions remain separate and auditable.",
      ar: "القيادة مسؤولية، بينما تبقى صلاحيات المنصة منفصلة وقابلة للتدقيق.",
    },
  },
];
