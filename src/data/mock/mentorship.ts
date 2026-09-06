import { text } from "../../lib/localize";
import type {
  Mentor,
  MentorshipQuestion,
  MentorshipRequest,
  MentorshipSession,
  MentorshipSessionRegistration,
} from "../../types/content";

/** Illustrative mentor profiles. Verify identity and consent before publication. */
export const mentors: Mentor[] = [
  {
    id: "mentor-lina",
    slug: "lina-haddad",
    name: text("Dr. Lina Haddad", "د. لينا حداد"),
    initials: text("LH", "ل ح"),
    title: text("MedClub graduate", "خريجة النادي الطبي"),
    specialty: text("Internal Medicine", "الطب الباطني"),
    graduationYear: 2023,
    bio: text(
      "Supports students as they move from classroom knowledge into supervised clinical learning.",
      "تدعم الطلبة في الانتقال من المعرفة الصفية إلى التعلّم السريري تحت الإشراف.",
    ),
    areas: [
      text("Clinical transitions", "الانتقال إلى المرحلة السريرية"),
      text("Residency planning", "التخطيط للإقامة"),
      text("Study systems", "أنظمة الدراسة"),
    ],
    languages: [text("Arabic", "العربية"), text("English", "الإنجليزية")],
    format: "hybrid",
    capacity: 5,
    activeMentees: 3,
    availability: text("Two places available", "مكانان متاحان"),
    featured: true,
  },
  {
    id: "mentor-omar",
    slug: "omar-khalil",
    name: text("Dr. Omar Khalil", "د. عمر خليل"),
    initials: text("OK", "ع خ"),
    title: text("Research mentor", "مرشد بحثي"),
    specialty: text("Public Health", "الصحة العامة"),
    graduationYear: 2021,
    bio: text(
      "Helps students turn broad interests into answerable research questions and responsible project plans.",
      "يساعد الطلبة على تحويل الاهتمامات الواسعة إلى أسئلة بحثية قابلة للإجابة وخطط مسؤولة.",
    ),
    areas: [
      text("Research questions", "أسئلة البحث"),
      text("Project planning", "تخطيط المشاريع"),
      text("Academic writing", "الكتابة الأكاديمية"),
    ],
    languages: [text("Arabic", "العربية"), text("English", "الإنجليزية")],
    format: "online",
    capacity: 4,
    activeMentees: 4,
    availability: text("Group sessions only", "جلسات جماعية فقط"),
  },
  {
    id: "mentor-sara",
    slug: "sara-nassar",
    name: text("Dr. Sara Nassar", "د. سارة نصار"),
    initials: text("SN", "س ن"),
    title: text("Alumni mentor", "مرشدة من الخريجين"),
    specialty: text("Pediatrics", "طب الأطفال"),
    graduationYear: 2022,
    bio: text(
      "Offers practical guidance on rotations, communication and finding a sustainable learning rhythm.",
      "تقدم إرشاداً عملياً حول الدورات السريرية والتواصل وإيجاد إيقاع تعلّم مستدام.",
    ),
    areas: [
      text("Rotation readiness", "الاستعداد للدورات السريرية"),
      text("Communication", "التواصل"),
      text("Career reflection", "التفكير المهني"),
    ],
    languages: [text("Arabic", "العربية"), text("English", "الإنجليزية")],
    format: "onsite",
    capacity: 6,
    activeMentees: 2,
    availability: text("Four places available", "أربعة أماكن متاحة"),
  },
  {
    id: "mentor-yazan",
    slug: "yazan-saleh",
    name: text("Dr. Yazan Saleh", "د. يزن صالح"),
    initials: text("YS", "ي ص"),
    title: text("Clinical skills mentor", "مرشد المهارات السريرية"),
    specialty: text("Emergency Medicine", "طب الطوارئ"),
    graduationYear: 2020,
    bio: text(
      "Mentors students on preparation, teamwork and learning safely inside supervised clinical settings.",
      "يرشد الطلبة حول الاستعداد والعمل الجماعي والتعلّم الآمن ضمن البيئات السريرية الخاضعة للإشراف.",
    ),
    areas: [
      text("Clinical teamwork", "العمل الجماعي السريري"),
      text("Feedback habits", "عادات الاستفادة من الملاحظات"),
      text("Career planning", "التخطيط المهني"),
    ],
    languages: [text("Arabic", "العربية"), text("English", "الإنجليزية")],
    format: "hybrid",
    capacity: 5,
    activeMentees: 1,
    availability: text("Four places available", "أربعة أماكن متاحة"),
  },
];

