import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useCourses } from "../../hooks/useContent";
import { Button } from "../../components/ui/button";
import { ApiError } from "../../services/api/client";
import {
  Panel,
  QueryStatus,
  useScheduleAction,
  useScheduleConnection,
  useScheduleQuery,
} from "./shared";
export function FollowedSubjects() {
  const { api, owner } = useScheduleConnection(),
    { t } = useLocale(),
    courses = useCourses(),
    action = useScheduleAction();
  const query = useScheduleQuery("followed-subjects", async (signal) => {
    const result = await api.get_api_v1_student_followed_subjects({ signal });
    if (result.some((r) => r.userId !== owner))
      throw new ApiError(
        "Subject ownership did not match the signed-in account.",
        401,
        "SESSION_CHANGED",
      );
    return result;
  });
  const [subject, setSubject] = useState(""),
    [offering, setOffering] = useState("");
  const subjects = (courses.data || []).filter(
    (c, i, all) =>
      c.subjectId && all.findIndex((v) => v.subjectId === c.subjectId) === i,
  );
  const offerings = (courses.data || []).filter((c) => c.subjectId === subject);
  return (
    <Panel title={t({ en: "Followed subjects", ar: "المواد المتابعة" })}>
      <p>
        {t({
          en: "Follow a subject for relevant updates, or limit the follow to one course offering.",
          ar: "تابع مادة لتصلك تحديثاتها أو حدد المتابعة لمساق مطروح واحد.",
        })}
      </p>
      <QueryStatus query={query} />
      <QueryStatus query={courses} />
      {query.data?.map((row) => {
        const course = courses.data?.find(
          (c) =>
            c.subjectId === row.subjectId &&
            (!row.offeringId || c.id === row.offeringId),
        );
        return (
          <div className="student-connected-row" key={row.id}>
            <div>
              <strong>
                {course
                  ? t(course.title)
                  : t({
                      en: "Subject unavailable in the current course list",
                      ar: "المادة غير متاحة في قائمة المساقات الحالية",
                    })}
              </strong>
              <small>
                {t(
                  row.offeringId
                    ? { en: "Specific offering", ar: "مساق مطروح محدد" }
                    : {
                        en: "All offerings of this subject",
                        ar: "كل المساقات المطروحة لهذه المادة",
                      },
                )}
              </small>
            </div>
            <Button
              variant="outline"
              disabled={action.busy}
              onClick={() =>
                void action.run(() =>
                  api.delete_api_v1_student_followed_subjects_by_id({
                    path: { id: row.id },
                  }),
                )
              }
            >
              {t({ en: "Unfollow", ar: "إلغاء المتابعة" })}
            </Button>
          </div>
        );
      })}
      <form
        className="schedule-fields"
        onSubmit={(e) => {
          e.preventDefault();
          void action.run(
            () =>
              api.post_api_v1_student_followed_subjects({
                body: { subjectId: subject, offeringId: offering || null },
              }),
            () => {
              setSubject("");
              setOffering("");
            },
          );
        }}
      >
        <label>
          {t({ en: "Subject", ar: "المادة" })}
          <select
            required
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setOffering("");
            }}
          >
            <option value="" />
            {subjects.map((c) => (
              <option key={c.subjectId} value={c.subjectId}>
                {t(c.title)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t({
            en: "Course offering (optional)",
            ar: "المساق المطروح (اختياري)",
          })}
          <select
            value={offering}
            onChange={(e) => setOffering(e.target.value)}
          >
            <option value="">
              {t({ en: "All offerings", ar: "كل المساقات المطروحة" })}
            </option>
            {offerings.map((c) => (
              <option key={c.id} value={c.id}>
                {t(c.title)} · {c.code}
              </option>
            ))}
          </select>
        </label>
        <Button disabled={!subject || action.busy || !!courses.error}>
          {t({ en: "Follow subject", ar: "متابعة المادة" })}
        </Button>
      </form>
      {action.feedback}
    </Panel>
  );
}
