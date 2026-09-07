import { STORAGE_KEYS } from "../constants/config";
import {
  accessChangeRequests,
  capabilityDefinitions,
  governanceRoles,
  governanceUsers,
} from "../data/mock/governance";
import { text } from "../lib/localize";
import type {
  AccessChangeRequest,
  Capability,
  GovernanceService,
  GovernanceUser,
  RoleDefinition,
} from "../types/governance";

interface GovernanceState {
  users: GovernanceUser[];
  roles: RoleDefinition[];
  requests: AccessChangeRequest[];
}

const currentActorId = "founder-1";
const mutationTime = "2026-09-07T13:20:00+03:00";
const seed = (): GovernanceState => ({
  users: structuredClone(governanceUsers),
  roles: structuredClone(governanceRoles),
  requests: structuredClone(accessChangeRequests),
});

function normalize(value: unknown): GovernanceState | null {
  if (!value || typeof value !== "object") return null;
  const state = value as Partial<GovernanceState>;
  if (!Array.isArray(state.users) || !Array.isArray(state.roles) || !Array.isArray(state.requests)) return null;
  if (!state.users.some((user) => user.id === currentActorId)) return null;
  if (state.users.filter((user) => user.isFounder).length !== 5) return null;
  return state as GovernanceState;
}

function uniqueCapabilities(capabilities: Capability[]) {
  const allowed = new Set(capabilityDefinitions.map(({ id }) => id));
  return [...new Set(capabilities)].filter((item) => allowed.has(item));
}

function refreshRoleCounts(state: GovernanceState) {
  state.roles = state.roles.map((role) => ({
    ...role,
    memberCount: state.users.filter((user) => user.roleIds.includes(role.id)).length,
  }));
}

/**
 * Device-local governance preview. Every invariant here must also be enforced by
 * the API and database before production; hiding a button is never authorization.
 */
