import { Button } from "../ui/button";
import { useLocale } from "../../app/providers/LocaleProvider";
export function ErrorState({ retry }: { retry: () => void }) {
  const { label } = useLocale();
  return (
    <div className="container empty-state" role="alert">
      <h2>{label("errorTitle")}</h2>
      <p>{label("errorBody")}</p>
      <Button onClick={retry} className="button button-primary">
        {label("retry")}
      </Button>
    </div>
  );
}
