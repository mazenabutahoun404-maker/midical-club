import { text as t } from "../../lib/localize";
import type {
  ClubMembershipProfile,
  RecruitmentApplication,
  RecruitmentPosition,
} from "../../types/recruitment";

export const recruitmentPositions: RecruitmentPosition[] = [
  {
    id: "rp-technical-frontend",
    slug: "frontend-member",
    team: "technical",
    title: t("Frontend Member", "عضو تطوير الواجهات"),
    summary: t(
      "Shape fast, accessible student experiences across MedClub.",
      "ساهم في بناء تجارب طلابية سريعة وسهلة الوصول عبر منصة النادي.",
    ),
    description: t(
      "Work with the technical team on React interfaces, design-system components and careful quality checks for the student platform.",
      "اعمل مع الفريق التقني على واجهات React ومكوّنات نظام التصميم وفحوصات الجودة الدقيقة لمنصة الطلبة.",
    ),
    responsibilities: [
      t("Build responsive product interfaces", "بناء واجهات متجاوبة"),
      t(
        "Review accessibility and interaction states",
        "مراجعة الوصول وحالات التفاعل",
      ),
      t(
        "Document reusable components",
        "توثيق المكوّنات القابلة لإعادة الاستخدام",
      ),
    ],
    requirements: [
      t(
        "Comfort with React or modern JavaScript",
        "معرفة جيدة بـ React أو JavaScript الحديثة",
      ),
      t(
        "Ability to commit four hours each week",
        "القدرة على الالتزام بأربع ساعات أسبوعياً",
      ),
      t(
        "A thoughtful, collaborative review style",
        "أسلوب تعاوني ودقيق في المراجعة",
      ),
    ],
    skills: [
      t("React", "React"),
      t("Accessibility", "الوصول"),
      t("UI systems", "أنظمة الواجهات"),
    ],
    yearEligibility: [1, 2, 3, 4, 5, 6],
    commitmentHoursPerWeek: 4,
    openings: 3,
    applicationCount: 14,
    closesAt: "2026-09-22T23:59:00+03:00",
    status: "open",
    accent: "red",
    featured: true,
  },
  {
    id: "rp-scientific-review",
    slug: "academic-content-reviewer",
    team: "scientific",
    title: t("Academic Content Reviewer", "مراجع محتوى أكاديمي"),
    summary: t(
      "Help student resources stay clear, referenced and scientifically responsible.",
      "ساعد في إبقاء المصادر الطلابية واضحة وموثقة ومسؤولة علمياً.",
    ),
    description: t(
      "Review educational submissions with senior scientific reviewers and improve source quality before publication.",
      "راجع المساهمات التعليمية مع المراجعين العلميين وساهم في تحسين جودة المصادر قبل النشر.",
    ),
    responsibilities: [
      t("Check references and learning scope", "فحص المراجع والنطاق التعليمي"),
      t("Write specific revision notes", "كتابة ملاحظات تعديل محددة"),
      t("Keep review records complete", "الحفاظ على اكتمال سجلات المراجعة"),
    ],
    requirements: [
      t("Third year or above", "السنة الثالثة أو أعلى"),
      t("Strong source-checking habits", "مهارة قوية في التحقق من المصادر"),
      t(
        "Respect for the scientific approval workflow",
        "الالتزام بمسار الاعتماد العلمي",
      ),
    ],
    skills: [
      t("Evidence review", "مراجعة الأدلة"),
      t("Writing", "الكتابة"),
      t("Medical education", "التعليم الطبي"),
    ],
    yearEligibility: [3, 4, 5, 6],
    commitmentHoursPerWeek: 3,
    openings: 4,
    applicationCount: 21,
    closesAt: "2026-09-18T23:59:00+03:00",
    status: "closing-soon",
    accent: "russet",
    featured: true,
  },
  {
    id: "rp-media-story",
    slug: "medical-storyteller",
    team: "media",
    title: t("Medical Storyteller", "صانع محتوى طبي"),
    summary: t(
      "Turn club work into accurate, human stories for the student community.",
      "حوّل أعمال النادي إلى قصص دقيقة وإنسانية للمجتمع الطلابي.",
    ),
    description: t(
      "Plan bilingual campaign stories, interview members and create concise educational media with appropriate review.",
      "خطط لقصص حملات ثنائية اللغة، وأجرِ مقابلات مع الأعضاء، وأنشئ محتوى تعليمياً موجزاً يخضع للمراجعة المناسبة.",
    ),
    responsibilities: [
      t("Plan campaign narratives", "تخطيط قصص الحملات"),
      t("Prepare bilingual captions", "إعداد نصوص ثنائية اللغة"),
      t("Coordinate consent and review", "تنسيق الموافقات والمراجعة"),
    ],
    requirements: [
      t(
        "A small writing or design portfolio",
        "نماذج بسيطة من الكتابة أو التصميم",
      ),
      t("Careful handling of student stories", "التعامل المسؤول مع قصص الطلبة"),
      t("Three hours of weekly availability", "ثلاث ساعات متاحة أسبوعياً"),
    ],
    skills: [
      t("Storytelling", "السرد"),
      t("Arabic and English", "العربية والإنجليزية"),
      t("Visual communication", "التواصل البصري"),
    ],
    yearEligibility: [1, 2, 3, 4, 5, 6],
    commitmentHoursPerWeek: 3,
    openings: 2,
    applicationCount: 9,
    closesAt: "2026-09-25T23:59:00+03:00",
    status: "open",
    accent: "purple",
  },
  {
    id: "rp-activities-coordinator",
    slug: "event-experience-coordinator",
    team: "activities",
    title: t("Event Experience Coordinator", "منسق تجربة الفعاليات"),
    summary: t(
      "Make workshops and volunteering days feel organized from arrival to follow-up.",
      "اجعل الورش والأيام التطوعية منظمة من لحظة الوصول حتى المتابعة.",
    ),
    description: t(
      "Support registrations, accessible venue flow, volunteer briefings and post-event evaluation with the activities team.",
      "ادعم التسجيل وسهولة الحركة في الموقع وتوجيه المتطوعين وتقييم ما بعد الفعالية مع فريق الأنشطة.",
    ),
    responsibilities: [
      t("Prepare participant journeys", "إعداد رحلة المشاركين"),
      t("Coordinate check-in and volunteers", "تنسيق الدخول والمتطوعين"),
      t("Collect structured feedback", "جمع ملاحظات منظمة"),
    ],
    requirements: [
      t("Reliable communication", "تواصل موثوق"),
      t("Availability around selected events", "التفرغ خلال الفعاليات المحددة"),
      t(
        "Comfort working with a team under time limits",
        "القدرة على العمل ضمن فريق وتحت وقت محدد",
      ),
    ],
    skills: [
      t("Coordination", "التنسيق"),
      t("Volunteer care", "دعم المتطوعين"),
      t("Event operations", "تشغيل الفعاليات"),
    ],
    yearEligibility: [1, 2, 3, 4, 5, 6],
    commitmentHoursPerWeek: 4,
    openings: 5,
    applicationCount: 17,
    closesAt: "2026-09-29T23:59:00+03:00",
    status: "open",
    accent: "olive",
  },
  {
    id: "rp-operations-records",
    slug: "membership-records-assistant",
    team: "operations",
    title: t("Membership Records Assistant", "مساعد سجلات العضوية"),
    summary: t(
      "Keep team records, onboarding steps and verified hours understandable.",
      "حافظ على وضوح سجلات الفرق وخطوات الانضمام والساعات الموثقة.",
    ),
    description: t(
      "Support the secretary team with structured records and clear follow-up. This position does not grant website permissions.",
      "ادعم فريق الأمانة بسجلات منظمة ومتابعة واضحة. هذا الدور لا يمنح صلاحيات للموقع.",
    ),
    responsibilities: [
      t(
        "Maintain structured membership records",
        "الحفاظ على سجلات عضوية منظمة",
      ),
      t("Follow up on onboarding tasks", "متابعة مهام الانضمام"),
      t(
        "Prepare hour summaries for verification",
        "إعداد ملخصات الساعات للتحقق",
      ),
    ],
    requirements: [
      t("Careful attention to detail", "اهتمام دقيق بالتفاصيل"),
      t("Respect for member privacy", "احترام خصوصية الأعضاء"),
      t("Consistent weekly follow-up", "متابعة أسبوعية منتظمة"),
    ],
    skills: [
      t("Organization", "التنظيم"),
      t("Privacy", "الخصوصية"),
      t("Documentation", "التوثيق"),
    ],
    yearEligibility: [2, 3, 4, 5, 6],
    commitmentHoursPerWeek: 3,
    openings: 1,
    applicationCount: 12,
    closesAt: "2026-09-01T23:59:00+03:00",
    status: "closed",
    accent: "ink",
  },
];

