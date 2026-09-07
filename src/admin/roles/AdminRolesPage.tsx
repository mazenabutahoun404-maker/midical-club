import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, KeyRound, LockKeyhole, ShieldCheck, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "../../app/providers/LocaleProvider";
import { PageIntro } from "../../components/data-display/PageIntro";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { Button } from "../../components/ui/button";
import type { Capability, CapabilityGroup } from "../../types/governance";
import { useCapabilities, useGovernanceActions, useGovernanceRoles } from "../governance/useGovernance";

export default function AdminRolesPage() {
  const { label, t } = useLocale();
  const roles = useGovernanceRoles();
  const definitions = useCapabilities();
  const actions = useGovernanceActions();
  const [selectedId, setSelectedId] = useState("founder");
  const selected = roles.data?.find((role) => role.id === selectedId) || roles.data?.[0];
  const [draft, setDraft] = useState<Capability[]>([]);
  useEffect(() => setDraft(selected ? [...selected.capabilities] : []), [selected]);
  const grouped = useMemo(() => {
    const result = new Map<CapabilityGroup, NonNullable<typeof definitions.data>>();
    for (const group of ["content", "people", "governance", "operations"] as const) result.set(group, []);
    for (const item of definitions.data || []) result.get(item.group)?.push(item);
    return result;
  }, [definitions.data]);
  if (roles.isPending || definitions.isPending) return <LoadingState />;
  if (roles.isError || definitions.isError) return <ErrorState retry={() => { void roles.refetch(); void definitions.refetch(); }} />;
  const toggle = (capability: Capability) => {
    if (selected?.protected) return;
    setDraft((current) => current.includes(capability) ? current.filter((item) => item !== capability) : [...current, capability]);
  };
  const save = async () => {
    if (!selected) return;
    try { await actions.updateRole({ roleId: selected.id, capabilities: draft }); toast.success(label("governanceRoleSaved")); }
    catch { toast.error(label("governanceRoleFailed")); }
  };
  const groupLabel: Record<CapabilityGroup, ReturnType<typeof label>> = {
    content: label("governanceGroupContent"), people: label("governanceGroupPeople"), governance: label("governanceGroupGovernance"), operations: label("governanceGroupOperations"),
  };
  return (
    <div className="container admin-page governance-roles-page">
      <PageIntro eyebrow={label("governanceRolesEyebrow")} title={label("governanceRolesTitle")} description={label("governanceRolesBody")} />
      <section className="governance-role-layout">
        <nav className="governance-role-list" aria-label={label("governanceRoles")}>
          {roles.data.map((role) => <button type="button" key={role.id} data-tone={role.tone} className={role.id === selected?.id ? "active" : ""} aria-pressed={role.id === selected?.id} onClick={() => setSelectedId(role.id)}><span className="governance-role-glyph">{role.protected ? <ShieldCheck size={20} /> : <KeyRound size={20} />}</span><span><strong>{t(role.name)}</strong><small><UsersRound size={13} />{role.memberCount} {label("governanceMembers")}</small></span>{role.protected && <LockKeyhole size={16} />}</button>)}
        </nav>
        {selected && <article className="governance-capability-panel">
          <header><span className="governance-role-glyph" data-tone={selected.tone}>{selected.protected ? <ShieldCheck size={24} /> : <KeyRound size={24} />}</span><div><h2>{t(selected.name)}</h2><p>{t(selected.description)}</p></div>{selected.protected && <span className="governance-lock-chip"><LockKeyhole size={14} />{label("governanceProtectedRole")}</span>}</header>
          {selected.protected && <p className="governance-protected-note"><ShieldCheck size={18} />{label("governanceProtectedRoleBody")}</p>}
          <div className="governance-capability-groups">
            {[...grouped].map(([group, items]) => <section key={group}><h3>{groupLabel[group]}</h3><div>{items.map((item) => { const checked = draft.includes(item.id); return <button type="button" key={item.id} disabled={selected.protected} className={checked ? "selected" : ""} aria-pressed={checked} onClick={() => toggle(item.id)}><span className="governance-capability-check">{checked && <Check size={15} />}</span><span><strong>{t(item.label)}</strong><small>{t(item.description)}</small></span>{item.highRisk && <em><AlertTriangle size={13} />{label("governanceHighRiskCapability")}</em>}</button>; })}</div></section>)}
          </div>
          <Button disabled={selected.protected || actions.isMutating} onClick={() => void save()}>{label("governanceSaveRole")}</Button>
        </article>}
      </section>
    </div>
  );
}
