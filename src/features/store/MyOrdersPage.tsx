import {useServices} from "../../app/providers/ServicesProvider";
import {MyStoreOrders} from "../store-live/Orders";
import { useState } from "react";
import {
  CheckCircle2,
  Clock3,
  PackageCheck,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "../../app/providers/LocaleProvider";
import { PageIntro } from "../../components/data-display/PageIntro";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { StoreNavigation } from "../../components/navigation/StoreNavigation";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/button";
import { useStoreWorkspace } from "../../hooks/useContent";
import { formatDate } from "../../lib/dates";
import { formatStorePrice } from "../../lib/store";
import type { StoreOrder } from "../../types/content";

const progress = ["reserved", "confirmed", "ready", "collected"] as const;
export default function MyOrdersPage() {
 const services=useServices();return services.storeApi?<MyStoreOrders/>:<PreviewMyOrdersPage/>;
}
function PreviewMyOrdersPage() {
  const { label, t, locale } = useLocale();
  const store = useStoreWorkspace();
  const [cancelling, setCancelling] = useState<StoreOrder | null>(null);
  if (store.isPending) return <LoadingState />;
  if (store.isError) return <ErrorState retry={store.retry} />;
  async function cancel() {
    if (!cancelling) return;
    try {
      await store.cancelOrder(cancelling.id);
      setCancelling(null);
      toast.success(label("orderCancelled"));
    } catch {
      toast.error(label("orderActionFailed"));
    }
  }
  return (
    <div className="container store-v7 my-orders-page">
      <PageIntro
        eyebrow={label("myOrdersEyebrow")}
        title={label("myOrdersTitle")}
        description={label("myOrdersBody")}
      />
      <StoreNavigation />
      {store.orders.length ? (
        <div className="order-list">
          {store.orders.map((order) => {
            const current = progress.indexOf(
              order.status as (typeof progress)[number],
            );
            return (
              <article
                className="order-card"
                key={order.id}
                data-status={order.status}
              >
                <header>
                  <span className="order-mark">
                    {order.status === "cancelled" ? (
                      <XCircle />
                    ) : order.status === "ready" ? (
                      <PackageCheck />
                    ) : (
                      <Clock3 />
                    )}
                  </span>
                  <div>
                    <small>{label("orderNumber")}</small>
                    <h2>{order.number}</h2>
                  </div>
                  <span className="order-status">{label(order.status)}</span>
                </header>
                <div className="order-lines">
                  {order.lines.map((line) => (
                    <div key={`${line.productId}:${line.variantId}`}>
                      <span>
                        <ShoppingBag size={17} />
                      </span>
                      <p>
                        <strong>{t(line.name)}</strong>
                        <small>
                          {t(line.variantLabel)} · {line.quantity}
                        </small>
                      </p>
                      <b>
                        {formatStorePrice(
                          line.unitPriceFils * line.quantity,
                          locale,
                        )}
                      </b>
                    </div>
                  ))}
                </div>
                {order.status !== "cancelled" && (
                  <section
                    className="order-progress"
                    aria-label={label("orderTimeline")}
                  >
                    {progress.map((status, index) => (
                      <div
                        key={status}
                        data-complete={index <= current || undefined}
                        data-current={status === order.status || undefined}
                      >
                        <span>
                          {index < current ? <CheckCircle2 /> : index + 1}
                        </span>
                        <small>{label(status)}</small>
                      </div>
                    ))}
                  </section>
                )}
                <dl className="order-facts">
                  <div>
                    <dt>{label("orderedOn")}</dt>
                    <dd>{formatDate(order.reservedAt, locale)}</dd>
                  </div>
                  <div>
                    <dt>{label("pickupLocation")}</dt>
                    <dd>{t(order.pickupLocation)}</dd>
                  </div>
                  <div>
                    <dt>{label("orderTotal")}</dt>
                    <dd>{formatStorePrice(order.totalFils, locale)}</dd>
                  </div>
                  {order.reservationExpiresAt && (
                    <div>
                      <dt>{label("reservationExpires")}</dt>
                      <dd>{formatDate(order.reservationExpiresAt, locale)}</dd>
                    </div>
                  )}
                </dl>
                {order.status === "reserved" && (
                  <footer>
                    <Button
                      variant="outline"
                      onClick={() => setCancelling(order)}
                    >
                      {label("cancelOrder")}
                    </Button>
                  </footer>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={label("noOrders")}
          description={label("noOrdersBody")}
        />
      )}
      <p className="store-boundary-note">{label("storePreviewNotice")}</p>
      <Modal
        open={!!cancelling}
        onClose={() => setCancelling(null)}
        title={label("cancelOrderTitle")}
        description={label("cancelOrderBody")}
      >
        <div className="workspace-form-actions">
          <Button variant="outline" onClick={() => setCancelling(null)}>
            {label("cancel")}
          </Button>
          <Button
            variant="destructive"
            disabled={store.isMutating}
            onClick={() => void cancel()}
          >
            {label("cancelOrder")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
