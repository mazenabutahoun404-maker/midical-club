import { useState } from "react";
import { Minus, PackageCheck, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLocale } from "../../app/providers/LocaleProvider";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { StoreNavigation } from "../../components/navigation/StoreNavigation";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/button";
import { useStoreProducts, useStoreWorkspace } from "../../hooks/useContent";
import { cartSubtotal, formatStorePrice } from "../../lib/store";
import { ProductVisual } from "./ProductVisual";

export default function CartPage() {
  const { label, t, locale } = useLocale();
  const navigate = useNavigate();
  const products = useStoreProducts();
  const store = useStoreWorkspace();
  const [confirming, setConfirming] = useState(false);
  if (products.isPending || store.isPending) return <LoadingState />;
  if (products.isError || store.isError)
    return (
      <ErrorState
        retry={() => {
          void products.refetch();
          store.retry();
        }}
      />
    );
  const rows = store.cart.lines.flatMap((line) => {
    const product = products.data?.find((item) => item.id === line.productId);
    const variant = product?.variants.find(
      (item) => item.id === line.variantId,
    );
    return product && variant ? [{ line, product, variant }] : [];
  });
  const subtotal = cartSubtotal(store.cart, products.data || []);
  async function change(
    productId: string,
    variantId: string,
    quantity: number,
  ) {
    try {
      await store.setQuantity({ productId, variantId, quantity });
    } catch {
      toast.error(label("maxStockReached"));
    }
  }
  async function remove(productId: string, variantId: string) {
    try {
      await store.remove({ productId, variantId });
    } catch {
      toast.error(label("cartError"));
    }
  }
  async function reserve() {
    try {
      await store.reserve();
      setConfirming(false);
      toast.success(label("reservationCreated"));
      navigate("/my/orders");
    } catch {
      toast.error(label("reserveFailed"));
    }
  }
  return (
    <div className="container store-v7 cart-page">
      <StoreNavigation />
      <header className="cart-header">
        <span className="eyebrow">{label("reservationSummary")}</span>
        <h1 tabIndex={-1} data-page-heading>
          {label("cartTitle")}
        </h1>
        <p>{label("cartBody")}</p>
      </header>
      {rows.length ? (
        <div className="cart-layout">
          <section className="cart-lines" aria-label={label("cart")}>
            {rows.map(({ line, product, variant }) => (
              <article key={`${line.productId}:${line.variantId}`}>
                <ProductVisual visual={product.visual} />
                <div className="cart-line-copy">
                  <span>{label(product.category)}</span>
                  <h2>{t(product.name)}</h2>
                  <p>{t(variant.label)}</p>
                  <strong>{formatStorePrice(product.priceFils, locale)}</strong>
                </div>
                <div className="cart-line-actions">
                  <div
                    className="quantity-stepper"
                    aria-label={label("quantity")}
                  >
                    <button
                      aria-label={label("decreaseQuantity")}
                      onClick={() =>
                        void change(product.id, variant.id, line.quantity - 1)
                      }
                    >
                      <Minus size={16} />
                    </button>
                    <output>{line.quantity}</output>
                    <button
                      aria-label={label("increaseQuantity")}
                      disabled={line.quantity >= variant.stock}
                      onClick={() =>
                        void change(product.id, variant.id, line.quantity + 1)
                      }
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button
                    className="cart-remove"
                    aria-label={`${label("removeItem")} ${t(product.name)}`}
                    onClick={() => void remove(product.id, variant.id)}
                  >
                    <Trash2 size={17} /> {label("removeItem")}
                  </button>
                </div>
              </article>
            ))}
          </section>
          <aside className="cart-summary">
            <span className="summary-icon">
              <PackageCheck />
            </span>
            <h2>{label("reservationSummary")}</h2>
            <dl>
              <div>
                <dt>{label("products")}</dt>
                <dd>{rows.length}</dd>
              </div>
              <div>
                <dt>{label("subtotal")}</dt>
                <dd>{formatStorePrice(subtotal, locale)}</dd>
              </div>
            </dl>
            <Button
              className="button button-primary"
              onClick={() => setConfirming(true)}
            >
              {label("reserveForPickup")}
            </Button>
            <p>{label("noPaymentNow")}</p>
          </aside>
        </div>
      ) : (
        <EmptyState
          title={label("cartEmpty")}
          description={label("cartEmptyBody")}
          href="/store"
          actionLabel={label("continueShopping")}
        />
      )}
      <p className="store-boundary-note">{label("storePreviewNotice")}</p>
      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title={label("reserveTitle")}
        description={label("reserveBody")}
      >
        <div className="workspace-form-actions">
          <Button variant="outline" onClick={() => setConfirming(false)}>
            {label("cancel")}
          </Button>
          <Button
            className="button button-primary"
            disabled={store.isMutating}
            onClick={() => void reserve()}
          >
            {label("confirmReservation")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
