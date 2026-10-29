import { Button } from "../ui/button";
import { useLocale } from "../../app/providers/LocaleProvider";
import { ContentPlaceholder } from "./ContentPlaceholder";
import { ReadFeedback } from "./ReadFeedback";
export function ErrorState({
  retry,
  error,
}: {
  retry: () => void;
  error?: unknown;
}) {
  const { label, t } = useLocale();
  return (
    <div className="container">
      {error ? (
        <ReadFeedback query={{ isPending: false, error, refetch: retry }} />
      ) : (
        <>
          <ContentPlaceholder
            error
            icon="cloud"
            title={label("errorTitle")}
            description={t({
              en: "This section couldn’t load. You can try again or browse another page.",
              ar: "تعذّر تحميل هذا القسم. يمكنك المحاولة مجدداً أو تصفّح قسم آخر.",
            })}
          />
          <Button onClick={retry} variant="outline">
            {label("retry")}
          </Button>
        </>
      )}
    </div>
  );
}
