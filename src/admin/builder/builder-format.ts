import type { MessageKey } from "../../constants/messages";
import type {
  BuilderAudience,
  BuilderBlockType,
  BuilderPageStatus,
} from "../../types/builder";

const blockKeys = {
  hero: "builderBlockHero",
  announcement: "builderBlockAnnouncement",
  "rich-text": "builderBlockRichText",
  "quick-links": "builderBlockQuickLinks",
  "course-grid": "builderBlockCourseGrid",
  metrics: "builderBlockMetrics",
  media: "builderBlockMedia",
  "call-to-action": "builderBlockCta",
  group: "builderBlockGroup",
  spacer: "builderBlockSpacer",
} as const satisfies Record<BuilderBlockType, MessageKey>;

export const builderBlockKey = (type: BuilderBlockType): MessageKey =>
  blockKeys[type];

const statusKeys = {
  draft: "builderDrafts",
  scheduled: "builderScheduled",
  published: "builderPublished",
} as const satisfies Record<BuilderPageStatus, MessageKey>;

export const builderStatusKey = (status: BuilderPageStatus): MessageKey =>
  statusKeys[status];

const audienceKeys = {
  public: "builderAudiencePublic",
  students: "builderAudienceStudents",
  members: "builderAudienceMembers",
} as const satisfies Record<BuilderAudience, MessageKey>;

export const builderAudienceKey = (audience: BuilderAudience): MessageKey =>
  audienceKeys[audience];