export const mentorshipSessions: MentorshipSession[] = [
  {
    id: "ms-research-question",
    slug: "research-question-clinic",
    mentorId: "mentor-omar",
    title: text("Research Question Clinic", "عيادة سؤال البحث"),
    topic: text("Research planning", "تخطيط البحث"),
    summary: text(
      "Bring one broad idea and learn how to narrow it into a question worth discussing with a supervisor.",
      "أحضر فكرة عامة وتعلّم كيف تضيقها إلى سؤال يستحق النقاش مع المشرف.",
    ),
    startsAt: "2026-09-10T17:00:00+03:00",
    endsAt: "2026-09-10T18:00:00+03:00",
    format: "online",
    location: text("Online room", "قاعة إلكترونية"),
    capacity: 20,
    registeredCount: 14,
    audience: text("Years 2–6", "السنوات ٢–٦"),
  },
  {
    id: "ms-clinical-transition",
    slug: "first-clinical-rotation",
    mentorId: "mentor-lina",
    title: text("Your First Clinical Rotation", "دورتك السريرية الأولى"),
    topic: text("Clinical transition", "الانتقال السريري"),
    summary: text(
      "A structured conversation about expectations, supervision and learning from feedback.",
      "حوار منظم حول التوقعات والإشراف والتعلّم من الملاحظات.",
    ),
    startsAt: "2026-09-16T16:00:00+03:00",
    endsAt: "2026-09-16T17:15:00+03:00",
    format: "hybrid",
    location: text("Skills Lab · Room 2", "مختبر المهارات · القاعة ٢"),
    capacity: 24,
    registeredCount: 21,
    audience: text("Years 3–4", "السنتان ٣–٤"),
  },
  {
    id: "ms-career-map",
    slug: "career-map-without-rushing",
    mentorId: "mentor-sara",
    title: text(
      "Build a Career Map Without Rushing",
      "ابنِ خريطة مهنية دون استعجال",
    ),
    topic: text("Career reflection", "التفكير المهني"),
    summary: text(
      "Compare interests, evidence and next experiments without treating one session as a final career decision.",
      "قارن الاهتمامات والأدلة والخطوات التجريبية دون اعتبار جلسة واحدة قراراً مهنياً نهائياً.",
    ),
    startsAt: "2026-09-22T15:30:00+03:00",
    endsAt: "2026-09-22T16:30:00+03:00",
    format: "onsite",
    location: text("Medical School · Seminar 1", "كلية الطب · قاعة الندوات ١"),
    capacity: 18,
    registeredCount: 18,
    audience: text("All medical students", "جميع طلبة الطب"),
  },
];

