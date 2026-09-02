import { useCourses, useResources } from "../../../hooks/useContent";
import { ResourceCollection } from "../../resources/ResourceCollection";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { ErrorState } from "../../../components/feedback/ErrorState";
export function LatestResources() {
  const courses = useCourses();
  const resources = useResources();
  if (courses.isPending || resources.isPending) return <LoadingState />;
  if (courses.isError || resources.isError)
    return (
      <ErrorState
        retry={() => {
          void courses.refetch();
          void resources.refetch();
        }}
      />
    );
  return (
    <ResourceCollection
      courses={courses.data}
      resources={resources.data}
      limit={4}
    />
  );
}
