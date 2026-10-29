import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import { record, string } from "../../services/api/mapping";
import { storeRoutes } from "../../services/api/store-contracts.generated";
import { localizedField } from "../engagement/model";
import {
  money,
  snapshotName,
  normalized,
  returnRequest,
  inspectReturn,
  storeRequest,
  type StoreOperation,
} from "./model";
import { StoreNav, StoreImage } from "./Catalog";
import { StoreEditor } from "./Forms";
import {
  useStoreConnection,
  useStoreQuery,
  useStoreAction,
  QueryStatus,
  Panel,
  Empty,
  Pager,
  rows,
} from "./shared";
type Entry = Record<string, unknown>;
export function MyStoreOrders() {
  const { owner, session } = useStoreConnection(),
    { t, label } = useLocale(),
    [tab, setTab] = useState("orders");
  return (
    <div className="container store-v7 store-connected">
      <StoreNav />
      <h1 tabIndex={-1} data-page-heading>
        {label("myOrders")}
      </h1>
      {!owner ? (
        <p>
          {t({
            en: "Sign in to view your orders and returns.",
            ar: "سجّل الدخول لعرض طلباتك ومرتجعاتك.",
          })}
        </p>
      ) : (
        <>
          <nav className="engagement-tabs">
            <Button
              variant={tab === "orders" ? "default" : "outline"}
              onClick={() => setTab("orders")}
            >
              {label("myOrders")}
            </Button>
            <Button
              variant={tab === "returns" ? "default" : "outline"}
              onClick={() => setTab("returns")}
            >
              {t({ en: "Returns & exchanges", ar: "الإرجاع والاستبدال" })}
            </Button>
          </nav>
          {tab === "orders" ? (
            <Orders key={"orders" + session} />
          ) : (
            <Returns key={"returns" + session} />
          )}
        </>
      )}
    </div>
  );
}
export function Orders({
  admin = false,
  permissions = [],
}: {
  admin?: boolean;
  permissions?: string[];
}) {
  const { api, session } = useStoreConnection(),
    { t, locale } = useLocale(),
    [params] = useSearchParams(),
    [page, setPage] = useState(1),
    [status, setStatus] = useState(""),
    [number, setNumber] = useState(""),
    [selected, setSelected] = useState(params.get("order") || "");
  const q = useStoreQuery(
    admin ? "admin-orders" : "orders",
    (signal) =>
      admin
        ? api.get_api_v1_store_admin_orders({
            query: {
              Page: page,
              PageSize: 20,
              OrderStatus: status || undefined,
              OrderNumber: number || undefined,
            },
            signal,
          })
        : api.get_api_v1_store_orders_my({
            query: {
              Page: page,
              PageSize: 20,
              OrderStatus: status || undefined,
            },
            signal,
          }),
    [page, status, number],
    true,
    true,
  );
  return (
    <>
      <div className="store-toolbar">
        <label>
          {t({ en: "Status", ar: "الحالة" })}
          <input
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          />
        </label>
        {admin && (
          <label>
            {t({ en: "Order number", ar: "رقم الطلب" })}
            <input
              value={number}
              onChange={(e) => {
                setPage(1);
                setNumber(e.target.value);
              }}
            />
          </label>
        )}
      </div>
      <QueryStatus query={q} />
      {q.data && (
        <>
          <div className="store-products">
            {q.data.items.map((order) => (
              <article key={order.id} className="store-card">
                <span>{order.status}</span>
                <h2>{order.orderNumber}</h2>
                <p>{money(order.totalAmount, locale, order.currency)}</p>
                <Button variant="outline" onClick={() => setSelected(order.id)}>
                  {t({ en: "View order", ar: "عرض الطلب" })}
                </Button>
              </article>
            ))}
          </div>
          <Empty items={q.data.items} />
          <Pager page={page} total={q.data.total} onChange={setPage} />
        </>
      )}
      {selected && (
        <Modal
          open
          description=""
          title={t({ en: "Order details", ar: "تفاصيل الطلب" })}
          onClose={() => setSelected("")}
          className="engagement-modal store-connected"
        >
          <OrderDetail
            key={selected + session}
            id={selected}
            admin={admin}
            permissions={permissions}
          />
        </Modal>
      )}
    </>
  );
}
const orderCommands: Record<
  string,
  { op: StoreOperation; en: string; ar: string }
