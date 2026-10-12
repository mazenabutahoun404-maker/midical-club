import { StudyError, type StudyHubService } from "../../types/study-hub";
/** A live deployment must opt into an actual adapter. Never quietly persist live user records in the preview store. */
export function unavailableStudyService(): StudyHubService {
  return new Proxy({ source: "api" } as StudyHubService, {
    get(target, key) {
      if (key === "source") return target.source;
      return () => Promise.reject(new StudyError("NOT_CONFIGURED", 503));
    },
  });
}
