import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { useSyncExternalStore } from "react";
import { useAuth } from "../../app/providers/AuthProvider";
import { useServices } from "../../app/providers/ServicesProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { ExamError } from "../../types/exams";
export function useExams() {
  const { snapshot } = useAuth(),
    services = useServices(),
    location = useLocation(),
    client = useQueryClient();
  const owner = snapshot.user?.id || "guest",
    service = services.exams!;
  useSyncExternalStore(
    service.subscribe || (() => () => {}),
    () => service.persistent !== false,
    () => true,
  );
  const base = location.pathname.startsWith("/my/")
    ? "/my/exams"
    : "/learn/electronic-exams";
  return {
    owner,
    service,
    base,
    authenticated: snapshot.status === "authenticated",
    refresh: () => client.invalidateQueries({ queryKey: ["exams", owner] }),
  };
}
export function useExamQuery<T>(
  name: string,
  fetcher: (signal: AbortSignal) => Promise<T>,
  extra = "",
  enabled = true,
) {
  const { owner } = useExams();
  return useQuery({
    queryKey: ["exams", owner, name, extra],
    queryFn: ({ signal }) => fetcher(signal),
    enabled,
    retry: false,
  });
}
export function useExamError() {
  const { t } = useLocale();
  return (error: unknown) =>
    t(
      error instanceof ExamError && error.code === "UNAVAILABLE"
        ? {
            en: "Exam content is not connected yet.",
            ar: "محتوى الامتحانات غير متصل بعد.",
          }
        : error instanceof ExamError && error.code === "CONFLICT"
          ? {
              en: "This record changed in another tab. Reload it before continuing.",
              ar: "تغيّر السجل في صفحة أخرى. أعد تحميله قبل المتابعة.",
            }
          : error instanceof ExamError && error.code === "FORBIDDEN"
            ? {
                en: "You do not have access to this record.",
                ar: "ليس لديك صلاحية الوصول لهذا السجل.",
              }
            : error instanceof ExamError && error.code === "INVALID"
              ? {
                  en: "Check the details and try again.",
                  ar: "تحقق من التفاصيل وحاول مجدداً.",
                }
              : {
                  en: "This action could not be saved. Try again before leaving.",
                  ar: "تعذر حفظ هذا الإجراء. حاول مجدداً قبل المغادرة.",
                },
    );
}
