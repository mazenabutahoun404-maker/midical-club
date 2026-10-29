import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { AppLink } from "../../components/navigation/AppLink";
import { MentorshipNavigation } from "../../components/navigation/MentorshipNavigation";
import { HeroArtwork } from "../../components/data-display/HeroArtwork";
import {
  useMembershipConnection,
  useMembershipQuery,
  useMembershipAction,
  Panel,
  QueryStatus,
  Pager,
  Empty,
} from "./shared";
import {
  Facts,
  Table,
  Localized,
  SectionHeading,
  EditDialog,
  AnswersForm,
  type Edit,
} from "./UI";
import { record, string, array } from "../../services/api/mapping";
import type { Question } from "./model";
import "../../styles/membership-connect.css";
export function MentorshipDirectory() {
  const { api, owner } = useMembershipConnection(),
    { t, locale } = useLocale(),
    [params] = useSearchParams(),
    [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    [area, setArea] = useState(""),
    [id, setId] = useState(params.get("mentor") || "");
  const q = useMembershipQuery(
      "mentors",
      (signal) =>
        api.get_api_v1_mentors({
          query: {
            Page: page,
            PageSize: 20,
            Search: search || undefined,
            AreaId: area || undefined,
          },
          signal,
        }),
      [page, search, area],
    ),
    areas = useMembershipQuery("areas", (signal) =>
      api.get_api_v1_mentorship_areas({ signal }),
    );
  return (
    <div className="container mentorship-v6 membership-connected">
      <MentorshipNavigation />
      <header className="mentorship-hero artwork-scene">
        <SectionHeading
          title={t({ en: "Find a mentor", ar: "ابحث عن مرشد" })}
          body={t({
            en: "Choose an area, review a mentor and request an available session.",
            ar: "اختر مجالاً وراجع ملف المرشد ثم اطلب جلسة متاحة.",
          })}
        />
        <HeroArtwork section="mentorship" />
      </header>
      <div className="membership-toolbar">
        <label>
          {t({ en: "Search mentors", ar: "البحث عن المرشدين" })}
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </label>
        <label>
          {t({ en: "Area", ar: "المجال" })}
          <select
            value={area}
            onChange={(e) => {
              setPage(1);
              setArea(e.target.value);
            }}
          >
            <option value="">
              {t({ en: "All areas", ar: "كل المجالات" })}
            </option>
            {areas.data?.map((v) => (
              <option key={v.id} value={v.id}>
                {(locale === "ar" ? v.nameAr : v.nameEn) || v.nameAr}
              </option>
            ))}
          </select>
        </label>
      </div>
      <QueryStatus query={areas} />
      <QueryStatus query={q} />
      {q.data && (
        <>
          <div className="membership-grid">
            {q.data.items.map((row) => (
              <article key={row.id} className="membership-card">
                <h3>{row.displayNameSnapshot}</h3>
                <p>
                  <Localized row={row} field="specialty" />
                </p>
                <p>
                  <Localized row={row} field="bio" />
                </p>
                <Facts
                  value={{
                    activeMentees: row.activeMentees,
                    capacity: row.defaultCapacity,
                  }}
                />
                <Button variant="outline" onClick={() => setId(row.id)}>
                  {t({
                    en: "Review mentor and times",
                    ar: "مراجعة المرشد والمواعيد",
                  })}
                </Button>
              </article>
            ))}
          </div>
          <Empty items={q.data.items} />
          <Pager page={page} total={q.data.totalItems} onChange={setPage} />
        </>
      )}
      {id && (
        <MentorDetails
          key={id}
          id={id}
          signedIn={!!owner}
          onClose={() => setId("")}
        />
      )}
    </div>
  );
}
function MentorDetails({
  id,
  signedIn,
  onClose,
}: {
  id: string;
  signedIn: boolean;
  onClose: () => void;
}) {
  const { api } = useMembershipConnection(),
    { t } = useLocale(),
    [page, setPage] = useState(1),
    [slot, setSlot] = useState<Record<string, unknown> | null>(null),
    [message, setMessage] = useState(""),
    action = useMembershipAction(),
    q = useMembershipQuery(
      "mentor-detail",
      (signal) => api.get_api_v1_mentors_by_id({ path: { id }, signal }),
      id,
    ),
    slots = useMembershipQuery(
      "mentor-availability",
      (signal) =>
        api.get_api_v1_mentors_by_id_availability({
          path: { id },
          query: { Page: page, PageSize: 20 },
          signal,
        }),
      [id, page],
    );
  return (
    <Panel
      title={
        q.data?.displayNameSnapshot ||
        t({ en: "Mentor details", ar: "تفاصيل المرشد" })
      }
    >
      <Button variant="ghost" onClick={onClose}>
        {t({ en: "Close details", ar: "إغلاق التفاصيل" })}
      </Button>
      <QueryStatus query={q} />
      {q.data && (
        <>
          <p>
            <Localized row={q.data} field="bio" />
          </p>
          <Facts
            value={{
              supportsIndividual: q.data.supportsIndividual,
              supportsGroup: q.data.supportsGroup,
              supportsOnline: q.data.supportsOnline,
              supportsInPerson: q.data.supportsInPerson,
            }}
          />
          <h3>{t({ en: "Available times", ar: "المواعيد المتاحة" })}</h3>
          <QueryStatus query={slots} />
          {slots.data && (
            <>
              <div className="membership-grid">
                {slots.data.items.map((row) => (
                  <article key={row.id} className="membership-card">
                    <Facts value={row} />
                    {signedIn ? (
                      <Button
                        disabled={
                          row.available <= 0 || !q.data.supportsIndividual
                        }
                        onClick={() => {
                          setSlot(row);
                          setMessage("");
                        }}
                      >
                        {t({ en: "Request this time", ar: "طلب هذا الموعد" })}
                      </Button>
                    ) : (
                      <AppLink href="/auth/sign-in">
                        {t({
                          en: "Sign in to request",
                          ar: "سجل الدخول لطلب جلسة",
                        })}
                      </AppLink>
                    )}
                  </article>
                ))}
              </div>
              <Pager
                page={page}
                total={slots.data.totalItems}
                onChange={setPage}
              />
            </>
          )}
          {slot && (
            <AnswersForm
              title={t({
                en: "Send mentorship request",
                ar: "إرسال طلب الإرشاد",
              })}
              questions={q.data.questions as Question[]}
              onClose={() => setSlot(null)}
              busy={action.busy}
              feedback={action.feedback}
              onSubmit={(answers) =>
                action.run(
                  () =>
                    api.post_api_v1_mentorship_requests({
                      body: {
                        slotId: string(slot.id),
                        studentMessage: message || null,
                        answers,
                      },
                    }),
                  () => setSlot(null),
                  t({ en: "Request submitted", ar: "تم إرسال الطلب" }),
                )
              }
            >
              <Facts
                value={{
                  startsAt: slot.startsAt,
                  endsAt: slot.endsAt,
                  mode: slot.mode,
                }}
              />
              <label>
                {t({ en: "Message to the mentor", ar: "رسالة إلى المرشد" })}
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </label>
            </AnswersForm>
          )}
        </>
      )}
      {!slot && action.feedback}
    </Panel>
  );
}
export function GroupSessions() {
  const { api, owner } = useMembershipConnection(),
    { t } = useLocale(),
    [page, setPage] = useState(1),
    [myPage, setMyPage] = useState(1),
    [edit, setEdit] = useState<Edit | null>(null),
    q = useMembershipQuery(
      "group-sessions",
      (signal) =>
        api.get_api_v1_mentorship_group_sessions({
          query: { Page: page, PageSize: 20 },
          signal,
        }),
      page,
    ),
    mine = useMembershipQuery(
      "group-registrations",
      (signal) =>
        api.get_api_v1_mentorship_group_sessions_my({
          query: { Page: myPage, PageSize: 20 },
          signal,
        }),
      myPage,
      !!owner,
      true,
    );
  return (
    <div className="container mentorship-v6 membership-connected">
      <MentorshipNavigation />
      <SectionHeading
        title={t({ en: "Group sessions", ar: "الجلسات الجماعية" })}
      />
      <QueryStatus query={q} />
      {q.data && (
        <>
          <div className="membership-grid">
            {q.data.items.map((row) => (
              <article className="membership-card" key={row.id}>
                <h3>
                  <Localized row={row} field="title" />
                </h3>
                <p>{row.mentorName}</p>
                <p>
                  <Localized row={row} field="summary" />
                </p>
                <Facts
                  value={{
                    startsAt: row.startsAt,
                    endsAt: row.endsAt,
                    mode: row.mode,
                    capacity: row.capacity,
                    registeredCount: row.registeredCount,
                  }}
                />
                {owner ? (
                  <Button
                    disabled={
                      typeof row.registeredCount !== "number" ||
                      typeof row.capacity !== "number" ||
                      row.registeredCount >= row.capacity
                    }
                    onClick={() =>
                      setEdit({
                        operation:
                          "post_api_v1_mentorship_group_sessions_by_slotId_register",
                        title: t({
                          en: "Register for group session",
                          ar: "التسجيل في الجلسة الجماعية",
                        }),
                        path: { slotId: row.id },
                        initial: { version: row.version },
                        hiddenFields: [
                          "revisionId",
                          "reviewerId",
                          "status",
                          "feedback",
                          "internalNotes",
                        ],
                        description: t({
                          en: "Review the session time and capacity. The server checks your eligibility.",
                          ar: "راجع موعد الجلسة وسعتها. يتحقق الخادم من أهليتك.",
                        }),
                      })
                    }
                  >
                    {t({ en: "Review registration", ar: "مراجعة التسجيل" })}
                  </Button>
                ) : (
                  <AppLink href="/auth/sign-in">
                    {t({ en: "Sign in to register", ar: "سجل الدخول للتسجيل" })}
                  </AppLink>
                )}
              </article>
            ))}
          </div>
          <Empty items={q.data.items} />
          <Pager page={page} total={q.data.totalItems} onChange={setPage} />
        </>
      )}
      {owner && (
        <Panel
          title={t({ en: "My group registrations", ar: "تسجيلاتي الجماعية" })}
        >
          <QueryStatus query={mine} />
          {mine.data && (
            <>
              {mine.data.items.map((row) => (
                <article key={row.id} className="membership-card">
                  <Facts value={row} />
                  {!row.cancelledAt && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        setEdit({
                          operation:
                            "post_api_v1_mentorship_group_sessions_by_slotId_cancel",
                          title: t({
                            en: "Cancel group registration",
                            ar: "إلغاء التسجيل الجماعي",
                          }),
                          path: { slotId: string(row.sessionId) },
                          initial: { version: row.version },
                          hiddenFields: [
                            "revisionId",
                            "reviewerId",
                            "status",
                            "feedback",
                            "internalNotes",
                          ],
                          description: t({
                            en: "Uses this registration’s version, not the public slot version.",
                            ar: "يستخدم نسخة هذا التسجيل، وليس نسخة الموعد العام.",
                          }),
                        })
                      }
                    >
                      {t({ en: "Review cancellation", ar: "مراجعة الإلغاء" })}
                    </Button>
                  )}
                </article>
              ))}
              <Pager
                page={myPage}
                total={mine.data.totalItems}
                onChange={setMyPage}
              />
            </>
          )}
        </Panel>
      )}
      {edit && <EditDialog edit={edit} onClose={() => setEdit(null)} />}
    </div>
  );
}
export function PublicQA() {
  const { api } = useMembershipConnection(),
    { t } = useLocale(),
    [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    q = useMembershipQuery(
      "public-qa",
      (signal) =>
        api.get_api_v1_mentorship_public_qa({
          query: { Page: page, PageSize: 20, Search: search || undefined },
          signal,
        }),
      [page, search],
    );
  return (
    <div className="container mentorship-v6 membership-connected">
      <MentorshipNavigation />
      <SectionHeading
        title={t({
          en: "Mentorship questions and answers",
          ar: "أسئلة وأجوبة الإرشاد",
        })}
      />
      <label>
        {t({ en: "Search questions", ar: "البحث في الأسئلة" })}
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </label>
      <QueryStatus query={q} />
      {q.data && (
        <>
          {q.data.items.map((row) => (
            <article className="membership-card" key={row.id}>
              <h3>
                <Localized row={row} field="question" />
              </h3>
              <p>
                <Localized row={row} field="answer" />
              </p>
              <p>{row.answererNameSnapshot}</p>
              <Facts
                value={{ category: row.category, publishedAt: row.publishedAt }}
              />
            </article>
          ))}
          <Empty items={q.data.items} />
          <Pager page={page} total={q.data.totalItems} onChange={setPage} />
        </>
      )}
    </div>
  );
}
