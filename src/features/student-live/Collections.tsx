import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { PageIntro } from "../../components/data-display/PageIntro";
import { AppLink } from "../../components/navigation/AppLink";
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
import { record, string, number } from "../../services/api/mapping";

export default function Collections() {
  const { owner } = useStudentConnection();
  return <CollectionShelf key={owner} />;
}
function CollectionShelf() {
  const { api } = useStudentConnection(),
    { t } = useLocale(),
    action = useStudentAction();
  const [selected, setSelected] = useState(""),
    [page, setPage] = useState(1),
    [name, setName] = useState(""),
    [description, setDescription] = useState("");
  const [editing, setEditing] = useState<{
      id: string;
      version: string;
    } | null>(null),
    [confirm, setConfirm] = useState(false);
  const list = useStudentQuery("collections", (signal) =>
    api.get_api_v1_library_collections({ signal }),
  );
  const collections = rows(list.data);
  const detail = useStudentQuery(
    "collection",
    (signal) =>
      api.get_api_v1_library_collections_by_id({
        path: { id: selected },
        query: { Page: page, PageSize: 20 },
        signal,
      }),
    [selected, page],
    !!selected,
  );
  const collection = record(record(detail.data).collection),
    envelope = record(record(detail.data).items),
    items = rows(envelope.items);
  const [order, setOrder] = useState<string[] | null>(null);
  function choose(id: string) {
    setSelected(id);
    setPage(1);
    setOrder(null);
    setConfirm(false);
  }
  async function moveCollection(index: number, delta: number) {
    const ids = collections.map((row) => string(row.id));
    [ids[index], ids[index + delta]] = [ids[index + delta], ids[index]];
    await action.run(() =>
      api.put_api_v1_library_collections_reorder({
        body: { ids, version: string(collections[index].version) },
      }),
    );
  }
  return (
    <div className="container student-connected">
      <PageIntro
        title={t({ en: "Your library", ar: "مكتبتك" })}
        description={t({
          en: "Keep useful materials together in your private collections.",
          ar: "اجمع المواد المفيدة في مجموعاتك الخاصة.",
        })}
      />
      <div className="student-connected-actions">
        <AppLink href="/my/search">
          {t({ en: "Find materials to save", ar: "ابحث عن مواد لحفظها" })}
        </AppLink>
        <AppLink href="/my/study/plans">
          {t({ en: "Study plans", ar: "خطط الدراسة" })}
        </AppLink>
      </div>
      <div className="student-connected-grid">
        <Panel title={t({ en: "Collections", ar: "المجموعات" })}>
          <QueryStatus query={list} />
          {!list.isPending && !list.error && <Empty items={collections} />}
          {collections.map((row, index) => (
            <div className="student-connected-row" key={string(row.id)}>
              <Button
                variant={selected === row.id ? "default" : "outline"}
                onClick={() => choose(string(row.id))}
              >
                {string(row.name)}
              </Button>
              <div className="student-connected-actions">
                <Button
                  variant="outline"
                  disabled={action.busy || index === 0}
                  onClick={() => void moveCollection(index, -1)}
                  aria-label={t({
                    en: "Move collection earlier",
                    ar: "نقل المجموعة للأعلى",
                  })}
                >
                  ↑
                </Button>
                <Button
                  variant="outline"
                  disabled={action.busy || index === collections.length - 1}
                  onClick={() => void moveCollection(index, 1)}
                  aria-label={t({
                    en: "Move collection later",
                    ar: "نقل المجموعة للأسفل",
                  })}
                >
                  ↓
                </Button>
              </div>
            </div>
          ))}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void action.run(
                () =>
                  editing
                    ? api.put_api_v1_library_collections_by_id({
                        path: { id: editing.id },
                        body: { name, description, version: editing.version },
                      })
                    : api.post_api_v1_library_collections({
                        body: { name, description },
                      }),
                () => {
                  setName("");
                  setDescription("");
                  setEditing(null);
                },
              );
            }}
          >
            <label>
              {t({ en: "Collection name", ar: "اسم المجموعة" })}
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              {t({ en: "Description", ar: "الوصف" })}
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <Button disabled={action.busy}>
              {t(
                editing
                  ? { en: "Save collection", ar: "حفظ المجموعة" }
                  : { en: "Create collection", ar: "إنشاء مجموعة" },
              )}
            </Button>
            {editing && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditing(null);
                  setName("");
                  setDescription("");
                }}
              >
                {t({ en: "Cancel", ar: "إلغاء" })}
              </Button>
            )}
          </form>
        </Panel>
        <Panel
          title={
            string(collection.name) ||
            t({ en: "Choose a collection", ar: "اختر مجموعة" })
          }
        >
          {selected && (
            <>
              <QueryStatus query={detail} />
              <p>{string(collection.description)}</p>
              {collection.id && (
                <div className="student-connected-actions">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditing({
                        id: string(collection.id),
                        version: string(collection.version),
                      });
                      setName(string(collection.name));
                      setDescription(string(collection.description));
                    }}
                  >
                    {t({ en: "Rename / edit", ar: "تعديل" })}
                  </Button>
                  {!collection.isDefault && (
                    <Button variant="outline" onClick={() => setConfirm(true)}>
                      {t({ en: "Delete collection", ar: "حذف المجموعة" })}
                    </Button>
                  )}
                </div>
              )}
              {confirm && (
                <div role="alert">
                  <p>
                    {t({
                      en: "Delete this collection and its saved links?",
                      ar: "حذف هذه المجموعة وروابطها المحفوظة؟",
                    })}
                  </p>
                  <Button
                    disabled={action.busy}
                    onClick={() =>
                      void action.run(
                        () =>
                          api.delete_api_v1_library_collections_by_id({
                            path: { id: selected },
                            query: { version: string(collection.version) },
                          }),
                        () => choose(""),
                      )
                    }
                  >
                    {t({ en: "Confirm deletion", ar: "تأكيد الحذف" })}
                  </Button>
                  <Button variant="outline" onClick={() => setConfirm(false)}>
                    {t({ en: "Cancel", ar: "إلغاء" })}
                  </Button>
                </div>
              )}
              {!detail.isPending && !detail.error && <Empty items={items} />}
              {(order
                ? order.map((id) =>
                    items.find((row) => record(row.item).id === id)!,
                  )
                : items
              )
                .filter(Boolean)
                .map((row, index) => {
                  const item = record(row.item);
                  return (
                    <div
                      className="student-connected-row"
                      key={string(item.id)}
                    >
                      <div>
                        <strong>{string(row.title)}</strong>
                        <small>{string(item.itemType)}</small>
                        <AppLink
                          href={`/my/search?q=${encodeURIComponent(string(row.title))}`}
                        >
                          {t({
                            en: "Find this material",
                            ar: "البحث عن هذه المادة",
                          })}
                        </AppLink>
                      </div>
                      <div className="student-connected-actions">
                        <Button
                          variant="outline"
                          disabled={action.busy}
                          onClick={() =>
                            void action.run(() =>
                              api.delete_api_v1_library_collections_by_id_items_by_itemId(
                                {
                                  path: {
                                    id: selected,
                                    itemId: string(item.id),
                                  },
                                },
                              ),
                            )
                          }
                        >
                          {t({ en: "Remove", ar: "إزالة" })}
                        </Button>
                        <Button
                          variant="outline"
                          disabled={index === 0 || number(envelope.total) > 20}
                          onClick={() => {
                            const ids =
                              order ||
                              items.map((r) => string(record(r.item).id));
                            const next = [...ids];
                            [next[index], next[index - 1]] = [
                              next[index - 1],
                              next[index],
                            ];
                            setOrder(next);
                          }}
                          aria-label={t({
                            en: "Move saved item earlier",
                            ar: "نقل العنصر للأعلى",
                          })}
                        >
                          ↑
                        </Button>
                      </div>
                    </div>
                  );
                })}
              {order && (
                <Button
                  disabled={action.busy}
                  onClick={() =>
                    void action.run(
                      () =>
                        api.put_api_v1_library_collections_by_id_items_reorder({
                          path: { id: selected },
                          body: {
                            ids: order,
                            version: string(collection.version),
                          },
                        }),
                      () => setOrder(null),
                    )
                  }
                >
                  {t({ en: "Save order", ar: "حفظ الترتيب" })}
                </Button>
              )}
              {number(envelope.total) > 20 && (
                <p>
                  {t({
                    en: "Reordering is available when the whole collection fits on one page.",
                    ar: "الترتيب متاح عندما تتسع المجموعة في صفحة واحدة.",
                  })}
                </p>
              )}
              <Pager
                page={page}
                total={number(envelope.total)}
                onChange={(p) => {
                  setOrder(null);
                  setPage(p);
                }}
              />
            </>
          )}
        </Panel>
      </div>
      {action.feedback}
    </div>
  );
}