export function createLocalGovernanceService(): GovernanceService {
  let memory = seed();
  let volatile = false;
  const read = () => {
    if (volatile) return structuredClone(memory);
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.governance);
      memory = (raw && normalize(JSON.parse(raw))) || seed();
    } catch {
      volatile = true;
    }
    return structuredClone(memory);
  };
  const write = (state: GovernanceState) => {
    refreshRoleCounts(state);
    memory = structuredClone(state);
    try {
      localStorage.setItem(STORAGE_KEYS.governance, JSON.stringify(state));
      volatile = false;
    } catch {
      volatile = true;
    }
  };
  const currentAccess = (state: GovernanceState) => {
    const actor = state.users.find((user) => user.id === currentActorId);
    if (!actor) throw new Error("GOVERNANCE_ACTOR_NOT_FOUND");
    return {
      actorId: actor.id,
      roleIds: [...actor.roleIds],
      capabilities: uniqueCapabilities(
        state.roles
          .filter((role) => actor.roleIds.includes(role.id))
          .flatMap((role) => role.capabilities),
      ),
    };
  };
  const applyRequest = (state: GovernanceState, request: AccessChangeRequest) => {
    const user = state.users.find((item) => item.id === request.targetUserId);
    if (!user) throw new Error("GOVERNANCE_USER_NOT_FOUND");
    if (user.isFounder && request.removeRoleIds.length)
      throw new Error("FOUNDER_PROTECTED");
    const validRoles = new Set(state.roles.map(({ id }) => id));
    user.roleIds = [
      ...new Set([
        ...user.roleIds.filter((id) => !request.removeRoleIds.includes(id)),
        ...request.addRoleIds.filter((id) => validRoles.has(id)),
      ]),
    ];
    if (user.isFounder && !user.roleIds.includes("founder"))
      throw new Error("FOUNDER_PROTECTED");
  };

  return {
    getAccess: async () => currentAccess(read()),
    getOverview: async () => {
      const state = read();
      return {
        protectedFounders: state.users.filter((user) => user.isFounder).length,
        activeUsers: state.users.filter((user) => user.status === "active").length,
        roles: state.roles.length,
        pendingRequests: state.requests.filter((request) => request.status === "pending").length,
        highRiskRequests: state.requests.filter((request) => request.status === "pending" && request.risk === "high").length,
        generatedAt: mutationTime,
      };
    },
    listCapabilities: async () => structuredClone(capabilityDefinitions),
    listUsers: async () => read().users,
    listRoles: async () => read().roles,
    listRequests: async () => read().requests,
    updateRoleCapabilities: async (roleId, capabilities) => {
      const state = read();
      const role = state.roles.find((item) => item.id === roleId);
      if (!role) throw new Error("GOVERNANCE_ROLE_NOT_FOUND");
      const next = uniqueCapabilities(capabilities);
      if (role.protected && role.capabilities.some((item) => !next.includes(item)))
        throw new Error("FOUNDER_ROLE_PROTECTED");
      role.capabilities = next;
      write(state);
      return structuredClone(role);
    },
    requestAccessChange: async (input) => {
      const state = read();
      const user = state.users.find((item) => item.id === input.targetUserId);
      if (!user) throw new Error("GOVERNANCE_USER_NOT_FOUND");
      if (!input.reason.trim()) throw new Error("GOVERNANCE_REASON_REQUIRED");
      if (user.isFounder && input.removeRoleIds.length)
        throw new Error("FOUNDER_PROTECTED");
      const validRoles = new Set(state.roles.map(({ id }) => id));
      if ([...input.addRoleIds, ...input.removeRoleIds].some((id) => !validRoles.has(id)))
        throw new Error("GOVERNANCE_ROLE_NOT_FOUND");
      const request: AccessChangeRequest = {
        id: `access-request-${Date.now()}`,
        targetUserId: user.id,
        targetUser: user.name,
        requestedById: currentActorId,
        requestedBy: text("Dr. Sara Naser", "د. سارة ناصر"),
        addRoleIds: [...new Set(input.addRoleIds)],
        removeRoleIds: [...new Set(input.removeRoleIds)],
        reason: input.reason.trim(),
        status: "pending",
        risk: "high",
        approvalsRequired: 2,
        approvals: [],
        createdAt: mutationTime,
      };
      state.requests.unshift(request);
      write(state);
      return structuredClone(request);
    },
    decideRequest: async (input) => {
      const state = read();
      const request = state.requests.find((item) => item.id === input.requestId);
      if (!request) throw new Error("GOVERNANCE_REQUEST_NOT_FOUND");
      if (request.status !== "pending") throw new Error("GOVERNANCE_REQUEST_RESOLVED");
      if (request.requestedById === input.actorId) throw new Error("GOVERNANCE_SELF_APPROVAL_BLOCKED");
      if (request.approvals.some((approval) => approval.actorId === input.actorId))
        throw new Error("GOVERNANCE_DUPLICATE_APPROVAL");
      const actor = state.users.find((user) => user.id === input.actorId);
      if (!actor) throw new Error("GOVERNANCE_ACTOR_NOT_FOUND");
      const actorCapabilities = uniqueCapabilities(
        state.roles.filter((role) => actor.roleIds.includes(role.id)).flatMap((role) => role.capabilities),
      );
      if (!actorCapabilities.includes("governance.approve")) throw new Error("GOVERNANCE_FORBIDDEN");
      request.approvals.push({
        actorId: actor.id,
        actor: actor.name,
        decision: input.decision === "approve" ? "approved" : "rejected",
        at: mutationTime,
        note: input.note?.trim() || undefined,
      });
      if (input.decision === "reject") {
        request.status = "rejected";
        request.resolvedAt = mutationTime;
      } else if (request.approvals.filter((item) => item.decision === "approved").length >= request.approvalsRequired) {
        applyRequest(state, request);
        request.status = "approved";
        request.resolvedAt = mutationTime;
      }
      write(state);
      return structuredClone(request);
    },
    suspendUser: async (userId) => {
      const state = read();
      const user = state.users.find((item) => item.id === userId);
      if (!user) throw new Error("GOVERNANCE_USER_NOT_FOUND");
      if (user.isFounder) throw new Error("FOUNDER_PROTECTED");
      user.status = "suspended";
      write(state);
      return structuredClone(user);
    },
  };
}
