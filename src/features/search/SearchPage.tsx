import { useSearchParams } from "react-router-dom";
import { PageIntro } from "../../components/data-display/PageIntro";
import { useLocale } from "../../app/providers/LocaleProvider";
import { SearchPanel } from "./SearchPanel";
export default function SearchPage() {
  const { label } = useLocale();
  const [params] = useSearchParams();
  return (
    <div className="container discovery-page">
      <PageIntro
        eyebrow={label("searchPageEyebrow")}
        title={label("searchPageTitle")}
        description={label("searchPageBody")}
      />
      <SearchPanel initialQuery={params.get("q") || ""} />
    </div>
  );
}
