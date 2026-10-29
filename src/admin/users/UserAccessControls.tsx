import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useServices } from "../../app/providers/ServicesProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useAccess } from "../governance/useGovernance";
import { useBatches } from "../../hooks/useContent";
import type { GovernanceUser } from "../../types/governance";
import type { UserDetails } from "../../types/accounts";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import { ApiActionError } from "../../components/feedback/ApiActionError";
type Mode = "status" | "academic" | "verify" | "revoke" | "titles";
export function UserAccessControls({ user }: { user: GovernanceUser }) {
  const { accessAdmin } = useServices();
  const access = useAccess();
  const client = useQueryClient();
  const { t, label } = useLocale();
  const [mode, setMode] = useState<Mode | null>(null),
    [error, setError] = useState<unknown>(null),
    [busy, setBusy] = useState(false),
    [snapshot, setSnapshot] = useState<UserDetails | null>(null);
  const [reference, setReference] = useState(""),
    [status, setStatus] = useState("Active"),
    [batchId, setBatch] = useState(""),
    [year, setYear] = useState(1),
    [gender, setGender] = useState(""),
    [studentNumber, setNumber] = useState(""),
    [approved, setApproved] = useState(true),
    [titleIds, setTitleIds] = useState<string[]>([]),
    [replaceTitles, setReplaceTitles] = useState(false);
  const batches = useBatches();
  const titles = useQuery({
    queryKey: ["access-admin", "titles"],
    queryFn: accessAdmin?.titles.list || (async () => []),
    enabled: mode === "titles",
  });
  useEffect(() => {
    setMode(null);
    setSnapshot(null);
    setError(null);
    setReference("");
  }, [user.id]);
  if (!accessAdmin) return null;
  const can = (name: string) => !!access.data?.permissions?.includes(name);
  const open = async (next: Mode) => {
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const value = await accessAdmin.getUser(user.id);
      setSnapshot(value);
      setStatus(value.accountStatus || "Active");
      setBatch(value.batchId || "");
      setYear(value.studyYear || 1);
      setGender(value.gender || "");
      setNumber(value.studentNumber || "");
      setTitleIds(user.symbolicTitleIds || []);
      setReplaceTitles(false);
      setReference("");
      setMode(next);
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(false);
    }
  };
  const title = (
    {
      status: t({ en: "Account status", ar: "حالة الحساب" }),
      academic: t({ en: "Academic identity", ar: "الهوية الأكاديمية" }),
      verify: t({ en: "Student verification", ar: "التحقق من الطالب" }),
      revoke: t({ en: "Revoke all sessions", ar: "إلغاء كل الجلسات" }),
      titles: t({ en: "Symbolic titles", ar: "الألقاب الرمزية" }),
    } as const
  )[mode || "status"];
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!snapshot || !mode || busy) return;
    if (mode === "titles" && !replaceTitles) return;
    setBusy(true);
    setError(null);
    try {
      if (mode === "status")
        await accessAdmin.updateStatus(
          user.id,
          status as NonNullable<UserDetails["accountStatus"]>,
          snapshot.version,
        );
      if (mode === "academic")
        await accessAdmin.updateAcademicProfile(user.id, {
          version: snapshot.version,
          batchId,
          studyYear: year,
          gender: gender as "Male" | "Female",
          studentNumber,
          reason: reference,
        });
      if (mode === "verify")
        await accessAdmin.verifyStudent(user.id, approved, reference);
      if (mode === "revoke")
        await accessAdmin.revokeSessions(user.id, reference);
      if (mode === "titles" && replaceTitles)
        await accessAdmin.setUserTitles(user.id, titleIds, snapshot.version);
      setMode(null);
      setSnapshot(null);
      setReference("");
      await client.invalidateQueries({ queryKey: ["governance"] });
      toast.success(t({ en: "Account updated", ar: "تم تحديث الحساب" }));
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="access-management-card">
      <h3>{t({ en: "Account actions", ar: "إجراءات الحساب" })}</h3>
      <div className="account-security-actions">
        {can("users.status.manage") && !user.isFounder && (
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => void open("status")}
          >
            {t({ en: "Change status", ar: "تغيير الحالة" })}
          </Button>
        )}
        {can("users.manage") && (
          <>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void open("academic")}
            >
              {t({
                en: "Edit academic identity",
                ar: "تعديل الهوية الأكاديمية",
              })}
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void open("verify")}
            >
              {t({ en: "Verify student", ar: "التحقق من الطالب" })}
            </Button>
          </>
        )}
        {can("users.status.manage") && (
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => void open("revoke")}
          >
            {t({ en: "Revoke sessions", ar: "إلغاء الجلسات" })}
          </Button>
        )}
        {can("titles.manage") && (
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => void open("titles")}
          >
            {t({ en: "Edit titles", ar: "تعديل الألقاب" })}
          </Button>
        )}
      </div>
      {!mode && <ApiActionError error={error} />}
      <Modal
        open={!!mode}
        onClose={() => {
          if (!busy) {
            setMode(null);
            setError(null);
            setSnapshot(null);
            setReference("");
          }
        }}
        title={title}
        description={t(user.name)}
      >
        <form className="account-api-form" onSubmit={submit}>
          {mode === "status" && (
            <label>
              {t({ en: "Status", ar: "الحالة" })}
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                disabled={busy}
              >
                {[
                  "PendingEmailVerification",
                  "Active",
                  "Disabled",
                  "InvitationPending",
                ].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          )}
          {mode === "academic" && (
            <>
              <label>
                {label("batch")}
                <select
                  value={batchId}
                  onChange={(event) => setBatch(event.target.value)}
                  disabled={busy || batches.isPending}
                  required
                >
                  {!batches.data?.some((batch) => batch.id === batchId) && (
                    <option value={batchId}>{batchId || "—"}</option>
                  )}
                  {batches.data?.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {t(batch.name)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {label("studyYear")}
                <select
                  value={year}
                  onChange={(event) => setYear(Number(event.target.value))}
                  disabled={busy}
                >
                  {[1, 2, 3, 4, 5, 6].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t({ en: "Gender", ar: "الجنس" })}
                <select
                  value={gender}
                  onChange={(event) => setGender(event.target.value)}
                  disabled={busy}
                  required
                >
                  <option value="">—</option>
                  <option value="Male">{t({ en: "Male", ar: "ذكر" })}</option>
                  <option value="Female">
                    {t({ en: "Female", ar: "أنثى" })}
                  </option>
                </select>
              </label>
              <label>
                {t({ en: "University number", ar: "الرقم الجامعي" })}
                <input
                  value={studentNumber}
                  onChange={(event) => setNumber(event.target.value)}
                  disabled={busy}
                  required
                />
              </label>
            </>
          )}
          {mode === "verify" && (
            <>
              <p>
                {t({
                  en: "Record the reference of an independently checked student record. Email ownership alone is insufficient.",
                  ar: "سجّل مرجع سجل الطالب الذي تم التحقق منه بشكل مستقل. ملكية البريد وحدها لا تكفي.",
                })}
              </p>
              <label>
                {t({ en: "Decision", ar: "القرار" })}
                <select
                  value={approved ? "approved" : "rejected"}
                  onChange={(event) =>
                    setApproved(event.target.value === "approved")
                  }
                  disabled={busy}
                >
                  <option value="approved">
                    {t({ en: "Approve eligibility", ar: "اعتماد الأهلية" })}
                  </option>
                  <option value="rejected">
                    {t({ en: "Reject eligibility", ar: "رفض الأهلية" })}
                  </option>
                </select>
              </label>
            </>
          )}
          {mode === "revoke" && (
            <p>
              {t({
                en: "This signs the user out of every session and invalidates recovery grants.",
                ar: "سيتم إخراج المستخدم من كل الجلسات وإبطال منح الاسترداد.",
              })}
            </p>
          )}
          {["academic", "verify", "revoke"].includes(mode || "") && (
            <label>
              {mode === "academic"
                ? t({ en: "Reason", ar: "السبب" })
                : t({
                    en: "Evidence / incident reference",
                    ar: "مرجع التحقق أو الحادثة",
                  })}
              <textarea
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                required
                disabled={busy}
                rows={3}
              />
            </label>
          )}
          {mode === "titles" && (
            <>
              <p>
                {t({
                  en: "Choose the complete set of titles. This replaces all current title assignments and does not grant permissions.",
                  ar: "اختر المجموعة الكاملة من الألقاب. سيستبدل هذا كل الألقاب الحالية دون منح صلاحيات.",
                })}
              </p>
              {titles.isError ? (
                <ApiActionError error={titles.error} />
              ) : (
                <div className="access-permission-grid">
                  {titles.data?.map((item) => (
                    <label key={item.id}>
                      <input
                        type="checkbox"
                        checked={titleIds.includes(item.id)}
                        onChange={(event) =>
                          setTitleIds((current) =>
                            event.target.checked
                              ? [...current, item.id]
                              : current.filter((id) => id !== item.id),
                          )
                        }
                        disabled={busy}
                      />
                      {item.name}
                    </label>
                  ))}
                </div>
              )}
              <label>
                <span>
                  <input
                    type="checkbox"
                    checked={replaceTitles}
                    onChange={(event) => setReplaceTitles(event.target.checked)}
                  />{" "}
                  {t({
                    en: "Replace all assigned titles with this selection",
                    ar: "استبدال كل الألقاب المعيّنة بهذا الاختيار",
                  })}
                </span>
              </label>
            </>
          )}
          <ApiActionError
            error={error}
            onReload={() => {
              setMode(null);
              setError(null);
              void client.invalidateQueries({ queryKey: ["governance"] });
            }}
          />
          <Button
            type="submit"
            disabled={
              busy ||
              (mode === "titles" &&
                (!replaceTitles || titles.isError || titles.isPending))
            }
          >
            {label("saveProfile")}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
