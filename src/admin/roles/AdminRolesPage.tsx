import { useEffect, useMemo, useState } from "react";
import {
  Check,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useServices } from "../../app/providers/ServicesProvider";
import { PageIntro } from "../../components/data-display/PageIntro";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ApiActionError } from "../../components/feedback/ApiActionError";
import { Button } from "../../components/ui/button";
import type { Capability } from "../../types/governance";
import {
  useAccess,
  useCapabilities,
  usePermissions,
  useGovernanceActions,
  useGovernanceRoles,
} from "../governance/useGovernance";
export default function AdminRolesPage() {
  const { label, t } = useLocale();
  const live = useServices().governance.mode === "api";
  const roles = useGovernanceRoles(),
    definitions = useCapabilities(),
    permissions = usePermissions(),
    access = useAccess();
  const actions = useGovernanceActions();
  const [selectedId, setSelectedId] = useState("");
  const selected =
    roles.data?.find((role) => role.id === selectedId) || roles.data?.[0];
  const [editorId, setEditorId] = useState(""),
    [draftVersion, setDraftVersion] = useState(""),
    [draft, setDraft] = useState<string[]>([]),
    [dirty, setDirty] = useState(false),
    [error, setError] = useState<unknown>(null),
    [search, setSearch] = useState("");
  useEffect(() => {
    if (!selected) return;
    if (editorId !== selected.id || !dirty) {
      setEditorId(selected.id);
      setDraftVersion(selected.version || "");
      setDraft(
        live
          ? selected.permissions?.map((permission) => permission.id) || []
          : [...selected.capabilities],
      );
    }
  }, [selected, live, dirty, editorId]);
  const entries = live
    ? (permissions.data || []).map((permission) => ({
        id: permission.id,
        title: permission.name,
        description: "",
        group: permission.name.split(".")[0],
      }))
    : (definitions.data || []).map((capability) => ({
        id: capability.id,
        title: t(capability.label),
        description: t(capability.description),
        group: capability.group,
      }));
  const grouped = useMemo(() => {
    const groups = new Map<string, typeof entries>();
    for (const entry of entries.filter((entry) =>
      `${entry.title} ${entry.description}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    ))
      groups.set(entry.group, [...(groups.get(entry.group) || []), entry]);
    return groups;
  }, [entries, search]);
  if (roles.isPending || (live ? permissions.isPending : definitions.isPending))
    return <LoadingState />;
  if (roles.isError || (live ? permissions.isError : definitions.isError))
    return (
      <ErrorState
        retry={() => {
          void roles.refetch();
          void (live ? permissions.refetch() : definitions.refetch());
        }}
      />
    );
  const editable =
    !!selected &&
    !selected.protected &&
    (!live ||
      (!!draftVersion &&
        access.data?.permissions?.includes("roles.permissions.manage")));
  const save = async () => {
    if (!selected || !editable) return;
    setError(null);
    try {
      if (live)
        await actions.updatePermissions({
          id: selected.id,
          permissionIds: draft,
          version: draftVersion,
        });
      else
        await actions.updateRole({
          roleId: selected.id,
          capabilities: draft as Capability[],
        });
      setDirty(false);
      toast.success(label("governanceRoleSaved"));
    } catch (caught) {
      setError(caught);
    }
  };
  return (
    <div className="container admin-page governance-roles-page">
      <PageIntro
        eyebrow={label("governanceRolesEyebrow")}
        title={
          live
            ? t({ en: "Roles & permissions", ar: "الأدوار والصلاحيات" })
            : label("governanceRolesTitle")
        }
        description={
          live
            ? t({
                en: "Review roles and their individual permissions. Protected roles remain read-only.",
                ar: "مراجعة الأدوار وصلاحياتها التفصيلية. تبقى الأدوار المحمية للقراءة فقط.",
              })
            : label("governanceRolesBody")
        }
      />
      <section className="governance-role-layout">
        <nav
          className="governance-role-list"
          aria-label={label("governanceRoles")}
        >
          {roles.data.map((role) => (
            <button
              type="button"
              key={role.id}
              data-tone={role.tone}
              className={role.id === selected?.id ? "active" : ""}
              aria-pressed={role.id === selected?.id}
              onClick={() => {
                setSelectedId(role.id);
                setDirty(false);
                setError(null);
              }}
            >
              <span className="governance-role-glyph">
                {role.protected ? (
                  <ShieldCheck size={20} />
                ) : (
                  <KeyRound size={20} />
                )}
              </span>
              <span>
                <strong>{t(role.name)}</strong>
                <small>
                  <UsersRound size={13} />
                  {role.memberCount} {label("governanceMembers")}
                </small>
              </span>
              {role.protected && <LockKeyhole size={16} />}
            </button>
          ))}
        </nav>
        {selected && (
          <article className="governance-capability-panel">
            <header>
              <span className="governance-role-glyph" data-tone={selected.tone}>
                <KeyRound size={24} />
              </span>
              <div>
                <h2>{t(selected.name)}</h2>
                <p>{t(selected.description)}</p>
              </div>
              {selected.protected && (
                <span className="governance-lock-chip">
                  <LockKeyhole size={14} />
                  {label("governanceProtectedRole")}
                </span>
              )}
            </header>
            {selected.protected && (
              <p className="governance-protected-note">
                {label("governanceProtectedRoleBody")}
              </p>
            )}
            <div className="account-api-form">
              <label>
                {t({ en: "Find a permission", ar: "البحث عن صلاحية" })}
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
            </div>
            <div className="governance-capability-groups">
              {[...grouped].map(([group, items]) => (
                <section key={group}>
                  <h3>{group}</h3>
                  <div>
                    {items.map((item) => {
                      const checked = draft.includes(item.id);
                      return (
                        <button
                          type="button"
                          key={item.id}
                          disabled={!editable}
                          className={checked ? "selected" : ""}
                          aria-pressed={checked}
                          onClick={() => {
                            setDirty(true);
                            setDraft((current) =>
                              current.includes(item.id)
                                ? current.filter((id) => id !== item.id)
                                : [...current, item.id],
                            );
                          }}
                        >
                          <span className="governance-capability-check">
                            {checked && <Check size={15} />}
                          </span>
                          <span>
                            <strong>{item.title}</strong>
                            {item.description && (
                              <small>{item.description}</small>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
            <ApiActionError
              error={error}
              onReload={() => {
                void roles.refetch().then(() => {
                  setDirty(false);
                  setError(null);
                });
              }}
            />
            <Button
              disabled={!editable || !dirty || actions.isMutating}
              onClick={() => void save()}
            >
              {live
                ? t({ en: "Save permissions", ar: "حفظ الصلاحيات" })
                : label("governanceSaveRole")}
            </Button>
          </article>
        )}
      </section>
    </div>
  );
}
