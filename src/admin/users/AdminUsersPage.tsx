import { AppLink } from "../../components/navigation/AppLink";
import { useMemo, useState, useRef } from "react";
import {
  BadgeCheck,
  Clock3,
  KeyRound,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useServices } from "../../app/providers/ServicesProvider";
import { ApiActionError } from "../../components/feedback/ApiActionError";
import { UserAccessControls } from "./UserAccessControls";
import { useLocale } from "../../app/providers/LocaleProvider";
import { PageIntro } from "../../components/data-display/PageIntro";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { SearchInput } from "../../components/forms/SearchInput";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/button";
import { formatDate } from "../../lib/dates";
import type { GovernanceUser } from "../../types/governance";
import {
  useAccess,
  useGovernanceActions,
  useGovernanceRoles,
  useGovernanceUsers,
} from "../governance/useGovernance";

export default function AdminUsersPage() {
  const { label, t, locale } = useLocale();
  const services = useServices();
  const live = services.governance.mode === "api";
  const access = useAccess();
  const rolesEnabled =
    !live || !!access.data?.permissions?.includes("roles.read");
  const usersQuery = useGovernanceUsers();
  const rolesQuery = useGovernanceRoles(rolesEnabled);
  const actions = useGovernanceActions();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>();
  const [requestOpen, setRequestOpen] = useState(false);
  const [addRoleId, setAddRoleId] = useState("");
  const [removeRoleId, setRemoveRoleId] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<unknown>(null);
  const requestTarget = useRef<GovernanceUser | null>(null);
  const filtered = useMemo(
    () =>
      (usersQuery.data || []).filter((user) =>
        `${t(user.name)} ${user.email}`
          .toLocaleLowerCase()
          .includes(query.trim().toLocaleLowerCase()),
      ),
    [query, t, usersQuery.data],
  );
  const basic =
    usersQuery.data?.find((user) => user.id === selectedId) ||
    filtered[0] ||
    usersQuery.data?.[0];
  const detail = useQuery({
    queryKey: ["governance", "user", basic?.id],
    queryFn: () => services.governance.getUser!(basic!.id),
    enabled: !!basic && !!services.governance.getUser,
  });
  if (usersQuery.isPending || (rolesEnabled && rolesQuery.isPending))
    return <LoadingState />;
  if (usersQuery.isError || (rolesEnabled && rolesQuery.isError))
    return (
      <ErrorState
        retry={() => {
          void usersQuery.refetch();
          void rolesQuery.refetch();
        }}
      />
    );
  const selected = detail.data?.id === basic?.id ? detail.data : basic;
  const rolesById = new Map(
    (rolesQuery.data || []).map((role) => [role.id, role]),
  );
  const submit = async () => {
    const target = requestTarget.current || selected;
    if (!target) return;
    setError(null);
    try {
      await actions.requestChange({
        targetUserId: target.id,
        targetVersion: target.version,
        addRoleIds: addRoleId ? [addRoleId] : [],
        removeRoleIds: removeRoleId ? [removeRoleId] : [],
        reason,
      });
      setRequestOpen(false);
      setAddRoleId("");
      setRemoveRoleId("");
      setReason("");
      toast.success(label("governanceRequestCreated"));
    } catch (caught) {
      setError(caught);
    }
  };
  return (
    <div className="container admin-page governance-users-page">
      <PageIntro
        eyebrow={label("governanceUsersEyebrow")}
        title={label("governanceUsersTitle")}
        description={label("governanceUsersBody")}
      />
      <section className="governance-user-layout">
        <aside className="governance-user-list">
          <header>
            <strong>{label("governanceAllUsers")}</strong>
            <span>{usersQuery.data.length}</span>
          </header>
          <SearchInput
            value={query}
            onChange={setQuery}
            label={label("governanceSearchUsers")}
          />
          <div className="governance-user-scroll">
            {filtered.map((user) => (
              <UserRow
                user={user}
                selected={selected?.id === user.id}
                onSelect={() => setSelectedId(user.id)}
                key={user.id}
              />
            ))}
          </div>
        </aside>
        {selected && (
          <article className="governance-user-inspector">
            <header>
              <span className="governance-avatar">{selected.initials}</span>
              <div>
                <h2>{t(selected.name)}</h2>
                <p>{selected.email}</p>
                <span
                  className="governance-account-state"
                  data-status={selected.status}
                >
                  {label(
                    selected.isFounder
                      ? "governanceFounder"
                      : selected.status === "active"
                        ? "governanceActive"
                        : selected.status === "invited"
                          ? "governanceInvited"
                          : "governanceSuspended",
                  )}
                </span>
              </div>
              {selected.isFounder && (
                <ShieldCheck className="governance-founder-seal" size={30} />
              )}
            </header>
            <p className="governance-last-active">
              <Clock3 size={15} />
              {label("governanceLastActive")} ·{" "}
              {selected.lastActiveAt
                ? formatDate(selected.lastActiveAt, locale, {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </p>
            <div className="governance-identity-grid">
              <section>
                <h3>
                  <KeyRound size={18} />
                  {label("governanceRolesLabel")}
                </h3>
                <div className="governance-chip-list">
                  {selected.roleIds.map((id) => (
                    <span data-kind="role" key={id}>
                      {rolesById.has(id) ? t(rolesById.get(id)!.name) : id}
                    </span>
                  ))}
                </div>
              </section>
              <section>
                <h3>
                  <UsersRound size={18} />
                  {label("governanceMembershipsLabel")}
                </h3>
                {selected.memberships.map((membership, index) => (
                  <div className="governance-membership" key={index}>
                    <strong>{t(membership.team)}</strong>
                    <span>
                      {membership.positionsVisible === false
                        ? t({
                            en: "Positions restricted",
                            ar: "المناصب غير متاحة لصلاحياتك",
                          })
                        : membership.positions.map(t).join(" · ") || "—"}
                    </span>
                    <small>
                      {membership.volunteerHours ?? "—"}{" "}
                      {label("governanceVolunteerHours")}
                    </small>
                  </div>
                ))}
              </section>
              <section>
                <h3>
                  <Sparkles size={18} />
                  {label("governanceTitlesLabel")}
                </h3>
                <div className="governance-chip-list">
                  {selected.symbolicTitles.length ? (
                    selected.symbolicTitles.map((title, index) => (
                      <span data-kind="title" key={index}>
                        {t(title)}
                      </span>
                    ))
                  ) : (
                    <small>{label("governanceNoTitles")}</small>
                  )}
                </div>
              </section>
            </div>
            {selected.isFounder && (
              <p className="governance-protected-note">
                <BadgeCheck size={18} />
                {label("governanceProtectedAction")}
              </p>
            )}
            <div className="governance-inspector-actions">
              <Button
                disabled={
                  live &&
                  (!access.data?.permissions?.includes("users.read") ||
                    !rolesEnabled ||
                    selected.isFounder ||
                    !selected.version)
                }
                onClick={() => {
                  requestTarget.current = structuredClone(selected);
                  setError(null);
                  setRequestOpen(true);
                }}
              >
                {label("governanceRequestChange")}
              </Button>
              <Button
                variant="outline"
                disabled={
                  selected.isFounder ||
                  actions.isMutating ||
                  (live &&
                    !access.data?.permissions?.includes("users.status.manage"))
                }
                onClick={() =>
                  void actions
                    .suspend({ id: selected.id, version: selected.version })
                    .catch(setError)
                }
              >
                {label("governanceSuspend")}
              </Button>
            </div>
            <ApiActionError
              error={error || detail.error}
              onReload={() => {
                void detail.refetch();
                void usersQuery.refetch();
                setError(null);
              }}
            />
            {live && <UserAccessControls user={selected} />}
            {services.academicAdmin &&
              access.data?.permissions?.includes("academics.read") && (
                <AppLink
                  className="button button-secondary"
                  href={`/admin/academics?student=${encodeURIComponent(selected.id)}`}
                >
                  {t({
                    en: "Open academic progression",
                    ar: "فتح التقدم الأكاديمي",
                  })}
                </AppLink>
              )}
          </article>
        )}
      </section>
      <Modal
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        title={label("governanceRequestTitle")}
        description={label("governanceRequestBody")}
        className="governance-request-modal"
      >
        <div className="governance-request-form">
          <label>
            {label("governanceAddRole")}
            <select
              value={addRoleId}
              onChange={(event) => setAddRoleId(event.target.value)}
            >
              <option value="">{label("governanceNoChange")}</option>
              {(rolesQuery.data || [])
                .filter((role) => !selected?.roleIds.includes(role.id))
                .map((role) => (
                  <option value={role.id} key={role.id}>
                    {t(role.name)}
                  </option>
                ))}
            </select>
          </label>
          <label>
            {label("governanceRemoveRole")}
            <select
              value={removeRoleId}
              disabled={selected?.isFounder}
              onChange={(event) => setRemoveRoleId(event.target.value)}
            >
              <option value="">{label("governanceNoChange")}</option>
              {selected?.roleIds.map((id) => (
                <option value={id} key={id}>
                  {rolesById.has(id) ? t(rolesById.get(id)!.name) : id}
                </option>
              ))}
            </select>
          </label>
          <label>
            {label("governanceReason")}
            <textarea
              rows={4}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={label("governanceReasonPlaceholder")}
            />
          </label>
          <ApiActionError
            error={error}
            onReload={() => {
              setRequestOpen(false);
              void detail.refetch();
            }}
          />
          <Button
            disabled={
              !reason.trim() ||
              (!addRoleId && !removeRoleId) ||
              actions.isMutating
            }
            onClick={() => void submit()}
          >
            {label("governanceSubmitRequest")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function UserRow({
  user,
  selected,
  onSelect,
}: {
  user: GovernanceUser;
  selected: boolean;
  onSelect: () => void;
}) {
  const { label, t } = useLocale();
  return (
    <button
      type="button"
      className={selected ? "active" : ""}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className="governance-avatar">{user.initials}</span>
      <span>
        <strong>{t(user.name)}</strong>
        <small>{user.email}</small>
      </span>
      {user.isFounder && (
        <ShieldCheck size={17} aria-label={label("governanceFounder")} />
      )}
    </button>
  );
}
