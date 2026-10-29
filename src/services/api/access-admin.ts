import type {
  AccessAdminService,
  NamedAccessRecord,
  TeamMemberRecord,
} from "../../types/accounts";
import type { ApiClient } from "./client";
import { ApiError } from "./client";
import { collectApiPages, record, requireId, string } from "./mapping";
import { requireVersion } from "./accounts";
const named = (value: unknown): NamedAccessRecord => {
  const row = record(value);
  return {
    id: requireId(row.id),
    name: string(row.name),
    version: string(row.version),
  };
};
const reference = (value: string) => {
  if (!value.trim())
    throw new ApiError(
      "Enter a reference for this action.",
      422,
      "REFERENCE_REQUIRED",
    );
  return value.trim();
};
export function createHttpAccessAdmin(api: ApiClient): AccessAdminService {
  return {
    getUser: (id) => api.call("get_api_v1_admin_users_by_id", { path: { id } }),
    updateStatus: async (id, status, version) => {
      requireVersion(version);
      await api.call("patch_api_v1_admin_users_by_id_status", {
        path: { id },
        body: { status, version },
        idempotencyKey: crypto.randomUUID(),
      });
    },
    updateAcademicProfile: async (id, input) => {
      requireVersion(input.version);
      if (!string(input.reason).trim())
        throw new ApiError(
          "Enter the reason for the academic change.",
          422,
          "REASON_REQUIRED",
        );
      await api.call("patch_api_v1_admin_users_by_id_academic_profile", {
        path: { id },
        body: input,
        idempotencyKey: crypto.randomUUID(),
      });
    },
    setUserRoles: async (id, roleIds, version) => {
      requireVersion(version);
      await api.call("put_api_v1_admin_users_by_id_roles", {
        path: { id },
        body: { roleIds, version },
        idempotencyKey: crypto.randomUUID(),
      });
    },
    verifyStudent: async (userId, approved, evidenceReference) => {
      await api.call(
        "post_api_v1_admin_security_students_by_userId_verification",
        {
          path: { userId },
          body: { approved, evidenceReference: reference(evidenceReference) },
          idempotencyKey: crypto.randomUUID(),
        },
      );
    },
    revokeSessions: async (userId, incidentReference) => {
      await api.call(
        "post_api_v1_admin_security_users_by_userId_revoke_sessions",
        {
          path: { userId },
          body: { incidentReference: reference(incidentReference) },
          idempotencyKey: crypto.randomUUID(),
        },
      );
    },
    setUserTitles: async (id, titleIds, version) => {
      requireVersion(version);
      await api.call("put_api_v1_admin_users_by_id_symbolic_titles", {
        path: { id },
        body: { titleIds, version },
        idempotencyKey: crypto.randomUUID(),
      });
    },
    teams: {
      list: async () =>
        (
          await collectApiPages(api, (Page) =>
            api.call("get_api_v1_admin_teams", {
              query: { Page, PageSize: 100 },
            }),
          )
        ).map(named),
      get: async (id) =>
        named(await api.call("get_api_v1_admin_teams_by_id", { path: { id } })),
      save: async (name, existing) => {
        if (!name.trim())
          throw new ApiError("Enter a team name.", 422, "NAME_REQUIRED");
        if (existing) {
          requireVersion(existing.version);
          return named(
            await api.call("put_api_v1_admin_teams_by_id", {
              path: { id: existing.id },
              body: { name: name.trim(), version: existing.version },
              idempotencyKey: crypto.randomUUID(),
            }),
          );
        }
        return named(
          await api.call("post_api_v1_admin_teams", {
            body: { name: name.trim() },
            idempotencyKey: crypto.randomUUID(),
          }),
        );
      },
      remove: async (id, version) => {
        requireVersion(version);
        await api.call("delete_api_v1_admin_teams_by_id", {
          path: { id },
          query: { version },
          idempotencyKey: crypto.randomUUID(),
        });
      },
      members: async (id) =>
        (
          await collectApiPages(api, (Page) =>
            api.call("get_api_v1_admin_teams_by_id_members", {
              path: { id },
              query: { Page, PageSize: 100 },
            }),
          )
        ).map((row): TeamMemberRecord => ({
          id: requireId(row.id),
          userId: requireId(row.userId),
          fullName: string(row.fullName),
          isManager: row.isManager === true,
          joinedAt: string(row.joinedAt),
          version: string(row.version),
        })),
      addMember: async (id, userId, isManager) => {
        if (!userId.trim())
          throw new ApiError("Select a user.", 422, "USER_REQUIRED");
        await api.call("post_api_v1_admin_teams_by_id_members", {
          path: { id },
          body: { userId, isManager },
          idempotencyKey: crypto.randomUUID(),
        });
      },
      removeMember: async (id, userId, version) => {
        requireVersion(version);
        await api.call("delete_api_v1_admin_teams_by_id_members_by_userId", {
          path: { id, userId },
          query: { version },
          idempotencyKey: crypto.randomUUID(),
        });
      },
      setAvailablePermissions: async (id, permissionIds, version) => {
        requireVersion(version);
        await api.call("put_api_v1_admin_teams_by_id_available_permissions", {
          path: { id },
          body: { permissionIds, version },
          idempotencyKey: crypto.randomUUID(),
        });
      },
      setMemberPermissions: async (id, userId, permissionIds, version) => {
        requireVersion(version);
        await api.call(
          "put_api_v1_admin_teams_by_id_members_by_userId_permissions",
          {
            path: { id, userId },
            body: { permissionIds, version },
            idempotencyKey: crypto.randomUUID(),
          },
        );
      },
    },
    titles: {
      list: async () =>
        (
          await collectApiPages(api, (Page) =>
            api.call("get_api_v1_admin_symbolic_titles", {
              query: { Page, PageSize: 100 },
            }),
          )
        ).map(named),
      save: async (name, existing) => {
        if (!name.trim())
          throw new ApiError("Enter a title.", 422, "NAME_REQUIRED");
        if (existing) {
          requireVersion(existing.version);
          return named(
            await api.call("put_api_v1_admin_symbolic_titles_by_id", {
              path: { id: existing.id },
              body: { name: name.trim(), version: existing.version },
              idempotencyKey: crypto.randomUUID(),
            }),
          );
        }
        return named(
          await api.call("post_api_v1_admin_symbolic_titles", {
            body: { name: name.trim() },
            idempotencyKey: crypto.randomUUID(),
          }),
        );
      },
      remove: async (id, version) => {
        requireVersion(version);
        await api.call("delete_api_v1_admin_symbolic_titles_by_id", {
          path: { id },
          query: { version },
          idempotencyKey: crypto.randomUUID(),
        });
      },
    },
  };
}
