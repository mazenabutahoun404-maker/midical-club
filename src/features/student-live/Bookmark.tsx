import { useState } from "react";
import { Bookmark } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/button";
import { AppLink } from "../../components/navigation/AppLink";
import { record, string } from "../../services/api/mapping";
import { resolveLearningTarget } from "../../services/api/learning-target";
import {
  Panel,
  QueryStatus,
  rows,
  useStudentAction,
  useStudentConnection,
  useStudentQuery,
} from "./shared";

export function LiveBookmark({ id, title }: { id: string; title: string }) {
  const { owner } = useStudentConnection();
  return <BookmarkSession key={owner || "guest"} id={id} title={title} />;
}
function BookmarkSession({ id, title }: { id: string; title: string }) {
  const { api, authenticated } = useStudentConnection(),
    { t } = useLocale(),
    action = useStudentAction();
  const [open, setOpen] = useState(false),
    [selected, setSelected] = useState("");
  const collections = useStudentQuery(
    "collections",
    (signal) => api.get_api_v1_library_collections({ signal }),
    "",
    authenticated && open,
  );
  return (
    <>
      <button
        type="button"
        className="save-button notebook-icon-button"
        aria-label={t({ en: `Save ${title}`, ar: `حفظ ${title}` })}
        onClick={() => setOpen(true)}
      >
        <Bookmark size={18} />
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t({ en: "Save to your library", ar: "حفظ في مكتبتك" })}
        description={title}
      >
        <Panel title={title}>
          {!authenticated ? (
            <AppLink href="/auth/sign-in">
              {t({ en: "Sign in to save", ar: "سجّل الدخول للحفظ" })}
            </AppLink>
          ) : (
            <>
              <QueryStatus query={collections} />
              <label>
                {t({ en: "Collection", ar: "المجموعة" })}
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                >
                  <option value="" />
                  {rows(collections.data).map((c) => (
                    <option key={string(c.id)} value={string(c.id)}>
                      {string(c.name)}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                disabled={!selected || action.busy}
                onClick={() =>
                  void action.run(
                    async () => {
                      const target = await resolveLearningTarget(
                        api,
                        id.split(":")[0],
                        title,
                      );
                      return api.post_api_v1_library_collections_by_id_items({
                        path: { id: selected },
                        body: {
                          itemType: target.contentType,
                          itemId: target.contentId,
                        },
                      });
                    },
                    () => setOpen(false),
                  )
                }
              >
                {t({ en: "Save", ar: "حفظ" })}
              </Button>
              <AppLink href="/my/library">
                {t({ en: "Manage collections", ar: "إدارة المجموعات" })}
              </AppLink>
              {action.feedback}
            </>
          )}
        </Panel>
      </Modal>
    </>
  );
}
