import { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, ShoppingCart, PackageCheck } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { HeroArtwork } from "../../components/data-display/HeroArtwork";
import { AliveTabs } from "../../components/navigation/AliveTabs";
import { AppLink } from "../../components/navigation/AppLink";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import { record, string, collectApiPages } from "../../services/api/mapping";
import { storeUuid } from "../../services/api/store-contracts";
import { localizedField } from "../engagement/model";
import { checkoutQuote, money, quantity, normalized } from "./model";
import {
  useStoreConnection,
  useStoreQuery,
  useStoreAction,
  QueryStatus,
  Panel,
  Pager,
  Empty,
  rows,
  Confirm,
} from "./shared";
import "../../styles/store-connect.css";
export function StoreNav() {
  const { api, owner } = useStoreConnection(),
    { label, t } = useLocale(),
    navigate = useNavigate(),
    { pathname } = useLocation();
  const cart = useStoreQuery(
      "cart",
      (signal) => api.get_api_v1_store_cart({ signal }),
      "",
      !!owner,
    ),
    orders = useStoreQuery(
      "orders-count",
      (signal) =>
        api.get_api_v1_store_orders_my({
          query: { Page: 1, PageSize: 20 },
          signal,
        }),
      "",
      !!owner,
    );
  return (
    <nav className="store-navigation" aria-label={label("storeNavigation")}>
      <AliveTabs
        label={label("storeNavigation")}
        items={[
          { id: "/store", label: label("shopAll"), icon: ShoppingBag },
          {
            id: "/store/cart",
            label: label("cart"),
            icon: ShoppingCart,
            locked: !owner,
            lockLabel: t({ en: "Sign in required", ar: "يتطلب تسجيل الدخول" }),
            count: cart.data?.items.reduce((n, line) => n + line.quantity, 0),
          },
          {
            id: "/my/orders",
            label: label("myOrders"),
            icon: PackageCheck,
            locked: !owner,
            lockLabel: t({ en: "Sign in required", ar: "يتطلب تسجيل الدخول" }),
            count: orders.data?.total,
          },
        ]}
        value={
          pathname.startsWith("/store/cart")
            ? "/store/cart"
            : pathname.startsWith("/my/orders")
              ? "/my/orders"
              : "/store"
        }
        onChange={navigate}
      />
    </nav>
  );
}
export function StoreCatalog() {
  const { api, services } = useStoreConnection(),
    { t, label, locale } = useLocale(),
    [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState("");
  const categories = useStoreQuery("categories", (signal) =>
      collectApiPages(services.api!, (page) =>
        api.get_api_v1_store_categories({
          query: { Page: page, PageSize: 100 },
          signal,
        }),
      ),
    ),
    q = useStoreQuery(
      "products",
      (signal) =>
        api.get_api_v1_store_products({
          query: {
            Page: page,
            PageSize: 20,
            Search: search || undefined,
            Category: category || undefined,
          },
          signal,
        }),
      [page, search, category],
    );
  return (
    <div className="container store-v7 store-page store-connected">
      <StoreNav />
      <section className="store-hero artwork-scene">
        <div>
          <span className="eyebrow">{label("storeEyebrow")}</span>
          <h1 tabIndex={-1} data-page-heading>
            {label("storeTitle")}
          </h1>
          <p>
            {t({
              en: "Browse club essentials. Reserve your choices and pay when you collect them.",
              ar: "تصفّح مستلزمات النادي واحجز خياراتك وادفع عند الاستلام.",
            })}
          </p>
        </div>
        <HeroArtwork section="store" />
      </section>
      <div className="store-toolbar">
        <label>
          {t({ en: "Search products", ar: "البحث في المنتجات" })}
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </label>
        <label>
          {t({ en: "Category", ar: "الفئة" })}
          <select
            value={category}
            onChange={(e) => {
              setPage(1);
              setCategory(e.target.value);
            }}
          >
            <option value="">
              {t({ en: "All categories", ar: "كل الفئات" })}
            </option>
            {categories.data?.map((item) => (
              <option key={string(item.id)} value={string(item.id)}>
                {localizedField(item, "name", locale)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {categories.error && <QueryStatus query={categories} />}
      <QueryStatus query={q} />
      {q.data && (
        <>
          <div className="store-products">
            {q.data.items.map((product) => (
              <article className="product-card" key={product.id}>
                <ShoppingBag size={42} />
                <h2>{localizedField(product, "name", locale)}</h2>
                <span>
                  {t(
                    product.inStock
                      ? { en: "Available", ar: "متاح" }
                      : { en: "Unavailable", ar: "غير متاح" },
                  )}
                </span>
                <strong>{money(product.minPrice, locale)}</strong>
                <AppLink
                  href={"/store/products/" + encodeURIComponent(product.id)}
                  className="button button-outline"
                >
                  {label("viewProduct")}
                </AppLink>
              </article>
            ))}
          </div>
          <Empty items={q.data.items} />
          <Pager page={page} total={q.data.total} onChange={setPage} />
        </>
      )}
    </div>
  );
}
export function StoreProduct() {
  const { slug = "" } = useParams(),
    { api, services, owner } = useStoreConnection(),
    { t, label, locale } = useLocale(),
    [variantId, setVariantId] = useState(""),
    [amount, setAmount] = useState(1),
    action = useStoreAction();
  const lookup = useStoreQuery(
    "product-slug",
    (signal) =>
      api.get_api_v1_store_products({
        query: { Search: slug, Page: 1, PageSize: 100 },
        signal,
      }),
    slug,
    !storeUuid.test(slug),
  );
  const id = storeUuid.test(slug)
    ? slug
    : lookup.data?.items.find((p) => p.slug === slug)?.id;
  const q = useStoreQuery(
      "product",
      (signal) =>
        api.get_api_v1_store_products_by_productId({
          path: { productId: id! },
          signal,
        }),
      id,
      !!id,
    ),
    cart = useStoreQuery(
      "cart",
      (signal) => api.get_api_v1_store_cart({ signal }),
      "",
      !!owner,
    ),
    p = q.data,
    selected = p?.variants.find((v) => v.id === variantId);
  function add() {
    if (!selected || !cart.data) return;
    const body = {
      quantity: quantity(
        (cart.data.items.find((x) => x.variantId === selected.id)?.quantity ||
          0) + amount,
      ),
      cartVersion: cart.data.version,
    };
    void action.run(() =>
      api.put_api_v1_store_cart_items_by_variantId({
        path: { variantId: selected.id },
        body,
      }),
    );
  }
  return (
    <div className="container store-v7 store-connected">
      <StoreNav />
      {!storeUuid.test(slug) && <QueryStatus query={lookup} />}
      <QueryStatus query={q} />
      {lookup.data && !id && (
        <p>
          {t({
            en: "This product is unavailable.",
            ar: "هذا المنتج غير متاح.",
          })}
        </p>
      )}
      {p && (
        <>
          <header className="engagement-heading">
            <h1 data-page-heading tabIndex={-1}>
              {localizedField(p, "name", locale)}
            </h1>
            <p>{localizedField(p, "shortDescription", locale)}</p>
          </header>
          <div className="editor-two-column">
            <div>
              {p.images
                .filter(
                  (image) =>
                    image.status === "Ready" &&
                    (!image.variantId || image.variantId === variantId),
                )
                .map((image) => (
                  <StoreImage
                    key={image.id}
                    assetId={image.assetId}
                    alt={localizedField(image, "altText", locale)}
                  />
                ))}
            </div>
            <Panel title={t({ en: "Choose your item", ar: "اختر صنفك" })}>
              <label>
                {t({ en: "Variant", ar: "الصنف" })}
                <select
                  value={variantId}
                  onChange={(e) => {
                    setVariantId(e.target.value);
                    setAmount(1);
                  }}
                >
                  <option value="">
                    {t({ en: "Choose an option", ar: "اختر خياراً" })}
                  </option>
                  {p.variants.map((v) => (
                    <option
                      value={v.id}
                      key={v.id}
                      disabled={normalized(v.status) !== "active"}
                    >
                      {localizedField(v, "displayName", locale)} ·{" "}
                      {money(v.priceJod, locale)}
                    </option>
                  ))}
                </select>
              </label>
              {selected && (
                <p>
                  {selected.availableQuantity == null
                    ? t({
                        en: "Availability is checked when ordering.",
                        ar: "يُتحقق من التوفر عند الطلب.",
                      })
                    : t({ en: "Available quantity", ar: "الكمية المتاحة" }) +
                      ": " +
                      selected.availableQuantity}
                </p>
              )}
              <label>
                {t({ en: "Quantity", ar: "الكمية" })}
                <input
                  className="store-quantity"
                  type="number"
                  min={1}
                  step={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.valueAsNumber)}
                />
              </label>
              {!owner && (
                <p>
                  {t({
                    en: "Sign in to add items to your cart.",
                    ar: "سجّل الدخول لإضافة المنتجات إلى السلة.",
                  })}
                </p>
              )}
              <Button
                disabled={
                  !owner ||
                  !p.canOrder ||
                  !selected ||
                  selected.availableQuantity === 0 ||
                  action.busy ||
                  !cart.data ||
                  !Number.isInteger(amount) ||
                  amount < 1
                }
                onClick={add}
              >
                {label("addToCart")}
              </Button>
              {cart.error && <QueryStatus query={cart} />}
              <AppLink href="/store/cart">{label("cart")}</AppLink>
              {action.feedback}
            </Panel>
          </div>
          <p className="store-lines">
            {localizedField(p, "description", locale)}
          </p>
        </>
      )}
    </div>
  );
}
export function StoreImage({ assetId, alt }: { assetId: string; alt: string }) {
  const { services } = useStoreConnection(),
    q = useStoreQuery(
      "image",
      () => services.files!.previewUrl(assetId),
      assetId,
    );
  return q.data ? (
    <img src={q.data.url} alt={alt} className="store-image" />
  ) : q.error ? (
    <span>{alt}</span>
  ) : null;
}
export function StoreCart() {
  const { api, owner } = useStoreConnection(),
    { t, label, locale } = useLocale(),
    action = useStoreAction(),
    navigate = useNavigate(),
    [clear, setClear] = useState(false),
    [review, setReview] = useState<unknown>(null),
    [ack, setAck] = useState(false);
  const q = useStoreQuery(
    "cart",
    (signal) => api.get_api_v1_store_cart({ signal }),
    "",
    !!owner,
  );
  function checkout() {
    if (!review || !ack) return;
    void action.run(
      () => api.post_api_v1_store_orders({ body: checkoutQuote(review) }),
      (order) => {
        setReview(null);
        navigate("/my/orders?order=" + encodeURIComponent(order.id));
      },
    );
  }
  return (
    <div className="container store-v7 store-connected">
      <StoreNav />
      <h1 data-page-heading tabIndex={-1}>
        {label("cart")}
      </h1>
      {!owner ? (
        <p>
          {t({
            en: "Sign in to view your cart.",
            ar: "سجّل الدخول لعرض سلتك.",
          })}
        </p>
      ) : (
        <>
          <QueryStatus query={q} />
          {q.data && (
            <>
              <div>
                {q.data.items.map((line) => (
                  <CartLine
                    key={line.id + q.data!.version}
                    line={line}
                    version={q.data!.version}
                    blocked={action.busy}
                  />
                ))}
              </div>
              <Empty items={q.data.items} />
              <dl className="store-facts">
                <div>
                  <dt>{t({ en: "Total", ar: "المجموع" })}</dt>
                  <dd>{money(q.data.total, locale, q.data.currency)}</dd>
                </div>
              </dl>
              <p>
                {t({
                  en: "Adding items does not reserve stock. Stock and prices are checked when you confirm the order. Payment is collected at pickup.",
                  ar: "الإضافة للسلة لا تحجز المخزون. يُتحقق من السعر والمخزون عند تأكيد الطلب، والدفع عند الاستلام.",
                })}
              </p>
              <div className="store-actions">
                <Button
                  disabled={
                    action.busy || !q.data.canCheckout || !q.data.quoteToken
                  }
                  onClick={() => {
                    setAck(false);
                    setReview(q.data);
                  }}
                >
                  {t({ en: "Review order", ar: "مراجعة الطلب" })}
                </Button>
                <Button
                  variant="outline"
                  disabled={action.busy || !q.data.items.length}
                  onClick={() => setClear(true)}
                >
                  {t({ en: "Empty cart", ar: "إفراغ السلة" })}
                </Button>
              </div>
              {clear && (
                <Confirm
                  busy={action.busy}
                  onCancel={() => setClear(false)}
                  onConfirm={() =>
                    void action.run(
                      () => api.delete_api_v1_store_cart({}),
                      () => setClear(false),
                    )
                  }
                >
                  {t({
                    en: "Remove all items from your cart?",
                    ar: "إزالة كل المنتجات من سلتك؟",
                  })}
                </Confirm>
              )}
              {action.feedback}
            </>
          )}
        </>
      )}
      {!!review && (
        <Modal
          open
          title={t({ en: "Confirm order", ar: "تأكيد الطلب" })}
          description={t({
            en: "Review your items and total. You will pay at pickup.",
            ar: "راجع المنتجات والمجموع. سيكون الدفع عند الاستلام.",
          })}
          onClose={() => {
            if (!action.busy) setReview(null);
          }}
        >
          <ul>
            {rows(record(review).items).map((line) => (
              <li key={string(line.id)}>
                {string(line.productName)} · {string(line.variantName)} ×{" "}
                {Number(line.quantity)} ·{" "}
                {money(line.lineTotal, locale, string(record(review).currency))}
              </li>
            ))}
          </ul>
          <strong>
            {money(
              record(review).total,
              locale,
              string(record(review).currency),
            )}
          </strong>
          <label className="engagement-check">
            <input
              type="checkbox"
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
            />
            {t({
              en: "I reviewed these items and agree to place this pickup order.",
              ar: "راجعت المنتجات وأوافق على إنشاء طلب للاستلام.",
            })}
          </label>
          <Button disabled={!ack || action.busy} onClick={checkout}>
            {t({ en: "Place order", ar: "إنشاء الطلب" })}
          </Button>
          {action.feedback}
        </Modal>
      )}
    </div>
  );
}
function CartLine({
  line,
  version,
  blocked,
}: {
  line: Record<string, unknown>;
  version: string;
  blocked: boolean;
}) {
  const { api } = useStoreConnection(),
    action = useStoreAction(),
    { t, locale } = useLocale(),
    [amount, setAmount] = useState(Number(line.quantity));
  return (
    <article className="store-card">
      <h2>{string(line.productName)}</h2>
      <p>{string(line.variantName)}</p>
      <strong>{money(line.lineTotal, locale)}</strong>
      <ul>
        {Array.isArray(line.validationErrors) &&
          line.validationErrors.map((error, i) => (
            <li key={i} role="alert">
              {typeof error === "string" ? error : JSON.stringify(error)}
            </li>
          ))}
      </ul>
      <label>
        {t({ en: "Quantity", ar: "الكمية" })}
        <input
          className="store-quantity"
          type="number"
          min={1}
          step={1}
          value={amount}
          onChange={(e) => setAmount(e.target.valueAsNumber)}
          disabled={blocked || action.busy}
        />
      </label>
      <div className="store-actions">
        <Button
          variant="outline"
          disabled={blocked || action.busy}
          onClick={() =>
            void action.run(() =>
              api.put_api_v1_store_cart_items_by_variantId({
                path: { variantId: string(line.variantId) },
                body: { quantity: quantity(amount), cartVersion: version },
              }),
            )
          }
        >
          {t({ en: "Update quantity", ar: "تحديث الكمية" })}
        </Button>
        <Button
          variant="ghost"
          disabled={blocked || action.busy}
          onClick={() =>
            void action.run(() =>
              api.delete_api_v1_store_cart_items_by_itemId({
                path: { itemId: string(line.id) },
              }),
            )
          }
        >
          {t({ en: "Remove", ar: "إزالة" })}
        </Button>
      </div>
      {action.feedback}
    </article>
  );
}
