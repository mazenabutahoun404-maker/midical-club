import { HeroArtwork } from "../../components/data-display/HeroArtwork";
import { useMemo, useState } from "react";
import {
  Boxes,
  PackageSearch,
  Search,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { ProductCard } from "../../components/cards/ProductCard";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { AliveTabs } from "../../components/navigation/AliveTabs";
import { StoreNavigation } from "../../components/navigation/StoreNavigation";
import { useStoreProducts, useStoreWorkspace } from "../../hooks/useContent";
import { productStock } from "../../lib/store";
import type { ProductCategory } from "../../types/content";

type View = "all" | ProductCategory;
export default function StorePage() {
  const { label, t } = useLocale();
  const products = useStoreProducts();
  const store = useStoreWorkspace();
  const [view, setView] = useState<View>("all");
  const [search, setSearch] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const rows = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase();
    return (products.data || []).filter((product) => {
      const haystack = [
        t(product.name),
        t(product.shortDescription),
        t(product.description),
        ...product.materials.map(t),
      ]
        .join(" ")
        .toLocaleLowerCase();
      return (
        (view === "all" || product.category === view) &&
        (!inStockOnly || productStock(product) > 0) &&
        (!needle || haystack.includes(needle))
      );
    });
  }, [inStockOnly, products.data, search, t, view]);
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
  const counts = (category?: ProductCategory) =>
    (products.data || []).filter(
      (product) => !category || product.category === category,
    ).length;
  const tabs = [
    {
      id: "all",
      label: label("allProducts"),
      icon: ShoppingBag,
      count: counts(),
    },
    {
      id: "apparel",
      label: label("apparel"),
      icon: Sparkles,
      count: counts("apparel"),
    },
    {
      id: "stationery",
      label: label("stationery"),
      icon: PackageSearch,
      count: counts("stationery"),
    },
    {
      id: "accessories",
      label: label("accessories"),
      icon: Boxes,
      count: counts("accessories"),
    },
    {
      id: "drinkware",
      label: label("drinkware"),
      icon: ShoppingBag,
      count: counts("drinkware"),
    },
  ] as const;
  return (
    <div className="container store-v7 store-page">
      <StoreNavigation />
      <section className="store-hero artwork-scene">
        <div>
          <span className="eyebrow">{label("storeEyebrow")}</span>
          <h1 tabIndex={-1} data-page-heading>
            {label("storeTitle")}
          </h1>
          <p>{label("storeBody")}</p>
        </div>
        <HeroArtwork section="store" />
      </section>
      <section className="store-controls" aria-label={label("productFilters")}>
        <AliveTabs
          label={label("productFilters")}
          items={[...tabs]}
          value={view}
          onChange={setView}
        />
        <div className="store-filter-row">
          <label className="store-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={label("storeSearch")}
            />
          </label>
          <label className="stock-toggle">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(event) => setInStockOnly(event.target.checked)}
            />
            <span aria-hidden="true">
              <i />
            </span>
            {label("inStockOnly")}
          </label>
        </div>
      </section>
      <p className="store-results" role="status">
        <strong>{rows.length}</strong> {label("products")}
      </p>
      {rows.length ? (
        <div className="product-grid">
          {rows.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
      <p className="store-boundary-note">{label("storePreviewNotice")}</p>
    </div>
  );
}
