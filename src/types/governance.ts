import type { Text } from "./content";

export type Capability =
  | "admin.access"
  | "content.review"
  | "content.publish"
  | "builder.manage"
  | "builder.publish"
  | "users.view"
  | "users.manage"
  | "roles.manage"
  | "governance.approve"
  | "activity.view"
  | "versions.restore"
  | "events.manage"
  | "store.manage";

export type CapabilityGroup = "content" | "people" | "governance" | "operations";

export interface CapabilityDefinition {
  id: Capability;
  group: CapabilityGroup;
  label: Text;
  description: Text;
  highRisk: boolean;
}

export interface RoleDefinition {
  id: string;
  name: Text;
  description: Text;
  capabilities: Capability[];
  memberCount: number;
  protected: boolean;
  tone: "red" | "russet" | "plum" | "olive" | "ink";
}

export interface TeamMembership {
  team: Text;
  positions: Text[];
  volunteerHours: number;
}

export interface GovernanceUser {
  id: string;
  name: Text;
  email: string;
  initials: string;
  status: "active" | "invited" | "suspended";
  isFounder: boolean;
  roleIds: string[];
  memberships: TeamMembership[];
  symbolicTitles: Text[];
  lastActiveAt: string;
}

export type AccessRequestStatus = "pending" | "approved" | "rejected";

export interface AccessApproval {
  actorId: string;
  actor: Text;
  decision: "approved" | "rejected";
  at: string;
  note?: string;
}

export interface AccessChangeRequest {
  id: string;
  targetUserId: string;
  targetUser: Text;
  requestedById: string;
  requestedBy: Text;
  addRoleIds: string[];
  removeRoleIds: string[];
  reason: string;
  status: AccessRequestStatus;
  risk: "high";
  approvalsRequired: number;
  approvals: AccessApproval[];
  createdAt: string;
  resolvedAt?: string;
}

export interface AccessSnapshot {
  actorId: string;
  roleIds: string[];
  capabilities: Capability[];
}

export interface GovernanceOverview {
  protectedFounders: number;
  activeUsers: number;
  roles: number;
  pendingRequests: number;
  highRiskRequests: number;
  generatedAt: string;
}

export interface AccessChangeInput {
  targetUserId: string;
  addRoleIds: string[];
  removeRoleIds: string[];
  reason: string;
}

export interface AccessDecisionInput {
  requestId: string;
  actorId: string;
  decision: "approve" | "reject";
  note?: string;
}

export interface GovernanceService {
  getAccess: () => Promise<AccessSnapshot>;
  getOverview: () => Promise<GovernanceOverview>;
  listCapabilities: () => Promise<CapabilityDefinition[]>;
  listUsers: () => Promise<GovernanceUser[]>;
  listRoles: () => Promise<RoleDefinition[]>;
  listRequests: () => Promise<AccessChangeRequest[]>;
  updateRoleCapabilities: (
    roleId: string,
    capabilities: Capability[],
  ) => Promise<RoleDefinition>;
  requestAccessChange: (input: AccessChangeInput) => Promise<AccessChangeRequest>;
  decideRequest: (input: AccessDecisionInput) => Promise<AccessChangeRequest>;
  suspendUser: (userId: string) => Promise<GovernanceUser>;
}
