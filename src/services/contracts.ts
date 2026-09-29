import type { StudentProfile } from "../types/student";
import type { AuthService } from "../types/auth";
import type { AdminService } from "../types/admin";
import type { BuilderService } from "../types/builder";
import type { GovernanceService } from "../types/governance";
import type { InsightsService } from "../types/insights";
import type {
  ClubMembershipProfile,
  RecruitmentApplication,
  RecruitmentApplicationInput,
  RecruitmentPosition,
} from "../types/recruitment";
import type {
  WorkspaceService,
  CalendarItem,
  StudentNotification,
} from "../types/workspace";
import type {
  SiteContent,
  Course,
  Batch,
  ClinicalYear,
  Resource,
  ClubEvent,
  EventRegistration,
  Opportunity,
  Article,
  CommunityActivity,
  MediaStory,
  ExecutiveBody,
  Recognition,
  ClubValue,
  Mentor,
  MentorshipSession,
  MentorshipQuestion,
  MentorshipRequest,
  MentorshipRequestInput,
  MentorshipSessionRegistration,
  StudentContribution,
  ContributionInput,
  StoreProduct,
  StoreCart,
  StoreOrder,
  SearchResult,
  SearchFilters,
} from "../types/content";
export interface MedClubServices {
  /** Public lists are visible records. A sample source declares its fixed calendar anchor. */
  contentSnapshot?: { kind: "sample" | "live"; asOf?: string };
  auth: AuthService;
  admin: AdminService;
  builder: BuilderService;
  governance: GovernanceService;
  insights: InsightsService;
  workspace: WorkspaceService;
  calendar: { list: () => Promise<CalendarItem[]> };
  notifications: { list: () => Promise<StudentNotification[]> };
  personal: { getProfile: () => Promise<StudentProfile> };
  site: { get: () => Promise<SiteContent> };
  academics: {
    listCourses: () => Promise<Course[]>;
    listBatches: () => Promise<Batch[]>;
    listClinicalYears: () => Promise<ClinicalYear[]>;
  };
  resources: { list: () => Promise<Resource[]> };
  events: {
    list: () => Promise<ClubEvent[]>;
    get: (slug: string) => Promise<ClubEvent | null>;
    listRegistrations: (studentId: string) => Promise<EventRegistration[]>;
    register: (
      studentId: string,
      eventId: string,
    ) => Promise<EventRegistration>;
    cancel: (studentId: string, eventId: string) => Promise<void>;
  };
  opportunities: {
    list: () => Promise<Opportunity[]>;
    get: (slug: string) => Promise<Opportunity | null>;
  };
  journal: {
    list: () => Promise<Article[]>;
    get: (slug: string) => Promise<Article | null>;
  };
  community: {
    listActivities: () => Promise<CommunityActivity[]>;
    listMedia: () => Promise<MediaStory[]>;
    listExecutiveBodies: () => Promise<ExecutiveBody[]>;
    listRecognitions: () => Promise<Recognition[]>;
    listValues: () => Promise<ClubValue[]>;
  };
  mentorship: {
    listMentors: () => Promise<Mentor[]>;
    listSessions: () => Promise<MentorshipSession[]>;
    listQuestions: () => Promise<MentorshipQuestion[]>;
    listRequests: (studentId: string) => Promise<MentorshipRequest[]>;
    request: (
      studentId: string,
      input: MentorshipRequestInput,
    ) => Promise<MentorshipRequest>;
    cancelRequest: (studentId: string, requestId: string) => Promise<void>;
    listSessionRegistrations: (
      studentId: string,
    ) => Promise<MentorshipSessionRegistration[]>;
    registerSession: (
      studentId: string,
      sessionId: string,
    ) => Promise<MentorshipSessionRegistration>;
    cancelSessionRegistration: (
      studentId: string,
      sessionId: string,
    ) => Promise<void>;
  };
  contributions: {
    list: (studentId: string) => Promise<StudentContribution[]>;
    saveDraft: (
      studentId: string,
      input: ContributionInput,
    ) => Promise<StudentContribution>;
    submit: (studentId: string, id: string) => Promise<StudentContribution>;
    deleteDraft: (studentId: string, id: string) => Promise<void>;
  };
  recruitment: {
    listPositions: () => Promise<RecruitmentPosition[]>;
    getPosition: (slug: string) => Promise<RecruitmentPosition | null>;
    listApplications: (studentId: string) => Promise<RecruitmentApplication[]>;
    saveDraft: (
      studentId: string,
      input: RecruitmentApplicationInput,
    ) => Promise<RecruitmentApplication>;
    submit: (
      studentId: string,
      applicationId: string,
    ) => Promise<RecruitmentApplication>;
    withdraw: (
      studentId: string,
      applicationId: string,
    ) => Promise<RecruitmentApplication>;
    toggleOnboardingTask: (
      studentId: string,
      applicationId: string,
      taskId: string,
    ) => Promise<RecruitmentApplication>;
    getMemberProfile: (
      studentId: string,
    ) => Promise<ClubMembershipProfile | null>;
  };
  store: {
    listProducts: () => Promise<StoreProduct[]>;
    getProduct: (slug: string) => Promise<StoreProduct | null>;
    getCart: (studentId: string) => Promise<StoreCart>;
    addCartLine: (
      studentId: string,
      productId: string,
      variantId: string,
      quantity: number,
    ) => Promise<StoreCart>;
    setCartLine: (
      studentId: string,
      productId: string,
      variantId: string,
      quantity: number,
    ) => Promise<StoreCart>;
    removeCartLine: (
      studentId: string,
      productId: string,
      variantId: string,
    ) => Promise<StoreCart>;
    clearCart: (studentId: string) => Promise<StoreCart>;
    listOrders: (studentId: string) => Promise<StoreOrder[]>;
    reserveCart: (studentId: string) => Promise<StoreOrder>;
    cancelOrder: (studentId: string, orderId: string) => Promise<StoreOrder>;
  };
  search: {
    query: (query: string, filters?: SearchFilters) => Promise<SearchResult[]>;
  };
}
