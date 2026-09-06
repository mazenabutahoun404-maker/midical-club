import { ArrowUpRight, Boxes, Sparkles } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { productPath } from "../../constants/routes";
import { formatStorePrice, productStock } from "../../lib/store";
import type { StoreProduct } from "../../types/content";
import { ProductVisual } from "../../features/store/ProductVisual";
import { AppLink } from "../navigation/AppLink";

export function ProductCard({ product }: { product: StoreProduct }) {
  const { label, t, locale } = useLocale();
  const stock = productStock(product);
  const stockKey =
    stock === 0 ? "soldOut" : stock <= 5 ? "lowStock" : "inStock";
  return (
    <article
      className="product-card"
      data-accent={product.accent}
      data-stock={stockKey}
    >
      <ProductVisual visual={product.visual} />
      <div className="product-card-body">
        <header>
          <span className="product-category">{label(product.category)}</span>
          {product.featured && (
            <span className="product-featured">
              <Sparkles size={13} /> {label("featured")}
            </span>
          )}
        </header>
        <h2>{t(product.name)}</h2>
        <p>{t(product.shortDescription)}</p>
        <div className="product-stock" data-stock={stockKey}>
          <Boxes size={16} />
          <span>{label(stockKey)}</span>
          {stock > 0 && <b>{stock}</b>}
        </div>
        <footer>
          <strong>{formatStorePrice(product.priceFils, locale)}</strong>
          <AppLink
            href={productPath(product.slug)}
            aria-label={`${label("viewProduct")} ${t(product.name)}`}
          >
            <span>{label("viewProduct")}</span>
            <ArrowUpRight size={18} className="directional" />
          </AppLink>
        </footer>
      </div>
    </article>
  );
}