export const mentorshipQuestions: MentorshipQuestion[] = [
  {
    id: "mq-1",
    category: "research",
    question: text(
      "How specific should my first research question be?",
      "ما مدى التحديد المطلوب في أول سؤال بحثي لي؟",
    ),
    answer: text(
      "Specific enough that you can name the population, the issue and the outcome you want to understand. Treat the first version as something to refine with a qualified supervisor before collecting data.",
      "محدداً بما يكفي لتسمية الفئة والمشكلة والنتيجة التي تريد فهمها. اعتبر النسخة الأولى نقطة قابلة للتطوير مع مشرف مؤهل قبل جمع البيانات.",
    ),
    answeredBy: text("Research Mentorship Panel", "فريق الإرشاد البحثي"),
    answeredAt: "2026-08-29T12:00:00+03:00",
    tags: [text("Research", "البحث"), text("Supervision", "الإشراف")],
  },
  {
    id: "mq-2",
    category: "clinical-learning",
    question: text(
      "What should I prepare before my first clinical rotation?",
      "ماذا أجهز قبل أول دورة سريرية؟",
    ),
    answer: text(
      "Confirm the official schedule, dress and safety requirements, review the stated learning objectives, and know who supervises you. Clinical tasks must stay within the instructions and supervision provided by the training site.",
      "تأكد من الجدول الرسمي ومتطلبات اللباس والسلامة، وراجع أهداف التعلّم المحددة واعرف من يشرف عليك. يجب أن تبقى المهام السريرية ضمن تعليمات جهة التدريب وإشرافها.",
    ),
    answeredBy: text("Clinical Education Panel", "فريق التعليم السريري"),
    answeredAt: "2026-08-24T10:00:00+03:00",
    tags: [
      text("Clinical learning", "التعلّم السريري"),
      text("Safety", "السلامة"),
    ],
  },
  {
    id: "mq-3",
    category: "career",
    question: text(
      "Is it too early to explore specialties in the basic-science years?",
      "هل من المبكر استكشاف التخصصات خلال سنوات العلوم الأساسية؟",
    ),
    answer: text(
      "Exploration is useful when it stays open-ended. Attend verified sessions, notice what questions interest you and revisit your assumptions during later clinical exposure instead of forcing an early commitment.",
      "الاستكشاف مفيد عندما يبقى مفتوحاً. احضر جلسات موثوقة ولاحظ الأسئلة التي تهمك وراجع افتراضاتك خلال الخبرة السريرية لاحقاً بدلاً من فرض قرار مبكر.",
    ),
    answeredBy: text("Alumni Mentorship Panel", "فريق إرشاد الخريجين"),
    answeredAt: "2026-08-17T14:00:00+03:00",
    tags: [text("Career", "المسار المهني"), text("Exploration", "الاستكشاف")],
  },
  {
    id: "mq-4",
    category: "student-life",
    question: text(
      "How do I make a mentorship meeting useful?",
      "كيف أجعل لقاء الإرشاد مفيداً؟",
    ),
    answer: text(
      "Choose one or two questions, share enough context, take brief notes and agree on a realistic next step. A mentor offers perspective; they do not replace faculty policy, professional services or your own decisions.",
      "اختر سؤالاً أو سؤالين وقدّم سياقاً كافياً ودوّن ملاحظات قصيرة واتفق على خطوة واقعية. يقدم المرشد منظوراً ولا يحل مكان سياسات الكلية أو الخدمات المهنية أو قراراتك.",
    ),
    answeredBy: text("Mentorship Coordination Team", "فريق تنسيق الإرشاد"),
    answeredAt: "2026-08-10T11:00:00+03:00",
    tags: [text("Mentorship", "الإرشاد"), text("Planning", "التخطيط")],
  },
];

export const demoMentorshipRequests: MentorshipRequest[] = [
  {
    id: "mr-demo-accepted",
    studentId: "demo-student",
    mentorId: "mentor-lina",
    area: "Clinical transitions",
    note: "I would like to discuss preparing for the clinical years.",
    preferredFormat: "hybrid",
    status: "accepted",
    requestedAt: "2026-08-28T13:00:00+03:00",
    scheduledAt: "2026-09-14T16:30:00+03:00",
    response: text(
      "Your sample session is confirmed. Bring two questions you want to discuss.",
      "تم تأكيد جلستك التوضيحية. أحضر سؤالين ترغب في مناقشتهما.",
    ),
  },
];

export const demoMentorshipRegistrations: MentorshipSessionRegistration[] = [];
