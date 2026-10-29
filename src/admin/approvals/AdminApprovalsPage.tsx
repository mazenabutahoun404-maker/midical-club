import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Clock3, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useServices } from "../../app/providers/ServicesProvider";
import { PageIntro } from "../../components/data-display/PageIntro";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ApiActionError } from "../../components/feedback/ApiActionError";
import { AliveTabs } from "../../components/navigation/AliveTabs";
import { Button } from "../../components/ui/button";
import { formatDate } from "../../lib/dates";
import type { AccessChangeRequest } from "../../types/governance";
import {
  useAccess,
  useAccessRequests,
  useGovernanceActions,
  useGovernanceRoles,
  useGovernanceUsers,
} from "../governance/useGovernance";
export default function AdminApprovalsPage() {
  const { label, t } = useLocale();
  const access = useAccess();
  const live = useServices().governance.mode === "api";
  const rolesEnabled =
    !live || !!access.data?.permissions?.includes("roles.read");
  const requests = useAccessRequests(),
    roles = useGovernanceRoles(rolesEnabled);
  const users = useGovernanceUsers(
    !!access.data?.permissions?.includes("users.read"),
  );
  const [view, setView] = useState<"pending" | "resolved">("pending");
  if (
    requests.isPending ||
    access.isPending ||
    (rolesEnabled && roles.isPending)
  )
    return <LoadingState />;
  if (requests.isError || access.isError || (rolesEnabled && roles.isError))
    return (
      <ErrorState
        retry={() => {
          void requests.refetch();
          void access.refetch();
          if (rolesEnabled) void roles.refetch();
        }}
      />
    );
  const userNames = new Map(
    (users.data || []).map((user) => [user.id, t(user.name)]),
  );
  const names = new Map(
    (roles.data || []).map((role) => [role.id, t(role.name)]),
  );
  return (
    <div className="container admin-page governance-approvals-page">
      <PageIntro
        eyebrow={label("governanceApprovalsEyebrow")}
        title={label("governanceApprovalsTitle")}
        description={label("governanceApprovalsBody")}
      />
      <div className="governance-approval-toolbar">
        <AliveTabs
          items={[
            {
              id: "pending",
              label: label("governancePendingQueue"),
              icon: Clock3,
            },
            {
              id: "resolved",
              label: label("governanceResolvedQueue"),
              icon: ShieldCheck,
            },
          ]}
          value={view}
          onChange={(value) => setView(value as typeof view)}
          label={label("governanceApprovals")}
        />
      </div>
      <section className="governance-approval-list">
        {requests.data
          .filter((request) =>
            view === "pending"
              ? request.status === "pending"
              : request.status !== "pending",
          )
          .map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              roleNames={names}
              userNames={userNames}
              actorId={access.data.actorId}
            />
          ))}
        {!requests.data.some((request) =>
          view === "pending"
            ? request.status === "pending"
            : request.status !== "pending",
        ) && (
          <div className="governance-empty-queue">
            <ShieldCheck size={32} />
            <p>{label("governanceNoRequests")}</p>
          </div>
        )}
      </section>
    </div>
  );
}
function RequestCard({
  request,
  roleNames,
  userNames,
  actorId,
}: {
  request: AccessChangeRequest;
  roleNames: Map<string, string>;
  userNames: Map<string, string>;
  actorId: string;
}) {
  const { governance } = useServices();
  const { label, t, locale } = useLocale();
  const [open, setOpen] = useState(false),
    [note, setNote] = useState(""),
    [error, setError] = useState<unknown>(null);
  const actions = useGovernanceActions();
  const detail = useQuery({
    queryKey: ["governance", "request", request.id],
    queryFn: () => governance.getRequest!(request.id),
    enabled: open && !!governance.getRequest,
  });
  const current = detail.data || request;
  const loaded = governance.mode !== "api" || !!detail.data;
  const blocked =
    !loaded ||
    current.status !== "pending" ||
    current.targetUserId === actorId ||
    current.requestedById === actorId ||
    current.approvals.some((approval) => approval.actorId === actorId);
  const decide = async (decision: "approve" | "reject") => {
    if (blocked || actions.isMutating) return;
    setError(null);
    try {
      await actions.decide({
        requestId: current.id,
        version: current.version,
        actorId,
        decision,
        note,
      });
      setNote("");
      toast.success(label("governanceDecisionRecorded"));
    } catch (caught) {
      setError(caught);
    }
  };
  return (
    <article className="governance-approval-card" data-status={current.status}>
      <header>
        <ShieldCheck size={22} />
        <h2>{userNames.get(current.targetUserId) || t(current.targetUser)}</h2>
        <span>{current.status}</span>
      </header>
      <p>{current.reason}</p>
      <dl>
        <div>
          <dt>{label("governanceRequestedBy")}</dt>
          <dd>
            {userNames.get(current.requestedById) || t(current.requestedBy)}
          </dd>
        </div>
        <div>
          <dt>{label("date")}</dt>
          <dd>
            {current.createdAt ? formatDate(current.createdAt, locale) : "—"}
          </dd>
        </div>
      </dl>
      <p>
        +{" "}
        {current.addRoleIds.map((id) => roleNames.get(id) || id).join(", ") ||
          "—"}
      </p>
      <p>
        −{" "}
        {current.removeRoleIds
          .map((id) => roleNames.get(id) || id)
          .join(", ") || "—"}
      </p>
      <Button variant="outline" onClick={() => setOpen((value) => !value)}>
        {t({
          en: open ? "Hide decisions" : "Review decisions",
          ar: open ? "إخفاء القرارات" : "مراجعة القرارات",
        })}
      </Button>
      {open && (
        <div className="account-api-form">
          <ApiActionError
            error={detail.error}
            onReload={() => void detail.refetch()}
          />
          {detail.isFetching && !detail.data ? (
            <p role="status">{label("loading")}</p>
          ) : (
            loaded && (
              <>
                <p>
                  {
                    current.approvals.filter(
                      (approval) => approval.decision === "approved",
                    ).length
                  }
                  /{current.approvalsRequired}
                </p>
                {current.approvals.map((approval, index) => (
                  <p key={index}>
                    {approval.decision} ·{" "}
                    {userNames.get(approval.actorId) || t(approval.actor)}{" "}
                    {approval.note}
                  </p>
                ))}
                {current.status === "pending" && (
                  <>
                    <label>
                      {t({ en: "Decision note", ar: "ملاحظة القرار" })}
                      <textarea
                        rows={3}
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        disabled={blocked || actions.isMutating}
                      />
                    </label>
                    <div className="account-security-actions">
                      <Button
                        onClick={() => void decide("approve")}
                        disabled={blocked || actions.isMutating}
                      >
                        <Check size={16} />
                        {label("governanceApprove")}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => void decide("reject")}
                        disabled={blocked || actions.isMutating}
                      >
                        <X size={16} />
                        {label("governanceReject")}
                      </Button>
                    </div>
                  </>
                )}
              </>
            )
          )}
          <ApiActionError
            error={error}
            onReload={() => {
              setError(null);
              void detail.refetch();
            }}
          />
        </div>
      )}
    </article>
  );
}
