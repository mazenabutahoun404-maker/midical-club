import type {
  GovernanceService,
  GovernanceUser,
  RoleDefinition,
  AccessChangeRequest,
} from "../../types/governance";
import type { PermissionRecord } from "../../types/accounts";
import type { ApiClient } from "./client";
import { ApiError } from "./client";
import {
  assertOwner,
  array,
  collectApiPages,
  initials,
  localized,
  number,
  record,
  requireId,
  string,
  text,
} from "./mapping";
import { capabilitiesFor } from "./permissions";
import { requireVersion } from "./accounts";
import { createHttpAccessAdmin } from "./access-admin";
export const mapPermission = (value: unknown): PermissionRecord => {
  const row = record(value);
  return { id: requireId(row.id), name: string(row.name) };
};
export const mapRole = (row: Record<string, unknown>): RoleDefinition => {
  const permissions = array(row.permissions).map(mapPermission);
  return {
    id: requireId(row.id),
    version: string(row.version) || undefined,
    name: text(row.name),
    description: text(""),
    permissions,
    capabilities: capabilitiesFor(permissions.map((p) => p.name)),
    memberCount: number(row.memberCount),
    protected: row.isProtected === true,
    tone: row.isProtected === true ? "red" : "plum",
  };
};
export const mapUser = (row: Record<string, unknown>): GovernanceUser => ({
  id: requireId(row.id),
  version: string(row.version),
  accountStatus: string(row.accountStatus),
  name: text(row.fullName),
  email: string(row.email),
  initials: initials(string(row.fullName)),
  status:
    row.accountStatus === "Active"
      ? "active"
      : ["InvitationPending", "PendingEmailVerification"].includes(
            string(row.accountStatus),
          )
        ? "invited"
        : "suspended",
  isFounder: row.isFounder === true,
  roleIds: array(row.roleIds).map(String),
  memberships: [],
  symbolicTitles: [],
  lastActiveAt: string(row.lastActiveAt),
});
export const mapRequest = (
  row: Record<string, unknown>,
): AccessChangeRequest => ({
  id: requireId(row.id),
  version: string(row.version),
  targetUserId: string(row.targetUserId),
  targetUser: text(row.targetUserId),
  requestedById: string(row.requestedById),
  requestedBy: text(row.requestedById),
  addRoleIds: array(row.addRoleIds).map(String),
  removeRoleIds: array(row.removeRoleIds).map(String),
  reason: string(row.reason),
  status:
    string(row.status).toLowerCase() === "approved"
      ? "approved"
      : ["rejected", "cancelled"].includes(string(row.status).toLowerCase())
        ? "rejected"
        : "pending",
  risk: "high",
  approvalsRequired: number(row.approvalsRequired),
  approvals: array(row.decisions).map((value) => {
    const decision = record(value);
    return {
      actorId: string(decision.actorUserId),
      actor: text(decision.actorUserId),
      decision: string(decision.decision).toLowerCase().startsWith("approv")
        ? "approved"
        : "rejected",
      at: string(decision.decidedAt),
      note: string(decision.note),
    };
  }),
  createdAt: string(row.createdAt),
  resolvedAt: string(row.resolvedAt) || undefined,
  decisionsLoaded: Array.isArray(row.decisions),
});
export function createHttpGovernance(api: ApiClient): GovernanceService {
  const admin = createHttpAccessAdmin(api);
  const getAccess = async () => {
    if (!api.session.get())
      return { actorId: "", roleIds: [], capabilities: [], permissions: [] };
    const access = await api.call("get_api_v1_governance_access");
    return {
      actorId: requireId(access.actorId),
      roleIds: access.roleIds || [],
      permissions: access.permissions || [],
      capabilities: capabilitiesFor(access.permissions || []),
    };
  };
  const listUsers = async () =>
    (
      await collectApiPages(api, (Page) =>
        api.call("get_api_v1_admin_users", { query: { Page, PageSize: 100 } }),
      )
    ).map(mapUser);
  const listRoles = async () =>
    (
      await collectApiPages(api, (Page) =>
        api.call("get_api_v1_admin_roles", { query: { Page, PageSize: 100 } }),
      )
    ).map(mapRole);
  const listPermissions = async () =>
    (
      await collectApiPages(api, (Page) =>
        api.call("get_api_v1_admin_permissions", {
          query: { Page, PageSize: 100 },
        }),
      )
    ).map(mapPermission);
  const getUser = async (id: string) => {
    const owner = api.session.get()?.sessionId;
    const user = mapUser(record(await admin.getUser(id)));
    const access = await getAccess();
    assertOwner(api, owner);
    if (!access.permissions.includes("teams.read")) return user;
    const info = await api.call("get_api_v1_admin_users_by_id_memberships", {
      path: { id },
    });
    assertOwner(api, owner);
    user.memberships = info.memberships.map((row) => ({
      team: text(row.name),
      positions: (row.positions || []).map((p) =>
        localized(p.titleEn, p.titleAr),
      ),
      volunteerHours: row.volunteerHours,
      positionsVisible: row.positionsVisible,
      hoursVisible: row.hoursVisible,
    }));
    user.symbolicTitles = info.symbolicTitles.map((row) => text(row.name));
    user.symbolicTitleIds = info.symbolicTitles.map((row) => row.id);
    return user;
  };
  const getRequest = async (id: string) =>
    mapRequest(
      record(
        await api.call("get_api_v1_governance_access_requests_by_id", {
          path: { id },
        }),
      ),
    );
  const listMyRequests = async () =>
    (
      await collectApiPages(api, (page) =>
        api.call("get_api_v1_governance_access_requests_my", {
          query: { page, pageSize: 100 },
        }),
      )
    ).map(mapRequest);
  const listRequests = async () => {
    const access = await getAccess();
    if (!access.permissions.includes("roles.assign")) return listMyRequests();
    return (
      await collectApiPages(api, (page) =>
        api.call("get_api_v1_admin_governance_access_requests", {
          query: { page, pageSize: 100 },
        }),
      )
    ).map(mapRequest);
  };
  return {
    mode: "api",
    getAccess,
    listUsers,
    listRoles,
    listPermissions,
    getUser,
    getRequest,
    listMyRequests,
    listRequests,
    getOverview: async () => {
      const owner = api.session.get()?.sessionId;
      const access = await getAccess();
      const [users, roles, requests] = await Promise.all([
        access.permissions.includes("users.read") ? listUsers() : null,
        access.permissions.includes("roles.read") ? listRoles() : null,
        access.permissions.includes("roles.assign") ? listRequests() : null,
      ]);
      assertOwner(api, owner);
      const pending = requests?.filter(
        (request) => request.status === "pending",
      );
      return {
        protectedFounders: users
          ? users.filter((user) => user.isFounder).length
          : null,
        activeUsers: users
          ? users.filter((user) => user.accountStatus === "Active").length
          : null,
        roles: roles?.length ?? null,
        pendingRequests: pending?.length ?? null,
        highRiskRequests: pending
          ? pending.filter((request) => request.approvalsRequired > 1).length
          : null,
        generatedAt: new Date().toISOString(),
      };
    },
    listCapabilities: async () => {
      throw new ApiError(
        "Use the backend permission catalog.",
        422,
        "PERMISSION_IDS_REQUIRED",
      );
    },
    updateRoleCapabilities: async () => {
      throw new ApiError(
        "Edit the backend permission IDs for this role.",
        422,
        "PERMISSION_IDS_REQUIRED",
      );
    },
    updateRolePermissions: async (id, permissionIds, version) => {
      requireVersion(version);
      await api.call("put_api_v1_admin_roles_by_id_permissions", {
        path: { id },
        body: { permissionIds, version },
        idempotencyKey: crypto.randomUUID(),
      });
    },
    requestAccessChange: async (input) => {
      const owner = api.session.get()?.sessionId;
      requireVersion(input.targetVersion);
      if (!input.reason.trim())
        throw new ApiError("Enter a reason.", 422, "REASON_REQUIRED");
      if (input.addRoleIds.some((id) => input.removeRoleIds.includes(id)))
        throw new ApiError(
          "A role cannot be added and removed together.",
          422,
          "ROLE_CONFLICT",
        );
      const access = await getAccess();
      assertOwner(api, owner);
      if (access.actorId === input.targetUserId)
        throw new ApiError(
          "You cannot request your own access change.",
          403,
          "SELF_CHANGE_FORBIDDEN",
        );
      return mapRequest(
        record(
          await api.call("post_api_v1_admin_governance_access_requests", {
            body: {
              targetUserId: input.targetUserId,
              targetVersion: input.targetVersion,
              addRoleIds: input.addRoleIds,
              removeRoleIds: input.removeRoleIds,
              reason: input.reason.trim(),
            },
            idempotencyKey: crypto.randomUUID(),
          }),
        ),
      );
    },
    decideRequest: async (input) => {
      const owner = api.session.get()?.sessionId;
      requireVersion(input.version);
      const [access, request] = await Promise.all([
        getAccess(),
        getRequest(input.requestId),
      ]);
      assertOwner(api, owner);
      if (
        access.actorId !== input.actorId ||
        request.targetUserId === access.actorId ||
        request.requestedById === access.actorId ||
        request.approvals.some(
          (decision) => decision.actorId === access.actorId,
        )
      )
        throw new ApiError(
          "This request needs a different approver.",
          403,
          "APPROVER_CONFLICT",
        );
      if (request.version !== input.version || request.status !== "pending")
        throw new ApiError(
          "This request changed. Reload it before deciding.",
          409,
          "REQUEST_CHANGED",
        );
      return mapRequest(
        record(
          await api.call(
            "post_api_v1_admin_governance_access_requests_by_id_decisions",
            {
              path: { id: input.requestId },
              body: {
                version: input.version,
                decision: input.decision,
                note: input.note || null,
              },
              idempotencyKey: crypto.randomUUID(),
            },
          ),
        ),
      );
    },
    suspendUser: async (id, version) => {
      requireVersion(version);
      await admin.updateStatus(id, "Disabled", version);
      return;
    },
  };
}
