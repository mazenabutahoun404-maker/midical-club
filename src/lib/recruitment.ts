import type { MessageKey } from "../constants/messages";
import type {
  RecruitmentApplicationStatus,
  RecruitmentPositionStatus,
  RecruitmentTeam,
} from "../types/recruitment";

export const teamKey = (team: RecruitmentTeam): MessageKey =>
  ({
    scientific: "scientificTeam",
    technical: "technicalTeam",
    media: "mediaTeam",
    activities: "activitiesTeam",
    operations: "operationsTeam",
  })[team] as MessageKey;

export const positionStatusKey = (
  status: RecruitmentPositionStatus,
): MessageKey =>
  ({
    open: "positionOpen",
    "closing-soon": "closingSoon",
    closed: "positionClosed",
  })[status] as MessageKey;

export const applicationStatusKey = (
  status: RecruitmentApplicationStatus,
): MessageKey =>
  ({
    draft: "applicationDraft",
    submitted: "applicationSubmitted",
    screening: "applicationScreening",
    interview: "applicationInterview",
    accepted: "applicationAccepted",
    rejected: "applicationRejected",
    onboarding: "applicationOnboarding",
    completed: "applicationCompleted",
    withdrawn: "applicationWithdrawn",
  })[status] as MessageKey;

export const applicationStage = (status: RecruitmentApplicationStatus) => {
  if (status === "screening") return 1;
  if (status === "interview") return 2;
  if (status === "accepted" || status === "rejected") return 3;
  if (status === "onboarding") return 4;
  if (status === "completed") return 5;
  return 0;
};

export const activeApplication = (status: RecruitmentApplicationStatus) =>
  !["rejected", "withdrawn", "completed"].includes(status);
