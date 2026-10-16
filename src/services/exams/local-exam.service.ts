import type { AuthService } from "../../types/auth";
import type { GovernanceService } from "../../types/governance";
import type { Course } from "../../types/content";
import type {
  ExamAttempt,
  ExamSet,
  ExamQuestion,
  ExamReport,
  ExamService,
  ExamProgress,
} from "../../types/exams";
import { ExamError } from "../../types/exams";
import {
  freshProgress,
  normalizeProgress,
  shuffleQuestions,
  summarize,
  validateQuestion,
} from "../../features/exams/exam-model";
import { previewQuestions } from "./preview-questions";
type State = {
  sets: ExamSet[];
  questions: ExamQuestion[];
  attempts: ExamAttempt[];
  bookmarks: Record<string, string[]>;
  reports: ExamReport[];
};
const empty = (): State => ({
  sets: [],
  questions: [],
  attempts: [],
  bookmarks: {},
  reports: [],
});
const key = "medclub.exam-preview.v1";
const id = () => crypto.randomUUID();
const stamp = () => new Date().toISOString();
const clone = <T>(v: T): T => structuredClone(v);
/** Browser-only preview. No original API calls, credentials or database clients are used. */
export function createLocalExamService(deps: {
  auth: AuthService;
  governance: GovernanceService;
  courses: () => Promise<Course[]>;
  storage?: Pick<Storage, "getItem" | "setItem">;
}): ExamService {
  let memory = empty(),
    volatile = false,
    queue = Promise.resolve<unknown>(undefined);
  const storage = () => deps.storage || localStorage;
  const listeners = new Set<() => void>();
  function persistence(next: boolean) {
    if (next === volatile) return;
    volatile = next;
    listeners.forEach((listener) => listener());
  }
  function read(): State {
    if (volatile) return clone(memory);
    let raw: string | null;
    try {
      raw = storage().getItem(key);
    } catch {
      persistence(true);
      return clone(memory);
    }
    if (!raw) return empty();
    try {
      const state = JSON.parse(raw);
      if (
        !state ||
        ![state.sets, state.questions, state.attempts, state.reports].every(
          Array.isArray,
        ) ||
        !state.bookmarks ||
        typeof state.bookmarks !== "object"
      )
        throw new Error("Malformed preview data");
      for (const q of state.questions) validateQuestion(q);
      if (
        state.sets.some(
          (s: ExamSet) => !s || !s.id || !Array.isArray(s.questionIds),
        ) ||
        state.attempts.some(
          (a: ExamAttempt) =>
            !a?.id ||
            !a.ownerId ||
            !Array.isArray(a.questions) ||
            !a.progress ||
            !Number.isInteger(a.version),
        )
      )
        throw new Error("Malformed preview record");
      for (const a of state.attempts) {
        if (
          !["practice", "self-test"].includes(a.mode) ||
          !["active", "finished", "abandoned"].includes(a.status) ||
          !Number.isFinite(Date.parse(a.updatedAt)) ||
          !Number.isFinite(Date.parse(a.startedAt))
        )
          throw new Error("Malformed attempt");
        for (const q of a.questions) validateQuestion(q);
        a.progress = normalizeProgress(a.progress, a.questions);
      }
      memory = state;
      return clone(state);
    } catch {
      throw new ExamError(
        "STORAGE",
        "The exam preview data could not be read.",
      );
    }
  }
  function write(state: State) {
    memory = clone(state);
    try {
      storage().setItem(key, JSON.stringify(state));
      persistence(false);
    } catch {
      persistence(true);
    }
  }
  async function owner() {
    const snapshot = await deps.auth.getSnapshot();
    return snapshot.status === "authenticated" && snapshot.user
      ? snapshot.user.id
      : "guest";
  }
  async function mutate<T>(
    task: (s: State, actor: string) => Promise<T> | T,
  ): Promise<T> {
    const actor = await owner();
    const job = queue
      .catch(() => undefined)
      .then(async () => {
        if ((await owner()) !== actor) throw new ExamError("FORBIDDEN");
        const s = read();
        const result = await task(s, actor);
        if ((await owner()) !== actor) throw new ExamError("FORBIDDEN");
        write(s);
        return clone(result);
      });
    queue = job;
    return job;
  }
  async function requireAdmin() {
    const access = await deps.governance.getAccess();
    if (!access.capabilities.includes("content.review"))
      throw new ExamError("FORBIDDEN");
  }
  async function combined(s = read()) {
    const courses = await deps.courses();
    const sets: ExamSet[] = courses.map((c) => ({
      id: `preview-${c.id}`,
      courseId: c.id,
      title: { en: "Explore the exam experience", ar: "استكشف تجربة الامتحان" },
      description: {
        en: "Four nonclinical examples to try the interface before the question-bank API is connected.",
        ar: "أربعة أمثلة غير طبية لتجربة الواجهة قبل ربط خدمة بنك الأسئلة.",
      },
      batch: { en: "Interface preview", ar: "معاينة الواجهة" },
      questionIds: previewQuestions(c.id).map((q) => q.id),
      kind: "practice",
      suggestedMinutes: 4,
      published: true,
      version: "preview-1",
    }));
    const questions = courses.flatMap((c) => previewQuestions(c.id));
    const setMap = new Map([...sets, ...s.sets].map((exam) => [exam.id, exam]));
    const qMap = new Map([...questions, ...s.questions].map((q) => [q.id, q]));
    return {
      courses,
      sets: [...setMap.values()],
      questions: [...qMap.values()],
    };
  }
  async function visible(exam: ExamSet, actor: string) {
    if (exam.ownerId) return exam.ownerId === actor;
    if (exam.published) return true;
    try {
      await requireAdmin();
      return true;
    } catch {
      return false;
    }
  }
  function owned(
    s: State,
    actor: string,
    attemptId: string,
    expected?: number,
  ) {
    const attempt = s.attempts.find(
      (a) => a.id === attemptId && a.ownerId === actor,
    );
    if (!attempt) throw new ExamError("NOT_FOUND");
    if (expected !== undefined && attempt.version !== expected)
      throw new ExamError("CONFLICT");
    return attempt;
  }
  function update(attempt: ExamAttempt, progress: ExamProgress) {
    if (attempt.status !== "active") throw new ExamError("CONFLICT");
    const next = normalizeProgress(progress, attempt.questions);
    if (attempt.mode === "practice")
      for (const [qid, answer] of Object.entries(attempt.progress.answers))
        next.answers[qid] = answer;
    next.elapsedSeconds = Math.max(
      next.elapsedSeconds,
      attempt.progress.elapsedSeconds,
    );
    attempt.progress = next;
    attempt.updatedAt = stamp();
    attempt.version++;
    return attempt;
  }
  const service: ExamService = {
    source: "preview",
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    get persistent() {
      return !volatile;
    },
    catalog: async () => {
      const all = await combined(),
        actor = await owner();
      const checks = await Promise.all(
        all.sets.map((exam) => visible(exam, actor)),
      );
      return {
        courses: clone(all.courses),
        sets: clone(all.sets.filter((_, i) => checks[i])),
      };
    },
    getExam: async (examId) => {
      const all = await combined(),
        actor = await owner(),
        exam = all.sets.find((e) => e.id === examId);
      return exam && (await visible(exam, actor)) ? clone(exam) : null;
    },
    questions: async (examId) => {
      const exam = await service.getExam(examId);
      if (!exam) throw new ExamError("NOT_FOUND");
      const all = await combined();
      return clone(
        exam.questionIds.flatMap((qid) => {
          const q = all.questions.find((q) => q.id === qid);
          return q ? [q] : [];
        }),
      );
    },
    questionBank: async (courseId) => {
      const catalog = await service.catalog();
      const ids = new Set(
        catalog.sets
          .filter((s) => !courseId || s.courseId === courseId)
          .flatMap((s) => s.questionIds),
      );
      return clone((await combined()).questions.filter((q) => ids.has(q.id)));
    },
    search: async (query, courseId, signal) => {
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      const terms = query
        .trim()
        .toLocaleLowerCase()
        .split(/\s+/)
        .filter(Boolean);
      const bank = await service.questionBank(courseId);
      return bank
        .filter((q) =>
          terms.every((term) =>
            [
              q.stem.en,
              q.stem.ar,
              q.chapter.en,
              q.chapter.ar,
              q.lecture?.en || "",
              q.lecture?.ar || "",
              ...q.choices.flatMap((c) => [c.text.en, c.text.ar]),
              q.doctor || "",
            ]
              .join(" ")
              .toLocaleLowerCase()
              .includes(term),
          ),
        )
        .slice(0, 100);
    },
    start: (examId, mode, resume) =>
      mutate(async (s, actor) => {
        if (!["practice", "self-test"].includes(mode))
          throw new ExamError("INVALID");
        const exam = await service.getExam(examId);
        if (!exam) throw new ExamError("NOT_FOUND");
        const existing = s.attempts.find(
          (a) =>
            a.ownerId === actor &&
            a.examId === examId &&
            a.mode === mode &&
            a.status === "active",
        );
        if (resume && existing) return existing;
        const questions = await service.questions(examId);
        if (!questions.length)
          throw new ExamError("INVALID", "This set has no questions.");
        const attempt: ExamAttempt = {
          id: id(),
          ownerId: actor,
          examId,
          mode,
          status: "active",
          progress: freshProgress(),
          questionIds: questions.map((q) => q.id),
          questions,
          startedAt: stamp(),
          updatedAt: stamp(),
          version: 1,
        };
        s.attempts.unshift(attempt);
        return attempt;
      }),
    attempts: async () => {
      const actor = await owner();
      return read()
        .attempts.filter((a) => a.ownerId === actor)
        .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
    },
    attempt: async (attemptId) => {
      const actor = await owner();
      return (
        read().attempts.find(
          (a) => a.id === attemptId && a.ownerId === actor,
        ) || null
      );
    },
    save: (attemptId, progress, expected) =>
      mutate((s, actor) =>
        update(owned(s, actor, attemptId, expected), progress),
      ),
    finish: (attemptId, progress, expected) =>
      mutate((s, actor) => {
        const a = owned(s, actor, attemptId);
        if (a.status === "finished") return a;
        if (a.version !== expected) throw new ExamError("CONFLICT");
        update(a, progress);
        a.status = "finished";
        a.summary = summarize(a.progress, a.questions);
        return a;
      }),
    abandon: (attemptId, expected) =>
      mutate((s, actor) => {
        const a = owned(s, actor, attemptId, expected);
        if (a.status !== "active") throw new ExamError("CONFLICT");
        a.status = "abandoned";
        a.version++;
        a.updatedAt = stamp();
      }),
    notebook: async () => {
      const actor = await owner(),
        s = read();
      const wrong = s.attempts
        .filter((a) => a.ownerId === actor && a.status === "finished")
        .flatMap((a) =>
          a.questions
            .filter(
              (q) =>
                a.progress.answers[q.id] &&
                q.correct &&
                a.progress.answers[q.id] !== q.correct,
            )
            .map((q) => q.id),
        );
      return {
        bookmarkedIds: (Object.hasOwn(s.bookmarks, actor) &&
        Array.isArray(s.bookmarks[actor])
          ? s.bookmarks[actor]
          : []
        ).filter((id) => typeof id === "string"),
        wrongIds: [...new Set(wrong)],
      };
    },
    notebookQuestions: async (input) => {
      const actor = await owner(),
        state = read(),
        notebook = await service.notebook();
      const ids = new Set(
        input.wrong ? notebook.wrongIds : notebook.bookmarkedIds,
      );
      const snapshotMap = new Map<string, ExamQuestion>();
      for (const attempt of state.attempts.filter(
        (a) => a.ownerId === actor && a.status === "finished",
      ))
        for (const q of attempt.questions)
          if (
            ids.has(q.id) &&
            (!input.wrong ||
              (attempt.progress.answers[q.id] &&
                q.correct &&
                attempt.progress.answers[q.id] !== q.correct)) &&
            !snapshotMap.has(q.id)
          )
            snapshotMap.set(q.id, q);
      const pool = input.wrong
        ? [...snapshotMap.values()]
        : (await service.questionBank()).filter((q) => ids.has(q.id));
      const rows = pool.filter(
        (q) =>
          (!input.courseId || q.courseId === input.courseId) &&
          (!input.query ||
            `${q.stem.en} ${q.stem.ar}`
              .toLowerCase()
              .includes(input.query.toLowerCase())),
      );
      const pageSize = Math.max(1, Math.min(50, input.pageSize)),
        offset = Math.max(0, input.page) * pageSize;
      return {
        items: clone(rows.slice(offset, offset + pageSize)),
        total: rows.length,
      };
    },
    customOptions: async (courseId, filters) => {
      const catalog = await service.catalog(),
        bank = await service.questionBank(courseId);
      const ids = new Set(
        catalog.sets
          .filter(
            (e) =>
              e.courseId === courseId &&
              (!filters.batch || e.batch.en === filters.batch),
          )
          .flatMap((e) => e.questionIds),
      );
      const matching = bank.filter(
        (q) =>
          ids.has(q.id) &&
          (!filters.chapters.length ||
            filters.chapters.includes(q.chapterId || q.chapter.en)) &&
          (!filters.lectures.length ||
            filters.lectures.includes(q.lectureId || q.lecture?.en || "")) &&
          (!filters.doctors.length ||
            filters.doctors.includes(q.doctorId || q.doctor || "")),
      );
      return {
        chapters: [
          ...new Map(
            bank.map((q) => [
              q.chapterId || q.chapter.en,
              { value: q.chapterId || q.chapter.en, label: q.chapter },
            ]),
          ).values(),
        ],
        lectures: [
          ...new Map(
            bank
              .filter((q) => !!q.lecture)
              .map((q) => [
                q.lectureId || q.lecture!.en,
                { value: q.lectureId || q.lecture!.en, label: q.lecture! },
              ]),
          ).values(),
        ],
        doctors: [
          ...new Map(
            bank
              .filter((q) => !!q.doctor)
              .map((q) => [
                q.doctorId || q.doctor!,
                {
                  value: q.doctorId || q.doctor!,
                  label: { en: q.doctor!, ar: q.doctor! },
                },
              ]),
          ).values(),
        ],
        batches: [
          ...new Map(
            catalog.sets
              .filter((e) => e.courseId === courseId)
              .map((e) => [e.batch.en, e.batch]),
          ).values(),
        ],
        matchedCount: matching.length,
      };
    },
    bookmark: (questionId, saved) =>
      mutate(async (s, actor) => {
        if (!(await service.questionBank()).some((q) => q.id === questionId))
          throw new ExamError("NOT_FOUND");
        const ids = new Set(
          Object.hasOwn(s.bookmarks, actor) ? s.bookmarks[actor] : [],
        );
        saved ? ids.add(questionId) : ids.delete(questionId);
        s.bookmarks[actor] = [...ids];
        const old = await service.notebook();
        return { ...old, bookmarkedIds: [...ids] };
      }),
    report: (input) =>
      mutate(async (s, actor) => {
        if (
          !(await service.questionBank()).some(
            (q) => q.id === input.questionId,
          ) ||
          !["answer", "wording", "explanation", "image", "other"].includes(
            input.category,
          ) ||
          !input.body.trim() ||
          input.body.length > 2000
        )
          throw new ExamError("INVALID");
        const report: ExamReport = {
          ...input,
          body: input.body.trim(),
          id: id(),
          ownerId: actor,
          createdAt: stamp(),
          status: "open",
        };
        s.reports.unshift(report);
        return report;
      }),
    custom: (input) =>
      mutate(async (s, actor) => {
        if (
          !input.title.trim() ||
          input.title.length > 100 ||
          !Number.isInteger(input.count) ||
          input.count < 1 ||
          input.count > 100
        )
          throw new ExamError("INVALID");
        const catalog = await service.catalog(),
          course = catalog.courses.find((c) => c.id === input.courseId);
        if (!course) throw new ExamError("INVALID");
        const selected = catalog.sets.filter(
          (e) =>
            e.courseId === course.id &&
            (!input.batch || e.batch.en === input.batch),
        );
        const ids = new Set(selected.flatMap((e) => e.questionIds));
        let bank = (await service.questionBank(course.id)).filter(
          (q) =>
            ids.has(q.id) &&
            (!input.chapters.length ||
              input.chapters.includes(q.chapterId || q.chapter.en)) &&
            (!input.lectures.length ||
              input.lectures.includes(q.lectureId || q.lecture?.en || "")) &&
            (!input.doctors.length ||
              input.doctors.includes(q.doctorId || q.doctor || "")),
        );
        if (bank.length < input.count)
          throw new ExamError(
            "INVALID",
            "Not enough questions match these filters.",
          );
        if (input.shuffle) bank = shuffleQuestions(bank);
        const exam: ExamSet = {
          id: id(),
          ownerId: actor,
          courseId: course.id,
          title: { en: input.title.trim(), ar: input.title.trim() },
          description: {
            en: "Your selected question set",
            ar: "مجموعة الأسئلة التي اخترتها",
          },
          batch: course.batch,
          questionIds: bank.slice(0, input.count).map((q) => q.id),
          kind: "custom",
          suggestedMinutes: input.count,
          published: false,
          version: id(),
        };
        s.sets.unshift(exam);
        return exam;
      }),
    admin: {
      uploadImage: async (file) => {
        await requireAdmin();
        if (
          !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(
            file.type,
          ) ||
          file.size > 512 * 1024 ||
          !file.size
        )
          throw new ExamError(
            "INVALID",
            "Choose a PNG, JPEG, WebP or GIF image under 512KiB.",
          );
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            typeof reader.result === "string"
              ? resolve(reader.result)
              : reject(new ExamError("INVALID"));
          reader.onerror = () => reject(new ExamError("STORAGE"));
          reader.readAsDataURL(file);
        });
      },
      saveSet: (input, expected) =>
        mutate(async (s) => {
          await requireAdmin();
          if (
            !input.title.en.trim() ||
            !input.title.ar.trim() ||
            !(await deps.courses()).some((c) => c.id === input.courseId) ||
            input.ownerId ||
            input.title.en.length > 150 ||
            input.title.ar.length > 150
          )
            throw new ExamError("INVALID");
          const existing = s.sets.find((e) => e.id === input.id);
          if (input.published && !existing?.questionIds.length)
            throw new ExamError("INVALID");
          if (
            existing?.questionIds.length &&
            existing.courseId !== input.courseId
          )
            throw new ExamError("INVALID");
          if (expected && existing?.version !== expected)
            throw new ExamError("CONFLICT");
          const exam = {
            ...clone(input),
            id: input.id || id(),
            questionIds: existing?.questionIds || [],
            version: id(),
          };
          s.sets = [...s.sets.filter((e) => e.id !== exam.id), exam];
          return exam;
        }),
      saveQuestions: (examId, questions, expected) =>
        mutate(async (s) => {
          await requireAdmin();
          const exam = s.sets.find((e) => e.id === examId);
          if (!exam) throw new ExamError("NOT_FOUND");
          if (exam.version !== expected) throw new ExamError("CONFLICT");
          if (
            !questions.length ||
            questions.length > 500 ||
            new Set(questions.map((q) => q.id)).size !== questions.length
          )
            throw new ExamError("INVALID");
          for (const q of questions) {
            validateQuestion(q);
            if (q.courseId !== exam.courseId) throw new ExamError("INVALID");
          }
          const next = questions.map((q) => ({
            ...clone(q),
            version: id(),
          }));
          const ids = new Set(next.map((q) => q.id));
          s.questions = [...s.questions.filter((q) => !ids.has(q.id)), ...next];
          exam.questionIds = [...new Set([...exam.questionIds, ...ids])];
          exam.version = id();
          return exam;
        }),
      deleteSet: (examId, expected) =>
        mutate(async (s) => {
          await requireAdmin();
          const exam = s.sets.find((e) => e.id === examId);
          if (!exam || exam.ownerId) throw new ExamError("NOT_FOUND");
          if (exam.version !== expected) throw new ExamError("CONFLICT");
          s.sets = s.sets.filter((e) => e.id !== examId);
        }),
      deleteQuestion: (examId, questionId, expected) =>
        mutate(async (state) => {
          await requireAdmin();
          const exam = state.sets.find((e) => e.id === examId);
          if (!exam || !exam.questionIds.includes(questionId))
            throw new ExamError("NOT_FOUND");
          if (exam.version !== expected) throw new ExamError("CONFLICT");
          exam.questionIds = exam.questionIds.filter((id) => id !== questionId);
          exam.version = id();
          if (!exam.questionIds.length) exam.published = false;
          return exam;
        }),
      reports: async () => {
        await requireAdmin();
        return read().reports;
      },
      resolveReport: (reportId) =>
        mutate(async (s) => {
          await requireAdmin();
          const report = s.reports.find((r) => r.id === reportId);
          if (!report) throw new ExamError("NOT_FOUND");
          report.status = "resolved";
        }),
    },
  };
  return service;
}
