import { throwToTrash } from "../../components/feedback/action-flight";
import { useAuth } from "../../app/providers/AuthProvider";
import { useServices } from "../../app/providers/ServicesProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { StudyError } from "../../types/study-hub";
import { useLocale } from "../../app/providers/LocaleProvider";
export function useStudyHub() {
  const { snapshot } = useAuth();
  const services = useServices();
  const client = useQueryClient();
  const owner = snapshot.status === "authenticated" ? snapshot.user?.id : null;
  const service = services.studyHub!;
  return {
    owner,
    service,
    refresh: () => client.invalidateQueries({ queryKey: ["study-hub", owner] }),
  };
}
export function useHubQuery<T>(
  name: string,
  fn: (signal: AbortSignal) => Promise<T>,
  extra: string = "",
  interval?: number,
  enabled = true,
) {
  const { owner } = useStudyHub();
  return useQuery({
    queryKey: ["study-hub", owner, name, extra],
    enabled: !!owner && enabled,
    queryFn: ({ signal }) => fn(signal),
    retry: false,
    refetchInterval: interval,
    refetchIntervalInBackground: false,
  });
}
export function useStudyError() {
  const { t } = useLocale();
  return (e: unknown) =>
    t(
      e instanceof StudyError && e.code === "NOT_CONFIGURED"
        ? {
            en: "Study features are waiting for the backend connection.",
            ar: "أدوات الدراسة بانتظار ربط الخدمة الخلفية.",
          }
        : e instanceof StudyError && e.code === "CONFLICT"
          ? {
              en: "This record changed. Reload it before trying again.",
              ar: "تغير السجل. أعد تحميله قبل المحاولة.",
            }
          : e instanceof StudyError && e.code === "CAPACITY"
            ? {
                en: "The room or collection is full.",
                ar: "الغرفة أو المجموعة ممتلئة.",
              }
            : e instanceof StudyError && e.code === "FORBIDDEN"
              ? {
                  en: "You do not have permission for this action.",
                  ar: "ليست لديك صلاحية لهذا الإجراء.",
                }
              : e instanceof StudyError && e.code === "STORAGE"
                ? {
                    en: "Could not save to this device. Check available storage.",
                    ar: "تعذر الحفظ على الجهاز. تحقق من مساحة التخزين.",
                  }
                : {
                    en: "Could not complete this action. Check the details and try again.",
                    ar: "تعذر إكمال الإجراء. تحقق من التفاصيل وحاول مجدداً.",
                  },
    );
}
/** Use the existing one-shot paper-to-bin effect; records still change only after the service succeeds. */
export function flyDeletedRecord(
  attribute:
    "data-margin-id" | "data-recall-id" | "data-claim-id" | "data-pack-key",
  id: string,
  title: string,
) {
  const source =
    Array.from(
      document.querySelectorAll<HTMLElement>("[" + attribute + "]"),
    ).find((element) => element.getAttribute(attribute) === id) || null;
  return throwToTrash(source, title);
}