export const demoRecruitmentApplications: RecruitmentApplication[] = [
  {
    id: "ra-demo-technical",
    studentId: "demo-student",
    positionId: "rp-technical-frontend",
    motivation:
      "I want to make the student platform simpler and more accessible across devices.",
    experience:
      "React course projects, interface testing and peer design reviews.",
    availability: "Four hours weekly, mainly Sunday and Tuesday evenings.",
    consentConfirmed: true,
    status: "onboarding",
    createdAt: "2026-08-16T10:00:00+03:00",
    updatedAt: "2026-09-02T15:30:00+03:00",
    submittedAt: "2026-08-16T10:15:00+03:00",
    interviewAt: "2026-08-27T16:00:00+03:00",
    interviewLocation: t(
      "Innovation Lab · Building C",
      "مختبر الابتكار · مبنى C",
    ),
    reviewerNote: t(
      "Welcome to the technical team. Complete the remaining orientation steps.",
      "أهلاً بك في الفريق التقني. أكمل خطوات التهيئة المتبقية.",
    ),
    history: [
      {
        id: "rh-tech-1",
        status: "submitted",
        at: "2026-08-16T10:15:00+03:00",
        note: t("Application received.", "تم استلام الطلب."),
      },
      {
        id: "rh-tech-2",
        status: "screening",
        at: "2026-08-20T12:00:00+03:00",
        note: t(
          "Application moved to team review.",
          "انتقل الطلب إلى مراجعة الفريق.",
        ),
      },
      {
        id: "rh-tech-3",
        status: "interview",
        at: "2026-08-23T14:00:00+03:00",
        note: t("Interview scheduled.", "تم تحديد المقابلة."),
      },
      {
        id: "rh-tech-4",
        status: "accepted",
        at: "2026-08-30T11:00:00+03:00",
        note: t("Application accepted.", "تم قبول الطلب."),
      },
      {
        id: "rh-tech-5",
        status: "onboarding",
        at: "2026-09-02T15:30:00+03:00",
        note: t("Onboarding started.", "بدأت مرحلة التهيئة."),
      },
    ],
    onboarding: [
      {
        id: "ob-code",
        title: t("Read the team charter", "قراءة ميثاق الفريق"),
        description: t(
          "Review responsibilities and communication norms.",
          "راجع المسؤوليات وقواعد التواصل.",
        ),
        completed: true,
      },
      {
        id: "ob-intro",
        title: t("Meet your team lead", "لقاء مسؤول الفريق"),
        description: t(
          "Join the short role and expectations session.",
          "انضم إلى جلسة تعريف الدور والتوقعات.",
        ),
        completed: true,
      },
      {
        id: "ob-tools",
        title: t("Set up the working tools", "إعداد أدوات العمل"),
        description: t(
          "Access is granted separately after identity checks.",
          "تُمنح صلاحيات الأدوات بشكل منفصل بعد التحقق.",
        ),
        completed: false,
      },
      {
        id: "ob-first",
        title: t("Choose a first task", "اختيار المهمة الأولى"),
        description: t(
          "Agree on a small, reviewed first contribution.",
          "اتفق على مساهمة أولى صغيرة تخضع للمراجعة.",
        ),
        completed: false,
      },
    ],
  },
  {
    id: "ra-demo-scientific",
    studentId: "demo-student",
    positionId: "rp-scientific-review",
    motivation:
      "I want to improve the clarity and referencing of shared academic resources.",
    experience: "Peer study-group notes and evidence summaries for physiology.",
    availability: "Three hours weekly after lectures.",
    consentConfirmed: true,
    status: "screening",
    createdAt: "2026-09-01T09:00:00+03:00",
    updatedAt: "2026-09-04T13:00:00+03:00",
    submittedAt: "2026-09-01T09:20:00+03:00",
    reviewerNote: t(
      "The scientific team is reviewing your references.",
      "يراجع الفريق العلمي المراجع التي أرفقتها.",
    ),
    history: [
      {
        id: "rh-science-1",
        status: "submitted",
        at: "2026-09-01T09:20:00+03:00",
        note: t("Application received.", "تم استلام الطلب."),
      },
      {
        id: "rh-science-2",
        status: "screening",
        at: "2026-09-04T13:00:00+03:00",
        note: t("Scientific review in progress.", "المراجعة العلمية جارية."),
      },
    ],
    onboarding: [],
  },
];

