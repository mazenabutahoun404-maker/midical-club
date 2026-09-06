import {
  BadgeCheck,
  CupSoda,
  NotebookPen,
  ShieldPlus,
  Shirt,
} from "lucide-react";
import type { ProductVisual as ProductVisualName } from "../../types/content";

const icons = {
  notebook: NotebookPen,
  hoodie: Shirt,
  cap: ShieldPlus,
  tumbler: CupSoda,
  badge: BadgeCheck,
};

export function ProductVisual({ visual }: { visual: ProductVisualName }) {
  const Icon = icons[visual];
  return (
    <div className="product-visual" data-visual={visual} aria-hidden="true">
      <span className="product-scan" />
      <i className="product-orbit product-orbit-a" />
      <i className="product-orbit product-orbit-b" />
      <span className="product-object">
        <Icon strokeWidth={1.45} />
      </span>
      <b>MC</b>
    </div>
  );
}
