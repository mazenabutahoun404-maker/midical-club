import type { Text } from "./content";

export type BuilderPageStatus = "draft" | "scheduled" | "published";
export type BuilderAudience = "public" | "students" | "members";
export type BuilderLocaleTarget = "all" | "en" | "ar";
export type BuilderTheme = "pulse" | "warm" | "clinical";
export type BuilderDevice = "desktop" | "tablet" | "phone";

export type BuilderBlockType =
  | "hero"
  | "announcement"
  | "rich-text"
  | "quick-links"
  | "course-grid"
  | "metrics"
  | "media"
  | "call-to-action"
  | "group"
  | "spacer";

export interface BuilderSchedule {
  startsAt?: string;
  endsAt?: string;
}

export interface BuilderVisibility {
  audience: BuilderAudience;
  locale: BuilderLocaleTarget;
}

export interface BuilderItem {
  id: string;
  title: Text;
  body?: Text;
  href?: string;
  value?: string;
  icon?: "heart" | "book" | "calendar" | "research";
}

export interface BuilderBlockData {
  eyebrow?: Text;
  title?: Text;
  body?: Text;
  align?: "start" | "center";
  tone?: "red" | "russet" | "ink" | "cream";
  primaryLabel?: Text;
  primaryHref?: string;
  secondaryLabel?: Text;
  secondaryHref?: string;
  items?: BuilderItem[];
  source?: "current-courses" | "latest-resources" | "upcoming-events";
  imageUrl?: string;
  imageAlt?: Text;
  caption?: Text;
  embedUrl?: string;
  height?: "small" | "medium" | "large";
  columns?: 1 | 2 | 3;
  children?: BuilderBlock[];
}

export interface BuilderBlock {
  id: string;
  type: BuilderBlockType;
  name: Text;
  enabled: boolean;
  visibility: BuilderVisibility;
  schedule: BuilderSchedule;
  data: BuilderBlockData;
}

export interface BuilderSeo {
  description: Text;
  socialImage?: string;
  noIndex: boolean;
}

export interface BuilderPageDocument {
  id: string;
  slug: string;
  title: Text;
  status: BuilderPageStatus;
  theme: BuilderTheme;
  audience: BuilderAudience;
  schedule: BuilderSchedule;
  seo: BuilderSeo;
  blocks: BuilderBlock[];
  revision: number;
  createdAt: string;
  updatedAt: string;
  lastSavedAt: string;
  publishedAt?: string;
}

export interface BuilderPageSummary {
  id: string;
  slug: string;
  title: Text;
  status: BuilderPageStatus;
  audience: BuilderAudience;
  blockCount: number;
  revision: number;
  updatedAt: string;
  scheduledAt?: string;
}

export interface BuilderTemplate {
  id: string;
  name: Text;
  description: Text;
  createdAt: string;
  block: BuilderBlock;
}

export interface BuilderVersion {
  id: string;
  pageId: string;
  versionNumber: number;
  createdAt: string;
  createdBy: Text;
  reason: Text;
  snapshot: BuilderPageDocument;
}

export interface CreateBuilderPageInput {
  title: Text;
  slug: string;
}

export interface BuilderService {
  listPages: () => Promise<BuilderPageSummary[]>;
  getPage: (pageId: string) => Promise<BuilderPageDocument | null>;
  createPage: (input: CreateBuilderPageInput) => Promise<BuilderPageDocument>;
  duplicatePage: (pageId: string) => Promise<BuilderPageDocument>;
  saveDraft: (page: BuilderPageDocument) => Promise<BuilderPageDocument>;
  publish: (pageId: string) => Promise<BuilderPageDocument>;
  schedule: (
    pageId: string,
    schedule: BuilderSchedule,
  ) => Promise<BuilderPageDocument>;
  listTemplates: () => Promise<BuilderTemplate[]>;
  saveTemplate: (
    name: Text,
    description: Text,
    block: BuilderBlock,
  ) => Promise<BuilderTemplate>;
  listVersions: (pageId: string) => Promise<BuilderVersion[]>;
  restoreVersion: (
    pageId: string,
    versionId: string,
  ) => Promise<BuilderPageDocument>;
}
