import { useAuth } from "../../app/providers/AuthProvider";
import { PackageCheck, ShoppingBag, ShoppingCart } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useStoreWorkspace } from "../../hooks/useContent";
import { cartQuantity } from "../../lib/store";
import { AliveTabs } from "./AliveTabs";

export function StoreNavigation() {
  const { label, t } = useLocale(),
    locked = useAuth().snapshot.status !== "authenticated";
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const store = useStoreWorkspace();
  const value = pathname.startsWith("/store/cart")
    ? "/store/cart"
    : pathname.startsWith("/my/orders")
      ? "/my/orders"
      : "/store";
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
            locked,
            lockLabel: t({ en: "Sign in required", ar: "يتطلب تسجيل الدخول" }),
            count: cartQuantity(store.cart),
          },
          {
            id: "/my/orders",
            label: label("myOrders"),
            icon: PackageCheck,
            locked,
            lockLabel: t({ en: "Sign in required", ar: "يتطلب تسجيل الدخول" }),
            count: store.orders.filter((order) => order.status !== "cancelled")
              .length,
          },
        ]}
        value={value}
        onChange={navigate}
      />
    </nav>
  );
}
