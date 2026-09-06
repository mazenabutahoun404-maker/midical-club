import { PackageCheck, ShoppingBag, ShoppingCart } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useStoreWorkspace } from "../../hooks/useContent";
import { cartQuantity } from "../../lib/store";
import { AliveTabs } from "./AliveTabs";

export function StoreNavigation() {
  const { label } = useLocale();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const store = useStoreWorkspace();
  const value = pathname.startsWith("/store/cart")
    ? "/store/cart"
    : pathname.startsWith("/my/orders")
      ? "/my/orders"
      : "/store";
  return (
    <AliveTabs
      label={label("storeNavigation")}
      items={[
        { id: "/store", label: label("shopAll"), icon: ShoppingBag },
        {
          id: "/store/cart",
          label: label("cart"),
          icon: ShoppingCart,
          count: cartQuantity(store.cart),
        },
        {
          id: "/my/orders",
          label: label("myOrders"),
          icon: PackageCheck,
          count: store.orders.filter((order) => order.status !== "cancelled")
            .length,
        },
      ]}
      value={value}
      onChange={navigate}
    />
  );
}
