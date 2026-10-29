import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServices } from "../../app/providers/ServicesProvider";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/button";
import { ApiActionError } from "../../components/feedback/ApiActionError";
import { formatDate } from "../../lib/dates";
export function AccountAccessRequests() {
  const { governance } = useServices();
  const { snapshot } = useAuth();
  const { t, locale } = useLocale();
  const [selected, setSelected] = useState<string | null>(null);
  const requests = useQuery({
    queryKey: ["account", "access-requests", snapshot.user?.id],
    queryFn: governance.listMyRequests || (async () => []),
    enabled: !!governance.listMyRequests && snapshot.status === "authenticated",
  });
  const detail = useQuery({
    queryKey: ["account", "access-request", snapshot.user?.id, selected],
    queryFn: () => governance.getRequest!(selected!),
    enabled: !!selected && !!governance.getRequest,
  });
  if (!governance.listMyRequests) return null;
  return (
    <section className="account-security-card">
      <h2>{t({ en: "My access requests", ar: "طلبات الوصول الخاصة بي" })}</h2>
      <ApiActionError
        error={requests.error}
        onReload={() => void requests.refetch()}
      />
      {requests.isPending ? (
        <p role="status">
          {t({ en: "Loading requests…", ar: "تحميل الطلبات…" })}
        </p>
      ) : requests.data?.length ? (
        requests.data.map((request) => (
          <div className="access-request-summary" key={request.id}>
            <p>{request.reason}</p>
            <small>
              {request.status} ·{" "}
              {request.createdAt ? formatDate(request.createdAt, locale) : "—"}
            </small>
            <Button variant="outline" onClick={() => setSelected(request.id)}>
              {t({ en: "View decisions", ar: "عرض القرارات" })}
            </Button>
          </div>
        ))
      ) : (
        !requests.isError && (
          <p>
            {t({
              en: "No access requests yet.",
              ar: "لا توجد طلبات وصول حالياً.",
            })}
          </p>
        )
      )}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={t({ en: "Access request", ar: "طلب الوصول" })}
        description={detail.data?.reason || ""}
      >
        <ApiActionError
          error={detail.error}
          onReload={() => void detail.refetch()}
        />
        {detail.isPending ? (
          <p role="status">{t({ en: "Loading…", ar: "تحميل…" })}</p>
        ) : (
          detail.data && (
            <div className="account-api-form">
              <p>
                {detail.data.status} ·{" "}
                {
                  detail.data.approvals.filter(
                    (value) => value.decision === "approved",
                  ).length
                }
                /{detail.data.approvalsRequired}
              </p>
              {detail.data.approvals.map((approval, index) => (
                <div key={index} className="access-request-summary">
                  <strong>{approval.decision}</strong>
                  <small>{approval.actorId}</small>
                  {approval.note && <p>{approval.note}</p>}
                  <small>
                    {approval.at ? formatDate(approval.at, locale) : "—"}
                  </small>
                </div>
              ))}
            </div>
          )
        )}
      </Modal>
    </section>
  );
}
