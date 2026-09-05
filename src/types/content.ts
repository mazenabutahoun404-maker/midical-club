export type Locale = "en" | "ar";
export type Text = Record<Locale, string>;
export type Track = "basic" | "clinical";
export type ResourceKind =
  | "guidance"
  | "slides"
  | "notes"
  | "summary"
  | "recording"
  | "book"
  | "questions"
  | "external";
export type CourseSectionKind = "overview" | ResourceKind;
export type IconName =
  | "book"
  | "stethoscope"
  | "exam"
  | "timer"
  | "library"
  | "heart"
  | "brain"
  | "flask"
  | "bone"
  | "users";
export interface Course {
  id: string;
  slug: string;
  title: Text;
  code: string;
  track: Track;
  year: number;
  batch: Text;
  description: Text;
  accent: "russet" | "red" | "olive" | "purple";
  icon: IconName;
  credits: number;
  semester: number;
  lastUpdated: string;
  sharedWithBatchIds: string[];
  outcomes: Text[];
  sections: CourseSection[];
}
export interface CourseSection {
  id: string;
  kind: CourseSectionKind;
  title: Text;
  description: Text;
  order: number;
}
export interface AcademicTerm {
  id: string;
  label: Text;
  academicYear: string;
  semester: number;
  courseIds: string[];
  current: boolean;
}
export interface Batch {
  id: string;
  slug: string;
  name: Text;
  classLabel: Text;
  tagline: Text;
  description: Text;
  graduationYear: number;
  studyYear: number;
  progress: number;
  accent: "russet" | "red" | "olive";
  terms: AcademicTerm[];
}
export interface ClinicalYear {
  id: string;
  slug: "fourth-year" | "fifth-year" | "sixth-year";
  year: 4 | 5 | 6;
  label: Text;
  tagline: Text;
  description: Text;
  currentBlock: Text;
  focusAreas: Text[];
  courseIds: string[];
  accent: "red" | "russet" | "purple";
}
export interface Resource {
  id: string;
  title: Text;
  courseId: string;
  kind: ResourceKind;
  updatedAt: string;
  pages: number;
  description: Text;
  contributor: Text;
  fileUrl: string | null;
  keywords: string[];
  audience: "shared" | "batch";
  batchIds: string[];
  format: Text;
  durationMinutes?: number;
}
export interface ClubEvent {
  id: string;
  slug: string;
  title: Text;
  category: "workshop" | "talk" | "volunteering" | "conference" | "training";
  type: Text;
  startDate: string;
  endDate: string;
  location: Text;
  format: "onsite" | "hybrid" | "online";
  description: Text;
  agenda: Text[];
  audience: Text;
  capacity: number;
  registeredCount: number;
  waitlistEnabled: boolean;
  registrationOpensAt: string;
  registrationClosesAt: string;
  featured?: boolean;
}
export type EventRegistrationStatus = "registered" | "waitlisted";
export interface EventRegistration {
  eventId: string;
  studentId: string;
  status: EventRegistrationStatus;
  requestedAt: string;
}
export interface Opportunity {
  id: string;
  slug: string;
  title: Text;
  organization: Text;
  category:
    | "research"
    | "training"
    | "conference"
    | "grant"
    | "exchange"
    | "volunteering";
  type: Text;
  field: Text;
  location: Text;
  mode: Text;
  postedAt: string;
  deadline: string;
  yearEligibility: number[];
  eligibility: Text;
  description: Text;
  tags: Text[];
  verified: boolean;
  externalUrl: string | null;
  featured?: boolean;
}
export interface Article {
  id: string;
  slug: string;
  title: Text;
  category: Text;
  categoryId: "student-life" | "research" | "clinical" | "community";
  excerpt: Text;
  readMinutes: number;
  body: Text[];
  author: Text;
  reviewer: Text;
  publishedAt: string;
  tags: Text[];
  featured?: boolean;
}
export type CommunityActivityKind =
  "health-campaign" | "peer-learning" | "volunteering" | "student-life";
export interface CommunityActivity {
  id: string;
  slug: string;
  title: Text;
  kind: CommunityActivityKind;
  summary: Text;
  date: string;
  location: Text;
  participantCount: number;
  impact: Text;
  relatedEventId?: string;
  featured?: boolean;
}
export interface MediaStory {
  id: string;
  title: Text;
  caption: Text;
  capturedAt: string;
  kind: "photo-story" | "video" | "campaign";
  accent: "red" | "russet" | "olive" | "ink";
  relatedActivityId?: string;
}
export interface TeamMember {
  id: string;
  name: Text;
  role: Text;
  initials: Text;
  focus: Text;
}
export interface ExecutiveBody {
  id: string;
  term: string;
  title: Text;
  description: Text;
  current: boolean;
  members: TeamMember[];
}
export interface Recognition {
  id: string;
  kind: "honor-plate" | "hall-of-honor";
  name: Text;
  title: Text;
  contribution: Text;
  year: number;
}
export interface ClubValue {
  id: string;
  title: Text;
  description: Text;
}
export type SectionType =
  | "announcement"
  | "pathways"
  | "resources"
  | "events"
  | "opportunities"
  | "journal"
  | "community";
export interface HomeSection {
  id: string;
  type: SectionType;
  enabled: boolean;
  order: number;
  startsAt?: string;
  endsAt?: string;
}
export interface NavItem {
  id: string;
  label: Text;
  href: string;
  description?: Text;
  icon?: IconName;
}
export interface SectionHeading {
  eyebrow: Text;
  title: Text;
  description?: Text;
}
export interface SiteContent {
  brand: { name: string; caption: Text; logoAlt: Text; copyright: Text };
  navigation: {
    main: NavItem[];
    academic: NavItem[];
    tools: NavItem[];
    footer: NavItem[];
  };
  hero: {
    eyebrow: Text;
    title: Text;
    accent: Text;
    description: Text;
    primary: NavItem;
    secondary: NavItem;
    note: Text;
    panelLabel: Text;
    panelTitle: Text;
    panelAccent: Text;
    knowledge: Text;
    community: Text;
    searchTitle: Text;
    searchHint: Text;
  };
  announcement: {
    label: Text;
    title: Text;
    description: Text;
    eventId: string;
  };
  pathways: NavItem[];
  headings: Record<SectionType, SectionHeading>;
  sections: HomeSection[];
  community: { body: Text; action: NavItem };
  footer: { description: Text; message: Text };
  study: {
    title: Text;
    description: Text;
    checklist: Text[];
    durationSeconds: number;
  };
}
export type DetailRecord =
  | { kind: "resource"; item: Resource }
  | { kind: "event"; item: ClubEvent }
  | { kind: "opportunity"; item: Opportunity }
  | { kind: "article"; item: Article };
export interface SearchResult {
  matchReason?: "title" | "course" | "keyword";
  id: string;
  title: Text;
  subtitle: Text;
  record: DetailRecord | { kind: "course"; item: Course };
}
export interface SearchFilters {
  type?: SearchResult["record"]["kind"];
  track?: Track;
  resourceKind?: ResourceKind;
  courseId?: string;
  courseIds?: string[];
}
