import {
  ActionReceipt,
  useActionReceipt,
} from "../../components/feedback/ActionReceipt";
import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import {
  flyDeletedRecord,
  useStudyHub,
  useHubQuery,
  useStudyError,
} from "./useStudyHub";
import { useAccess } from "../../admin/governance/useGovernance";
import { AppLink } from "../../components/navigation/AppLink";
import type { ClaimInput, PortfolioClaim } from "../../types/study-hub";
import { toast } from "sonner";
import { Plus, ShieldCheck, Pencil, Trash2, Download } from "lucide-react";
import { offerUndo } from "../../components/feedback/undo-action";
import "./study-hub.css";
const initial: ClaimInput = {
  title: "",
  description: "",
  kind: "activity",
  occurredAt: new Date().toISOString().slice(0, 10),
  evidenceUrl: "",
};
export default function PortfolioPage() {
  const feedback = useActionReceipt();
  const { t } = useLocale(),
    { owner, service, refresh } = useStudyHub(),
    errorText = useStudyError(),
    access = useAccess();
  const claims = useHubQuery("claims", (signal) =>
      service.listClaims({ signal }),
    ),
    share = useHubQuery("share", (signal) => service.getShare({ signal }));
  const canReview =
    access.data?.actorId === owner &&
    access.data?.capabilities.some(
      (c) => c === "events.manage" || c === "content.review",
    );
  const queue = useHubQuery(
    "claim-queue",
    (signal) =>
      canReview ? service.reviewQueue({ signal }) : Promise.resolve([]),
    String(canReview),
  );
  const [editing, setEditing] = useState<PortfolioClaim | null | undefined>(
      undefined,
    ),
    [draft, setDraft] = useState<ClaimInput>(initial),
    [busy, setBusy] = useState(false),
    [review, setReview] = useState<{ id: string; note: string } | null>(null),
    [consent, setConsent] = useState(false);
  async function action(fn: () => Promise<unknown>) {
    setBusy(true);
    try {
      await fn();
      await refresh();
      feedback.flash("saved");
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  function edit(c: PortfolioClaim | null) {
    setEditing(c);
    setDraft(
      c
        ? {
            title: c.title,
            description: c.description,
            kind: c.kind,
            occurredAt: c.occurredAt,
            hours: c.hours,
            evidenceUrl: c.evidenceUrl,
          }
        : { ...initial },
    );
  }
  const verified = (claims.data || []).filter((c) => c.status === "verified");
  function exportRecords() {
    const payload = {
      source: service.source,
      exportedAt: new Date().toISOString(),
      records: verified,
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "MedClub-verified-portfolio.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <main className="container study-hub">
      <header className="study-hub-heading">
        <span className="study-hub-action-receipt">
          <ActionReceipt receipt={feedback.receipt} />
        </span>
        <AppLink href="/my/study" className="text-link">
          ← {t({ en: "Study desk", ar: "مكتب الدراسة" })}
        </AppLink>
        <h1 data-page-heading tabIndex={-1}>
          {t({ en: "Your campus portfolio", ar: "ملف إنجازاتك الجامعي" })}
        </h1>
        <p>
          {t({
            en: "Keep the evidence. Ask an authorized reviewer to verify it. Share only the verified record.",
            ar: "احتفظ بالدليل واطلب اعتماد الإنجاز من مراجع مخول. شارك السجل المعتمد فقط.",
          })}
        </p>
        {service.source === "device-preview" && (
          <p className="study-source-note">
            {t({
              en: "Local preview attestations are not institutional certificates. Public sharing across devices requires the backend.",
              ar: "اعتماد المعاينة ليس شهادة مؤسسية. المشاركة بين الأجهزة تحتاج الخدمة الخلفية.",
            })}
          </p>
        )}
      </header>
      <div className="study-metrics">
        <span>
          <b>{claims.data?.length || 0}</b>
          {t({ en: "Claims", ar: "الإنجازات" })}
        </span>
        <span>
          <b>{verified.length}</b>
          {t({ en: "Verified", ar: "المعتمدة" })}
        </span>
        <span>
          <b>
            {verified.reduce(
              (sum, c) => sum + (c.kind === "volunteering" ? c.hours || 0 : 0),
              0,
            )}
          </b>
          {t({ en: "Verified volunteer hours", ar: "ساعات التطوع المعتمدة" })}
        </span>
      </div>
      <div className="study-hub-actions">
        <button className="button button-primary" onClick={() => edit(null)}>
          <Plus size={18} />
          {t({ en: "Add achievement", ar: "أضف إنجازاً" })}
        </button>
        <button
          className="button"
          disabled={!verified.length}
          onClick={exportRecords}
        >
          <Download size={17} />
          {t({ en: "Export verified record", ar: "تصدير السجل المعتمد" })}
        </button>
      </div>
      {claims.isPending ? (
        <p role="status">
          {t({ en: "Loading portfolio…", ar: "جار تحميل الملف…" })}
        </p>
      ) : claims.isError ? (
        <button onClick={() => void claims.refetch()}>
          {t({ en: "Retry", ar: "حاول مجدداً" })}
        </button>
      ) : (
        <div className="portfolio-grid">
          {claims.data?.map((c) => (
            <article
              className="portfolio-record"
              data-claim-id={c.id}
              key={c.id}
              data-status={c.status}
            >
              <header>
                <ShieldCheck size={22} />
                <span className="study-status">
                  {t(
                    {
                      draft: { en: "Draft", ar: "مسودة" },
                      pending: {
                        en: "Awaiting review",
                        ar: "بانتظار المراجعة",
                      },
                      verified: { en: "Verified", ar: "معتمد" },
                      rejected: { en: "Needs revision", ar: "يحتاج تعديلاً" },
                      revoked: {
                        en: "Verification revoked",
                        ar: "أُلغي الاعتماد",
                      },
                    }[c.status],
                  )}
                </span>
              </header>
              <h2>{c.title}</h2>
              <p>{c.description}</p>
              <small>
                {c.occurredAt}
                {c.hours !== undefined
                  ? " · " + c.hours + " " + t({ en: "hours", ar: "ساعة" })
                  : ""}
              </small>
              <a href={c.evidenceUrl} target="_blank" rel="noopener noreferrer">
                {t({ en: "Evidence", ar: "الدليل" })} ↗
              </a>
              {c.review && (
                <p className="study-source-note">
                  {c.review.note} · {new Date(c.review.at).toLocaleDateString()}
                </p>
              )}
              <footer>
                {["draft", "rejected"].includes(c.status) && (
                  <>
                    <button onClick={() => edit(c)}>
                      <Pencil size={16} />
                      {t({ en: "Edit", ar: "تعديل" })}
                    </button>
                    <button
                      disabled={busy}
                      onClick={() =>
                        void action(async () => {
                          await service.submitClaim(c.id, c.version);
                          toast.success(
                            t({
                              en: "Sent for verification",
                              ar: "أُرسل للاعتماد",
                            }),
                          );
                        })
                      }
                    >
                      {t({ en: "Request verification", ar: "طلب الاعتماد" })}
                    </button>
                  </>
                )}
                {c.status !== "verified" && (
                  <button
                    aria-label={t({
                      en: "Delete achievement",
                      ar: "حذف الإنجاز",
                    })}
                    disabled={busy}
                    onClick={() =>
                      void action(async () => {
                        await service.deleteClaim(c.id, c.version);
                        flyDeletedRecord("data-claim-id", c.id, c.title);
                        offerUndo({
                          message: t({
                            en: "Achievement removed",
                            ar: "حُذف الإنجاز",
                          }),
                          label: t({ en: "Undo", ar: "تراجع" }),
                          restored: t({
                            en: "Achievement restored",
                            ar: "استعيد الإنجاز",
                          }),
                          failed: t({
                            en: "Could not restore achievement",
                            ar: "تعذرت الاستعادة",
                          }),
                          undo: async () => {
                            await service.restoreClaim(c);
                            await refresh();
                          },
                        });
                      })
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </footer>
            </article>
          ))}
        </div>
      )}
      {editing !== undefined && (
        <section className="study-editor">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void action(async () => {
                const before = editing;
                const saved = await service.saveClaim(
                  draft,
                  editing
                    ? { id: editing.id, version: editing.version }
                    : undefined,
                );
                setEditing(undefined);
                if (before)
                  offerUndo({
                    message: t({
                      en: "Achievement updated",
                      ar: "حُدث الإنجاز",
                    }),
                    label: t({ en: "Undo", ar: "تراجع" }),
                    restored: t({
                      en: "Previous details restored",
                      ar: "استعيدت التفاصيل",
                    }),
                    failed: t({
                      en: "This claim changed; reload it.",
                      ar: "تغير الإنجاز؛ أعد تحميله.",
                    }),
                    undo: async () => {
                      await service.saveClaim(before, {
                        id: saved.id,
                        version: saved.version,
                      });
                      await refresh();
                    },
                  });
                else
                  toast.success(t({ en: "Draft saved", ar: "حُفظت المسودة" }));
              });
            }}
          >
            <h2>{t({ en: "Document your achievement", ar: "وثق إنجازك" })}</h2>
            <label>
              {t({ en: "Type", ar: "النوع" })}
              <select
                value={draft.kind}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    kind: e.target.value as ClaimInput["kind"],
                  })
                }
              >
                {(
                  [
                    "activity",
                    "publication",
                    "leadership",
                    "volunteering",
                  ] as const
                ).map((k, i) => (
                  <option key={k} value={k}>
                    {t(
                      [
                        { en: "Activity", ar: "نشاط" },
                        { en: "Publication", ar: "منشور" },
                        { en: "Leadership", ar: "قيادة" },
                        { en: "Volunteering", ar: "تطوع" },
                      ][i],
                    )}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t({ en: "Title", ar: "العنوان" })}
              <input
                required
                minLength={3}
                maxLength={160}
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </label>
            <label>
              {t({ en: "Description", ar: "الوصف" })}
              <textarea
                required
                maxLength={2000}
                value={draft.description}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value })
                }
              />
            </label>
            <label>
              {t({ en: "Date", ar: "التاريخ" })}
              <input
                required
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                value={draft.occurredAt}
                onChange={(e) =>
                  setDraft({ ...draft, occurredAt: e.target.value })
                }
              />
            </label>
            {draft.kind === "volunteering" && (
              <label>
                {t({ en: "Volunteer hours", ar: "ساعات التطوع" })}
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  max="10000"
                  required
                  value={draft.hours ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, hours: Number(e.target.value) })
                  }
                />
              </label>
            )}
            <label>
              {t({ en: "Evidence link (HTTPS)", ar: "رابط الدليل (HTTPS)" })}
              <input
                type="url"
                required
                value={draft.evidenceUrl}
                onChange={(e) =>
                  setDraft({ ...draft, evidenceUrl: e.target.value })
                }
              />
            </label>
            <small>
              {t({
                en: "Use a record you have permission to share. Do not include patient information.",
                ar: "استخدم سجلاً لديك إذن بمشاركته ولا تضمن بيانات مرضى.",
              })}
            </small>
            <div>
              <button disabled={busy} className="button button-primary">
                {t({ en: "Save draft", ar: "حفظ المسودة" })}
              </button>
              <button
                type="button"
                className="button"
                onClick={() => setEditing(undefined)}
              >
                {t({ en: "Cancel", ar: "إلغاء" })}
              </button>
            </div>
          </form>
        </section>
      )}
      <section className="study-editor">
        <h2>
          {t({ en: "Share a verified profile", ar: "شارك ملفاً معتمداً" })}
        </h2>
        <p>
          {t({
            en: "Sharing is off by default. Private notes, pending claims, and evidence links never appear in the public profile.",
            ar: "المشاركة مغلقة افتراضياً. لا تظهر الملاحظات الخاصة والطلبات قيد المراجعة وروابط الأدلة في الملف العام.",
          })}
        </p>
        {!share.data?.enabled && (
          <label className="study-consent">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            {t({
              en: "I agree to share my name and verified achievements.",
              ar: "أوافق على مشاركة اسمي وإنجازاتي المعتمدة.",
            })}
          </label>
        )}
        <button
          className="button"
          disabled={busy || (!share.data?.enabled && !consent)}
          onClick={() =>
            void action(async () => {
              await service.setShare(!share.data?.enabled);
              toast.success(
                t({
                  en: "Sharing preference updated",
                  ar: "حُدث تفضيل المشاركة",
                }),
              );
            })
          }
        >
          {t(
            share.data?.enabled
              ? { en: "Revoke shared link", ar: "إلغاء رابط المشاركة" }
              : { en: "Create shared link", ar: "إنشاء رابط مشاركة" },
          )}
        </button>
        {share.data?.enabled && share.data.token && (
          <AppLink
            className="text-link"
            href={"/portfolio/" + share.data.token}
          >
            {t({ en: "Preview shared portfolio", ar: "معاينة الملف المشترك" })}{" "}
            ↗
          </AppLink>
        )}
      </section>
      {canReview && (
        <section className="study-editor">
          <h2>{t({ en: "Verification desk", ar: "مكتب الاعتماد" })}</h2>
          <p>
            {t({
              en: "Review only records within your permissions. You cannot verify your own achievement.",
              ar: "راجع ما يقع ضمن صلاحياتك. لا يمكنك اعتماد إنجازك.",
            })}
          </p>
          {queue.isError ? (
            <button onClick={() => void queue.refetch()}>
              {t({ en: "Reload queue", ar: "أعد تحميل الطلبات" })}
            </button>
          ) : (
            queue.data?.map((c) => (
              <article className="review-record" key={c.id}>
                <h3>{c.title}</h3>
                <p>{c.description}</p>
                <a
                  href={c.evidenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t({ en: "Inspect evidence", ar: "فحص الدليل" })} ↗
                </a>
                <button onClick={() => setReview({ id: c.id, note: "" })}>
                  {t({ en: "Review", ar: "راجع" })}
                </button>
                {review?.id === c.id && (
                  <>
                    <label>
                      {t({ en: "Review explanation", ar: "سبب القرار" })}
                      <textarea
                        minLength={3}
                        maxLength={1000}
                        value={review.note}
                        onChange={(e) =>
                          setReview({ ...review, note: e.target.value })
                        }
                      />
                    </label>
                    {c.status === "verified" ? (
                      <button
                        disabled={busy || review.note.trim().length < 3}
                        onClick={() =>
                          void action(async () => {
                            await service.revokeClaim(
                              c.id,
                              c.version,
                              review.note,
                            );
                            setReview(null);
                            toast.success(
                              t({
                                en: "Verification revoked",
                                ar: "أُلغي الاعتماد",
                              }),
                            );
                          })
                        }
                      >
                        {t({ en: "Revoke verification", ar: "إلغاء الاعتماد" })}
                      </button>
                    ) : (
                      (["verified", "rejected"] as const).map((decision, i) => (
                        <button
                          key={decision}
                          disabled={busy || review.note.trim().length < 3}
                          onClick={() =>
                            void action(async () => {
                              await service.reviewClaim(
                                c.id,
                                c.version,
                                decision,
                                review.note,
                              );
                              setReview(null);
                              toast.success(
                                t({
                                  en: "Decision recorded",
                                  ar: "سُجل القرار",
                                }),
                              );
                            })
                          }
                        >
                          {t(
                            [
                              { en: "Verify", ar: "اعتماد" },
                              { en: "Request revision", ar: "طلب تعديل" },
                            ][i],
                          )}
                        </button>
                      ))
                    )}
                  </>
                )}
              </article>
            ))
          )}
        </section>
      )}
    </main>
  );
}