> = {
  confirm: {
    op: "post_api_v1_store_admin_orders_by_orderId_confirm",
    en: "Confirm order",
    ar: "تأكيد الطلب",
  },
  reject: {
    op: "post_api_v1_store_admin_orders_by_orderId_reject",
    en: "Reject order",
    ar: "رفض الطلب",
  },
  ready: {
    op: "post_api_v1_store_admin_orders_by_orderId_ready_for_pickup",
    en: "Mark ready for pickup",
    ar: "جاهز للاستلام",
  },
  complete: {
    op: "post_api_v1_store_admin_orders_by_orderId_complete",
    en: "Complete pickup and record cash payment",
    ar: "إتمام الاستلام وتسجيل الدفع النقدي",
  },
  override: {
    op: "post_api_v1_store_admin_orders_by_orderId_complete_with_override",
    en: "Complete pickup with code override",
    ar: "إتمام الاستلام بتجاوز الرمز",
  },
  cancel: {
    op: "post_api_v1_store_admin_orders_by_orderId_cancel",
    en: "Cancel order",
    ar: "إلغاء الطلب",
  },
  deadline: {
    op: "post_api_v1_store_admin_orders_by_orderId_extend_pickup_deadline",
    en: "Extend pickup deadline",
    ar: "تمديد مهلة الاستلام",
  },
  regenerate: {
    op: "post_api_v1_store_admin_orders_by_orderId_regenerate_pickup_code",
    en: "Regenerate pickup code",
    ar: "تجديد رمز الاستلام",
  },
};
function OrderDetail({
  id,
  admin,
  permissions,
}: {
  id: string;
  admin: boolean;
  permissions: string[];
}) {
  const { api } = useStoreConnection(),
    { t, locale } = useLocale(),
    [page, setPage] = useState(1),
    [pickup, setPickup] = useState(false),
    [returning, setReturning] = useState(false),
    [edit, setEdit] = useState<{
      op: StoreOperation;
      title: string;
      initial: Entry;
      required?: string[];
    } | null>(null);
  const q = useStoreQuery(
    "order-detail",
    (signal) =>
      admin
        ? api.get_api_v1_store_admin_orders_by_orderId({
            path: { orderId: id },
            query: { Page: page, PageSize: 20 },
            signal,
          })
        : api.get_api_v1_store_orders_my_by_orderId({
            path: { orderId: id },
            query: { Page: page, PageSize: 20 },
            signal,
          }),
    [id, page, admin],
    true,
    true,
  );
  const order = record(q.data);
  return (
    <>
      <QueryStatus query={q} />
      {q.data && (
        <>
          <h2>{q.data.orderNumber}</h2>
          <p>
            {q.data.status} ·{" "}
            {money(q.data.totalAmount, locale, q.data.currency)}
          </p>
          <p>{q.data.pickupInstructionsSnapshot}</p>
          <dl className="store-facts">
            {[
              "reservationExpiresAt",
              "pickupDeadlineAt",
              "returnDeadlineAt",
            ].map(
              (key) =>
                !!order[key] && (
                  <div key={key}>
                    <dt>
                      {t({
                        en:
                          key === "pickupDeadlineAt"
                            ? "Pickup deadline"
                            : key === "returnDeadlineAt"
                              ? "Return deadline"
                              : "Reservation expires",
                        ar:
                          key === "pickupDeadlineAt"
                            ? "مهلة الاستلام"
                            : key === "returnDeadlineAt"
                              ? "مهلة الإرجاع"
                              : "انتهاء الحجز",
                      })}
                    </dt>
                    <dd>
                      {new Date(string(order[key])).toLocaleString(locale, {
                        timeZone: "Asia/Amman",
                      })}
                    </dd>
                  </div>
                ),
            )}
          </dl>
          <div className="store-table">
            <table>
              <thead>
                <tr>
                  <th>{t({ en: "Item", ar: "الصنف" })}</th>
                  <th>{t({ en: "Quantity", ar: "الكمية" })}</th>
                  <th>{t({ en: "Total", ar: "المجموع" })}</th>
                </tr>
              </thead>
              <tbody>
                {q.data.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {snapshotName(item, "productName", locale)} ·{" "}
                      {snapshotName(item, "variantName", locale)}
                      <small>{item.skuSnapshot}</small>
                    </td>
                    <td>{item.quantity}</td>
                    <td>{money(item.lineTotal, locale, q.data.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="store-actions">
            {!admin && (
              <>
                <Button
                  variant="outline"
                  onClick={() =>
                    setEdit({
                      op: "post_api_v1_store_orders_my_by_orderId_cancel",
                      title: t({ en: "Cancel order", ar: "إلغاء الطلب" }),
                      initial: { version: order.version },
                    })
                  }
                >
                  {t({ en: "Cancel order", ar: "إلغاء الطلب" })}
                </Button>
                {normalized(order.status) === "readyforpickup" && (
                  <Button onClick={() => setPickup((x) => !x)}>
                    {t(
                      pickup
                        ? { en: "Hide pickup code", ar: "إخفاء رمز الاستلام" }
                        : { en: "Show pickup code", ar: "عرض رمز الاستلام" },
                    )}
                  </Button>
                )}
              </>
            )}
            {admin &&
              Object.entries(orderCommands)
                .filter(([, c]) =>
                  permissions.includes(storeRoutes[c.op].permission!),
                )
                .map(([key, c]) => (
                  <Button
                    key={key}
                    variant="outline"
                    onClick={() =>
                      setEdit({
                        op: c.op,
                        title: t(c),
                        initial: { version: order.version },
                        required: [
                          "override",
                          "reject",
                          "cancel",
                          "deadline",
                          "regenerate",
                        ].includes(key)
                          ? ["reason"]
                          : [],
                      })
                    }
                  >
                    {t(c)}
                  </Button>
                ))}
            {(!admin || permissions.includes("store.returns.view_all")) && (
              <Button variant="outline" onClick={() => setReturning(true)}>
                {t({
                  en: "Return or exchange items",
                  ar: "إرجاع أو استبدال منتجات",
                })}
              </Button>
            )}
          </div>
          {pickup && !admin && <PickupCode id={id} />}
          {q.data.terminalReason && <p>{q.data.terminalReason}</p>}
          <Panel title={t({ en: "Order history", ar: "سجل الطلب" })}>
            <ol>
              {q.data.history.items.map((entry, i) => (
                <li key={i}>
                  {entry.toStatus} ·{" "}
                  {new Date(entry.occurredAt).toLocaleString(locale, {
                    timeZone: "Asia/Amman",
                  })}
                  <p>{entry.reason}</p>
                </li>
              ))}
            </ol>
            <Pager
              page={page}
              total={q.data.history.total}
              onChange={setPage}
            />
          </Panel>
          {admin && (
            <Panel title={t({ en: "Cash movements", ar: "الحركات النقدية" })}>
              {q.data.cashMovements?.map((movement) => (
                <div className="store-card" key={movement.id}>
                  {movement.movementType} · {money(movement.amountJod, locale)}
                  <p>{movement.reason}</p>
                  {permissions.includes("store.cash.correct") && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        setEdit({
                          op: "post_api_v1_store_admin_orders_by_orderId_cash_corrections",
                          title: t({
                            en: "Record cash correction",
                            ar: "تسجيل تصحيح نقدي",
                          }),
                          initial: { movementId: movement.id },
                          required: ["reason", "amountJod"],
                        })
                      }
                    >
                      {t({
                        en: "Correct this movement",
                        ar: "تصحيح هذه الحركة",
                      })}
                    </Button>
                  )}
                </div>
              ))}
            </Panel>
          )}
          {edit && (
            <StoreEditor
              operation={edit.op}
              title={edit.title}
              path={{ orderId: id }}
              initial={edit.initial}
              requireFields={edit.required}
              onClose={() => setEdit(null)}
            />
          )}
          {returning && (
            <RequestReturn
              id={id}
              admin={admin}
              orderItems={rows(order.items)}
              canSubmit={!admin || permissions.includes("store.returns.review")}
              onClose={() => setReturning(false)}
            />
          )}
        </>
      )}
    </>
  );
}
function PickupCode({ id }: { id: string }) {
  const { api } = useStoreConnection(),
    { t } = useLocale(),
    q = useStoreQuery(
      "pickup-code",
      (signal) =>
        api.get_api_v1_store_orders_my_by_orderId_pickup_code({
          path: { orderId: id },
          signal,
        }),
      id,
      true,
      true,
    );
  return (
    <section>
      <QueryStatus query={q} />
      {q.data && (
        <>
          <p>
            {t({
              en: "Show this code to the pickup desk when collecting your order.",
              ar: "اعرض هذا الرمز لمكتب الاستلام عند استلام الطلب.",
            })}
          </p>
          <output className="pickup-code" dir="ltr">
            {q.data.pickupCode}
          </output>
        </>
      )}
    </section>
  );
}
function RequestReturn({
  id,
  admin,
  orderItems,
  canSubmit,
  onClose,
}: {
  id: string;
  admin: boolean;
  canSubmit: boolean;
  orderItems: Entry[];
  onClose: () => void;
}) {
  const { api } = useStoreConnection(),
    action = useStoreAction(),
    { t, locale } = useLocale(),
    [reason, setReason] = useState(""),
    [selected, setSelected] = useState<
      Record<
        string,
        { quantity: number; resolution: string; replacement?: string }
      >
    >({}),
    [ack, setAck] = useState(false);
  const q = useStoreQuery(
    "returnable-items",
    (signal) =>
      admin
        ? api.get_api_v1_store_admin_orders_by_orderId_returnable_items({
            path: { orderId: id },
            signal,
          })
        : api.get_api_v1_store_orders_my_by_orderId_returnable_items({
            path: { orderId: id },
            signal,
          }),
    [id, admin],
    true,
    true,
  );
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!ack || !q.data) return;
    void action.run(() => {
      const body = returnRequest(q.data, selected, reason);
      return admin
        ? api.post_api_v1_store_admin_orders_by_orderId_returns({
            path: { orderId: id },
            body,
          })
        : api.post_api_v1_store_orders_my_by_orderId_returns({
            path: { orderId: id },
            body,
          });
    }, onClose);
  }
  return (
    <Modal
      open
      title={t({ en: "Return or exchange", ar: "إرجاع أو استبدال" })}
      description={t({
        en: "Choose eligible items. The team reviews your request before handover.",
        ar: "اختر المنتجات المؤهلة. يراجع الفريق طلبك قبل التسليم.",
      })}
      onClose={() => {
        if (!action.busy) onClose();
      }}
      className="engagement-modal store-connected"
    >
      <QueryStatus query={q} />
      <form onSubmit={submit}>
        {q.data?.map((item) => {
          const choice = selected[item.id];
          return (
            <article key={item.id} className="store-card">
              <label className="engagement-check">
                <input
                  type="checkbox"
                  disabled={!item.canRequest || action.busy}
                  checked={!!choice}
                  onChange={(e) => {
                    const next = { ...selected };
                    if (e.target.checked)
                      next[item.id] = { quantity: 1, resolution: "Refund" };
                    else delete next[item.id];
                    setSelected(next);
                  }}
                />
                {snapshotName(
                  orderItems.find((line) => line.id === item.orderItemId),
                  "productName",
                  locale,
                ) || t({ en: "Order item", ar: "صنف الطلب" })}{" "}
                · {t({ en: "Eligible quantity", ar: "الكمية المؤهلة" })}:{" "}
                {item.remainingQuantity} · {money(item.unitPrice, locale)}
              </label>
              {choice && (
                <>
                  <label>
                    {t({ en: "Quantity", ar: "الكمية" })}
                    <input
                      type="number"
                      min={1}
                      max={item.remainingQuantity}
                      value={choice.quantity}
                      onChange={(e) =>
                        setSelected({
                          ...selected,
                          [item.id]: {
                            ...choice,
                            quantity: e.target.valueAsNumber,
                          },
                        })
                      }
                    />
                  </label>
                  <label>
                    {t({ en: "Resolution", ar: "نوع المعالجة" })}
                    <select
                      value={choice.resolution}
                      onChange={(e) =>
                        setSelected({
                          ...selected,
                          [item.id]: { ...choice, resolution: e.target.value },
                        })
                      }
                    >
                      <option value="Refund">
                        {t({ en: "Refund", ar: "استرداد المبلغ" })}
                      </option>
                      <option value="Exchange">
                        {t({ en: "Exchange", ar: "استبدال" })}
                      </option>
                    </select>
                  </label>
                  {choice.resolution === "Exchange" && (
                    <label>
                      {t({
                        en: "Requested replacement variant ID",
                        ar: "معرّف الصنف البديل المطلوب",
                      })}
                      <input
                        required
                        value={choice.replacement || ""}
                        onChange={(e) =>
                          setSelected({
                            ...selected,
                            [item.id]: {
                              ...choice,
                              replacement: e.target.value,
                            },
                          })
                        }
                      />
                    </label>
                  )}
                </>
              )}
            </article>
          );
        })}
        <label>
          {t({ en: "Reason", ar: "السبب" })}
          <textarea
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <label className="engagement-check">
          <input
            type="checkbox"
            checked={ack}
            onChange={(e) => setAck(e.target.checked)}
          />
          {t({
            en: "I reviewed the selected items and quantities.",
            ar: "راجعت المنتجات والكميات المحددة.",
          })}
        </label>
        {action.feedback}
        <Button
          disabled={
            action.busy || !ack || !canSubmit || !Object.keys(selected).length
          }
        >
          {t({ en: "Submit return request", ar: "إرسال طلب الإرجاع" })}
        </Button>
      </form>
    </Modal>
  );
}
export function Returns({
  admin = false,
  permissions = [],
}: {
  admin?: boolean;
  permissions?: string[];
}) {
  const { api, session } = useStoreConnection(),
    { t } = useLocale(),
    [page, setPage] = useState(1),
    [status, setStatus] = useState(""),
    [id, setId] = useState("");
  const q = useStoreQuery(
    "returns",
    (signal) =>
      admin
        ? api.get_api_v1_store_admin_returns({
            query: {
              Page: page,
              PageSize: 20,
              ReturnStatus: status || undefined,
            },
            signal,
          })
        : api.get_api_v1_store_returns_my({
            query: {
              Page: page,
              PageSize: 20,
              ReturnStatus: status || undefined,
            },
            signal,
          }),
    [page, status, admin],
    true,
    true,
  );
  return (
    <>
      <label>
        {t({ en: "Return status", ar: "حالة الإرجاع" })}
        <input
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        />
      </label>
      <QueryStatus query={q} />
      {q.data && (
        <>
          <div className="store-products">
            {q.data.items.map((item) => (
              <article className="store-card" key={item.id}>
                <h2>{item.returnNumber}</h2>
                <p>
                  {item.requestType} · {item.status}
                </p>
                <Button variant="outline" onClick={() => setId(item.id)}>
                  {t({ en: "View return", ar: "عرض طلب الإرجاع" })}
                </Button>
              </article>
            ))}
          </div>
          <Empty items={q.data.items} />
          <Pager page={page} total={q.data.total} onChange={setPage} />
        </>
      )}
      {id && (
        <Modal
          open
          description=""
          title={t({ en: "Return details", ar: "تفاصيل الإرجاع" })}
          onClose={() => setId("")}
          className="engagement-modal store-connected"
        >
          <ReturnDetail
            key={id + session}
            id={id}
            admin={admin}
            permissions={permissions}
          />
        </Modal>
      )}
    </>
  );
}
function ReturnDetail({
  id,
  admin,
  permissions,
}: {
  id: string;
  admin: boolean;
  permissions: string[];
}) {
  const { api } = useStoreConnection(),
    { t, locale } = useLocale(),
    [page, setPage] = useState(1),
    [edit, setEdit] = useState<{
      op: StoreOperation;
      title: string;
      initial: Entry;
      path?: Record<string, string>;
    } | null>(null),
    [inspecting, setInspecting] = useState(false);
  const q = useStoreQuery(
      "return-detail",
      (signal) =>
        admin
          ? api.get_api_v1_store_admin_returns_by_returnId({
              path: { returnId: id },
              query: { Page: page, PageSize: 20 },
              signal,
            })
          : api.get_api_v1_store_returns_my_by_returnId({
              path: { returnId: id },
              query: { Page: page, PageSize: 20 },
              signal,
            }),
      [id, page, admin],
      true,
      true,
    ),
    item = record(q.data);
  const actions: {
    op: StoreOperation;
    en: string;
    ar: string;
    initial?: Entry;
  }[] = admin
    ? [
        {
          op: "post_api_v1_store_admin_returns_by_returnId_approve",
          en: "Approve return",
          ar: "الموافقة على الإرجاع",
          initial: {
            version: item.version,
            replacementVariants: Object.fromEntries(
              rows(item.items)
                .filter((x) => x.requestedExchangeVariantId)
                .map((x) => [string(x.id), x.requestedExchangeVariantId]),
            ),
          },
        },
        {
          op: "post_api_v1_store_admin_returns_by_returnId_reject",
          en: "Reject return",
          ar: "رفض الإرجاع",
        },
        {
          op: "post_api_v1_store_admin_returns_by_returnId_cancel",
          en: "Cancel return",
          ar: "إلغاء الإرجاع",
        },
      ]
    : [
        {
          op: "post_api_v1_store_returns_my_by_returnId_cancel",
          en: "Cancel return request",
          ar: "إلغاء طلب الإرجاع",
        },
        {
          op: "post_api_v1_store_returns_my_by_returnId_evidence",
          en: "Attach existing evidence image",
          ar: "ربط صورة إثبات موجودة",
        },
      ];
  return (
    <>
      <QueryStatus query={q} />
      {q.data && (
        <>
          <h2>{q.data.returnNumber}</h2>
          <p>{q.data.status}</p>
          <p className="store-lines">{q.data.studentReason}</p>
          <p>{q.data.adminDecisionReason}</p>
          {q.data.items.map((line) => (
            <article key={line.id} className="store-card">
              <strong>
                {line.replacementNameSnapshot || line.orderItemId.slice(0, 8)}
              </strong>
              <p>
                {line.resolution} · {line.quantity} ·{" "}
                {money(line.originalUnitPriceSnapshot, locale)}
              </p>
              {line.cashDifference != null && (
                <p>
                  {t({ en: "Cash difference", ar: "الفرق النقدي" })}:{" "}
                  {money(line.cashDifference, locale)}
                </p>
              )}
            </article>
          ))}
          <div className="store-actions">
            {actions
              .filter(
                (a) =>
                  !admin || permissions.includes(storeRoutes[a.op].permission!),
              )
              .map((a) => (
                <Button
                  key={a.op}
                  variant="outline"
                  onClick={() =>
                    setEdit({
                      op: a.op,
                      title: t(a),
                      initial: a.initial || { version: item.version },
                    })
                  }
                >
                  {t(a)}
                </Button>
              ))}
            {admin && permissions.includes("store.returns.complete") && (
              <Button onClick={() => setInspecting(true)}>
                {t({
                  en: "Inspect and complete handover",
                  ar: "فحص وإتمام التسليم",
                })}
              </Button>
            )}
          </div>
          <Panel title={t({ en: "Evidence", ar: "الإثباتات" })}>
            {q.data.evidence.map((image) => (
              <article key={image.assetId}>
                <StoreImage
                  assetId={image.assetId}
                  alt={t({ en: "Return evidence", ar: "إثبات الإرجاع" })}
                />
                {!admin && (
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setEdit({
                        op: "delete_api_v1_store_returns_my_by_returnId_evidence_by_assetId",
                        title: t({
                          en: "Remove evidence",
                          ar: "إزالة الإثبات",
                        }),
                        initial: {},
                        path: { returnId: id, assetId: image.assetId },
                      })
                    }
                  >
                    {t({ en: "Remove evidence", ar: "إزالة الإثبات" })}
                  </Button>
                )}
              </article>
            ))}
          </Panel>
          <Panel title={t({ en: "History", ar: "السجل" })}>
            <ol>
              {q.data.history.items.map((entry, i) => (
                <li key={i}>
                  {entry.toStatus}
                  <p>{entry.reason}</p>
                  <time>
                    {new Date(entry.occurredAt).toLocaleString(locale, {
                      timeZone: "Asia/Amman",
                    })}
                  </time>
                </li>
              ))}
            </ol>
            <Pager
              page={page}
              total={q.data.history.total}
              onChange={setPage}
            />
          </Panel>
          {edit && (
            <StoreEditor
              operation={edit.op}
              title={edit.title}
              initial={edit.initial}
              path={edit.path || { returnId: id }}
              onClose={() => setEdit(null)}
            />
          )}
          {inspecting && (
            <Inspection
              id={id}
              item={item}
              onClose={() => setInspecting(false)}
            />
          )}
        </>
      )}
    </>
  );
}
function Inspection({
  id,
  item,
  onClose,
}: {
  id: string;
  item: Entry;
  onClose: () => void;
}) {
  const { api } = useStoreConnection(),
    action = useStoreAction(),
    { t } = useLocale(),
    [inspection, setInspection] = useState<
      Record<
        string,
        {
          receivedQuantity: number;
          restockQuantity: number;
          damagedQuantity: number;
          note?: string;
        }
      >
    >(() =>
      Object.fromEntries(
        rows(item.items).map((row) => [
          string(row.id),
          { receivedQuantity: 0, restockQuantity: 0, damagedQuantity: 0 },
        ]),
      ),
    ),
    [ack, setAck] = useState(false),
    [reason, setReason] = useState("");
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!ack) return;
    void action.run(
      () =>
        api.post_api_v1_store_admin_returns_by_returnId_complete({
          path: { returnId: id },
          body: {
            version: string(item.version),
            items: inspectReturn(rows(item.items), inspection),
            reason: reason || null,
          },
        }),
      onClose,
    );
  }
  return (
    <Modal
      open
      title={t({
        en: "Return handover and settlement",
        ar: "تسليم المرتجع والتسوية",
      })}
      description={t({
        en: "Record the physical inspection. Completing this action records stock and cash movements.",
        ar: "سجّل الفحص الفعلي. يؤدي إتمام الإجراء إلى تسجيل حركات المخزون والنقد.",
      })}
      onClose={() => {
        if (!action.busy) onClose();
      }}
      className="engagement-modal store-connected"
    >
      <form onSubmit={submit}>
        {rows(item.items).map((row) => (
          <fieldset key={string(row.id)} disabled={action.busy}>
            <legend>
              {string(row.replacementNameSnapshot) || string(row.orderItemId)}
            </legend>
            {(
              [
                "receivedQuantity",
                "restockQuantity",
                "damagedQuantity",
              ] as const
            ).map((key) => (
              <label key={key}>
                {t(
                  key === "receivedQuantity"
                    ? { en: "Received quantity", ar: "الكمية المستلمة" }
                    : key === "restockQuantity"
                      ? { en: "Restock quantity", ar: "كمية إعادة التخزين" }
                      : { en: "Damaged quantity", ar: "الكمية التالفة" },
                )}
                <input
                  type="number"
                  min={0}
                  max={Number(row.quantity)}
                  step={1}
                  required
                  value={inspection[string(row.id)][key]}
                  onChange={(e) =>
                    setInspection({
                      ...inspection,
                      [string(row.id)]: {
                        ...inspection[string(row.id)],
                        [key]: e.target.valueAsNumber,
                      },
                    })
                  }
                />
              </label>
            ))}
          </fieldset>
        ))}
        <label>
          {t({ en: "Reason / notes", ar: "السبب / الملاحظات" })}
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <label className="engagement-check">
          <input
            type="checkbox"
            checked={ack}
            onChange={(e) => setAck(e.target.checked)}
          />
          {t({
            en: "I verified the physical quantities and the cash settlement.",
            ar: "تحققت من الكميات الفعلية والتسوية النقدية.",
          })}
        </label>
        {action.feedback}
        <Button disabled={!ack || action.busy}>
          {t({ en: "Complete return", ar: "إتمام الإرجاع" })}
        </Button>
      </form>
    </Modal>
  );
}
