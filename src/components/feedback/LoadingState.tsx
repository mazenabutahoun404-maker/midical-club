import { Skeleton } from "../ui/skeleton";
import { useLocale } from "../../app/providers/LocaleProvider";
export function LoadingState() {
  const { label } = useLocale();
  return (
    <div
      className="container section"
      data-route-loading
      aria-busy="true"
      role="status"
    >
      <span className="sr-only">{label("loading")}</span>
      <Skeleton className="h-12 w-2/3 mb-8" />
      <div className="resource-grid">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    </div>
  );
}
