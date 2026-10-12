import type { MedClubServices } from "../services/contracts";
import {
  createHttpStudyService,
  type StudyHttpOptions,
} from "../services/study/http-study.service";
/** Keep every existing backend adapter. Replace only the new feature boundary. */
export function connectStudyHub(
  existingServices: MedClubServices,
  options: StudyHttpOptions,
): MedClubServices {
  return { ...existingServices, studyHub: createHttpStudyService(options) };
}
