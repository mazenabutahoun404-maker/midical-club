import { STORAGE_KEYS } from "../constants/config";
import { demoStoreOrders, storeProducts } from "../data/mock/store";
import { text } from "../lib/localize";
import type {
  StoreCart,
  StoreCartLine,
  StoreOrder,
  StoreOrderStatus,
} from "../types/content";

const actionTime = "2026-09-03T17:00:00+03:00";
const holdUntil = "2026-09-05T17:00:00+03:00";
type StoredStore = { cart: StoreCart; orders: StoreOrder[] };

const emptyCart = (studentId: string): StoreCart => ({
  studentId,
  lines: [],
  updatedAt: actionTime,
});
const seed = (studentId: string): StoredStore => ({
  cart: emptyCart(studentId),
  orders: studentId === "demo-student" ? structuredClone(demoStoreOrders) : [],
});
const findVariant = (productId: string, variantId: string) => {
  const product = storeProducts.find((item) => item.id === productId);
  const variant = product?.variants.find((item) => item.id === variantId);
  return product && variant ? { product, variant } : null;
};
function normalizeLines(value: unknown): StoreCartLine[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Partial<StoreCartLine>;
    if (
      typeof record.productId !== "string" ||
      typeof record.variantId !== "string" ||
      !Number.isInteger(record.quantity) ||
      (record.quantity || 0) < 1
    )
      return [];
    const found = findVariant(record.productId, record.variantId);
    const id = `${record.productId}:${record.variantId}`;
    if (!found || seen.has(id) || record.quantity! > found.variant.stock)
      return [];
    seen.add(id);
    return [record as StoreCartLine];
  });
}
function normalizeOrders(value: unknown, studentId: string): StoreOrder[] {
  if (!Array.isArray(value)) return [];
  const statuses = new Set<StoreOrderStatus>([
    "reserved",
    "confirmed",
    "ready",
    "collected",
    "cancelled",
  ]);
  const seen = new Set<string>();
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const order = item as Partial<StoreOrder>;
    if (
      typeof order.id !== "string" ||
      seen.has(order.id) ||
      order.studentId !== studentId ||
      typeof order.number !== "string" ||
      !statuses.has(order.status as StoreOrderStatus) ||
      !Array.isArray(order.lines) ||
      !order.lines.length ||
      typeof order.totalFils !== "number" ||
      typeof order.reservedAt !== "string" ||
      !order.pickupLocation
    )
      return [];
    seen.add(order.id);
    return [order as StoreOrder];
  });
}
function normalize(value: unknown, studentId: string): StoredStore {
  if (!value || typeof value !== "object") return seed(studentId);
  const raw = value as Partial<StoredStore>;
  return {
    cart: {
      studentId,
      lines: normalizeLines(raw.cart?.lines),
      updatedAt:
        typeof raw.cart?.updatedAt === "string"
          ? raw.cart.updatedAt
          : actionTime,
    },
    orders: normalizeOrders(raw.orders, studentId),
  };
}

/** Device-local preview. Production inventory and order rules must be atomic server-side. */
export function createLocalStoreService() {
  const memory = new Map<string, StoredStore>();
  const volatile = new Set<string>();
  const key = (studentId: string) => `${STORAGE_KEYS.store}.${studentId}`;
  const read = (studentId: string) => {
    if (volatile.has(studentId))
      return structuredClone(memory.get(studentId) || seed(studentId));
    try {
      const stored = localStorage.getItem(key(studentId));
      return stored
        ? normalize(JSON.parse(stored), studentId)
        : seed(studentId);
    } catch {
      return structuredClone(memory.get(studentId) || seed(studentId));
    }
  };
  const write = (studentId: string, value: StoredStore) => {
    memory.set(studentId, structuredClone(value));
    try {
      localStorage.setItem(key(studentId), JSON.stringify(value));
      volatile.delete(studentId);
    } catch {
      volatile.add(studentId);
    }
  };
  const updateLine = (
    studentId: string,
    productId: string,
    variantId: string,
    quantity: number,
    additive: boolean,
  ) => {
    const found = findVariant(productId, variantId);
    if (!found) throw new Error("PRODUCT_VARIANT_NOT_FOUND");
    if (!Number.isInteger(quantity)) throw new Error("INVALID_QUANTITY");
    const state = read(studentId);
    const existing = state.cart.lines.find(
      (item) => item.productId === productId && item.variantId === variantId,
    );
    const nextQuantity = additive
      ? (existing?.quantity || 0) + quantity
      : quantity;
    if (nextQuantity < 0 || nextQuantity > found.variant.stock)
      throw new Error("INSUFFICIENT_STOCK");
    const without = state.cart.lines.filter(
      (item) => item.productId !== productId || item.variantId !== variantId,
    );
    const lines =
      nextQuantity === 0
        ? without
        : [...without, { productId, variantId, quantity: nextQuantity }];
    const next = {
      ...state,
      cart: { studentId, lines, updatedAt: actionTime },
    };
    write(studentId, next);
    return structuredClone(next.cart);
  };
  return {
    getCart: async (studentId: string) => read(studentId).cart,
    addCartLine: async (
      studentId: string,
      productId: string,
      variantId: string,
      quantity: number,
    ) => updateLine(studentId, productId, variantId, quantity, true),
    setCartLine: async (
      studentId: string,
      productId: string,
      variantId: string,
      quantity: number,
    ) => updateLine(studentId, productId, variantId, quantity, false),
    removeCartLine: async (
      studentId: string,
      productId: string,
      variantId: string,
    ) => updateLine(studentId, productId, variantId, 0, false),
    clearCart: async (studentId: string) => {
      const state = read(studentId);
      const cart = emptyCart(studentId);
      write(studentId, { ...state, cart });
      return structuredClone(cart);
    },
    listOrders: async (studentId: string) => read(studentId).orders,
    reserveCart: async (studentId: string) => {
      const state = read(studentId);
      if (!state.cart.lines.length) throw new Error("CART_EMPTY");
      const lines = state.cart.lines.map((line) => {
        const found = findVariant(line.productId, line.variantId);
        if (!found || line.quantity > found.variant.stock)
          throw new Error("INSUFFICIENT_STOCK");
        return {
          ...line,
          name: found.product.name,
          variantLabel: found.variant.label,
          unitPriceFils: found.product.priceFils,
        };
      });
      const subtotalFils = lines.reduce(
        (sum, line) => sum + line.unitPriceFils * line.quantity,
        0,
      );
      const sequence = 1100 + state.orders.length;
      const order: StoreOrder = {
        id: `order-${studentId}-${sequence}`,
        number: `MC-${sequence}`,
        studentId,
        status: "reserved",
        lines,
        subtotalFils,
        discountFils: 0,
        totalFils: subtotalFils,
        reservedAt: actionTime,
        reservationExpiresAt: holdUntil,
        pickupLocation: text(
          "Student Activities Office",
          "مكتب الأنشطة الطلابية",
        ),
      };
      write(studentId, {
        cart: emptyCart(studentId),
        orders: [order, ...state.orders],
      });
      return structuredClone(order);
    },
    cancelOrder: async (studentId: string, orderId: string) => {
      const state = read(studentId);
      const order = state.orders.find((item) => item.id === orderId);
      if (!order) throw new Error("ORDER_NOT_FOUND");
      if (order.status !== "reserved") throw new Error("ORDER_LOCKED");
      const nextOrder: StoreOrder = { ...order, status: "cancelled" };
      write(studentId, {
        ...state,
        orders: state.orders.map((item) =>
          item.id === orderId ? nextOrder : item,
        ),
      });
      return structuredClone(nextOrder);
    },
  };
}
