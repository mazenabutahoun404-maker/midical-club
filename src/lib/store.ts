import type { StoreCart, StoreProduct } from "../types/content";

export const formatStorePrice = (fils: number, locale: "en" | "ar") =>
  new Intl.NumberFormat(locale === "ar" ? "ar-JO" : "en-JO", {
    style: "currency",
    currency: "JOD",
    minimumFractionDigits: fils % 1000 ? 3 : 0,
    maximumFractionDigits: 3,
  }).format(fils / 1000);

export const productStock = (product: StoreProduct) =>
  product.variants.reduce((sum, variant) => sum + variant.stock, 0);

export const cartQuantity = (cart: StoreCart) =>
  cart.lines.reduce((sum, line) => sum + line.quantity, 0);

export const cartSubtotal = (cart: StoreCart, products: StoreProduct[]) =>
  cart.lines.reduce((sum, line) => {
    const product = products.find((item) => item.id === line.productId);
    return sum + (product?.priceFils || 0) * line.quantity;
  }, 0);
