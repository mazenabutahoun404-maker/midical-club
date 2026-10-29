import { ApiError } from "../../services/api/client";
import { record, string } from "../../services/api/mapping";
import type { StoreApi } from "../../services/api/store-api";
import { storeVersion, storeUuid } from "../../services/api/store-contracts";
export type StoreOperation = keyof StoreApi;
export function storeRequest(
  api: StoreApi,
  id: StoreOperation,
  input: unknown,
): Promise<unknown> {
  return (api[id] as (input: unknown) => Promise<unknown>)(input);
}
export function checkoutQuote(value: unknown) {
  const cart = record(value);
  storeVersion(cart.version);
  if (
    !cart.canCheckout ||
    !Array.isArray(cart.items) ||
    !cart.items.length ||
    cart.items.some((x) => record(x).isValid !== true) ||
    !string(cart.quoteToken)
  )
    throw new ApiError(
      "Refresh your cart and resolve its item warnings before ordering.",
      422,
      "CART_NOT_READY",
    );
  return {
    cartId: string(cart.id),
    cartVersion: cart.version,
    quoteToken: string(cart.quoteToken),
  };
}
export function quantity(value: unknown, max = 1000000) {
  if (!Number.isInteger(value) || Number(value) < 1 || Number(value) > max)
    throw new ApiError(
      "Enter a valid quantity within the available amount.",
      422,
      "INVALID_QUANTITY",
    );
  return Number(value);
}
export function returnRequest(
  entitlements: unknown[],
  selected: Record<
    string,
    { quantity: number; resolution: string; replacement?: string }
  >,
  reason: string,
) {
  if (!reason.trim())
    throw new ApiError(
      "Enter the reason for your return or exchange.",
      422,
      "REASON_REQUIRED",
    );
  const items = entitlements
    .filter((row) => selected[string(record(row).id)])
    .map((value) => {
      const row = record(value),
        choice = selected[string(row.id)];
      if (
        choice.resolution === "Exchange" &&
        !storeUuid.test(choice.replacement || "")
      )
        throw new ApiError(
          "Choose a valid replacement variant.",
          422,
          "REPLACEMENT_REQUIRED",
        );
      if (!row.canRequest)
        throw new ApiError(
          "This item is not eligible for a return.",
          422,
          "RETURN_NOT_ALLOWED",
        );
      return {
        orderItemId: string(row.orderItemId),
        sourceEntitlementId: string(row.id),
        quantity: quantity(choice.quantity, Number(row.remainingQuantity)),
        resolution: choice.resolution,
        requestedExchangeVariantId: choice.replacement || null,
      };
    });
  if (!items.length)
    throw new ApiError(
      "Choose at least one returnable item.",
      422,
      "RETURN_ITEMS_REQUIRED",
    );
  return { reason, items };
}
export function inspectReturn(
  items: unknown[],
  inspection: Record<
    string,
    {
      receivedQuantity: number;
      restockQuantity: number;
      damagedQuantity: number;
      note?: string;
    }
  >,
) {
  if (
    !items.length ||
    !Object.values(inspection).some((row) => row.receivedQuantity > 0)
  )
    throw new ApiError(
      "Record at least one received item before completing the return.",
      422,
      "INVALID_INSPECTION",
    );
  return items.map((value) => {
    const row = record(value),
      v = inspection[string(row.id)];
    if (
      !v ||
      ![v.receivedQuantity, v.restockQuantity, v.damagedQuantity].every(
        (x) => Number.isInteger(x) && x >= 0,
      ) ||
      v.receivedQuantity > Number(row.quantity) ||
      v.restockQuantity + v.damagedQuantity !== v.receivedQuantity
    )
      throw new ApiError(
        "Account for every received item as restockable or damaged, within the requested quantity.",
        422,
        "INVALID_INSPECTION",
      );
    return { itemId: string(row.id), ...v };
  });
}
export function parseStoreJson(value: unknown) {
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    throw new ApiError(
      "The saved store document is invalid. It has not been replaced.",
      422,
      "INVALID_STORE_DOCUMENT",
    );
  }
}
export function productDraft(value: unknown) {
  const p = record(value),
    values = Array.isArray(p.values) ? p.values.map(record) : [];
  return {
    categoryId: p.categoryId,
    nameAr: p.nameAr,
    nameEn: p.nameEn,
    slug: p.slug,
    shortDescriptionAr: p.shortDescriptionAr,
    shortDescriptionEn: p.shortDescriptionEn,
    descriptionAr: p.descriptionAr,
    descriptionEn: p.descriptionEn,
    audienceMode: p.audienceMode,
    audience:
      p.audience === null
        ? null
        : (Array.isArray(p.audience) ? p.audience : []).map((x) => {
            const a = record(x);
            return {
              batchId: a.batchId,
              studyYear: a.studyYear,
              academicYearId: a.academicYearId,
            };
          }),
    options: (Array.isArray(p.options) ? p.options : []).map((x) => {
      const o = record(x);
      return {
        code: o.code,
        nameAr: o.nameAr,
        nameEn: o.nameEn,
        isActive: o.isActive,
        values: values
          .filter((v) => v.productOptionId === o.id)
          .map((v) => ({
            code: v.code,
            valueAr: v.valueAr,
            valueEn: v.valueEn,
            isActive: v.isActive,
          })),
      };
    }),
    materials: parseStoreJson(p.materialsJson),
    defaultPrice: p.defaultPrice,
    richDescription: p.richDescription,
    version: p.version,
  };
}
export function settingsDraft(value: unknown) {
  const v = { ...record(value) };
  v.pickupReminderHours = parseStoreJson(v.pickupReminderHoursJson);
  return v;
}
export function money(value: unknown, locale: string, currency = "JOD") {
  return typeof value === "number" && Number.isFinite(value)
    ? new Intl.NumberFormat(locale, { style: "currency", currency }).format(
        value,
      )
    : "—";
}
export function normalized(value: unknown) {
  return String(value)
    .replace(/[-_\s]/g, "")
    .toLowerCase();
}

export function snapshotName(value: unknown, key: string, locale: string) {
  const item = record(value);
  return string(
    item[key + (locale === "ar" ? "Ar" : "En") + "Snapshot"] ||
      item[key + "ArSnapshot"] ||
      item[key + "EnSnapshot"],
  );
}
