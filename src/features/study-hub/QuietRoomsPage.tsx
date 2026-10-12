import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useStudyHub, useHubQuery, useStudyError } from "./useStudyHub";
import type { RoomInput, QuietRoom } from "../../types/study-hub";
import { toast } from "sonner";
import { Modal } from "../../components/ui/Modal";
import "./study-rooms.css";
import { AppLink } from "../../components/navigation/AppLink";
import { UsersRound, Copy, LogOut, Play, Leaf } from "lucide-react";
import "./study-hub.css";
function RoomClock({ room }: { room: QuietRoom }) {
  const { t } = useLocale();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const sync = () => {
      clearInterval(timer);
      setNow(Date.now());
      if (!document.hidden) timer = setInterval(() => setNow(Date.now()), 1000);
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  const seconds = Math.max(
    0,
    Math.ceil(
      (room.phase === "finished"
        ? 0
        : room.endsAt
          ? Date.parse(room.endsAt) - now
          : room.focusMinutes * 60000) / 1000,
    ),
  );
  const total =
    (room.phase === "rest" ? room.restMinutes : room.focusMinutes) * 60;
  return (
    <div
      className="room-clock"
      style={
        {
          "--room-progress":
            Math.max(0, Math.min(1, 1 - seconds / total)) * 360 + "deg",
        } as React.CSSProperties
      }
    >
      <small>
        {t(
          {
            waiting: {
              en: "Ready when you are",
              ar: "جاهزة عندما تكون جاهزاً",
            },
            focus: { en: "Quiet focus", ar: "تركيز هادئ" },
            rest: { en: "Take a breath", ar: "خذ استراحة" },
            finished: { en: "Session complete", ar: "اكتملت الجلسة" },
          }[room.phase],
        )}
      </small>
      <strong>
        {room.phase === "finished"
          ? "✓"
          : Math.floor(seconds / 60)
              .toString()
              .padStart(2, "0") +
            ":" +
            (seconds % 60).toString().padStart(2, "0")}
      </strong>
      <span>
        {t({
          en: "A shared clock. No chat, no camera.",
          ar: "مؤقت مشترك دون محادثة أو كاميرا.",
        })}
      </span>
    </div>
  );
}
export default function QuietRoomsPage() {
  const { t } = useLocale(),
    { owner, service, refresh } = useStudyHub(),
    errorText = useStudyError();
  const [params] = useSearchParams();
  const [code, setCode] = useState(params.get("invite") || ""),
    [goal, setGoal] = useState(""),
    [selected, setSelected] = useState<string | null>(null),
    [busy, setBusy] = useState(false);
  const [connection, setConnection] = useState("connecting");
  const [leaveConfirm, setLeaveConfirm] = useState(false);
  const [feedback, setFeedback] = useState(0);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const previousPhase = useRef<string | undefined>(undefined);
  useEffect(() => {
    setSelected(null);
    setConnection("connecting");
    setLeaveConfirm(false);
    setCode(params.get("invite") || "");
    setGoal("");
  }, [owner]);
  useEffect(() => () => clearTimeout(copyTimer.current), []);
  const [draft, setDraft] = useState<RoomInput>({
    title: "",
    capacity: 6,
    focusMinutes: 25,
    restMinutes: 5,
    goal: "",
  });
  const rooms = useHubQuery(
    "rooms",
    (signal) => service.listRooms({ signal }),
    "",
    selected ? 30000 : undefined,
  );
  const selectedRoom = useHubQuery(
    "room",
    (signal) => service.getRoom(selected!, { signal }),
    selected || "",
    5000,
    !!selected,
  );
  const room = selectedRoom.data;
  useEffect(() => {
    if (!room) return;
    const key = room.id + ":" + room.phase;
    if (
      previousPhase.current?.startsWith(room.id + ":") &&
      previousPhase.current !== key &&
      room.phase === "finished"
    )
      toast.success(
        t({
          en: "Study session complete. Your room is now closed.",
          ar: "اكتملت جلسة الدراسة وأُغلقت الغرفة.",
        }),
      );
    previousPhase.current = key;
  }, [room?.id, room?.phase]);
  useEffect(() => {
    if (!selected || room?.phase === "finished") return;
    let disposed = false,
      inFlight = false;
    setConnection("connecting");
    const heartbeat = async () => {
      if (document.hidden || inFlight) return;
      inFlight = true;
      try {
        await service.heartbeatRoom(selected);
        if (!disposed) {
          setConnection("connected");
          void selectedRoom.refetch();
        }
      } catch {
        if (!disposed) setConnection("reconnecting");
      } finally {
        inFlight = false;
      }
    };
    void heartbeat();
    const id = setInterval(() => void heartbeat(), 30000);
    document.addEventListener("visibilitychange", heartbeat);
    return () => {
      disposed = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", heartbeat);
    };
  }, [selected, owner, service, room?.phase === "finished"]);
  async function action(fn: () => Promise<unknown>) {
    setBusy(true);
    try {
      await fn();
      await refresh();
      setFeedback((value) => value + 1);
    } catch (e) {
      toast.error(errorText(e));
      void refresh();
    } finally {
      setBusy(false);
    }
  }
  async function copyInvite() {
    if (!room) return;
    try {
      const value =
        service.source === "api"
          ? location.origin +
            "/my/study/rooms?invite=" +
            encodeURIComponent(room.inviteCode)
          : room.inviteCode;
      await navigator.clipboard.writeText(value);
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 1600);
      toast.success(t({ en: "Invite copied", ar: "نُسخت الدعوة" }));
    } catch {
      toast.error(
        t({
          en: "Copy the displayed invite code.",
          ar: "انسخ رمز الدعوة الظاهر.",
        }),
      );
    }
  }
  async function leaveRoom() {
    if (!room) return;
    await action(async () => {
      await service.leaveRoom(room.id);
      setSelected(null);
      setLeaveConfirm(false);
      toast.success(t({ en: "Left the study room", ar: "غادرت غرفة الدراسة" }));
    });
  }
  return (
    <main className="container study-hub">
      <header className="study-hub-heading">
        <AppLink href="/my/study" className="text-link">
          ← {t({ en: "Study desk", ar: "مكتب الدراسة" })}
        </AppLink>
        <h1 data-page-heading tabIndex={-1}>
          {t({ en: "Study together", ar: "الدراسة معاً" })}
        </h1>
        <p>
          {t({
            en: "Invite real classmates with a code. Everyone sees the same focus and break schedule, each person’s goal, and their recent presence. No chat or camera.",
            ar: "ادعُ زملاءك برمز. يرى الجميع مؤقت التركيز والاستراحة نفسه وأهداف المشاركين وحضورهم الأخير، دون محادثة أو كاميرا.",
          })}
        </p>
        {service.source === "device-preview" && (
          <p className="study-source-note">
            {t({
              en: "Local preview: invites work only among accounts in this browser. Connect the API service for real campus rooms across devices.",
              ar: "معاينة محلية: الدعوات تعمل بين حسابات هذا المتصفح فقط. اربط الخدمة لغرف حقيقية بين الأجهزة.",
            })}
          </p>
        )}
      </header>
      {selected && (
        <button className="room-lobby-return" onClick={() => setSelected(null)}>
          {t({ en: "Back to room lobby", ar: "العودة إلى غرف الدراسة" })}
        </button>
      )}
      {selected && selectedRoom.isLoading && (
        <p role="status">
          {t({ en: "Opening your study room…", ar: "جارٍ فتح غرفة الدراسة…" })}
        </p>
      )}
      <div className="room-lobby" hidden={!!selected}>
        <section className="study-editor">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void action(async () => {
                const r = await service.createRoom(draft);
                setSelected(r.id);
                setDraft({ ...draft, title: "", goal: "" });
                toast.success(
                  t({
                    en: "Your quiet room is ready",
                    ar: "غرفتك الهادئة جاهزة",
                  }),
                );
              });
            }}
          >
            <h2>
              <UsersRound size={22} />
              {t({ en: "Open a room", ar: "افتح غرفة" })}
            </h2>
            <label>
              {t({ en: "Room name", ar: "اسم الغرفة" })}
              <input
                required
                minLength={3}
                maxLength={100}
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </label>
            <label>
              {t({ en: "Your study goal", ar: "هدف دراستك" })}
              <input
                required
                maxLength={140}
                value={draft.goal}
                onChange={(e) => setDraft({ ...draft, goal: e.target.value })}
              />
            </label>
            <div className="room-settings">
              <label>
                {t({ en: "Focus minutes", ar: "دقائق التركيز" })}
                <input
                  required
                  type="number"
                  min="1"
                  max="180"
                  value={draft.focusMinutes}
                  onChange={(e) =>
                    setDraft({ ...draft, focusMinutes: Number(e.target.value) })
                  }
                />
              </label>
              <label>
                {t({ en: "Rest minutes", ar: "دقائق الاستراحة" })}
                <input
                  required
                  type="number"
                  min="1"
                  max="60"
                  value={draft.restMinutes}
                  onChange={(e) =>
                    setDraft({ ...draft, restMinutes: Number(e.target.value) })
                  }
                />
              </label>
              <label>
                {t({ en: "Seats", ar: "المقاعد" })}
                <input
                  required
                  type="number"
                  min="2"
                  max="12"
                  value={draft.capacity}
                  onChange={(e) =>
                    setDraft({ ...draft, capacity: Number(e.target.value) })
                  }
                />
              </label>
            </div>
            <button className="button button-primary" disabled={busy}>
              {t({ en: "Create quiet room", ar: "إنشاء غرفة هادئة" })}
            </button>
          </form>
        </section>
        <section className="study-editor">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void action(async () => {
                const r = await service.joinRoom(code, goal);
                setSelected(r.id);
                setCode("");
                setGoal("");
                toast.success(
                  t({ en: "You have a seat", ar: "انضممت إلى الغرفة" }),
                );
              });
            }}
          >
            <h2>{t({ en: "Have an invite?", ar: "لديك دعوة؟" })}</h2>
            <label>
              {t({ en: "Invite code", ar: "رمز الدعوة" })}
              <input
                required
                minLength={8}
                maxLength={100}
                autoComplete="off"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </label>
            <label>
              {t({ en: "Your study goal", ar: "هدف دراستك" })}
              <input
                required
                maxLength={140}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </label>
            <button className="button" disabled={busy}>
              {t({ en: "Join quietly", ar: "انضم بهدوء" })}
            </button>
          </form>
        </section>
      </div>
      {rooms.isLoading && (
        <p role="status">
          {t({ en: "Finding your rooms…", ar: "جارٍ تحميل غرفك…" })}
        </p>
      )}
      {!rooms.isLoading && !rooms.isError && !rooms.data?.length && (
        <p className="room-empty">
          {t({
            en: "No rooms yet. Create a room or join with a classmate’s invite.",
            ar: "لا توجد غرف بعد. أنشئ غرفة أو انضم بدعوة زميل.",
          })}
        </p>
      )}
      {rooms.isError ? (
        <button onClick={() => void rooms.refetch()}>
          {t({ en: "Reconnect rooms", ar: "إعادة الاتصال بالغرف" })}
        </button>
      ) : (
        <div className="quiet-room-tabs">
          {rooms.data?.map((r) => (
            <button
              key={r.id}
              aria-pressed={selected === r.id}
              onClick={() => setSelected(r.id)}
            >
              {r.title}
              <small>
                {r.members.length}/{r.capacity}
              </small>
            </button>
          ))}
        </div>
      )}
      {selected && selectedRoom.isError && (
        <p role="alert" className="room-connection-error">
          {t({
            en: "This room could not be refreshed. Your timer may be out of date.",
            ar: "تعذر تحديث الغرفة. قد يكون المؤقت غير محدث.",
          })}{" "}
          <button onClick={() => void selectedRoom.refetch()}>
            {t({ en: "Retry", ar: "حاول مجدداً" })}
          </button>
        </p>
      )}
      {room && (
        <section
          className="quiet-room"
          key={room.id}
          data-phase={room.phase}
          data-feedback={feedback}
        >
          <header>
            <h2>{room.title}</h2>
            <button
              disabled={busy}
              onClick={() =>
                room.hostId === owner && room.phase !== "finished"
                  ? setLeaveConfirm(true)
                  : void leaveRoom()
              }
            >
              <LogOut size={18} />
              {t(
                room.hostId === owner && room.phase !== "finished"
                  ? { en: "End & leave", ar: "إنهاء ومغادرة" }
                  : { en: "Leave", ar: "غادر" },
              )}
            </button>
          </header>
          <div className="room-session-status" role="status">
            <span data-connection={connection}>
              {t(
                room.phase === "finished"
                  ? { en: "Session closed", ar: "الجلسة مغلقة" }
                  : connection === "connected"
                    ? { en: "Presence connected", ar: "الحضور متصل" }
                    : connection === "reconnecting"
                      ? {
                          en: "Reconnecting presence…",
                          ar: "إعادة اتصال الحضور…",
                        }
                      : {
                          en: "Connecting presence…",
                          ar: "جارٍ اتصال الحضور…",
                        },
              )}
            </span>
            <span>
              {room.members.length} / {room.capacity}{" "}
              {t({ en: "seats", ar: "مقاعد" })} · {room.focusMinutes}{" "}
              {t({ en: "min focus", ar: "دقيقة تركيز" })} / {room.restMinutes}{" "}
              {t({ en: "min break", ar: "دقيقة استراحة" })}
            </span>
          </div>
          <div
            className="room-action-flash"
            key={feedback}
            aria-hidden="true"
          />
          <RoomClock room={room} />
          <div className="room-seats">
            {room.members.map((m) => (
              <article
                key={m.userId}
                data-present={Date.now() - Date.parse(m.lastSeenAt) < 90000}
              >
                <span>{m.displayName.slice(0, 1)}</span>
                <strong>
                  {m.displayName}
                  {m.userId === room.hostId
                    ? " · " + t({ en: "Host", ar: "المضيف" })
                    : ""}
                </strong>
                <p>{m.goal}</p>
                <small>
                  {t(
                    Date.now() - Date.parse(m.lastSeenAt) < 90000
                      ? { en: "Here", ar: "حاضر" }
                      : { en: "Away", ar: "بعيد" },
                  )}
                </small>
              </article>
            ))}
            {Array.from(
              { length: Math.max(0, room.capacity - room.members.length) },
              (_, i) => (
                <div className="room-open-seat" key={"empty-" + i}>
                  <UsersRound size={24} aria-hidden="true" />
                  <strong>{t({ en: "Open seat", ar: "مقعد متاح" })}</strong>
                  <small>
                    {t({ en: "Invite a classmate", ar: "ادعُ زميلاً" })}
                  </small>
                </div>
              ),
            )}
          </div>
          {room.phase !== "finished" && room.hostId !== owner && (
            <p className="room-member-guidance">
              {t({
                en: "Your host controls the shared timer. Keep this room open to show your presence; the clock follows the session’s deadline.",
                ar: "يتحكم المضيف بالمؤقت المشترك. أبقِ الغرفة مفتوحة لعرض حضورك؛ يتبع المؤقت موعد الجلسة.",
              })}
            </p>
          )}
          <footer>
            {room.hostId === owner && room.phase !== "finished" && (
              <>
                <button
                  disabled={busy || room.phase !== "waiting"}
                  onClick={() =>
                    void action(() =>
                      service.advanceRoom(room.id, room.version, "start"),
                    )
                  }
                >
                  <Play size={17} />
                  {t({ en: "Start together", ar: "ابدأوا معاً" })}
                </button>
                <button
                  disabled={busy || room.phase !== "focus"}
                  onClick={() =>
                    void action(() =>
                      service.advanceRoom(room.id, room.version, "rest"),
                    )
                  }
                >
                  <Leaf size={17} />
                  {t({ en: "Start rest", ar: "ابدأ الاستراحة" })}
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    void action(() =>
                      service.advanceRoom(room.id, room.version, "finish"),
                    )
                  }
                >
                  {t({ en: "Finish session", ar: "إنهاء الجلسة" })}
                </button>
              </>
            )}
            {room.phase !== "finished" && (
              <>
                <button
                  data-copied={copied || undefined}
                  onClick={() => void copyInvite()}
                >
                  <Copy size={17} />
                  {t(
                    copied
                      ? { en: "Copied", ar: "نُسخت الدعوة" }
                      : { en: "Copy invite", ar: "نسخ الدعوة" },
                  )}
                </button>
                <code className="room-invite">{room.inviteCode}</code>
              </>
            )}
          </footer>
        </section>
      )}
      <Modal
        open={leaveConfirm}
        onClose={() => setLeaveConfirm(false)}
        title={t({
          en: "End the room for everyone?",
          ar: "إنهاء الغرفة للجميع؟",
        })}
        description={t({
          en: "Leaving as host closes the shared session and invalidates its invite. Other participants will see that the session has ended.",
          ar: "مغادرتك كمضيف تنهي الجلسة وتلغي الدعوة. سيرى المشاركون أن الجلسة انتهت.",
        })}
      >
        <div className="study-hub-actions">
          <button disabled={busy} onClick={() => setLeaveConfirm(false)}>
            {t({ en: "Stay in room", ar: "البقاء في الغرفة" })}
          </button>
          <button
            disabled={busy}
            className="sign-out-action"
            onClick={() => void leaveRoom()}
          >
            {t({ en: "End & leave", ar: "إنهاء ومغادرة" })}
          </button>
        </div>
      </Modal>
    </main>
  );
}
