import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { PageIntro } from "../../components/data-display/PageIntro";
import { record, string, number } from "../../services/api/mapping";
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
export default function Roadmaps() {
  const { owner } = useStudentConnection();
  return <RoadmapDesk key={owner} />;
}
function RoadmapDesk() {
  const { api } = useStudentConnection(),
    { t } = useLocale(),
    action = useStudentAction();
  const [page, setPage] = useState(1),
    [selected, setSelected] = useState(""),
    [versionId, setVersionId] = useState(""),
    [migrate, setMigrate] = useState(false);
  const list = useStudentQuery(
    "roadmaps",
    (signal) =>
      api.get_api_v1_roadmaps({ query: { Page: page, PageSize: 20 }, signal }),
    page,
  );
  const detail = useStudentQuery(
    "roadmap",
    (signal) =>
      api.get_api_v1_roadmaps_by_id({
        path: { id: selected },
        query: { versionId: versionId || undefined },
        signal,
      }),
    [selected, versionId],
    !!selected,
  );
  const progress = useStudentQuery(
    "roadmap-progress",
    (signal) =>
      api.get_api_v1_roadmaps_by_id_progress({
        path: { id: selected },
        query: { versionId: versionId || undefined },
        signal,
      }),
    [selected, versionId],
    !!selected,
  );
  const document = record(detail.data),
    state = record(progress.data),
    completed = Array.isArray(state.completedKeys) ? state.completedKeys : [];
  const pinned = string(document.versionId),
    items = rows(document.items);
  return (
    <div className="container student-connected">
      <PageIntro
        title={t({ en: "Learning roadmaps", ar: "مسارات التعلم" })}
        description={t({
          en: "Follow published steps and track progress against a specific version.",
          ar: "اتبع الخطوات المنشورة وتابع تقدمك على إصدار محدد.",
        })}
      />
      <Panel title={t({ en: "Choose a roadmap", ar: "اختر مساراً" })}>
        <QueryStatus query={list} />
        {!list.isPending && !list.error && (
          <Empty items={rows(record(list.data).items)} />
        )}
        {rows(record(list.data).items).map((row) => (
          <div className="student-connected-row" key={string(row.id)}>
            <div>
              <strong>{string(row.title)}</strong>
              <p>{string(row.description)}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSelected(string(row.id));
                setVersionId(string(row.publishedVersionId));
                setMigrate(false);
              }}
            >
              {t({ en: "Open roadmap", ar: "فتح المسار" })}
            </Button>
          </div>
        ))}
        <Pager
          page={page}
          total={number(record(list.data).total)}
          onChange={setPage}
        />
      </Panel>
      {selected && (
        <Panel title={t({ en: "Your roadmap", ar: "مسارك" })}>
          <QueryStatus query={detail} />
          <QueryStatus query={progress} />
          {pinned && (
            <>
              <p>
                {t({
                  en: `Published version ${document.number}`,
                  ar: `الإصدار المنشور ${document.number}`,
                })}
              </p>
              <progress max="100" value={number(state.percent)} />
              <span>{number(state.percent)}%</span>
              {state.contentChanged === true && (
                <aside role="alert">
                  <p>
                    {t({
                      en: "A newer version is published. Your progress remains tied to this version.",
                      ar: "نُشر إصدار أحدث. يبقى تقدمك مرتبطاً بهذا الإصدار.",
                    })}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setVersionId(string(state.currentVersionId));
                      setMigrate(false);
                    }}
                  >
                    {t({ en: "Open latest version", ar: "فتح أحدث إصدار" })}
                  </Button>
                </aside>
              )}
              <label>
                <span>
                  <input
                    type="checkbox"
                    checked={migrate}
                    onChange={(e) => setMigrate(e.target.checked)}
                  />
                  {t({
                    en: "On my next update, carry completed steps with matching stable keys to this version",
                    ar: "عند التحديث القادم، انقل الخطوات المكتملة ذات المفاتيح الثابتة المطابقة إلى هذا الإصدار",
                  })}
                </span>
              </label>
              {!detail.isPending && !detail.error && <Empty items={items} />}
              {items.map((item) => (
                <div key={string(item.id)} className="student-connected-row">
                  <div>
                    <strong>{string(item.title)}</strong>
                    <small>{string(item.kind)}</small>
                  </div>
                  {item.completable === true && (
                    <Button
                      variant="outline"
                      disabled={
                        action.busy ||
                        progress.isPending ||
                        !!progress.error ||
                        state.versionId !== pinned
                      }
                      aria-pressed={completed.includes(item.stableKey)}
                      onClick={() =>
                        void action.run(() =>
                          api.put_api_v1_roadmaps_by_id_items_by_itemId_progress(
                            {
                              path: { id: selected, itemId: string(item.id) },
                              body: {
                                completed: !completed.includes(item.stableKey),
                                versionId: pinned,
                                migrateStableItems: migrate,
                              },
                            },
                          ),
                        )
                      }
                    >
                      {t(
                        completed.includes(item.stableKey)
                          ? { en: "Completed", ar: "مكتمل" }
                          : { en: "Mark complete", ar: "وضع علامة مكتمل" },
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </>
          )}
          {!detail.isPending && !detail.error && !pinned && (
            <p>
              {t({
                en: "This roadmap does not have a published version available to study.",
                ar: "لا يوجد إصدار منشور متاح للدراسة لهذا المسار.",
              })}
            </p>
          )}
        </Panel>
      )}
      {action.feedback}
    </div>
  );
}
