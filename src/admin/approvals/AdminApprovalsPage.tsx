import { useState } from "react";
import { AlertTriangle, ArrowRight, Check, Clock3, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "../../app/providers/LocaleProvider";
import { PageIntro } from "../../components/data-display/PageIntro";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { AliveTabs } from "../../components/navigation/AliveTabs";
import { Button } from "../../components/ui/button";
import { formatDate } from "../../lib/dates";
import type { AccessChangeRequest } from "../../types/governance";
import { useAccess, useAccessRequests, useGovernanceActions, useGovernanceRoles } from "../governance/useGovernance";

export default function AdminApprovalsPage() {
  const { label, t, locale } = useLocale();
  const requests = useAccessRequests();
  const roles = useGovernanceRoles();
  const access = useAccess();
  const actions = useGovernanceActions();
  const [view, setView] = useState<"pending" | "resolved">("pending");
  if (requests.isPending || roles.isPending || access.isPending) return <LoadingState />;
  if (requests.isError || roles.isError || access.isError) return <ErrorState retry={() => { void requests.refetch(); void roles.refetch(); void access.refetch(); }} />;
  const roleNames = new Map(roles.data.map((role) => [role.id, t(role.name)]));
  const visible = requests.data.filter((request) => view === "pending" ? request.status === "pending" : request.status !== "pending");
  const decide = async (request: AccessChangeRequest, decision: "approve" | "reject") => {
    try { await actions.decide({ requestId: request.id, actorId: access.data.actorId, decision }); toast.success(label("governanceDecisionRecorded")); }
    catch { toast.error(label("governanceDecisionFailed")); }
  };
  return (
    <div className="container admin-page governance-approvals-page">
      <PageIntro eyebrow={label("governanceApprovalsEyebrow")} title={label("governanceApprovalsTitle")} description={label("governanceApprovalsBody")} />
      <div className="governance-approval-toolbar"><AliveTabs items={[{ id: "pending", label: label("governancePendingQueue"), icon: Clock3 }, { id: "resolved", label: label("governanceResolvedQueue"), icon: ShieldCheck }]} value={view} onChange={(value) => setView(value as typeof view)} label={label("governanceApprovals")} /><span><ShieldCheck size={16} />{label("governancePreviewOperator")}</span></div>
      <section className="governance-approval-list" aria-live="polite">
        {visible.length === 0 && <div className="governance-empty-queue"><ShieldCheck size={32} /><p>{label("governanceNoRequests")}</p></div>}
        {visible.map((request) => (
          <article className="governance-approval-card" data-status={request.status} key={request.id}>
            <header><span className="governance-risk-icon"><AlertTriangle size={20} /></span><div><span className="eyebrow">{label("governanceHighRisk")}</span><h2>{t(request.targetUser)}</h2></div><span className="governance-account-state" data-status={request.status}>{label(request.status === "approved" ? "governanceApproved" : request.status === "rejected" ? "governanceRejected" : "governancePending")}</span></header>
            <dl><div><dt>{label("governanceRequestedBy")}</dt><dd>{t(request.requestedBy)}</dd></div><div><dt>{label("date")}</dt><dd>{formatDate(request.createdAt, locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</dd></div></dl>
            <div className="governance-role-delta"><span>{request.addRoleIds.length ? request.addRoleIds.map((id) => roleNames.get(id) || id).join(", ") : label("governanceNoChange")}</span><ArrowRight size={18} className="directional" /><span>{request.removeRoleIds.length ? request.removeRoleIds.map((id) => roleNames.get(id) || id).join(", ") : label("governanceNoChange")}</span><small className="delta-add">+ {label("governanceAdd")}</small><small className="delta-remove">− {label("governanceRemove")}</small></div>
            <blockquote>{request.reason}</blockquote>
            <div className="governance-approval-chain" aria-label={label("governanceApprovalsProgress")}>{Array.from({ length: request.approvalsRequired }, (_, index) => { const approval = request.approvals[index]; return <span className={approval ? approval.decision : ""} key={index}>{approval ? approval.decision === "approved" ? <Check size={15} /> : <X size={15} /> : index + 1}<small>{approval ? t(approval.actor) : `${request.approvals.length}/${request.approvalsRequired}`}</small></span>; })}</div>
            {request.status === "pending" && <footer><Button onClick={() => void decide(request, "approve")} disabled={actions.isMutating}><Check size={16} />{label("governanceApprove")}</Button><Button variant="outline" onClick={() => void decide(request, "reject")} disabled={actions.isMutating}><X size={16} />{label("governanceReject")}</Button></footer>}
          </article>
        ))}
      </section>
    </div>
  );
}
