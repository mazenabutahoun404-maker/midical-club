export type Locale = "en" | "ar";
export type Text = Record<Locale, string>;
export type Track = "basic" | "clinical";
export type ResourceKind = "slides" | "notes" | "summary" | "questions";
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
}
export interface ClubEvent {
  id: string;
  title: Text;
  type: Text;
  startDate: string;
  endDate: string;
  location: Text;
  description: Text;
  agenda: Text[];
}
export interface Opportunity {
  id: string;
  title: Text;
  organization: Text;
  type: Text;
  location: Text;
  deadline: string;
  eligibility: Text;
  description: Text;
}
export interface Article {
  id: string;
  title: Text;
  category: Text;
  excerpt: Text;
  readMinutes: number;
  body: Text[];
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
  id: string;
  title: Text;
  subtitle: Text;
  record: DetailRecord | { kind: "course"; item: Course };
}
