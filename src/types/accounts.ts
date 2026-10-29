import type { Operations } from "../services/api/schema.generated";
export type AcademicProfile =
  Operations["get_api_v1_me_academic_profile"]["response"];
export interface AccountService {
  academicProfile: () => Promise<AcademicProfile>;
  requestEmailChange: (
    password: string,
    newEmail: string,
  ) => Promise<{ challengeId: string }>;
  confirmEmailChange: (challengeId: string, code: string) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}
export interface PermissionRecord {
  id: string;
  name: string;
}
export interface NamedAccessRecord {
  id: string;
  name: string;
  version: string;
}
export interface TeamMemberRecord {
  id: string;
  userId: string;
  fullName: string;
  isManager: boolean;
  joinedAt: string;
  version: string;
}
export type UserDetails =
  Operations["get_api_v1_admin_users_by_id"]["response"];
export type AcademicProfileUpdate =
  Operations["patch_api_v1_admin_users_by_id_academic_profile"]["body"];
export interface AccessAdminService {
  getUser: (id: string) => Promise<UserDetails>;
  updateStatus: (
    id: string,
    status: NonNullable<UserDetails["accountStatus"]>,
    version: string,
  ) => Promise<void>;
  updateAcademicProfile: (
    id: string,
    input: AcademicProfileUpdate,
  ) => Promise<void>;
  setUserRoles: (
    id: string,
    roleIds: string[],
    version: string,
  ) => Promise<void>;
  verifyStudent: (
    id: string,
    approved: boolean,
    evidenceReference: string,
  ) => Promise<void>;
  revokeSessions: (id: string, incidentReference: string) => Promise<void>;
  setUserTitles: (
    id: string,
    titleIds: string[],
    version: string,
  ) => Promise<void>;
  teams: {
    list: () => Promise<NamedAccessRecord[]>;
    get: (id: string) => Promise<NamedAccessRecord>;
    save: (
      name: string,
      existing?: NamedAccessRecord,
    ) => Promise<NamedAccessRecord>;
    remove: (id: string, version: string) => Promise<void>;
    members: (id: string) => Promise<TeamMemberRecord[]>;
    addMember: (
      id: string,
      userId: string,
      isManager: boolean,
    ) => Promise<void>;
    removeMember: (
      id: string,
      userId: string,
      version: string,
    ) => Promise<void>;
    setAvailablePermissions: (
      id: string,
      permissionIds: string[],
      version: string,
    ) => Promise<void>;
    setMemberPermissions: (
      id: string,
      userId: string,
      permissionIds: string[],
      version: string,
    ) => Promise<void>;
  };
  titles: {
    list: () => Promise<NamedAccessRecord[]>;
    save: (
      name: string,
      existing?: NamedAccessRecord,
    ) => Promise<NamedAccessRecord>;
    remove: (id: string, version: string) => Promise<void>;
  };
}
