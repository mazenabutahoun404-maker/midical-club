import type { AuthService } from "../../types/auth";
import type { GovernanceService } from "../../types/governance";
import type { Course, Resource } from "../../types/content";
import {
  StudyError,
  type StudyHubService,
  type MarginNote,
  type RecallCard,
  type RecallReview,
  type PortfolioClaim,
  type PortfolioShare,
  type QuietRoom,
  type Versioned,
} from "../../types/study-hub";
import { text, integer, anchor, claim, nextRecall } from "./validation";
type State = {
  margins: MarginNote[];
  cards: RecallCard[];
  reviews: RecallReview[];
  claims: PortfolioClaim[];
  rooms: QuietRoom[];
  shares: Record<string, PortfolioShare>;
  tombstones: Record<string, number>;
  requests: Record<string, RecallCard>;
};
const key = "medclub-study-hub-v1";
const empty = (): State => ({
  margins: [],
  cards: [],
  reviews: [],
  claims: [],
  rooms: [],
  shares: {},
  tombstones: {},
  requests: {},
});
let queue: Promise<unknown> = Promise.resolve();
export function createLocalStudyService(deps: {
  auth: AuthService;
  governance: GovernanceService;
  courses: () => Promise<Course[]>;
  resources: () => Promise<Resource[]>;
  now?: () => number;
  storage?: Pick<Storage, "getItem" | "setItem">;
}): StudyHubService {
  const clock = deps.now || Date.now,
    stamp = () => new Date(clock()).toISOString();
  const read = (): State => {
    try {
      const raw = (deps.storage || localStorage).getItem(key);
      return raw ? { ...empty(), ...JSON.parse(raw) } : empty();
    } catch {
      throw new StudyError("STORAGE");
    }
  };
  const write = (s: State) => {
    try {
      (deps.storage || localStorage).setItem(key, JSON.stringify(s));
    } catch {
      throw new StudyError("STORAGE");
    }
  };
  async function actor() {
    const a = await deps.auth.getSnapshot();
    if (a.status !== "authenticated" || !a.user)
      throw new StudyError("UNAUTHORIZED", 401);
    return a.user;
  }
  async function run<T>(
    fn: (s: State, a: Awaited<ReturnType<typeof actor>>) => Promise<T> | T,
  ): Promise<T> {
    const a = await actor();
    const task = async () => {
      const current = await actor();
      if (current.id !== a.id) throw new StudyError("UNAUTHORIZED", 401);
      const s = read();
      const result = await fn(s, a);
      if ((await actor()).id !== a.id)
        throw new StudyError("UNAUTHORIZED", 401);
      write(s);
      return structuredClone(result);
    };
    const locked = async (): Promise<T> =>
      typeof navigator !== "undefined" && navigator.locks
        ? ((await navigator.locks.request(key, async () => await task())) as T)
        : await task();
    const result = queue.then(locked, locked);
    queue = result.catch(() => {});
    return result;
  }
  function version<T extends Versioned>(items: T[], id: string, v: number) {
    const r = items.find((x) => x.id === id);
    if (!r) throw new StudyError("NOT_FOUND", 404);
    if (r.version !== v) throw new StudyError("CONFLICT", 409);
    return r;
  }
  function owned<T extends Versioned & { ownerId: string }>(
    items: T[],
    id: string,
    v: number,
    owner: string,
  ) {
    const r = version(items, id, v);
    if (r.ownerId !== owner) throw new StudyError("FORBIDDEN", 403);
    return r;
  }
  function base() {
    return { id: crypto.randomUUID(), version: 1, updatedAt: stamp() };
  }
  function changed<T extends Versioned>(r: T) {
    r.version++;
    r.updatedAt = stamp();
    return r;
  }
  async function course(id: string) {
    if (!(await deps.courses()).some((c) => c.id === id))
      throw new StudyError("INVALID");
  }
  async function source(
    courseId: string,
    p: import("../../types/study-hub").PageAnchor,
  ) {
    anchor(p);
    await course(courseId);
    const r = (await deps.resources()).find((x) => x.id === p.resourceId);
    if (r && (r.courseId !== courseId || r.updatedAt !== p.resourceRevision))
      throw new StudyError("CONFLICT", 409);
    if (!r && !/^(local-pdf-|personal-pdf-)/.test(p.resourceId))
      throw new StudyError("NOT_FOUND", 404);
  }
  async function reviewer(kind: PortfolioClaim["kind"]) {
    const access = await deps.governance.getAccess();
    const a = await actor();
    if (
      access.actorId !== a.id ||
      !access.capabilities.includes(
        kind === "publication" ? "content.review" : "events.manage",
      )
    )
      throw new StudyError("FORBIDDEN", 403);
  }
  function room(s: State, id: string, user: string) {
    const r = s.rooms.find((x) => x.id === id);
    if (!r) throw new StudyError("NOT_FOUND", 404);
    if (!r.members.some((m) => m.userId === user))
      throw new StudyError("FORBIDDEN", 403);
    return r;
  }
  function reconcile(r: QuietRoom) {
    if (r.endsAt && Date.parse(r.endsAt) <= clock()) {
      r.phase = r.phase === "focus" ? "rest" : "finished";
      r.endsAt =
        r.phase === "rest"
          ? new Date(Date.parse(r.endsAt) + r.restMinutes * 60000).toISOString()
          : null;
      changed(r);
      if (r.endsAt && Date.parse(r.endsAt) <= clock()) {
        r.phase = "finished";
        r.endsAt = null;
        changed(r);
      }
    }
    return r;
  }
  return {
    source: "device-preview",
    uploadPrivatePdf: async () => {
      throw new StudyError("INVALID");
    },
    listMargins: async (resourceId) => {
      const a = await actor();
      return read().margins.filter(
        (n) => n.ownerId === a.id && (!resourceId || n.anchor.resourceId === resourceId),
      );
    },
    saveMargin: (input, existing) =>
      run(async (s, a) => {
        await source(input.courseId, input.anchor);
        text(input.body, 1, 3000);
        if (!["amber", "mint", "rose"].includes(input.color))
          throw new StudyError("INVALID");
        if (existing) {
          const r = owned(s.margins, existing.id, existing.version, a.id);
          Object.assign(r, input, { body: input.body.trim() });
          return changed(r);
        }
        if (s.margins.filter((n) => n.ownerId === a.id).length >= 2000)
          throw new StudyError("CAPACITY", 409);
        const r = {
          ...base(),
          ...input,
          body: input.body.trim(),
          ownerId: a.id,
        };
        s.margins.push(r);
        return r;
      }),
    deleteMargin: (id, v) =>
      run((s, a) => {
        const r = owned(s.margins, id, v, a.id);
        s.tombstones[id] = r.version;
        s.margins = s.margins.filter((n) => n.id !== id);
      }),
    restoreMargin: (n) =>
      run(async (s, a) => {
        if (
          n.ownerId !== a.id ||
          s.margins.some((x) => x.id === n.id) ||
          s.tombstones[n.id] !== n.version
        )
          throw new StudyError("CONFLICT", 409);
        await source(n.courseId, n.anchor);
        const r = { ...n, version: n.version + 1, updatedAt: stamp() };
        s.margins.push(r);
        delete s.tombstones[n.id];
        return r;
      }),
    listRecall: async (courseId) => {
      const a = await actor();
      return read().cards.filter(
        (c) => c.ownerId === a.id && (!courseId || c.courseId === courseId),
      );
    },
    saveRecall: (input, existing) =>
      run(async (s, a) => {
        await course(input.courseId);
        text(input.prompt, 3, 600);
        text(input.answer, 1, 3000);
        if (input.source) await source(input.courseId, input.source);
        if (existing) {
          const r = owned(s.cards, existing.id, existing.version, a.id);
          Object.assign(r, input);
          return changed(r);
        }
        if (s.cards.filter((c) => c.ownerId === a.id).length >= 3000)
          throw new StudyError("CAPACITY", 409);
        const r = {
          ...base(),
          ...input,
          ownerId: a.id,
          dueAt: stamp(),
          intervalDays: 0,
          reviews: 0,
        };
        s.cards.push(r);
        return r;
      }),
    deleteRecall: (id, v) =>
      run((s, a) => {
        const r = owned(s.cards, id, v, a.id);
        s.tombstones[id] = r.version;
        s.cards = s.cards.filter((c) => c.id !== id);
      }),
    restoreRecall: (c) =>
      run(async (s, a) => {
        if (
          c.ownerId !== a.id ||
          s.cards.some((x) => x.id === c.id) ||
          s.tombstones[c.id] !== c.version
        )
          throw new StudyError("CONFLICT", 409);
        await course(c.courseId);
        const r = { ...c, version: c.version + 1, updatedAt: stamp() };
        s.cards.push(r);
        delete s.tombstones[c.id];
        return r;
      }),
    reviewRecall: (id, v, grade, requestId) =>
      run((s, a) => {
        text(requestId, 8, 180);
        const token = a.id + ":" + requestId;
        const prior = s.requests[token];
        if (prior) {
          if (prior.id !== id || prior.lastGrade !== grade)
            throw new StudyError("CONFLICT", 409);
          return prior;
        }
        const r = owned(s.cards, id, v, a.id);
        Object.assign(r, nextRecall(r.intervalDays, grade, clock()), {
          lastGrade: grade,
          reviews: r.reviews + 1,
        });
        changed(r);
        s.reviews.push({
          id: token,
          cardId: id,
          grade,
          reviewedAt: stamp(),
          nextDueAt: r.dueAt,
        });
        s.reviews = s.reviews.slice(-5000);
        s.requests[token] = structuredClone(r);
        const entries = Object.entries(s.requests);
        if (entries.length > 1000)
          s.requests = Object.fromEntries(entries.slice(-1000));
        return r;
      }),
    listReviews: async () => {
      const a = await actor();
      const s = read();
      const ids = new Set(
        s.cards.filter((c) => c.ownerId === a.id).map((c) => c.id),
      );
      return s.reviews.filter((r) => ids.has(r.cardId));
    },
    packManifest: async (id) => {
      await actor();
      const c = (await deps.courses()).find((x) => x.id === id);
      if (!c) throw new StudyError("NOT_FOUND", 404);
      return {
        id: crypto.randomUUID(),
        course: c,
        revision: c.lastUpdated,
        resources: (await deps.resources()).filter(
          (r) =>
            r.courseId === id &&
            !!r.fileUrl &&
            r.mediaType === "pdf" &&
            r.offline?.allowed !== false,
        ),
        expiresAt: new Date(clock() + 30 * 86400000).toISOString(),
        allowedOffline: true,
      };
    },
    listClaims: async () => {
      const a = await actor();
      return read().claims.filter((c) => c.ownerId === a.id);
    },
    saveClaim: (input, existing) =>
      run((s, a) => {
        claim(input);
        if (existing) {
          const r = owned(s.claims, existing.id, existing.version, a.id);
          if (!["draft", "rejected"].includes(r.status))
            throw new StudyError("CONFLICT", 409);
          Object.assign(r, input, { status: "draft", review: undefined });
          return changed(r);
        }
        if (s.claims.filter((c) => c.ownerId === a.id).length >= 300)
          throw new StudyError("CAPACITY", 409);
        const r: PortfolioClaim = {
          ...base(),
          ...input,
          ownerId: a.id,
          status: "draft",
        };
        s.claims.push(r);
        return r;
      }),
    deleteClaim: (id, v) =>
      run((s, a) => {
        const r = owned(s.claims, id, v, a.id);
        if (r.status === "verified") throw new StudyError("CONFLICT", 409);
        s.tombstones[id] = r.version;
        s.claims = s.claims.filter((c) => c.id !== id);
      }),
    restoreClaim: (c) =>
      run((s, a) => {
        if (
          c.ownerId !== a.id ||
          c.status === "verified" ||
          s.claims.some((x) => x.id === c.id) ||
          s.tombstones[c.id] !== c.version
        )
          throw new StudyError("CONFLICT", 409);
        claim(c);
        const r = { ...c, version: c.version + 1, updatedAt: stamp() };
        s.claims.push(r);
        delete s.tombstones[c.id];
        return r;
      }),
    submitClaim: (id, v) =>
      run((s, a) => {
        const r = owned(s.claims, id, v, a.id);
        if (!["draft", "rejected"].includes(r.status))
          throw new StudyError("CONFLICT", 409);
        claim(r);
        r.status = "pending";
        return changed(r);
      }),
    reviewQueue: async () => {
      const access = await deps.governance.getAccess();
      const a = await actor();
      if (access.actorId !== a.id) throw new StudyError("FORBIDDEN", 403);
      return read().claims.filter(
        (c) =>
          (c.status === "pending" || c.status === "verified") &&
          c.ownerId !== a.id &&
          access.capabilities.includes(
            c.kind === "publication" ? "content.review" : "events.manage",
          ),
      );
    },
    reviewClaim: (id, v, decision, note) =>
      run(async (s, a) => {
        const r = version(s.claims, id, v);
        await reviewer(r.kind);
        if (r.ownerId === a.id) throw new StudyError("FORBIDDEN", 403);
        if (r.status !== "pending") throw new StudyError("CONFLICT", 409);
        if (!["verified", "rejected"].includes(decision))
          throw new StudyError("INVALID");
        text(note, 3, 1000);
        r.status = decision;
        r.review = { actorId: a.id, note: note.trim(), at: stamp(), decision };
        return changed(r);
      }),
    revokeClaim: (id, v, note) =>
      run(async (s, a) => {
        const r = version(s.claims, id, v);
        await reviewer(r.kind);
        if (r.ownerId === a.id) throw new StudyError("FORBIDDEN", 403);
        if (r.status !== "verified") throw new StudyError("CONFLICT", 409);
        text(note, 3, 1000);
        r.status = "revoked";
        r.review = {
          actorId: a.id,
          note: note.trim(),
          at: stamp(),
          decision: "revoked",
        };
        return changed(r);
      }),
    getShare: async () => {
      const a = await actor();
      return (
        read().shares[a.id] || {
          enabled: false,
          token: null,
          displayName: a.profile.name.en,
          updatedAt: stamp(),
        }
      );
    },
    setShare: (enabled) =>
      run((s, a) => {
        if (typeof enabled !== "boolean") throw new StudyError("INVALID");
        const r = {
          enabled,
          token: enabled ? crypto.randomUUID() : null,
          displayName: a.profile.name.en,
          updatedAt: stamp(),
        };
        s.shares[a.id] = r;
        return r;
      }),
    sharedPortfolio: async (token) => {
      const s = read();
      const pair = Object.entries(s.shares).find(
        ([, r]) => r.enabled && r.token === token,
      );
      if (!pair) throw new StudyError("NOT_FOUND", 404);
      return {
        displayName: pair[1].displayName,
        claims: s.claims
          .filter((c) => c.ownerId === pair[0] && c.status === "verified")
          .map((c) => ({
            id: c.id,
            kind: c.kind,
            title: c.title,
            description: c.description,
            occurredAt: c.occurredAt,
            hours: c.hours,
            status: c.status,
            verifiedAt: c.review!.at,
          })),
        updatedAt: pair[1].updatedAt,
        source: "device-preview",
      };
    },
    listRooms: async () => {
      const a = await actor();
      return read()
        .rooms.filter((r) => r.members.some((m) => m.userId === a.id))
        .map(reconcile);
    },
    createRoom: (input) =>
      run((s, a) => {
        text(input.title, 3, 100);
        text(input.goal, 1, 140);
        integer(input.capacity, 2, 12);
        integer(input.focusMinutes, 1, 180);
        integer(input.restMinutes, 1, 60);
        if (
          s.rooms.filter((r) => r.hostId === a.id && r.phase !== "finished")
            .length >= 5
        )
          throw new StudyError("CAPACITY", 409);
        const r: QuietRoom = {
          ...base(),
          ...input,
          hostId: a.id,
          inviteCode: crypto.randomUUID().replaceAll("-", ""),
          phase: "waiting",
          endsAt: null,
          members: [
            {
              userId: a.id,
              displayName: a.profile.name.en,
              goal: input.goal,
              joinedAt: stamp(),
              lastSeenAt: stamp(),
            },
          ],
        };
        s.rooms.push(r);
        return r;
      }),
    joinRoom: (code, goal) =>
      run((s, a) => {
        text(goal, 1, 140);
        text(code, 8, 100);
        const r = s.rooms.find((r) => r.inviteCode === code.trim());
        if (!r) throw new StudyError("NOT_FOUND", 404);
        reconcile(r);
        if (r.phase === "finished") throw new StudyError("EXPIRED", 410);
        const existing = r.members.find((m) => m.userId === a.id);
        if (existing) {
          existing.lastSeenAt = stamp();
          return r;
        }
        if (r.members.length >= r.capacity)
          throw new StudyError("CAPACITY", 409);
        r.members.push({
          userId: a.id,
          displayName: a.profile.name.en,
          goal: goal.trim(),
          joinedAt: stamp(),
          lastSeenAt: stamp(),
        });
        return changed(r);
      }),
    getRoom: async (id) => {
      const a = await actor();
      return reconcile(structuredClone(room(read(), id, a.id)));
    },
    heartbeatRoom: (id) =>
      run((s, a) => {
        const r = room(s, id, a.id);
        reconcile(r);
        const m = r.members.find((m) => m.userId === a.id)!;
        m.lastSeenAt = stamp();
        return r;
      }),
    leaveRoom: (id) =>
      run((s, a) => {
        const r = room(s, id, a.id);
        r.members = r.members.filter((m) => m.userId !== a.id);
        if (r.hostId === a.id) {
          r.phase = "finished";
          r.endsAt = null;
          r.inviteCode = "";
        }
        if (!r.members.length) s.rooms = s.rooms.filter((x) => x.id !== id);
        else changed(r);
      }),
    advanceRoom: (id, v, action) =>
      run((s, a) => {
        const r = room(s, id, a.id);
        reconcile(r);
        if (r.hostId !== a.id) throw new StudyError("FORBIDDEN", 403);
        if (r.version !== v) throw new StudyError("CONFLICT", 409);
        if (
          !["start", "rest", "finish"].includes(action) ||
          r.phase === "finished" ||
          (action === "start" && r.phase !== "waiting") ||
          (action === "rest" && r.phase !== "focus")
        )
          throw new StudyError("CONFLICT", 409);
        r.phase =
          action === "start"
            ? "focus"
            : action === "rest"
              ? "rest"
              : "finished";
        r.endsAt =
          r.phase === "finished"
            ? null
            : new Date(
                clock() +
                  (r.phase === "focus" ? r.focusMinutes : r.restMinutes) *
                    60000,
              ).toISOString();
        return changed(r);
      }),
  };
}
