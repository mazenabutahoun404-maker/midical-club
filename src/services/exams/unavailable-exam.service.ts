import { ExamError, type ExamService } from "../../types/exams";
export function unavailableExamService(): ExamService {
  const fail = async (): Promise<never> => {
    throw new ExamError("UNAVAILABLE");
  };
  return {
    source: "unavailable",
    catalog: fail,
    getExam: fail,
    questions: fail,
    questionBank: fail,
    search: fail,
    start: fail,
    attempts: fail,
    attempt: fail,
    save: fail,
    finish: fail,
    abandon: fail,
    notebook: fail,
    notebookQuestions: fail,
    customOptions: fail,
    bookmark: fail,
    report: fail,
    custom: fail,
    admin: {
      uploadImage: fail,
      saveSet: fail,
      saveQuestions: fail,
      deleteSet: fail,
      deleteQuestion: fail,
      reports: fail,
      resolveReport: fail,
    },
  };
}
