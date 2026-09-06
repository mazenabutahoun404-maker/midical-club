import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Boxes, Minus, Plus, ShoppingCart } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { useLocale } from "../../app/providers/LocaleProvider";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { StoreNavigation } from "../../components/navigation/StoreNavigation";
import { ActionLink } from "../../components/ui/ActionLink";
import { Button } from "../../components/ui/button";
import { useStoreProduct, useStoreWorkspace } from "../../hooks/useContent";
import { formatStorePrice, productStock } from "../../lib/store";
import { ProductVisual } from "./ProductVisual";

export default function ProductPage() {
  const { slug } = useParams();
  const { label, t, locale } = useLocale();
  const query = useStoreProduct(slug);
  const store = useStoreWorkspace();
  const [variantId, setVariantId] = useState("");
  const [quantity, setQuantity] = useState(1);
  useEffect(() => {
    const first = query.data?.variants.find((variant) => variant.stock > 0);
    const selected = query.data?.variants.find(
      (variant) => variant.id === variantId && variant.stock > 0,
    );
    if (first && !selected) {
      setVariantId(first.id);
      setQuantity(1);
    }
  }, [query.data, variantId]);
  const variant = useMemo(
    () => query.data?.variants.find((item) => item.id === variantId),
    [query.data, variantId],
  );
  if (query.isPending || store.isPending) return <LoadingState />;
  if (query.isError || store.isError)
    return (
      <ErrorState
        retry={() => {
          void query.refetch();
          store.retry();
        }}
      />
    );
  const product = query.data;
  if (!product)
    return (
      <div className="container not-found">
        <h1>{label("notFound")}</h1>
        <ActionLink href="/store">{label("backToStore")}</ActionLink>
      </div>
    );
  const stock = productStock(product);
  async function add() {
    if (!variant || quantity > variant.stock) return;
    try {
      await store.add({
        productId: product!.id,
        variantId: variant.id,
        quantity,
      });
      toast.success(label("addedToCart"));
    } catch {
      toast.error(label("cartError"));
    }
  }
  return (
    <div className="container store-v7 product-page">
      <StoreNavigation />
      <div className="store-back-link">
        <ActionLink href="/store">
          <ArrowLeft size={17} className="directional" /> {label("backToStore")}
        </ActionLink>
      </div>
      <div className="product-detail-layout" data-accent={product.accent}>
        <div className="product-detail-visual">
          <ProductVisual visual={product.visual} />
          <span>{label(product.category)}</span>
        </div>
        <section className="product-detail-copy">
          {product.featured && (
            <span className="product-featured">{label("featured")}</span>
          )}
          <h1 tabIndex={-1} data-page-heading>
            {t(product.name)}
          </h1>
          <p className="product-lead">{t(product.description)}</p>
          <div className="product-price-row">
            <strong>{formatStorePrice(product.priceFils, locale)}</strong>
            {product.compareAtFils && (
              <s>{formatStorePrice(product.compareAtFils, locale)}</s>
            )}
          </div>
          <div
            className="product-stock product-stock-large"
            data-stock={
              stock === 0 ? "soldOut" : stock <= 5 ? "lowStock" : "inStock"
            }
          >
            <Boxes size={18} />
            {label(
              stock === 0 ? "soldOut" : stock <= 5 ? "lowStock" : "inStock",
            )}
          </div>
          <fieldset className="variant-picker">
            <legend>{label("chooseVariant")}</legend>
            <div>
              {product.variants.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  className={variantId === option.id ? "active" : ""}
                  aria-pressed={variantId === option.id}
                  disabled={option.stock === 0}
                  onClick={() => {
                    setVariantId(option.id);
                    setQuantity(1);
                  }}
                >
                  <strong>{t(option.label)}</strong>
                  <small>
                    {option.stock
                      ? `${option.stock} ${label("leftInStock")}`
                      : label("soldOut")}
                  </small>
                </button>
              ))}
            </div>
          </fieldset>
          <div className="product-purchase-row">
            <div className="quantity-stepper" aria-label={label("quantity")}>
              <button
                aria-label={label("decreaseQuantity")}
                disabled={quantity <= 1}
                onClick={() => setQuantity((value) => value - 1)}
              >
                <Minus size={17} />
              </button>
              <output>{quantity}</output>
              <button
                aria-label={label("increaseQuantity")}
                disabled={!variant || quantity >= variant.stock}
                onClick={() => setQuantity((value) => value + 1)}
              >
                <Plus size={17} />
              </button>
            </div>
            <Button
              className="button button-primary"
              disabled={!variant || !variant.stock || store.isMutating}
              onClick={() => void add()}
            >
              <ShoppingCart size={18} /> {label("addToCart")}
            </Button>
          </div>
          <section className="product-materials">
            <h2>{label("materials")}</h2>
            <ul>
              {product.materials.map((item) => (
                <li key={item.en}>{t(item)}</li>
              ))}
            </ul>
          </section>
        </section>
      </div>
      <p className="store-boundary-note">{label("storePreviewNotice")}</p>
    </div>
  );
}
