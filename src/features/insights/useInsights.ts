import { useUndoNotice } from "../../components/feedback/useUndoNotice";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServices } from "../../app/providers/ServicesProvider";
import { useStudentProfile } from "../../hooks/useContent";
import type { AnalyticsRange, AssessmentInput } from "../../types/insights";

export function useAdminAnalytics(range: AnalyticsRange) {
  const services = useServices();
  return useQuery({
    queryKey: ["insights", "admin", "analytics", range],
    queryFn: () => services.insights.getAdminAnalytics(range),
  });
}

export function useContentHealth() {
  const services = useServices();
  return useQuery({
    queryKey: ["insights", "admin", "content-health"],
    queryFn: services.insights.getContentHealth,
  });
}

export function useAcademicInsights() {
  const undoNotice = useUndoNotice();
  const services = useServices();
  const profile = useStudentProfile();
  const client = useQueryClient();
  const studentId = profile.data?.id;
  const key = ["insights", "academic", studentId];
  const query = useQuery({
    queryKey: key,
    queryFn: () => services.insights.getAcademicRecord(studentId!),
    enabled: !!studentId,
  });

  useEffect(() => {
    if (!studentId) return;
    return services.insights.subscribe(studentId, () => {
      void client.invalidateQueries({ queryKey: key });
    });
  }, [client, services.insights, studentId]);

  const confidence = useMutation({
    mutationFn: ({ courseId, value }: { courseId: string; value: number }) =>
      (async () => {
        const owner = studentId!,
          before =
            (await services.insights.getAcademicRecord(owner)).confidence.find(
              (item) => item.courseId === courseId,
            ) || null;
        const after = await services.insights.setConfidence(
          owner,
          courseId,
          value,
        );
        const expected = after.confidence.find(
          (item) => item.courseId === courseId,
        )!;
        if (services.insights.restoreConfidence)
          undoNotice(
            { en: "Confidence updated", ar: "عُدّل تقييم الثقة" },
            async () => {
              const restored = await services.insights.restoreConfidence!(
                owner,
                courseId,
                before,
                expected,
              );
              client.setQueryData(["insights", "academic", owner], restored);
            },
          );
        return after;
      })(),
    onSuccess: (record) => client.setQueryData(key, record),
  });
  const assessment = useMutation({
    mutationFn: (input: AssessmentInput) =>
      services.insights.recordAssessment(studentId!, input),
    onSuccess: (record) => client.setQueryData(key, record),
  });
  const remove = useMutation({
    mutationFn: async (attemptId: string) => {
      const owner = studentId!,
        before = (
          await services.insights.getAcademicRecord(owner)
        ).attempts.find((item) => item.id === attemptId);
      const after = await services.insights.deleteAssessment(owner, attemptId);
      if (before && services.insights.restoreAssessment)
        undoNotice(
          { en: "Practice record deleted", ar: "حُذف سجل التدريب" },
          async () => {
            const restored = await services.insights.restoreAssessment!(
              owner,
              before,
            );
            client.setQueryData(["insights", "academic", owner], restored);
          },
        );
      return after;
    },
    onSuccess: (record) => client.setQueryData(key, record),
  });

  return {
    profile,
    record: query.data,
    isPending: profile.isPending || query.isPending,
    isError: profile.isError || query.isError,
    isMutating:
      confidence.isPending || assessment.isPending || remove.isPending,
    setConfidence: confidence.mutateAsync,
    recordAssessment: assessment.mutateAsync,
    deleteAssessment: remove.mutateAsync,
    retry: () => {
      void profile.refetch();
      void query.refetch();
    },
  };
}
