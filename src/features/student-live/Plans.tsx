import {PlanCalendarSync} from "../schedule/PlanCalendarSync";
import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useCourses } from "../../hooks/useContent";
import { Button } from "../../components/ui/button";
import { PageIntro } from "../../components/data-display/PageIntro";
import {
  Panel,
  Pager,
  QueryStatus,
  Empty,
  rows,
  useStudentConnection,
  useStudentQuery,
  useStudentAction,
} from "./shared";
import { record, string, number, json } from "../../services/api/mapping";
import type { Schemas } from "../../services/api/schema.generated";
import { ApiError } from "../../services/api/client";

type PlanInput = Required<Omit<Schemas["PlanInput"], "subjects">> & {
  subjects: Required<Schemas["PlanSubject"]>[];
};
const newInput = (): PlanInput => ({
  name: "",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  sessionMinutes: 25,
  dailyStartMinute: 540,
  subjects: [],
  slots: null,
  dailyMinutes: {
    Sunday: 120,
    Monday: 120,
    Tuesday: 120,
    Wednesday: 120,
    Thursday: 120,
    Friday: 0,
    Saturday: 0,
  },
  restDays: [],
});
export default function Plans() {
  const { owner } = useStudentConnection();
  return <PlanDesk key={owner} />;
}
function PlanDesk() {
  const { api, services } = useStudentConnection(),
    { t } = useLocale(),
    courses = useCourses(),
    action = useStudentAction();
  const [page, setPage] = useState(1),
    [selected, setSelected] = useState(""),
    [input, setInput] = useState(newInput),
    [version, setVersion] = useState<string | undefined>(),
    [preview, setPreview] = useState<Record<string, unknown> | null>(null),
    [previewInput, setPreviewInput] = useState("");
  const [confirm, setConfirm] = useState(false),
    [item, setItem] = useState<Schemas["PlanItemRequest"] | null>(null),
    [itemId, setItemId] = useState("");
  const list = useStudentQuery(
    "plans",
    (signal) =>
      api.get_api_v1_study_plans({
        query: { Page: page, PageSize: 20 },
        signal,
      }),
    page,
  );
  const detail = useStudentQuery(
    "plan",
    (signal) =>
      api.get_api_v1_study_plans_by_id({ path: { id: selected }, signal }),
    selected,
    !!selected,
  );
  const plan = record(record(detail.data).plan),
    items = rows(record(detail.data).items);
  function change(patch: Partial<PlanInput>) {
    setInput((v) => ({ ...v, ...patch }));
    setPreview(null);
  }
  function load() {
    const v = json(plan.inputJson);
    if (!Array.isArray(v.subjects)) {
      action.setError(
        new ApiError(
          "The saved plan input is invalid.",
          502,
          "INVALID_RESPONSE",
        ),
      );
      return;
    }
    setInput({ ...newInput(), ...v, slots: v.slots ?? null } as PlanInput);
    setVersion(string(plan.version));
    setPreview(null);
  }
  function reset() {
    setSelected("");
    setVersion(undefined);
    setInput(newInput());
    setPreview(null);
    setItem(null);
    setConfirm(false);
  }
  const dayNames = {
    Sunday: { en: "Sunday", ar: "الأحد" },
    Monday: { en: "Monday", ar: "الاثنين" },
    Tuesday: { en: "Tuesday", ar: "الثلاثاء" },
    Wednesday: { en: "Wednesday", ar: "الأربعاء" },
    Thursday: { en: "Thursday", ar: "الخميس" },
    Friday: { en: "Friday", ar: "الجمعة" },
    Saturday: { en: "Saturday", ar: "السبت" },
  };
  const subjectOptions = (courses.data || []).filter(
    (c, index, all) =>
      c.subjectId &&
      all.findIndex((x) => x.subjectId === c.subjectId) === index,
  );
  return (
    <div className="container student-connected">
      <PageIntro
        title={t({ en: "Study plans", ar: "خطط الدراسة" })}
        description={t({
          en: "Preview a realistic schedule before saving it. Completed sessions stay completed when you regenerate the remaining work.",
          ar: "عاين جدولاً واقعياً قبل حفظه. تبقى الجلسات المكتملة عند إعادة توليد العمل المتبقي.",
        })}
      />
      <div className="student-connected-grid">
        <Panel title={t({ en: "Your plans", ar: "خططك" })}>
          <QueryStatus query={list} />
          {!list.isPending && !list.error && (
            <Empty items={rows(record(list.data).items)} />
          )}
          {rows(record(list.data).items).map((row) => (
            <div className="student-connected-row" key={string(row.id)}>
              <strong>{string(row.name)}</strong>
              <Button
                variant="outline"
                onClick={() => {
                  setSelected(string(row.id));
                  setVersion(undefined);
                  setPreview(null);
                  setItem(null);
                  setConfirm(false);
                }}
              >
                {t({ en: "Open plan", ar: "فتح الخطة" })}
              </Button>
            </div>
          ))}
          <Pager
            page={page}
            total={number(record(list.data).total)}
            onChange={setPage}
          />
          <Button variant="outline" onClick={reset}>
            {t({ en: "New plan", ar: "خطة جديدة" })}
          </Button>
        </Panel>
        <Panel
          title={
            version
              ? t({ en: "Edit plan", ar: "تعديل الخطة" })
              : t({ en: "Plan a study week", ar: "خطط لأسبوع دراسة" })
          }
        >
          {selected && !version ? (
            <p>
              {t({
                en: "Open the saved plan below, then choose Edit plan to change its settings.",
                ar: "افتح الخطة المحفوظة أدناه ثم اختر تعديل الخطة لتغيير إعداداتها.",
              })}
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void action.run(
                  async () => {
                    if (
                      input.endDate < input.startDate ||
                      !input.subjects.length
                    )
                      throw new ApiError(
                        "Choose subjects and a valid date range.",
                        422,
                        "INVALID_PLAN",
                      );
                    const value =
                      await api.post_api_v1_study_plans_generate_preview({
                        body: input,
                      });
                    setPreview(record(value));
                    setPreviewInput(JSON.stringify(input));
                  },
                  undefined,
                  t({ en: "Preview ready", ar: "المعاينة جاهزة" }),
                );
              }}
            >
              <label>
                {t({ en: "Plan name", ar: "اسم الخطة" })}
                <input
                  required
                  value={input.name}
                  onChange={(e) => change({ name: e.target.value })}
                />
              </label>
              <div className="student-connected-grid">
                <label>
                  {t({ en: "Start date", ar: "تاريخ البداية" })}
                  <input
                    type="date"
                    required
                    value={input.startDate}
                    onChange={(e) => change({ startDate: e.target.value })}
                  />
                </label>
                <label>
                  {t({ en: "End date", ar: "تاريخ النهاية" })}
                  <input
                    type="date"
                    required
                    value={input.endDate}
                    onChange={(e) => change({ endDate: e.target.value })}
                  />
                </label>
              </div>
              <label>
                {t({ en: "Time zone", ar: "المنطقة الزمنية" })}
                <input
                  required
                  value={input.timeZone}
                  onChange={(e) => change({ timeZone: e.target.value })}
                />
              </label>
              <label>
                {t({ en: "Session minutes", ar: "دقائق الجلسة" })}
                <input
                  type="number"
                  min="1"
                  max="240"
                  required
                  value={input.sessionMinutes}
                  onChange={(e) =>
                    change({ sessionMinutes: Number(e.target.value) })
                  }
                />
              </label>
              <label>
                {t({ en: "Daily start time", ar: "وقت البداية اليومي" })}
                <input
                  type="time"
                  required
                  value={`${String(Math.floor(input.dailyStartMinute / 60)).padStart(2, "0")}:${String(input.dailyStartMinute % 60).padStart(2, "0")}`}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(":").map(Number);
                    change({ dailyStartMinute: h * 60 + m });
                  }}
                />
              </label>
              <label>
                <span>
                  <input
                    type="checkbox"
                    checked={input.slots !== null}
                    onChange={(e) =>
                      change(
                        e.target.checked
                          ? { slots: [], dailyMinutes: null }
                          : {
                              slots: null,
                              dailyMinutes: newInput().dailyMinutes,
                            },
                      )
                    }
                  />
                  {t({
                    en: "Use custom weekly time slots",
                    ar: "استخدام فترات أسبوعية مخصصة",
                  })}
                </span>
              </label>
              {input.slots !== null ? (
                <details open>
                  <summary>
                    {t({ en: "Weekly time slots", ar: "الفترات الأسبوعية" })}
                  </summary>
                  {(input.slots || []).map((slot, index) => (
                    <div className="student-connected-grid" key={index}>
                      <label>
                        {t({ en: "Day", ar: "اليوم" })}
                        <select
                          required
                          value={slot.day || ""}
                          onChange={(e) =>
                            change({
                              slots: input.slots!.map((v, i) =>
                                i === index
                                  ? {
                                      ...v,
                                      day: e.target
                                        .value as Schemas["DayOfWeek"],
                                    }
                                  : v,
                              ),
                            })
                          }
                        >
                          <option value="" />
                          {Object.entries(dayNames).map(([day, label]) => (
                            <option value={day} key={day}>
                              {t(label)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        {t({
                          en: "Start minute (0–1439)",
                          ar: "دقيقة البداية (٠–١٤٣٩)",
                        })}
                        <input
                          type="number"
                          min="0"
                          max="1439"
                          required
                          value={slot.startMinute ?? 540}
                          onChange={(e) =>
                            change({
                              slots: input.slots!.map((v, i) =>
                                i === index
                                  ? {
                                      ...v,
                                      startMinute: Number(e.target.value),
                                    }
                                  : v,
                              ),
                            })
                          }
                        />
                      </label>
                      <label>
                        {t({ en: "Available minutes", ar: "الدقائق المتاحة" })}
                        <input
                          type="number"
                          min="1"
                          max="1440"
                          required
                          value={slot.durationMinutes ?? 120}
                          onChange={(e) =>
                            change({
                              slots: input.slots!.map((v, i) =>
                                i === index
                                  ? {
                                      ...v,
                                      durationMinutes: Number(e.target.value),
                                    }
                                  : v,
                              ),
                            })
                          }
                        />
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          change({
                            slots: input.slots!.filter((_, i) => i !== index),
                          })
                        }
                      >
                        {t({ en: "Remove slot", ar: "إزالة الفترة" })}
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      change({
                        slots: [
                          ...(input.slots || []),
                          {
                            day: "Sunday",
                            startMinute: 540,
                            durationMinutes: 120,
                          },
                        ],
                      })
                    }
                  >
                    {t({ en: "Add weekly slot", ar: "إضافة فترة أسبوعية" })}
                  </Button>
                </details>
              ) : (
                <details>
                  <summary>
                    {t({
                      en: "Minutes available by day",
                      ar: "الدقائق المتاحة لكل يوم",
                    })}
                  </summary>
                  {Object.entries(dayNames).map(([day, label]) => (
                    <label key={day}>
                      {t(label)}
                      <input
                        type="number"
                        min="0"
                        max="1440"
                        value={number(record(input.dailyMinutes)[day])}
                        onChange={(e) =>
                          change({
                            dailyMinutes: {
                              ...input.dailyMinutes,
                              [day]: Number(e.target.value),
                            },
                          })
                        }
                      />
                    </label>
                  ))}
                </details>
              )}
              <label>
                {t({
                  en: "Rest dates (one date per line)",
                  ar: "تواريخ الراحة (تاريخ في كل سطر)",
                })}
                <textarea
                  value={(input.restDays || []).join("\n")}
                  onChange={(e) =>
                    change({
                      restDays: e.target.value.split("\n").filter(Boolean),
                    })
                  }
                />
              </label>
              <h3>
                {t({
                  en: "Subjects and target minutes",
                  ar: "المواد والدقائق المستهدفة",
                })}
              </h3>
              {subjectOptions.map((c) => {
                const entry = input.subjects.find(
                  (x) => x.subjectId === c.subjectId,
                );
                return (
                  <div key={c.subjectId}>
                    <label>
                      <span>
                        <input
                          type="checkbox"
                          checked={!!entry}
                          onChange={(e) =>
                            change({
                              subjects: e.target.checked
                                ? [
                                    ...input.subjects,
                                    {
                                      subjectId: c.subjectId!,
                                      targetMinutes: 120,
                                      priority: 1,
                                    },
                                  ]
                                : input.subjects.filter(
                                    (x) => x.subjectId !== c.subjectId,
                                  ),
                            })
                          }
                        />{" "}
                        {t(c.title)}
                      </span>
                    </label>
                    {entry && (
                      <div className="student-connected-grid">
                        <label>
                          {t({ en: "Target minutes", ar: "الدقائق المستهدفة" })}
                          <input
                            type="number"
                            min="1"
                            value={entry.targetMinutes}
                            onChange={(e) =>
                              change({
                                subjects: input.subjects.map((x) =>
                                  x === entry
                                    ? {
                                        ...x,
                                        targetMinutes: Number(e.target.value),
                                      }
                                    : x,
                                ),
                              })
                            }
                          />
                        </label>
                        <label>
                          {t({ en: "Priority", ar: "الأولوية" })}
                          <input
                            type="number"
                            min="1"
                            value={entry.priority}
                            onChange={(e) =>
                              change({
                                subjects: input.subjects.map((x) =>
                                  x === entry
                                    ? { ...x, priority: Number(e.target.value) }
                                    : x,
                                ),
                              })
                            }
                          />
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
              <QueryStatus query={courses} />
              <Button disabled={action.busy}>
                {t({ en: "Generate preview", ar: "توليد معاينة" })}
              </Button>
            </form>
          )}
          {preview && (
            <aside>
              <h3>{t({ en: "Schedule preview", ar: "معاينة الجدول" })}</h3>
              <p>
                {t({
                  en: `${number(preview.scheduledMinutes)} minutes scheduled · ${number(preview.gapMinutes)} minutes unscheduled`,
                  ar: `${number(preview.scheduledMinutes)} دقيقة مجدولة · ${number(preview.gapMinutes)} دقيقة غير مجدولة`,
                })}
              </p>
              {Array.isArray(preview.warnings) &&
                preview.warnings.map((w, index) => (
                  <p role="alert" key={index}>
                    {String(w)}
                  </p>
                ))}
              {rows(preview.items).map((r, index) => (
                <p key={index}>
                  {string(r.date)} · {number(r.startMinute)} ·{" "}
                  {number(r.durationMinutes)}{" "}
                  {t({ en: "minutes", ar: "دقيقة" })}
                </p>
              ))}
              <Button
                disabled={action.busy || previewInput !== JSON.stringify(input)}
                onClick={() =>
                  void action.run(
                    () =>
                      version && selected
                        ? api.put_api_v1_study_plans_by_id({
                            path: { id: selected },
                            body: { input, version },
                          })
                        : api.post_api_v1_study_plans({ body: { input } }),
                    reset,
                  )
                }
              >
                {t({ en: "Save plan", ar: "حفظ الخطة" })}
              </Button>
            </aside>
          )}
        </Panel>
      </div>
      {selected && (
        <Panel
          title={
            string(plan.name) || t({ en: "Saved plan", ar: "الخطة المحفوظة" })
          }
        >
          <QueryStatus query={detail} />
          {!!plan.id && (
            <>
              <div className="student-connected-actions">
                <Button variant="outline" disabled={action.busy} onClick={load}>
                  {t({ en: "Edit plan", ar: "تعديل الخطة" })}
                </Button>
                <Button
                  variant="outline"
                  disabled={action.busy}
                  onClick={() =>
                    void action.run(() =>
                      api.post_api_v1_study_plans_by_id_regenerate_remaining({
                        path: { id: selected },
                        body: { version: string(plan.version) },
                      }),
                    )
                  }
                >
                  {t({ en: "Regenerate remaining", ar: "إعادة توليد المتبقي" })}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setItemId("");
                    setItem({
                      subjectId: subjectOptions[0]?.subjectId || "",
                      date: input.startDate,
                      startMinute: 540,
                      durationMinutes: 25,
                      status: string(items[0]?.status),
                    });
                  }}
                >
                  {t({ en: "Add session", ar: "إضافة جلسة" })}
                </Button>
                <Button variant="outline" onClick={() => setConfirm(true)}>
                  {t({ en: "Delete plan", ar: "حذف الخطة" })}
                </Button>
              </div>
              {services.scheduleApi && <PlanCalendarSync key={selected} id={selected} enabled={plan.calendarSyncEnabled === true}/>}
              {confirm && (
                <div role="alert">
                  <p>
                    {t({
                      en: "Delete this plan and all its sessions?",
                      ar: "حذف الخطة وكل جلساتها؟",
                    })}
                  </p>
                  <Button
                    disabled={action.busy}
                    onClick={() =>
                      void action.run(
                        () =>
                          api.delete_api_v1_study_plans_by_id({
                            path: { id: selected },
                            query: { version: string(plan.version) },
                          }),
                        reset,
                      )
                    }
                  >
                    {t({ en: "Confirm delete", ar: "تأكيد الحذف" })}
                  </Button>
                  <Button variant="outline" onClick={() => setConfirm(false)}>
                    {t({ en: "Cancel", ar: "إلغاء" })}
                  </Button>
                </div>
              )}
              {!detail.isPending && !detail.error && <Empty items={items} />}
              {items.map((row) => (
                <div className="student-connected-row" key={string(row.id)}>
                  <div>
                    <strong>
                      {t(
                        subjectOptions.find(
                          (c) => c.subjectId === row.subjectId,
                        )?.title || { en: "Subject", ar: "مادة" },
                      )}
                    </strong>
                    <small>
                      {string(row.date)} · {String(row.durationMinutes)}{" "}
                      {t({ en: "minutes", ar: "دقيقة" })} · {string(row.status)}
                    </small>
                  </div>
                  <div className="student-connected-actions">
                    <Button
                      variant="outline"
                      disabled={action.busy}
                      onClick={() =>
                        void action.run(() =>
                          api.post_api_v1_study_plans_by_id_items_by_itemId_complete(
                            {
                              path: { id: selected, itemId: string(row.id) },
                              body: {
                                completed: row.status !== "Completed",
                                expectedVersion: string(row.version),
                              },
                            },
                          ),
                        )
                      }
                    >
                      {t(
                        row.status === "Completed"
                          ? { en: "Mark incomplete", ar: "غير مكتمل" }
                          : { en: "Complete", ar: "إكمال" },
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setItemId(string(row.id));
                        setItem({
                          subjectId: string(row.subjectId),
                          date: string(row.date),
                          startMinute: number(row.startMinute),
                          durationMinutes: number(row.durationMinutes),
                          status: string(row.status),
                          version: string(row.version),
                        });
                      }}
                    >
                      {t({ en: "Edit", ar: "تعديل" })}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={action.busy}
                      onClick={() =>
                        void action.run(() =>
                          api.delete_api_v1_study_plans_by_id_items_by_itemId({
                            path: { id: selected, itemId: string(row.id) },
                            query: { version: string(row.version) },
                          }),
                        )
                      }
                    >
                      {t({ en: "Remove session", ar: "إزالة الجلسة" })}
                    </Button>
                  </div>
                </div>
              ))}
              {item && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void action.run(
                      () =>
                        itemId
                          ? api.put_api_v1_study_plans_by_id_items_by_itemId({
                              path: { id: selected, itemId },
                              body: item,
                            })
                          : api.post_api_v1_study_plans_by_id_items({
                              path: { id: selected },
                              body: item,
                            }),
                      () => setItem(null),
                    );
                  }}
                >
                  <label>
                    {t({ en: "Subject", ar: "المادة" })}
                    <select
                      required
                      value={item.subjectId}
                      onChange={(e) =>
                        setItem({ ...item, subjectId: e.target.value })
                      }
                    >
                      <option value="" />
                      {subjectOptions.map((c) => (
                        <option key={c.subjectId} value={c.subjectId}>
                          {t(c.title)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    {t({ en: "Date", ar: "التاريخ" })}
                    <input
                      type="date"
                      required
                      value={item.date}
                      onChange={(e) =>
                        setItem({ ...item, date: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    {t({
                      en: "Start minute (0–1439)",
                      ar: "دقيقة البداية (٠–١٤٣٩)",
                    })}
                    <input
                      type="number"
                      required
                      min="0"
                      max="1439"
                      value={item.startMinute}
                      onChange={(e) =>
                        setItem({
                          ...item,
                          startMinute: Number(e.target.value),
                        })
                      }
                    />
                  </label>
                  <label>
                    {t({ en: "Duration in minutes", ar: "المدة بالدقائق" })}
                    <input
                      type="number"
                      required
                      min="1"
                      max="1440"
                      value={item.durationMinutes}
                      onChange={(e) =>
                        setItem({
                          ...item,
                          durationMinutes: Number(e.target.value),
                        })
                      }
                    />
                  </label>
                  <label>
                    {t({ en: "Status", ar: "الحالة" })}
                    <input
                      required
                      value={item.status}
                      onChange={(e) =>
                        setItem({ ...item, status: e.target.value })
                      }
                    />
                  </label>
                  <Button disabled={action.busy}>
                    {t({ en: "Save session", ar: "حفظ الجلسة" })}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setItem(null)}
                  >
                    {t({ en: "Cancel", ar: "إلغاء" })}
                  </Button>
                </form>
              )}
            </>
          )}
        </Panel>
      )}
      {action.feedback}
    </div>
  );
}