export const demoMembershipProfile: ClubMembershipProfile = {
  id: "membership-demo-technical",
  studentId: "demo-student",
  team: "technical",
  teamLabel: t("Technical Team", "الفريق التقني"),
  positions: [
    t("Frontend Member", "عضو تطوير الواجهات"),
    t("Accessibility Advocate", "مناصر الوصول"),
  ],
  joinedAt: "2025-10-12T12:00:00+03:00",
  active: true,
  volunteerHours: 128,
  organizationalOnly: true,
  recentHours: [
    {
      id: "vh-1",
      activity: t(
        "Course-page accessibility review",
        "مراجعة وصول صفحات المساقات",
      ),
      date: "2026-08-28T17:00:00+03:00",
      hours: 8,
      status: "verified",
      verifiedBy: t("Technical Team Manager", "مسؤول الفريق التقني"),
    },
    {
      id: "vh-2",
      activity: t(
        "Research workshop check-in support",
        "دعم تسجيل الحضور لورشة البحث",
      ),
      date: "2026-08-14T15:00:00+03:00",
      hours: 6,
      status: "verified",
      verifiedBy: t("Activities Manager", "مسؤول الأنشطة"),
    },
    {
      id: "vh-3",
      activity: t("Design-system documentation", "توثيق نظام التصميم"),
      date: "2026-08-05T16:00:00+03:00",
      hours: 10,
      status: "verified",
      verifiedBy: t("Technical Team Manager", "مسؤول الفريق التقني"),
    },
    {
      id: "vh-4",
      activity: t("Community media upload support", "دعم رفع وسائط المجتمع"),
      date: "2026-09-02T18:00:00+03:00",
      hours: 3,
      status: "pending",
    },
  ],
};
