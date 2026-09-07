import type { Text } from "./content";

export type RecruitmentTeam =
  "scientific" | "technical" | "media" | "activities" | "operations";

export type RecruitmentPositionStatus = "open" | "closing-soon" | "closed";

export interface RecruitmentPosition {
  id: string;
  slug: string;
  team: RecruitmentTeam;
  title: Text;
  summary: Text;
  description: Text;
  responsibilities: Text[];
  requirements: Text[];
  skills: Text[];
  yearEligibility: number[];
  commitmentHoursPerWeek: number;
  openings: number;
  applicationCount: number;
  closesAt: string;
  status: RecruitmentPositionStatus;
  accent: "red" | "russet" | "ink" | "olive" | "purple";
  featured?: boolean;
}

export type RecruitmentApplicationStatus =
  | "draft"
  | "submitted"
  | "screening"
  | "interview"
  | "accepted"
  | "rejected"
  | "onboarding"
  | "completed"
  | "withdrawn";

export interface RecruitmentHistoryEntry {
  id: string;
  status: RecruitmentApplicationStatus;
  at: string;
  note: Text;
}

export interface OnboardingTask {
  id: string;
  title: Text;
  description: Text;
  completed: boolean;
}

export interface RecruitmentApplicationInput {
  id?: string;
  positionId: string;
  motivation: string;
  experience: string;
  availability: string;
  consentConfirmed: boolean;
}

export interface RecruitmentApplication extends Omit<
  RecruitmentApplicationInput,
  "id"
> {
  id: string;
  studentId: string;
  status: RecruitmentApplicationStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  interviewAt?: string;
  interviewLocation?: Text;
  reviewerNote?: Text;
  history: RecruitmentHistoryEntry[];
  onboarding: OnboardingTask[];
}

export interface VolunteerHourEntry {
  id: string;
  activity: Text;
  date: string;
  hours: number;
  status: "pending" | "verified";
  verifiedBy?: Text;
}

export interface ClubMembershipProfile {
  id: string;
  studentId: string;
  team: RecruitmentTeam;
  teamLabel: Text;
  positions: Text[];
  joinedAt: string;
  active: boolean;
  volunteerHours: number;
  recentHours: VolunteerHourEntry[];
  organizationalOnly: true;
}
