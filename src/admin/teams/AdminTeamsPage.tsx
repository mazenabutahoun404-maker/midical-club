import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useServices } from "../../app/providers/ServicesProvider";
import { useAccess, usePermissions } from "../governance/useGovernance";
import type { NamedAccessRecord, TeamMemberRecord } from "../../types/accounts";
import { PageIntro } from "../../components/data-display/PageIntro";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { ApiActionError } from "../../components/feedback/ApiActionError";
import "../../styles/account-access.css";
type Edit = {
  kind: "name" | "delete" | "add-member" | "remove-member" | "permissions";
  record?: NamedAccessRecord;
  member?: TeamMemberRecord;
  scope: "teams" | "titles";
};
export default function AdminTeamsPage() {
  const services = useServices(),
    admin = services.accessAdmin;
  const { t, label } = useLocale();
  const access = useAccess();
  const can = (permission: string) =>
    !!access.data?.permissions?.includes(permission);
  const client = useQueryClient();
  const [tab, setTab] = useState<"teams" | "titles">("teams"),
    [selectedId, setSelected] = useState(""),
    [search, setSearch] = useState(""),
    [edit, setEdit] = useState<Edit | null>(null),
    [error, setError] = useState<unknown>(null),
    [busy, setBusy] = useState(false);
  const [name, setName] = useState(""),
    [confirmation, setConfirmation] = useState(""),
    [userId, setUserId] = useState(""),
    [manager, setManager] = useState(false),
    [permissionIds, setPermissionIds] = useState<string[]>([]),
    [replace, setReplace] = useState(false);
  const teams = useQuery({
    queryKey: ["access-admin", "teams"],
    queryFn: admin?.teams.list || (async () => []),
    enabled: !!admin && can("teams.read"),
  });
  const titles = useQuery({
    queryKey: ["access-admin", "titles"],
    queryFn: admin?.titles.list || (async () => []),
    enabled: !!admin && can("titles.manage"),
  });
  const selected =
    teams.data?.find((team) => team.id === selectedId) || teams.data?.[0];
  const team = useQuery({
    queryKey: ["access-admin", "team", selected?.id],
    queryFn: () => admin!.teams.get(selected!.id),
    enabled: !!selected && tab === "teams",
  });
  const members = useQuery({
    queryKey: ["access-admin", "members", selected?.id],
    queryFn: () => admin!.teams.members(selected!.id),
    enabled: !!selected && tab === "teams",
  });
  const permissions = usePermissions(can("roles.read"));
  const users = useQuery({
    queryKey: ["governance", "users"],
    queryFn: services.governance.listUsers,
    enabled: edit?.kind === "add-member" && can("users.read"),
  });
  useEffect(() => {
    if (access.data && !can("teams.read") && can("titles.manage"))
      setTab("titles");
  }, [access.data]);
  const open = (value: Edit) => {
    setEdit(value);
    setError(null);
    setName(value.record?.name || "");
    setConfirmation("");
    setUserId("");
    setManager(false);
    setPermissionIds([]);
    setReplace(false);
  };
  const reload = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: ["access-admin"] }),
      client.invalidateQueries({ queryKey: ["governance"] }),
    ]);
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!edit || !admin || busy) return;
    if (edit.kind !== "name" && !edit.record) return;
    if (edit.kind === "delete" && confirmation !== edit.record?.name) return;
    if (edit.kind === "permissions" && !replace) return;
    setBusy(true);
    setError(null);
    try {
      const source = edit.scope === "teams" ? admin.teams : admin.titles;
      if (edit.kind === "name") await source.save(name, edit.record);
      if (
        edit.kind === "delete" &&
        edit.record &&
        confirmation === edit.record.name
      )
        await source.remove(edit.record.id, edit.record.version);
      if (edit.kind === "add-member" && edit.record)
        await admin.teams.addMember(edit.record.id, userId, manager);
      if (edit.kind === "remove-member" && edit.record && edit.member)
        await admin.teams.removeMember(
          edit.record.id,
          edit.member.userId,
          edit.member.version,
        );
      if (edit.kind === "permissions" && edit.record && replace) {
        if (edit.member)
          await admin.teams.setMemberPermissions(
            edit.record.id,
            edit.member.userId,
            permissionIds,
            edit.member.version,
          );
        else
          await admin.teams.setAvailablePermissions(
            edit.record.id,
            permissionIds,
            edit.record.version,
          );
      }
      setEdit(null);
      await reload();
      toast.success(t({ en: "Changes saved", ar: "تم حفظ التغييرات" }));
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(false);
    }
  };
  if (!admin) return null;
  if (access.isPending) return <LoadingState />;
  const active = tab === "teams" ? teams : titles;
  if (active.isPending) return <LoadingState />;
  if (active.isError) return <ErrorState retry={() => void active.refetch()} />;
  const selectedTeam = team.data || selected;
  const title =
    edit?.kind === "permissions"
      ? t({
          en: "Replace permission assignments",
          ar: "استبدال تعيينات الصلاحيات",
        })
      : edit?.kind === "add-member"
        ? t({ en: "Add team member", ar: "إضافة عضو للفريق" })
        : edit?.kind === "remove-member"
          ? t({ en: "Remove team member", ar: "إزالة عضو من الفريق" })
          : edit?.kind === "delete"
            ? t({ en: "Delete", ar: "حذف" })
            : t({ en: "Edit name", ar: "تعديل الاسم" });
  return (
    <div className="container admin-page">
      <PageIntro
        title={t({ en: "Teams & titles", ar: "الفرق والألقاب" })}
        description={t({
          en: "Manage team membership, delegated access and symbolic titles.",
          ar: "إدارة عضوية الفرق والصلاحيات المفوّضة والألقاب الرمزية.",
        })}
      />
      <div className="access-management-toolbar">
        {can("teams.read") && (
          <Button
            variant={tab === "teams" ? "default" : "outline"}
            onClick={() => setTab("teams")}
          >
            {t({ en: "Teams", ar: "الفرق" })}
          </Button>
        )}
        {can("titles.manage") && (
          <Button
            variant={tab === "titles" ? "default" : "outline"}
            onClick={() => setTab("titles")}
          >
            {t({ en: "Titles", ar: "الألقاب" })}
          </Button>
        )}
        {(tab === "teams" ? can("teams.manage") : can("titles.manage")) && (
          <Button onClick={() => open({ kind: "name", scope: tab })}>
            {t({ en: "Create", ar: "إنشاء" })}
          </Button>
        )}
      </div>
      <div className="account-api-form">
        <label>
          {label("search")}
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>
      {tab === "titles" ? (
        <section className="access-management-card">
          {!titles.data?.length && (
            <p>
              {t({
                en: "No symbolic titles yet.",
                ar: "لا توجد ألقاب رمزية حالياً.",
              })}
            </p>
          )}
          {titles.data
            ?.filter((item) =>
              item.name.toLowerCase().includes(search.toLowerCase()),
            )
            .map((item) => (
              <div className="access-row" key={item.id}>
                <span>{item.name}</span>
                <div className="access-row-actions">
                  <Button
                    variant="outline"
                    onClick={() =>
                      open({ kind: "name", scope: "titles", record: item })
                    }
                  >
                    {t({ en: "Rename", ar: "إعادة التسمية" })}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      open({ kind: "delete", scope: "titles", record: item })
                    }
                  >
                    {t({ en: "Delete", ar: "حذف" })}
                  </Button>
                </div>
              </div>
            ))}
        </section>
      ) : (
        <div className="access-management-columns">
          <nav
            className="access-management-list"
            aria-label={t({ en: "Teams", ar: "الفرق" })}
          >
            {teams.data
              ?.filter((item) =>
                item.name.toLowerCase().includes(search.toLowerCase()),
              )
              .map((item) => (
                <button
                  key={item.id}
                  aria-pressed={selected?.id === item.id}
                  onClick={() => setSelected(item.id)}
                >
                  {item.name}
                </button>
              ))}
            {!teams.data?.length && (
              <p>{t({ en: "No teams yet.", ar: "لا توجد فرق حالياً." })}</p>
            )}
          </nav>
          {selectedTeam && (
            <section className="access-management-card">
              <h2>{selectedTeam.name}</h2>
              <ApiActionError
                error={team.error}
                onReload={() => void team.refetch()}
              />
              <div className="account-security-actions">
                {can("teams.manage") && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() =>
                        open({
                          kind: "name",
                          scope: "teams",
                          record: structuredClone(selectedTeam),
                        })
                      }
                    >
                      {t({ en: "Rename", ar: "إعادة التسمية" })}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        open({
                          kind: "delete",
                          scope: "teams",
                          record: structuredClone(selectedTeam),
                        })
                      }
                    >
                      {t({ en: "Delete team", ar: "حذف الفريق" })}
                    </Button>
                  </>
                )}
                {can("teams.manage") && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      open({
                        kind: "add-member",
                        scope: "teams",
                        record: structuredClone(selectedTeam),
                      })
                    }
                  >
                    {t({ en: "Add member", ar: "إضافة عضو" })}
                  </Button>
                )}
                {can("teams.permissions.manage") && (
                  <Button
                    variant="outline"
                    disabled={!can("roles.read")}
                    onClick={() =>
                      open({
                        kind: "permissions",
                        scope: "teams",
                        record: structuredClone(selectedTeam),
                      })
                    }
                  >
                    {t({ en: "Team permissions", ar: "صلاحيات الفريق" })}
                  </Button>
                )}
              </div>
              <h3>{t({ en: "Members", ar: "الأعضاء" })}</h3>
              {members.isPending ? (
                <LoadingState />
              ) : members.isError ? (
                <ApiActionError
                  error={members.error}
                  onReload={() => void members.refetch()}
                />
              ) : (
                members.data?.map((member) => (
                  <div className="access-row" key={member.id}>
                    <span>
                      {member.fullName || member.userId}
                      <small>
                        {member.isManager
                          ? t({ en: "Manager", ar: "مدير" })
                          : t({ en: "Member", ar: "عضو" })}
                      </small>
                    </span>
                    <div className="access-row-actions">
                      {can("teams.permissions.manage") && (
                        <Button
                          variant="outline"
                          disabled={!can("roles.read")}
                          onClick={() =>
                            open({
                              kind: "permissions",
                              scope: "teams",
                              record: structuredClone(selectedTeam),
                              member: structuredClone(member),
                            })
                          }
                        >
                          {t({ en: "Permissions", ar: "الصلاحيات" })}
                        </Button>
                      )}
                      {can("teams.manage") && (
                        <Button
                          variant="ghost"
                          onClick={() =>
                            open({
                              kind: "remove-member",
                              scope: "teams",
                              record: structuredClone(selectedTeam),
                              member: structuredClone(member),
                            })
                          }
                        >
                          {t({ en: "Remove", ar: "إزالة" })}
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </section>
          )}
        </div>
      )}
      <Modal
        open={!!edit}
        onClose={() => {
          if (!busy) {
            setEdit(null);
            setError(null);
          }
        }}
        title={title}
        description={edit?.record?.name || ""}
      >
        <form className="account-api-form" onSubmit={submit}>
          {edit?.kind === "name" && (
            <label>
              {t({ en: "Name", ar: "الاسم" })}
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={busy}
                required
              />
            </label>
          )}
          {edit?.kind === "delete" && (
            <label>
              {t({
                en: "Type the name to confirm deletion",
                ar: "اكتب الاسم لتأكيد الحذف",
              })}
              <input
                autoComplete="off"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                disabled={busy}
                required
              />
            </label>
          )}
          {edit?.kind === "add-member" && (
            <>
              <label>
                {t({ en: "User", ar: "المستخدم" })}
                {can("users.read") ? (
                  <select
                    value={userId}
                    onChange={(event) => setUserId(event.target.value)}
                    disabled={busy || users.isPending}
                    required
                  >
                    <option value="">—</option>
                    {users.data?.map((user) => (
                      <option key={user.id} value={user.id}>
                        {t(user.name)} · {user.email}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={userId}
                    onChange={(event) => setUserId(event.target.value)}
                    placeholder={t({ en: "User ID", ar: "معرّف المستخدم" })}
                    disabled={busy}
                    required
                  />
                )}
              </label>
              <label>
                <span>
                  <input
                    type="checkbox"
                    checked={manager}
                    onChange={(event) => setManager(event.target.checked)}
                  />{" "}
                  {t({ en: "Team manager", ar: "مدير الفريق" })}
                </span>
              </label>
              <ApiActionError error={users.error} />
            </>
          )}
          {edit?.kind === "remove-member" && (
            <p>
              {t({
                en: "Remove this member from the team?",
                ar: "هل تريد إزالة هذا العضو من الفريق؟",
              })}{" "}
              {edit.member?.fullName}
            </p>
          )}
          {edit?.kind === "permissions" && (
            <>
              <p>
                {t({
                  en: "Current assignments are not available here. Choose the complete set to replace them.",
                  ar: "التعيينات الحالية غير متاحة هنا. اختر المجموعة الكاملة لاستبدالها.",
                })}
              </p>
              <div className="access-permission-grid">
                {permissions.data?.map((permission) => (
                  <label key={permission.id}>
                    <input
                      type="checkbox"
                      checked={permissionIds.includes(permission.id)}
                      onChange={(event) =>
                        setPermissionIds((current) =>
                          event.target.checked
                            ? [...current, permission.id]
                            : current.filter((id) => id !== permission.id),
                        )
                      }
                      disabled={busy}
                    />
                    {permission.name}
                  </label>
                ))}
              </div>
              <ApiActionError error={permissions.error} />
              <label>
                <span>
                  <input
                    type="checkbox"
                    checked={replace}
                    onChange={(event) => setReplace(event.target.checked)}
                  />{" "}
                  {t({
                    en: "Replace all permissions with this selection",
                    ar: "استبدال كل الصلاحيات بهذا الاختيار",
                  })}
                </span>
              </label>
            </>
          )}
          <ApiActionError
            error={error}
            onReload={() => {
              setEdit(null);
              void reload();
            }}
          />
          <Button
            type="submit"
            disabled={
              busy ||
              (edit?.kind === "delete" && confirmation !== edit.record?.name) ||
              (edit?.kind === "name" && !name.trim()) ||
              (edit?.kind === "permissions" &&
                (!replace || permissions.isError || permissions.isPending)) ||
              (edit?.kind === "add-member" && !userId)
            }
          >
            {t({ en: "Confirm", ar: "تأكيد" })}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
