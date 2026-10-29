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
  | "roles.view"
  | "teams.view"
  | "academics.manage"
  | "assets.manage"
  | "study-tools.manage"
  | "schedule.manage"
  | "publications.manage"
  | "engagement.manage"
  | "contributions.manage"
  | "governance.approve"
  | "activity.view"
  | "versions.restore"
  | "events.manage"
  | "membership.manage"
  | "operations.manage"
  | "store.manage";

export type CapabilityGroup =
  "content" | "people" | "governance" | "operations";

export interface CapabilityDefinition {
  id: Capability;
  group: CapabilityGroup;
  label: Text;
  description: Text;
  highRisk: boolean;
}

export interface RoleDefinition {
  id: string;
  version?: string;
  permissions?: import("./accounts").PermissionRecord[];
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
  volunteerHours: number | null;
  positionsVisible?: boolean;
  hoursVisible?: boolean;
}

export interface GovernanceUser {
  id: string;
  version?: string;
  accountStatus?: string;
  name: Text;
  email: string;
  initials: string;
  status: "active" | "invited" | "suspended";
  isFounder: boolean;
  roleIds: string[];
  memberships: TeamMembership[];
  symbolicTitles: Text[];
  symbolicTitleIds?: string[];
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
  version?: string;
  decisionsLoaded?: boolean;
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
  permissions?: string[];
}

export interface GovernanceOverview {
  protectedFounders: number | null;
  activeUsers: number | null;
  roles: number | null;
  pendingRequests: number | null;
  highRiskRequests: number | null;
  generatedAt: string;
}

export interface AccessChangeInput {
  targetUserId: string;
  addRoleIds: string[];
  removeRoleIds: string[];
  reason: string;
  targetVersion?: string;
}

export interface AccessDecisionInput {
  requestId: string;
  actorId: string;
  decision: "approve" | "reject";
  note?: string;
  version?: string;
}

export interface GovernanceService {
  mode?: "api" | "preview";
  getUser?: (id: string) => Promise<GovernanceUser>;
  listPermissions?: () => Promise<import("./accounts").PermissionRecord[]>;
  updateRolePermissions?: (
    id: string,
    permissionIds: string[],
    version: string,
  ) => Promise<void>;
  getRequest?: (id: string) => Promise<AccessChangeRequest>;
  listMyRequests?: () => Promise<AccessChangeRequest[]>;
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
  requestAccessChange: (
    input: AccessChangeInput,
  ) => Promise<AccessChangeRequest>;
  decideRequest: (input: AccessDecisionInput) => Promise<AccessChangeRequest>;
  suspendUser: (
    userId: string,
    version?: string,
  ) => Promise<GovernanceUser | void>;
}
