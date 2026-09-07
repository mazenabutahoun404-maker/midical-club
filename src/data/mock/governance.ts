import { text } from "../../lib/localize";
import type {
  AccessChangeRequest,
  CapabilityDefinition,
  GovernanceUser,
  RoleDefinition,
} from "../../types/governance";

export const capabilityDefinitions: CapabilityDefinition[] = [
  { id: "admin.access", group: "governance", label: text("Enter admin", "دخول الإدارة"), description: text("Open the control room.", "فتح غرفة التحكم."), highRisk: false },
  { id: "content.review", group: "content", label: text("Review content", "مراجعة المحتوى"), description: text("Request changes or approve submissions.", "طلب التعديلات أو اعتماد المشاركات."), highRisk: false },
  { id: "content.publish", group: "content", label: text("Publish content", "نشر المحتوى"), description: text("Make approved content public.", "إظهار المحتوى المعتمد للعامة."), highRisk: true },
  { id: "builder.manage", group: "content", label: text("Manage pages", "إدارة الصفحات"), description: text("Edit CMS pages and reusable blocks.", "تعديل صفحات المحتوى والأقسام القابلة لإعادة الاستخدام."), highRisk: false },
  { id: "builder.publish", group: "content", label: text("Publish pages", "نشر الصفحات"), description: text("Publish or schedule a managed page.", "نشر أو جدولة صفحة مُدارة."), highRisk: true },
  { id: "users.view", group: "people", label: text("View users", "عرض المستخدمين"), description: text("Inspect accounts and memberships.", "عرض الحسابات والعضويات."), highRisk: false },
  { id: "users.manage", group: "people", label: text("Manage users", "إدارة المستخدمين"), description: text("Invite, suspend and update accounts.", "دعوة الحسابات وتعليقها وتحديثها."), highRisk: true },
  { id: "roles.manage", group: "governance", label: text("Manage roles", "إدارة الأدوار"), description: text("Change role capability bundles.", "تغيير حزم صلاحيات الأدوار."), highRisk: true },
  { id: "governance.approve", group: "governance", label: text("Approve access", "اعتماد الوصول"), description: text("Approve high-risk access changes.", "اعتماد تغييرات الوصول عالية الخطورة."), highRisk: true },
  { id: "activity.view", group: "governance", label: text("View audit history", "عرض سجل التدقيق"), description: text("Inspect append-only operations history.", "فحص سجل العمليات غير القابل للتعديل."), highRisk: false },
  { id: "versions.restore", group: "operations", label: text("Restore versions", "استعادة الإصدارات"), description: text("Restore content as a new version.", "استعادة المحتوى كإصدار جديد."), highRisk: true },
  { id: "events.manage", group: "operations", label: text("Manage events", "إدارة الفعاليات"), description: text("Manage event lifecycle and attendance.", "إدارة دورة الفعاليات والحضور."), highRisk: false },
  { id: "store.manage", group: "operations", label: text("Manage store", "إدارة المتجر"), description: text("Manage inventory and reservations.", "إدارة المخزون والحجوزات."), highRisk: true },
];

const allCapabilities = capabilityDefinitions.map(({ id }) => id);

export const governanceRoles: RoleDefinition[] = [
  { id: "founder", name: text("Protected founder", "مؤسس محمي"), description: text("Permanent highest-trust account boundary.", "حد حساب دائم بأعلى مستوى ثقة."), capabilities: allCapabilities, memberCount: 5, protected: true, tone: "red" },
  { id: "president", name: text("President", "الرئيس"), description: text("Organization-wide operations and governance.", "العمليات والحوكمة على مستوى المؤسسة."), capabilities: allCapabilities.filter((item) => item !== "store.manage"), memberCount: 1, protected: false, tone: "russet" },
  { id: "technical-manager", name: text("Technical manager", "مدير الفريق التقني"), description: text("Platform, CMS and access operations.", "عمليات المنصة وإدارة المحتوى والوصول."), capabilities: ["admin.access", "builder.manage", "builder.publish", "users.view", "users.manage", "roles.manage", "governance.approve", "activity.view", "versions.restore"], memberCount: 2, protected: false, tone: "plum" },
  { id: "scientific-manager", name: text("Scientific manager", "مدير الفريق العلمي"), description: text("Scientific review and publishing.", "المراجعة والنشر العلميان."), capabilities: ["admin.access", "content.review", "content.publish", "builder.manage", "activity.view", "versions.restore"], memberCount: 4, protected: false, tone: "olive" },
  { id: "treasurer", name: text("Treasurer", "أمين الصندوق"), description: text("Store and financial operations only.", "عمليات المتجر والشؤون المالية فقط."), capabilities: ["admin.access", "store.manage", "activity.view"], memberCount: 1, protected: false, tone: "ink" },
  { id: "media-manager", name: text("Media manager", "مدير الفريق الإعلامي"), description: text("Editorial page preparation without access control.", "إعداد الصفحات التحريرية دون التحكم بالوصول."), capabilities: ["admin.access", "builder.manage", "content.review"], memberCount: 3, protected: false, tone: "russet" },
];

