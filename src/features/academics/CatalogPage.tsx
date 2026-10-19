import type { Track } from "../../types/content";
import { useCourses } from "../../hooks/useContent";
import { useLocale } from "../../app/providers/LocaleProvider";
import { PageIntro } from "../../components/data-display/PageIntro";
import { CourseDirectory } from "./CourseDirectory";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
export default function CatalogPage({ track }: { track?: Track }) {
  const query = useCourses();
  const { label } = useLocale();
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  return (
    <div className="container">
      <PageIntro
        eyebrow={label("learnEyebrow")}
        title={label(track || "learnTitle")}
        description={label("learnBody")}
      />
      <CourseDirectory courses={query.data} track={track} />
    </div>
  );
}
