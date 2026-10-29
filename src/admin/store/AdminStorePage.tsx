import type { Operations } from "../../services/api/schema.generated";
import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useAccess } from "../governance/useGovernance";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import { record, string } from "../../services/api/mapping";
import { storeRoutes } from "../../services/api/store-contracts.generated";
import { localizedField } from "../../features/engagement/model";
import { StoreEditor } from "../../features/store-live/Forms";
import {
  money,
  productDraft,
  settingsDraft,
  type StoreOperation,
} from "../../features/store-live/model";
import { Orders, Returns } from "../../features/store-live/Orders";
import {
  useStoreConnection,
  useStoreQuery,
  useStoreAction,
  Panel,
  QueryStatus,
  Pager,
  Empty,
  rows,
} from "../../features/store-live/shared";
import "../../styles/store-connect.css";
type Entry = Record<string, unknown>;
type Edit = {
  op: StoreOperation;
  title: string;
  initial: Entry;
  path?: Record<string, string>;
  description?: string;
  required?: string[];
  manualVersion?: boolean;
};
const allowed = (permissions: string[], id: StoreOperation) =>
  permissions.includes(storeRoutes[id].permission!);
export default function AdminStorePage() {
  const { owner, session } = useStoreConnection();
  return <AdminStore key={String(owner) + session} />;
}
function AdminStore() {
  const { t } = useLocale(),
    access = useAccess(),
    permissions = access.data?.permissions || [],
    [selected, setSelected] = useState("");
  const tabs = [
      ...(permissions.some(
        (p) =>
          p.startsWith("store.products.") ||
          p.startsWith("store.categories.") ||
          p.startsWith("store.inventory.") ||
          p === "store.catalog.view_admin",
      )
        ? [{ id: "catalog", en: "Catalogue", ar: "الكتالوج" }]
        : []),
      ...(permissions.includes("store.orders.view_all")
        ? [{ id: "orders", en: "Orders & pickup", ar: "الطلبات والاستلام" }]
        : []),
      ...(permissions.includes("store.returns.view_all")
        ? [
            {
              id: "returns",
              en: "Returns & exchanges",
              ar: "الإرجاع والاستبدال",
            },
          ]
        : []),
      ...(permissions.includes("store.settings.manage")
        ? [{ id: "settings", en: "Store settings", ar: "إعدادات المتجر" }]
        : []),
      ...(permissions.includes("store.reports.view") ||
      permissions.includes("store.reports.export")
        ? [{ id: "reports", en: "Reports & jobs", ar: "التقارير والمهام" }]
        : []),
    ],
    tab = tabs.find((x) => x.id === selected)?.id || tabs[0]?.id;
  return (
    <div className="container store-connected engagement-page">
      <header className="engagement-heading">
        <span className="eyebrow">medClub</span>
        <h1 tabIndex={-1} data-page-heading>
          {t({ en: "Store administration", ar: "إدارة المتجر" })}
        </h1>
        <p>
          {t({
            en: "Manage the catalogue, stock, pickup orders and returns.",
            ar: "إدارة الكتالوج والمخزون وطلبات الاستلام والمرتجعات.",
          })}
        </p>
      </header>
      <QueryStatus query={access} />
      <nav className="engagement-tabs">
        {tabs.map((item) => (
          <Button
            key={item.id}
            variant={tab === item.id ? "default" : "outline"}
            onClick={() => setSelected(item.id)}
          >
            {t(item)}
          </Button>
        ))}
      </nav>
      {tab === "catalog" && <Catalog permissions={permissions} />}
      {tab === "orders" && <Orders admin permissions={permissions} />}
      {tab === "returns" && <Returns admin permissions={permissions} />}
      {tab === "settings" && <Settings />}
      {tab === "reports" && <Reports permissions={permissions} />}
      {!access.isPending && !access.isError && !tab && (
        <p>
          {t({
            en: "Your permissions do not include a store section.",
            ar: "لا تتضمن صلاحياتك قسماً من المتجر.",
          })}
        </p>
      )}
    </div>
  );
}
function Catalog({ permissions }: { permissions: string[] }) {
  const { api, session } = useStoreConnection(),
    { t, locale } = useLocale(),
    [page, setPage] = useState(1),
    [categoryPage, setCategoryPage] = useState(1),
    [search, setSearch] = useState(""),
    [id, setId] = useState(""),
    [variantLookup, setVariantLookup] = useState(""),
    [variantDirect, setVariantDirect] = useState(""),
    [edit, setEdit] = useState<Edit | null>(null),
    canRead = permissions.includes("store.catalog.view_admin");
  const q = useStoreQuery(
      "admin-products",
      (signal) =>
        api.get_api_v1_store_admin_products({
          query: { Page: page, PageSize: 20, Search: search || undefined },
          signal,
        }),
      [page, search],
      canRead,
      true,
    ),
    categories = useStoreQuery(
      "admin-categories",
      (signal) =>
        api.get_api_v1_store_admin_categories({
          query: { Page: categoryPage, PageSize: 20 },
          signal,
        }),
      categoryPage,
      canRead,
      true,
    );
  return (
    <>
      {permissions.some((p) => p.startsWith("store.inventory.")) && (
        <Panel title={t({ en: "Inventory lookup", ar: "البحث في المخزون" })}>
          <label>
            {t({ en: "Variant ID", ar: "معرّف الصنف" })}
            <input
              value={variantLookup}
              onChange={(e) => setVariantLookup(e.target.value)}
            />
          </label>
          <Button
            disabled={!variantLookup}
            onClick={() => setVariantDirect(variantLookup)}
          >
            {t({ en: "Open inventory", ar: "فتح المخزون" })}
          </Button>
          {variantDirect && (
            <Modal
              open
              title={t({ en: "Inventory", ar: "المخزون" })}
              description=""
              onClose={() => setVariantDirect("")}
              className="engagement-modal store-connected"
            >
              <Inventory
                key={variantDirect}
                variant={{ id: variantDirect }}
                permissions={permissions}
              />
            </Modal>
          )}
        </Panel>
      )}
      <Panel title={t({ en: "Products", ar: "المنتجات" })}>
        <div className="store-actions">
          {allowed(permissions, "post_api_v1_store_admin_products") && (
            <Button
              onClick={() =>
                setEdit({
                  op: "post_api_v1_store_admin_products",
                  title: t({ en: "Create product", ar: "إنشاء منتج" }),
                  initial: {
                    audience: [],
                    options: [],
                    materials: [],
                    richDescription: null,
                  },
                  required: ["defaultPrice"],
                })
              }
            >
              {t({ en: "New product", ar: "منتج جديد" })}
            </Button>
          )}
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
        </div>
        {canRead && (
          <>
            <QueryStatus query={q} />
            {q.data && (
              <>
                <div className="store-products">
                  {q.data.items.map((product) => (
                    <article key={product.id} className="store-card">
                      <h3>{localizedField(product, "name", locale)}</h3>
                      <span>{product.status}</span>
                      <p>{money(product.minPrice, locale)}</p>
                      <Button
                        variant="outline"
                        onClick={() => setId(product.id)}
                      >
                        {t({ en: "Manage product", ar: "إدارة المنتج" })}
                      </Button>
                    </article>
                  ))}
                </div>
                <Empty items={q.data.items} />
                <Pager page={page} total={q.data.total} onChange={setPage} />
              </>
            )}
          </>
        )}
      </Panel>
      <Panel title={t({ en: "Categories", ar: "الفئات" })}>
        {allowed(permissions, "post_api_v1_store_admin_categories") && (
          <Button
            onClick={() =>
              setEdit({
                op: "post_api_v1_store_admin_categories",
                title: t({ en: "Create category", ar: "إنشاء فئة" }),
                initial: { sortOrder: 0 },
              })
            }
          >
            {t({ en: "New category", ar: "فئة جديدة" })}
          </Button>
        )}
        {canRead && (
          <>
            <QueryStatus query={categories} />
            {categories.data && (
              <>
                <ul>
                  {categories.data.items.map((item) => (
                    <li key={item.id}>
                      {localizedField(item, "name", locale)} · {item.status}
                      <div className="store-actions">
                        {allowed(
                          permissions,
                          "put_api_v1_store_admin_categories_by_id",
                        ) && (
                          <Button
                            variant="outline"
                            onClick={() =>
                              setEdit({
                                op: "put_api_v1_store_admin_categories_by_id",
                                title: t({
                                  en: "Edit category",
                                  ar: "تعديل الفئة",
                                }),
                                path: { id: item.id },
                                initial: item,
                              })
                            }
                          >
                            {t({ en: "Edit", ar: "تعديل" })}
                          </Button>
                        )}
                        {allowed(
                          permissions,
                          "post_api_v1_store_admin_categories_by_id_archive",
                        ) && (
                          <Button
                            variant="outline"
                            onClick={() =>
                              setEdit({
                                op: "post_api_v1_store_admin_categories_by_id_archive",
                                title: t({
                                  en: "Archive category",
                                  ar: "أرشفة الفئة",
                                }),
                                path: { id: item.id },
                                initial: { version: item.version },
                                required: ["reason"],
                              })
                            }
                          >
                            {t({ en: "Archive", ar: "أرشفة" })}
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                <Pager
                  page={categoryPage}
                  total={categories.data.total}
                  onChange={setCategoryPage}
                />
              </>
            )}
          </>
        )}
      </Panel>
      {id && (
        <Modal
          open
          title={t({ en: "Manage product", ar: "إدارة المنتج" })}
          description=""
          onClose={() => setId("")}
          className="engagement-modal store-connected"
        >
          <ProductAdmin key={id + session} id={id} permissions={permissions} />
        </Modal>
      )}
      {edit && <EditDialog edit={edit} onClose={() => setEdit(null)} />}
    </>
  );
}
function EditDialog({ edit, onClose }: { edit: Edit; onClose: () => void }) {
  return (
    <StoreEditor
      operation={edit.op}
      title={edit.title}
      initial={edit.initial}
      path={edit.path}
      description={edit.description}
      requireFields={edit.required}
      manualVersion={edit.manualVersion}
      onClose={onClose}
    />
  );
}
function ProductAdmin({
  id,
  permissions,
}: {
  id: string;
  permissions: string[];
}) {
  const { api } = useStoreConnection(),
    { t, locale } = useLocale(),
    [edit, setEdit] = useState<Edit | null>(null),
    [inventory, setInventory] = useState<Entry | null>(null),
    q = useStoreQuery(
      "admin-product",
      (signal) =>
        api.get_api_v1_store_admin_products_by_id({ path: { id }, signal }),
      id,
      true,
      true,
    );
  return (
    <>
      <QueryStatus query={q} />
      {q.data && (
        <>
          <h2>{localizedField(q.data, "name", locale)}</h2>
          <p>{q.data.status}</p>
          <div className="store-actions">
            {allowed(permissions, "put_api_v1_store_admin_products_by_id") && (
              <Button
                onClick={() =>
                  setEdit({
                    op: "put_api_v1_store_admin_products_by_id",
                    title: t({
                      en: "Save complete product",
                      ar: "حفظ المنتج كاملاً",
                    }),
                    initial: productDraft(q.data),
                    path: { id },
                    required: ["defaultPrice", "richDescription"],
                    description: t({
                      en: "The product read omits the saved default price and rich description. Supply those values from the authoritative product document, or explicitly replace them. Review the complete options, audience and materials before saving.",
                      ar: "لا يعيد عرض المنتج السعر الافتراضي والمحتوى المنسّق المحفوظين. أدخل القيم من مستند المنتج المعتمد أو استبدلها صراحة، وراجع الخيارات والجمهور والخامات قبل الحفظ.",
                    }),
                  })
                }
              >
                {t({ en: "Edit complete product", ar: "تعديل المنتج كاملاً" })}
              </Button>
            )}
            {(["activate", "archive"] as const).map((name) => {
              const op = (
                name === "activate"
                  ? "post_api_v1_store_admin_products_by_id_activate"
                  : "post_api_v1_store_admin_products_by_id_archive"
              ) as StoreOperation;
              return (
                allowed(permissions, op) && (
                  <Button
                    key={op}
                    variant="outline"
                    onClick={() =>
                      setEdit({
                        op,
                        title: t(
                          name === "activate"
                            ? { en: "Activate product", ar: "تفعيل المنتج" }
                            : { en: "Archive product", ar: "أرشفة المنتج" },
                        ),
                        path: { id },
                        initial: { version: q.data!.version },
                        required: ["reason"],
                      })
                    }
                  >
                    {t(
                      name === "activate"
                        ? { en: "Activate product", ar: "تفعيل المنتج" }
                        : { en: "Archive product", ar: "أرشفة المنتج" },
                    )}
                  </Button>
                )
              );
            })}
          </div>
          <Panel title={t({ en: "Variants", ar: "الأصناف" })}>
            {allowed(
              permissions,
              "post_api_v1_store_admin_products_by_id_variants",
            ) && (
              <Button
                onClick={() =>
                  setEdit({
                    op: "post_api_v1_store_admin_products_by_id_variants",
                    title: t({ en: "Create variant", ar: "إنشاء صنف" }),
                    path: { id },
                    initial: { optionValueIds: [] },
                  })
                }
              >
                {t({ en: "New variant", ar: "صنف جديد" })}
              </Button>
            )}
            {q.data.variants.map((variant) => (
              <article className="store-card" key={variant.id}>
                <h3>{localizedField(variant, "displayName", locale)}</h3>
                <p>
                  {variant.sku} · {variant.status} ·{" "}
                  {money(variant.priceJod, locale)}
                </p>
                <div className="store-actions">
                  {allowed(
                    permissions,
                    "put_api_v1_store_admin_variants_by_variantId",
                  ) && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        setEdit({
                          op: "put_api_v1_store_admin_variants_by_variantId",
                          title: t({ en: "Edit variant", ar: "تعديل الصنف" }),
                          path: { variantId: variant.id },
                          initial: {
                            ...variant,
                            optionValueIds: q
                              .data!.combinations.filter(
                                (x) => x.variantId === variant.id,
                              )
                              .map((x) => x.productOptionValueId),
                          },
                        })
                      }
                    >
                      {t({ en: "Edit variant", ar: "تعديل الصنف" })}
                    </Button>
                  )}
                  {allowed(
                    permissions,
                    "post_api_v1_store_admin_variants_by_variantId_archive",
                  ) && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        setEdit({
                          op: "post_api_v1_store_admin_variants_by_variantId_archive",
                          title: t({
                            en: "Archive variant",
                            ar: "أرشفة الصنف",
                          }),
                          path: { variantId: variant.id },
                          initial: { version: variant.version },
                          required: ["reason"],
                        })
                      }
                    >
                      {t({ en: "Archive variant", ar: "أرشفة الصنف" })}
                    </Button>
                  )}
                  {(permissions.includes("store.inventory.view") ||
                    permissions.includes("store.inventory.adjust")) && (
                    <Button
                      variant="outline"
                      onClick={() => setInventory(variant)}
                    >
                      {t({ en: "Inventory", ar: "المخزون" })}
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </Panel>
          <Panel title={t({ en: "Product images", ar: "صور المنتج" })}>
            {allowed(
              permissions,
              "post_api_v1_store_admin_products_by_id_assets",
            ) && (
              <Button
                onClick={() =>
                  setEdit({
                    op: "post_api_v1_store_admin_products_by_id_assets",
                    title: t({
                      en: "Link existing image",
                      ar: "ربط صورة موجودة",
                    }),
                    path: { id },
                    initial: { sortOrder: 0 },
                  })
                }
              >
                {t({ en: "Link image", ar: "ربط صورة" })}
              </Button>
            )}
            <ul>
              {q.data.images.map((image) => (
                <li key={image.id}>
                  {localizedField(image, "altText", locale) || image.assetId} ·{" "}
                  {image.status}
                  {allowed(
                    permissions,
                    "delete_api_v1_store_admin_products_by_id_assets_by_assetLinkId",
                  ) && (
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setEdit({
                          op: "delete_api_v1_store_admin_products_by_id_assets_by_assetLinkId",
                          title: t({ en: "Unlink image", ar: "فصل الصورة" }),
                          path: { id, assetLinkId: image.id },
                          initial: {},
                        })
                      }
                    >
                      {t({ en: "Unlink image", ar: "فصل الصورة" })}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </Panel>
          {inventory && (
            <Modal
              open
              description=""
              title={t({ en: "Inventory", ar: "المخزون" })}
              className="engagement-modal store-connected"
              onClose={() => setInventory(null)}
            >
              <Inventory variant={inventory} permissions={permissions} />
            </Modal>
          )}
          {edit && <EditDialog edit={edit} onClose={() => setEdit(null)} />}
        </>
      )}
    </>
  );
}
function Inventory({
  variant,
  permissions,
}: {
  variant: Entry;
  permissions: string[];
}) {
  const { api } = useStoreConnection(),
    { t, locale } = useLocale(),
    [page, setPage] = useState(1),
    [edit, setEdit] = useState<Edit | null>(null),
    variantId = string(variant.id),
    canRead = permissions.includes("store.inventory.view");
  const q = useStoreQuery(
      "inventory",
      (signal) =>
        api.get_api_v1_store_admin_variants_by_variantId_inventory({
          path: { variantId },
          signal,
        }),
      variantId,
      canRead,
      true,
    ),
    history = useStoreQuery(
      "inventory-history",
      (signal) =>
        api.get_api_v1_store_admin_variants_by_variantId_inventory_history({
          path: { variantId },
          query: { Page: page, PageSize: 20 },
          signal,
        }),
      [variantId, page],
      canRead,
      true,
    ),
    stock = record(q.data),
    pageData = record(history.data);
  return (
    <>
      <h3>{localizedField(variant, "displayName", locale)}</h3>
      {canRead && (
        <>
          <QueryStatus query={q} />
          {q.data && <DataTable value={stock} />}
          <Panel title={t({ en: "Movement history", ar: "سجل الحركات" })}>
            <QueryStatus query={history} />
            {history.data && (
              <>
                <DataTable value={pageData} />
                {Array.isArray(pageData.items) && (
                  <Pager
                    page={page}
                    total={Number(pageData.total)}
                    onChange={setPage}
                  />
                )}
              </>
            )}
          </Panel>
        </>
      )}
      {permissions.includes("store.inventory.adjust") && (
        <div className="store-actions">
          <Button
            onClick={() =>
              setEdit({
                op: "post_api_v1_store_admin_variants_by_variantId_inventory_adjustments",
                title: t({
                  en: "Record inventory adjustment",
                  ar: "تسجيل تسوية مخزون",
                }),
                path: { variantId },
                initial: {},
              })
            }
          >
            {t({ en: "Adjust stock", ar: "تسوية المخزون" })}
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setEdit({
                op: "put_api_v1_store_admin_variants_by_variantId_inventory_cost",
                title: t({
                  en: "Update inventory unit cost",
                  ar: "تحديث تكلفة وحدة المخزون",
                }),
                path: { variantId },
                initial: { unitCostJod: stock.unitCost },
                manualVersion: true,
                description: t({
                  en: "The inventory read does not expose its concurrency version. Supply the authoritative inventory version; the product variant version is a different record.",
                  ar: "لا يعيد عرض المخزون رقم نسخته. أدخل نسخة سجل المخزون المعتمدة؛ نسخة الصنف تخص سجلاً آخر.",
                }),
              })
            }
          >
            {t({ en: "Edit unit cost", ar: "تعديل تكلفة الوحدة" })}
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setEdit({
                op: "post_api_v1_store_admin_inventory_rebuild",
                title: t({
                  en: "Rebuild inventory projection",
                  ar: "إعادة بناء عرض المخزون",
                }),
                initial: { variantId },
                required: ["reason"],
              })
            }
          >
            {t({
              en: "Rebuild stock projection",
              ar: "إعادة بناء عرض المخزون",
            })}
          </Button>
        </div>
      )}
      {edit && <EditDialog edit={edit} onClose={() => setEdit(null)} />}
    </>
  );
}
function Settings() {
  const { api } = useStoreConnection(),
    { t } = useLocale(),
    [edit, setEdit] = useState(false),
    q = useStoreQuery(
      "settings",
      (signal) => api.get_api_v1_store_admin_settings({ signal }),
      "",
      true,
      true,
    );
  return (
    <Panel title={t({ en: "Store settings", ar: "إعدادات المتجر" })}>
      <QueryStatus query={q} />
      {q.data && (
        <>
          <DataTable value={q.data} />
          <Button onClick={() => setEdit(true)}>
            {t({ en: "Edit settings", ar: "تعديل الإعدادات" })}
          </Button>
          {edit && (
            <StoreEditor
              operation="put_api_v1_store_admin_settings"
              title={t({ en: "Save store settings", ar: "حفظ إعدادات المتجر" })}
              initial={settingsDraft(q.data)}
              onClose={() => setEdit(false)}
            />
          )}
        </>
      )}
    </Panel>
  );
}
function Reports({ permissions }: { permissions: string[] }) {
  const { api } = useStoreConnection(),
    { t } = useLocale(),
    [report, setReport] =
      useState<
        Operations["get_api_v1_store_admin_reports_by_report"]["path"]["report"]
      >("orders"),
    [page, setPage] = useState(1),
    [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [edit, setEdit] = useState<Edit | null>(null),
    [exportId, setExportId] = useState(""),
    [exportFormat, setExportFormat] = useState("csv"),
    canRead = permissions.includes("store.reports.view");
  const q = useStoreQuery(
      "report",
      (signal) =>
        api.get_api_v1_store_admin_reports_by_report({
          path: { report },
          query: {
            Page: page,
            PageSize: 20,
            From: from || undefined,
            To: to || undefined,
          },
          signal,
        }),
      [report, page, from, to],
      canRead,
      true,
    ),
    monitor = useStoreQuery(
      "store-monitoring",
      (signal) => api.get_api_v1_store_admin_monitoring({ signal }),
      "",
      canRead,
      true,
    ),
    exported = useStoreQuery(
      "export",
      (signal) =>
        api.get_api_v1_store_admin_reports_exports_by_id({
          path: { id: exportId },
          signal,
        }),
      exportId,
      !!exportId && permissions.includes("store.reports.export"),
      true,
    ),
    action = useStoreAction();
  return (
    <>
      <Panel title={t({ en: "Store reports", ar: "تقارير المتجر" })}>
        <div className="store-toolbar">
          <label>
            {t({ en: "Report", ar: "التقرير" })}
            <select
              value={report}
              onChange={(e) => {
                setReport(e.target.value as typeof report);
                setPage(1);
              }}
            >
              {[
                "orders",
                "sales",
                "inventory",
                "reservations",
                "products",
                "no-shows",
                "returns",
              ].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t({ en: "From (with UTC offset)", ar: "من (مع فرق التوقيت)" })}
            <input
              value={from}
              placeholder="2026-10-01T00:00:00+03:00"
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(1);
              }}
            />
          </label>
          <label>
            {t({ en: "To (with UTC offset)", ar: "إلى (مع فرق التوقيت)" })}
            <input
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(1);
              }}
            />
          </label>
        </div>
        {canRead && (
          <>
            <QueryStatus query={q} />
            {q.data && (
              <>
                <DataTable value={record(q.data)} />
                {"total" in q.data && (
                  <Pager
                    page={page}
                    total={Number(q.data.total)}
                    onChange={setPage}
                  />
                )}
              </>
            )}
          </>
        )}
        {permissions.includes("store.reports.export") && (
          <>
            <Button
              onClick={() =>
                void action.run(
                  () =>
                    api.post_api_v1_store_admin_reports_exports({
                      body: {
                        report,
                        format: exportFormat,
                        filters: { from: from || null, to: to || null },
                      },
                    }),
                  (result) => setExportId(result.id),
                  t({
                    en: "Export requested. It is processing.",
                    ar: "طُلب التصدير وهو قيد المعالجة.",
                  }),
                )
              }
            >
              {t({ en: "Request export", ar: "طلب التصدير" })}
            </Button>
            <label>
              {t({ en: "Export format", ar: "صيغة التصدير" })}
              <input
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
              />
            </label>
            <label>
              {t({ en: "Export ID", ar: "معرّف التصدير" })}
              <input
                value={exportId}
                onChange={(e) => setExportId(e.target.value)}
              />
            </label>
            {exportId && (
              <>
                <QueryStatus query={exported} />
                {exported.data && (
                  <>
                    <DataTable value={exported.data} />
                    <Button
                      variant="outline"
                      onClick={() => void exported.refetch()}
                    >
                      {t({
                        en: "Refresh export status",
                        ar: "تحديث حالة التصدير",
                      })}
                    </Button>
                    {exported.data.assetId && (
                      <DownloadExport id={exported.data.assetId} />
                    )}
                  </>
                )}
              </>
            )}
            {action.feedback}
          </>
        )}
      </Panel>
      {canRead && (
        <Panel
          title={t({
            en: "Monitoring and background jobs",
            ar: "المراقبة والمهام الخلفية",
          })}
        >
          <QueryStatus query={monitor} />
          {monitor.data && (
            <>
              <DataTable value={monitor.data} />
              {permissions.includes("store.settings.manage") &&
                monitor.data.failedJobs.map((job) => (
                  <article className="store-card" key={job.id}>
                    {job.kind} · {job.failureCode}
                    <Button
                      variant="outline"
                      onClick={() =>
                        setEdit({
                          op: "post_api_v1_store_admin_monitoring_jobs_by_id_retry",
                          title: t({
                            en: "Retry failed job",
                            ar: "إعادة محاولة المهمة",
                          }),
                          path: { id: job.id },
                          initial: {},
                          required: ["reason"],
                        })
                      }
                    >
                      {t({ en: "Review retry", ar: "مراجعة إعادة المحاولة" })}
                    </Button>
                  </article>
                ))}
            </>
          )}
        </Panel>
      )}
      {edit && <EditDialog edit={edit} onClose={() => setEdit(null)} />}
    </>
  );
}
function DownloadExport({ id }: { id: string }) {
  const { services } = useStoreConnection(),
    action = useStoreAction(),
    { t } = useLocale();
  return (
    <>
      <Button
        disabled={action.busy}
        onClick={() =>
          void action.run(
            async () => {
              const file = await services.files!.downloadUrl(id);
              const a = document.createElement("a");
              a.href = file.url;
              a.download = "";
              a.rel = "noopener noreferrer";
              a.click();
            },
            undefined,
            t({ en: "Download opened", ar: "فُتح التنزيل" }),
            false,
          )
        }
      >
        {t({ en: "Download private export", ar: "تنزيل التصدير الخاص" })}
      </Button>
      {action.feedback}
    </>
  );
}
export function DataTable({ value }: { value: unknown }) {
  const { locale } = useLocale();
  const hidden = [
    "version",
    "idempotencyKey",
    "correlationId",
    "recordedBy",
    "createdBy",
    "updatedBy",
  ];
  if (Array.isArray(value)) {
    if (!value.length) return <Empty items={[]} />;
    const keys = [
      ...new Set(value.flatMap((row) => Object.keys(record(row)))),
    ].filter((key) => !hidden.includes(key));
    return (
      <div className="store-table">
        <table>
          <thead>
            <tr>
              {keys.map((key) => (
                <th key={key}>{key.replace(/([a-z])([A-Z])/g, "$1 $2")}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {value.map((row, i) => (
              <tr key={i}>
                {keys.map((key) => (
                  <td key={key}>{renderCell(record(row)[key], locale)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  const v = record(value),
    entries = Object.entries(v).filter(
      ([key]) =>
        !hidden.includes(key) &&
        !["id", "singleton"].includes(key) &&
        !(
          Array.isArray(v.items) && ["total", "page", "pageSize"].includes(key)
        ),
    );
  return (
    <>
      <dl className="store-facts">
        {entries
          .filter(([, x]) => x === null || typeof x !== "object")
          .map(([key, x]) => (
            <div key={key}>
              <dt>{key.replace(/([a-z])([A-Z])/g, "$1 $2")}</dt>
              <dd>{renderCell(x, locale)}</dd>
            </div>
          ))}
      </dl>
      {entries
        .filter(([, x]) => x !== null && typeof x === "object")
        .map(([key, x]) => (
          <section key={key}>
            <h3>{key.replace(/([a-z])([A-Z])/g, "$1 $2")}</h3>
            <DataTable value={x} />
          </section>
        ))}
    </>
  );
}

function renderCell(value: unknown, locale: string) {
  if (value == null) return "—";
  if (typeof value === "boolean") return value ? "✓" : "–";
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "number") return value.toLocaleString(locale);
  return String(value);
}
