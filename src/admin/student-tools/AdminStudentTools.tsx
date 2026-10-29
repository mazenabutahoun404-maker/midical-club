import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { PageIntro } from "../../components/data-display/PageIntro";
import { useAccess } from "../governance/useGovernance";
import { AcademicFields } from "../academics/AcademicUI";
import type { Field } from "../academics/academic-fields";
import type { Schemas } from "../../services/api/schema.generated";
import { record, string, number, json } from "../../services/api/mapping";
import {
  Panel,
  Pager,
  QueryStatus,
  Empty,
  rows,
  useStudentAction,
  useStudentConnection,
  useStudentQuery,
} from "../../features/student-live/shared";
import { createRecordId } from "../../lib/record-id";
import { ApiError } from "../../services/api/client";

const f = (
  key: string,
  en: string,
  ar: string,
  options: Partial<Field> = {},
): Field => ({ key, label: { en, ar }, ...options });
const roadmapFields = [
  f("title", "Title", "العنوان", { required: true }),
  f("description", "Description", "الوصف", { type: "textarea" }),
  f("teamId", "Team ID (optional)", "معرّف الفريق (اختياري)"),
  f("stage", "Stage", "المرحلة"),
  f("studyYear", "Study year", "السنة الدراسية", { type: "number", min: 1 }),
  f("batchId", "Batch ID", "معرّف الدفعة"),
  f("subjectId", "Subject ID", "معرّف المادة"),
  f("offeringId", "Offering ID", "معرّف المساق"),
];
const roadmapItemFields = [
  f("stableKey", "Stable key", "مفتاح ثابت", { required: true }),
  f("kind", "Kind", "النوع", { required: true }),
  f("title", "Title", "العنوان", { required: true }),
  f(
    "completable",
    "Student can complete this step",
    "يمكن للطالب إكمال الخطوة",
    { type: "checkbox" },
  ),
  f("targetType", "Target content type", "نوع المحتوى المستهدف"),
  f("targetId", "Target ID", "معرّف الهدف"),
];
const scaleFields = [
  f("name", "Scale name", "اسم السلم", { required: true }),
  f("context", "Context", "السياق", { required: true }),
  f("maximumGpa", "Maximum GPA", "أعلى معدل", {
    type: "number",
    required: true,
    min: 0,
    step: "any",
  }),
  f("effectiveFrom", "Effective from", "ساري من", { type: "date" }),
  f("effectiveTo", "Effective to", "ساري حتى", { type: "date" }),
  f("teamId", "Team ID (optional)", "معرّف الفريق (اختياري)"),
];
const gradeFields = [
  f("letterGrade", "Letter grade", "التقدير", { required: true }),
  f("gradePoints", "Grade points", "نقاط التقدير", {
    type: "number",
    required: true,
    min: 0,
    step: "any",
  }),
  f("minimumScore", "Minimum score", "أقل علامة", {
    type: "number",
    step: "any",
  }),
  f("maximumScore", "Maximum score", "أعلى علامة", {
    type: "number",
    step: "any",
  }),
];
const utilityFields = [
  f("nameEn", "English name", "الاسم بالإنجليزية"),
  f("nameAr", "Arabic name", "الاسم بالعربية"),
  f("descriptionEn", "English description", "الوصف بالإنجليزية", {
    type: "textarea",
  }),
  f("descriptionAr", "Arabic description", "الوصف بالعربية", {
    type: "textarea",
  }),
  f("status", "Status", "الحالة", { required: true }),
  f("route", "Route", "المسار", { required: true }),
  f("icon", "Icon", "الأيقونة"),
  f("requiredPermission", "Required permission", "الصلاحية المطلوبة"),
];
function pick(row: Record<string, unknown>, fields: Field[]) {
  return Object.fromEntries(
    fields.map((field) => [field.key, row[field.key] ?? null]),
  );
}
export default function AdminStudentTools() {
  const { owner } = useStudentConnection();
  return <StudentToolsAdmin key={owner} />;
}
function StudentToolsAdmin() {
  const { t } = useLocale(),
    access = useAccess();
  const [tab, setTab] = useState("roadmaps");
  const can = (p: string) => access.data?.permissions?.includes(p);
  const active = can(
    tab === "roadmaps"
      ? "roadmaps.manage"
      : tab === "scales"
        ? "gpa_scales.manage"
        : "utilities.manage",
  )
    ? tab
    : can("roadmaps.manage")
      ? "roadmaps"
      : can("gpa_scales.manage")
        ? "scales"
        : "utilities";
  return (
    <div className="container student-connected">
      <PageIntro
        title={t({
          en: "Study tools administration",
          ar: "إدارة أدوات الدراسة",
        })}
        description={t({
          en: "Manage published roadmaps, grading scales, and available utilities.",
          ar: "إدارة المسارات المنشورة وسلالم التقدير والأدوات المتاحة.",
        })}
      />
      <QueryStatus query={access} />
      <nav className="student-connected-tabs">
        {[
          ["roadmaps", "roadmaps.manage", { en: "Roadmaps", ar: "المسارات" }],
          [
            "scales",
            "gpa_scales.manage",
            { en: "GPA scales", ar: "سلالم المعدّل" },
          ],
          ["utilities", "utilities.manage", { en: "Utilities", ar: "الأدوات" }],
        ].map(
          ([id, permission, label]) =>
            can(permission as string) && (
              <Button
                key={id as string}
                variant="outline"
                aria-pressed={active === id}
                onClick={() => setTab(id as string)}
              >
                {t(label as { en: string; ar: string })}
              </Button>
            ),
        )}
      </nav>
      {active === "roadmaps" && can("roadmaps.manage") && <RoadmapAdmin />}
      {active === "scales" && can("gpa_scales.manage") && <ScaleAdmin />}
      {active === "utilities" && can("utilities.manage") && <UtilityAdmin />}
    </div>
  );
}
function RoadmapAdmin() {
  const { api } = useStudentConnection(),
    { t } = useLocale(),
    action = useStudentAction();
  const [page, setPage] = useState(1),
    [team, setTeam] = useState(""),
    [id, setId] = useState(""),
    [draft, setDraft] = useState<Record<string, unknown> | null>(null),
    [items, setItems] = useState<Record<string, unknown>[]>([]),
    [version, setVersion] = useState(""),
    [confirm, setConfirm] = useState("");
  const list = useStudentQuery(
    "admin-roadmaps",
    (signal) =>
      api.get_api_v1_admin_roadmaps({
        query: { Page: page, PageSize: 20, teamId: team || undefined },
        signal,
      }),
    [page, team],
  );
  const detail = useStudentQuery(
    "admin-roadmap",
    (signal) => api.get_api_v1_admin_roadmaps_by_id({ path: { id }, signal }),
    id,
    !!id,
  );
  const versions = useStudentQuery(
    "admin-roadmap-versions",
    (signal) =>
      api.get_api_v1_admin_roadmaps_by_id_versions({ path: { id }, signal }),
    id,
    !!id,
  );
  const row = record(record(detail.data).roadmap);
  function edit() {
    const content = json(row.draftJson);
    if (!Array.isArray(content.items)) {
      action.setError(
        new ApiError(
          "The roadmap draft has an unsupported structure. It has not been changed.",
          422,
          "INVALID_DRAFT",
        ),
      );
      return;
    }
    setDraft(pick(row, roadmapFields));
    setVersion(string(row.version));
    setItems(rows(content.items));
    setConfirm("");
  }
  return (
    <>
      <Panel title={t({ en: "Roadmap library", ar: "مكتبة المسارات" })}>
        <label>
          {t({
            en: "Team ID filter (optional)",
            ar: "تصفية بمعرّف الفريق (اختياري)",
          })}
          <input
            value={team}
            onChange={(e) => {
              setTeam(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <QueryStatus query={list} />
        {!list.isPending && !list.error && (
          <Empty items={rows(record(list.data).items)} />
        )}
        {rows(record(list.data).items).map((r) => (
          <div key={string(r.id)} className="student-connected-row">
            <div>
              <strong>{string(r.title)}</strong>
              <small>{string(r.status)}</small>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setId(string(r.id));
                setDraft(null);
                setConfirm("");
              }}
            >
              {t({ en: "Open", ar: "فتح" })}
            </Button>
          </div>
        ))}
        <Pager
          page={page}
          total={number(record(list.data).total)}
          onChange={setPage}
        />
        <Button
          onClick={() => {
            setId("");
            setVersion("");
            setDraft({ title: "" });
            setItems([]);
            setConfirm("");
          }}
        >
          {t({ en: "New roadmap", ar: "مسار جديد" })}
        </Button>
      </Panel>
      {id && (
        <Panel title={string(row.title) || t({ en: "Roadmap", ar: "المسار" })}>
          <QueryStatus query={detail} />
          {!!row.id && (
            <>
              <p>{string(row.status)}</p>
              <div className="student-connected-actions">
                <Button variant="outline" onClick={edit}>
                  {t({ en: "Edit draft", ar: "تعديل المسودة" })}
                </Button>
                <Button variant="outline" onClick={() => setConfirm("publish")}>
                  {t({ en: "Publish a new version", ar: "نشر إصدار جديد" })}
                </Button>
                <Button variant="outline" onClick={() => setConfirm("archive")}>
                  {t({ en: "Archive", ar: "أرشفة" })}
                </Button>
              </div>
              {confirm && (
                <div role="alert">
                  <p>
                    {t(
                      confirm === "publish"
                        ? {
                            en: "Publish this saved draft as a new immutable version?",
                            ar: "نشر هذه المسودة المحفوظة كإصدار ثابت جديد؟",
                          }
                        : {
                            en: "Archive this roadmap?",
                            ar: "أرشفة هذا المسار؟",
                          },
                    )}
                  </p>
                  <Button
                    disabled={action.busy}
                    onClick={() =>
                      void action.run(
                        () =>
                          confirm === "publish"
                            ? api.post_api_v1_admin_roadmaps_by_id_publish({
                                path: { id },
                                body: { version: string(row.version) },
                              })
                            : api.post_api_v1_admin_roadmaps_by_id_archive({
                                path: { id },
                                body: { version: string(row.version) },
                              }),
                        () => {
                          setConfirm("");
                          setDraft(null);
                        },
                      )
                    }
                  >
                    {t({ en: "Confirm", ar: "تأكيد" })}
                  </Button>
                  <Button variant="outline" onClick={() => setConfirm("")}>
                    {t({ en: "Cancel", ar: "إلغاء" })}
                  </Button>
                </div>
              )}
            </>
          )}
          <details>
            <summary>
              {t({ en: "Published versions", ar: "الإصدارات المنشورة" })}
            </summary>
            <QueryStatus query={versions} />
            {rows(versions.data).map((v) => (
              <details key={string(v.id)}>
                <summary>
                  {t({ en: "Version", ar: "إصدار" })} {number(v.number)}
                </summary>
                <p>{string(v.createdAt)}</p>
                <pre
                  style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
                >
                  {string(v.snapshotJson)}
                </pre>
              </details>
            ))}
          </details>
        </Panel>
      )}
      {draft && (
        <Panel title={t({ en: "Roadmap draft", ar: "مسودة المسار" })}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void action.run(
                () => {
                  const body = {
                    ...draft,
                    items,
                    version: id ? version : undefined,
                  } as Schemas["RoadmapRequest"];
                  return id
                    ? api.put_api_v1_admin_roadmaps_by_id({
                        path: { id },
                        body,
                      })
                    : api.post_api_v1_admin_roadmaps({ body });
                },
                () => setDraft(null),
              );
            }}
          >
            <AcademicFields
              fields={roadmapFields}
              value={draft}
              onChange={setDraft}
              disabled={action.busy}
            />
            <h3>{t({ en: "Ordered steps", ar: "الخطوات المرتبة" })}</h3>
            {items.map((item, index) => (
              <fieldset key={index}>
                <legend>{index + 1}</legend>
                <AcademicFields
                  fields={roadmapItemFields}
                  value={item}
                  onChange={(v) =>
                    setItems((old) => old.map((x, i) => (i === index ? v : x)))
                  }
                />
                <div className="student-connected-actions">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={index === 0}
                    onClick={() =>
                      setItems((old) => {
                        const next = [...old];
                        [next[index], next[index - 1]] = [
                          next[index - 1],
                          next[index],
                        ];
                        return next;
                      })
                    }
                  >
                    {t({ en: "Move earlier", ar: "نقل للأعلى" })}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setItems((v) => v.filter((_, i) => i !== index))
                    }
                  >
                    {t({ en: "Remove step", ar: "إزالة الخطوة" })}
                  </Button>
                </div>
              </fieldset>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setItems((v) => [
                  ...v,
                  {
                    stableKey: createRecordId(),
                    kind: "",
                    title: "",
                    completable: true,
                  },
                ])
              }
            >
              {t({ en: "Add step", ar: "إضافة خطوة" })}
            </Button>
            <div className="student-connected-actions">
              <Button disabled={action.busy}>
                {t({ en: "Save draft", ar: "حفظ المسودة" })}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDraft(null)}
              >
                {t({ en: "Cancel", ar: "إلغاء" })}
              </Button>
            </div>
          </form>
        </Panel>
      )}
      {action.feedback}
    </>
  );
}
function ScaleAdmin() {
  const { api } = useStudentConnection(),
    { t } = useLocale(),
    action = useStudentAction();
  const [page, setPage] = useState(1),
    [team, setTeam] = useState(""),
    [id, setId] = useState(""),
    [draft, setDraft] = useState<Record<string, unknown> | null>(null),
    [grades, setGrades] = useState<Record<string, unknown>[]>([]),
    [version, setVersion] = useState(""),
    [confirm, setConfirm] = useState("");
  const list = useStudentQuery(
    "admin-gpa-scales",
    (signal) =>
      api.get_api_v1_admin_gpa_scales({
        query: { Page: page, PageSize: 20, teamId: team || undefined },
        signal,
      }),
    [page, team],
  );
  const detail = useStudentQuery(
      "admin-gpa-scale",
      (signal) =>
        api.get_api_v1_admin_gpa_scales_by_id({ path: { id }, signal }),
      id,
      !!id,
    ),
    scale = record(record(detail.data).scale);
  return (
    <>
      <Panel title={t({ en: "Grading scales", ar: "سلالم التقدير" })}>
        <label>
          {t({
            en: "Team ID filter (optional)",
            ar: "تصفية بمعرّف الفريق (اختياري)",
          })}
          <input
            value={team}
            onChange={(e) => {
              setTeam(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <QueryStatus query={list} />
        {!list.isPending && !list.error && (
          <Empty items={rows(record(list.data).items)} />
        )}
        {rows(record(list.data).items).map((r) => (
          <div className="student-connected-row" key={string(r.id)}>
            <div>
              <strong>{string(r.name)}</strong>
              <small>
                {string(r.context)} · {string(r.status)}
              </small>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setId(string(r.id));
                setDraft(null);
                setConfirm("");
              }}
            >
              {t({ en: "Open scale", ar: "فتح السلم" })}
            </Button>
          </div>
        ))}
        <Pager
          page={page}
          total={number(record(list.data).total)}
          onChange={setPage}
        />
        <Button
          onClick={() => {
            setId("");
            setDraft({ name: "", context: "default", maximumGpa: 4 });
            setVersion("");
            setGrades([]);
          }}
        >
          {t({ en: "New scale", ar: "سلم جديد" })}
        </Button>
      </Panel>
      {id && (
        <Panel
          title={
            string(scale.name) || t({ en: "Grading scale", ar: "سلم التقدير" })
          }
        >
          <QueryStatus query={detail} />
          {!!scale.id && (
            <>
              <p>
                {string(scale.status)} · {t({ en: "Revision", ar: "إصدار" })}{" "}
                {number(scale.revision)}
              </p>
              <div className="student-connected-actions">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDraft(pick(scale, scaleFields));
                    setGrades(
                      rows(record(detail.data).gradeEntries).map((r) =>
                        pick(r, gradeFields),
                      ),
                    );
                    setVersion(string(scale.version));
                  }}
                >
                  {t({ en: "Edit scale", ar: "تعديل السلم" })}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setConfirm("activate")}
                >
                  {t({ en: "Activate scale", ar: "تفعيل السلم" })}
                </Button>
                <Button variant="outline" onClick={() => setConfirm("archive")}>
                  {t({ en: "Archive scale", ar: "أرشفة السلم" })}
                </Button>
              </div>
              {confirm && (
                <div role="alert">
                  <p>
                    {t(
                      confirm === "activate"
                        ? {
                            en: "Activate this grading scale for its context and effective dates?",
                            ar: "تفعيل سلم التقدير لهذا السياق والتواريخ؟",
                          }
                        : {
                            en: "Archive this grading scale?",
                            ar: "أرشفة سلم التقدير؟",
                          },
                    )}
                  </p>
                  <Button
                    disabled={action.busy}
                    onClick={() =>
                      void action.run(
                        () =>
                          confirm === "activate"
                            ? api.post_api_v1_admin_gpa_scales_by_id_activate({
                                path: { id },
                                body: { version: string(scale.version) },
                              })
                            : api.post_api_v1_admin_gpa_scales_by_id_archive({
                                path: { id },
                                body: { version: string(scale.version) },
                              }),
                        () => {
                          setConfirm("");
                          setDraft(null);
                        },
                      )
                    }
                  >
                    {t({ en: "Confirm", ar: "تأكيد" })}
                  </Button>
                  <Button variant="outline" onClick={() => setConfirm("")}>
                    {t({ en: "Cancel", ar: "إلغاء" })}
                  </Button>
                </div>
              )}
            </>
          )}
        </Panel>
      )}
      {draft && (
        <Panel title={t({ en: "Edit grading scale", ar: "تعديل سلم التقدير" })}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void action.run(
                () => {
                  if (!grades.length)
                    throw new ApiError(
                      "Add at least one grade.",
                      422,
                      "GRADES_REQUIRED",
                    );
                  const body = {
                    ...draft,
                    gradeEntries: grades,
                    version: id ? version : undefined,
                  } as Schemas["GpaScaleRequest"];
                  return id
                    ? api.put_api_v1_admin_gpa_scales_by_id({
                        path: { id },
                        body,
                      })
                    : api.post_api_v1_admin_gpa_scales({ body });
                },
                () => setDraft(null),
              );
            }}
          >
            <AcademicFields
              fields={scaleFields}
              value={draft}
              onChange={setDraft}
            />
            {grades.map((g, index) => (
              <fieldset key={index}>
                <legend>{index + 1}</legend>
                <AcademicFields
                  fields={gradeFields}
                  value={g}
                  onChange={(v) =>
                    setGrades((old) => old.map((x, i) => (i === index ? v : x)))
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setGrades((v) => v.filter((_, i) => i !== index))
                  }
                >
                  {t({ en: "Remove grade", ar: "إزالة التقدير" })}
                </Button>
              </fieldset>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setGrades((v) => [...v, { letterGrade: "", gradePoints: 0 }])
              }
            >
              {t({ en: "Add grade", ar: "إضافة تقدير" })}
            </Button>
            <div className="student-connected-actions">
              <Button disabled={action.busy}>
                {t({ en: "Save scale", ar: "حفظ السلم" })}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDraft(null)}
              >
                {t({ en: "Cancel", ar: "إلغاء" })}
              </Button>
            </div>
          </form>
        </Panel>
      )}
      {action.feedback}
    </>
  );
}
function UtilityAdmin() {
  const { api } = useStudentConnection(),
    { t, locale } = useLocale(),
    action = useStudentAction();
  const list = useStudentQuery("admin-utilities", (signal) =>
    api.get_api_v1_admin_utilities({ signal }),
  );
  const [selected, setSelected] = useState<{
      id: string;
      version: string;
    } | null>(null),
    [draft, setDraft] = useState<Record<string, unknown>>({}),
    items = rows(list.data);
  function move(index: number) {
    const ids = items.map((r) => string(r.id));
    [ids[index], ids[index - 1]] = [ids[index - 1], ids[index]];
    void action.run(() =>
      api.put_api_v1_admin_utilities_reorder({
        body: { ids, version: string(items[index].version) },
      }),
    );
  }
  return (
    <Panel title={t({ en: "Utility directory", ar: "دليل الأدوات" })}>
      <QueryStatus query={list} />
      {!list.isPending && !list.error && <Empty items={items} />}
      {items.map((row, index) => (
        <div className="student-connected-row" key={string(row.id)}>
          <div>
            <strong>
              {string(
                locale === "ar"
                  ? row.nameAr || row.nameEn
                  : row.nameEn || row.nameAr,
              )}
            </strong>
            <small>
              {string(row.status)} · {string(row.route)}
            </small>
          </div>
          <div className="student-connected-actions">
            <Button
              variant="outline"
              disabled={action.busy || index === 0}
              onClick={() => move(index)}
            >
              {t({ en: "Move earlier", ar: "نقل للأعلى" })}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelected({
                  id: string(row.id),
                  version: string(row.version),
                });
                setDraft(pick(row, utilityFields));
              }}
            >
              {t({ en: "Edit utility", ar: "تعديل الأداة" })}
            </Button>
          </div>
        </div>
      ))}
      {selected && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void action.run(
              () =>
                api.put_api_v1_admin_utilities_by_id({
                  path: { id: selected.id },
                  body: {
                    ...draft,
                    version: selected.version,
                  } as Schemas["UtilityRequest"],
                }),
              () => setSelected(null),
            );
          }}
        >
          <AcademicFields
            fields={utilityFields}
            value={draft}
            onChange={setDraft}
          />
          <Button disabled={action.busy}>
            {t({ en: "Save utility", ar: "حفظ الأداة" })}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setSelected(null)}
          >
            {t({ en: "Cancel", ar: "إلغاء" })}
          </Button>
        </form>
      )}
      {action.feedback}
    </Panel>
  );
}