const founderNames = [
  ["Dr. Sara Naser", "د. سارة ناصر", "SN", "sara.naser"],
  ["Dr. Ahmad Khalil", "د. أحمد خليل", "AK", "ahmad.khalil"],
  ["Dr. Lina Odeh", "د. لينا عودة", "LO", "lina.odeh"],
  ["Dr. Omar Haddad", "د. عمر حداد", "OH", "omar.haddad"],
  ["Dr. Noor Saleh", "د. نور صالح", "NS", "noor.saleh"],
] as const;

export const governanceUsers: GovernanceUser[] = [
  ...founderNames.map(([en, ar, initials, email], index) => ({
    id: `founder-${index + 1}`,
    name: text(en, ar),
    email: `${email}@medclub.jo`,
    initials,
    status: "active" as const,
    isFounder: true,
    roleIds: ["founder"],
    memberships: [{ team: text("Founding council", "مجلس المؤسسين"), positions: [text("Founder", "مؤسس")], volunteerHours: 480 + index * 32 }],
    symbolicTitles: index === 0 ? [text("Founding chair", "رئيسة التأسيس")] : [],
    lastActiveAt: `2026-09-07T${String(12 - index).padStart(2, "0")}:20:00+03:00`,
  })),
  { id: "user-president", name: text("Maya Rahman", "مايا رحمن"), email: "maya.rahman@medclub.jo", initials: "MR", status: "active", isFounder: false, roleIds: ["president"], memberships: [{ team: text("Executive body", "الهيئة الإدارية"), positions: [text("President", "الرئيس")], volunteerHours: 214 }], symbolicTitles: [text("Community ambassador", "سفيرة المجتمع")], lastActiveAt: "2026-09-07T11:42:00+03:00" },
  { id: "user-tech", name: text("Yazan Qasem", "يزن قاسم"), email: "yazan.qasem@medclub.jo", initials: "YQ", status: "active", isFounder: false, roleIds: ["technical-manager"], memberships: [{ team: text("Technical team", "الفريق التقني"), positions: [text("Team manager", "مدير الفريق")], volunteerHours: 186 }], symbolicTitles: [], lastActiveAt: "2026-09-07T10:06:00+03:00" },
  { id: "user-science", name: text("Rana Dabbas", "رنا الدباس"), email: "rana.dabbas@medclub.jo", initials: "RD", status: "active", isFounder: false, roleIds: ["scientific-manager"], memberships: [{ team: text("Scientific team", "الفريق العلمي"), positions: [text("Scientific manager", "المدير العلمي")], volunteerHours: 152 }], symbolicTitles: [text("Research mentor", "مرشدة بحثية")], lastActiveAt: "2026-09-06T17:18:00+03:00" },
  { id: "user-treasurer", name: text("Laith Hmoud", "ليث حمود"), email: "laith.hmoud@medclub.jo", initials: "LH", status: "active", isFounder: false, roleIds: ["treasurer"], memberships: [{ team: text("Executive body", "الهيئة الإدارية"), positions: [text("Treasurer", "أمين الصندوق")], volunteerHours: 128 }], symbolicTitles: [], lastActiveAt: "2026-09-05T15:24:00+03:00" },
  { id: "user-media", name: text("Hala Issa", "هلا عيسى"), email: "hala.issa@medclub.jo", initials: "HI", status: "invited", isFounder: false, roleIds: ["media-manager"], memberships: [{ team: text("Media team", "الفريق الإعلامي"), positions: [text("Media manager", "مديرة الإعلام")], volunteerHours: 97 }], symbolicTitles: [], lastActiveAt: "2026-09-03T09:10:00+03:00" },
];

export const accessChangeRequests: AccessChangeRequest[] = [
  { id: "access-request-01", targetUserId: "user-science", targetUser: text("Rana Dabbas", "رنا الدباس"), requestedById: "user-tech", requestedBy: text("Yazan Qasem", "يزن قاسم"), addRoleIds: ["technical-manager"], removeRoleIds: [], reason: "Temporary page-builder ownership during the curriculum migration.", status: "pending", risk: "high", approvalsRequired: 2, approvals: [{ actorId: "founder-2", actor: text("Dr. Ahmad Khalil", "د. أحمد خليل"), decision: "approved", at: "2026-09-07T09:18:00+03:00" }], createdAt: "2026-09-07T08:40:00+03:00" },
  { id: "access-request-02", targetUserId: "user-media", targetUser: text("Hala Issa", "هلا عيسى"), requestedById: "user-president", requestedBy: text("Maya Rahman", "مايا رحمن"), addRoleIds: ["scientific-manager"], removeRoleIds: ["media-manager"], reason: "Move account access to the scientific review desk after onboarding.", status: "pending", risk: "high", approvalsRequired: 2, approvals: [], createdAt: "2026-09-06T14:15:00+03:00" },
];
