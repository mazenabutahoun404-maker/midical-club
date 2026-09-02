import { useLocation } from "react-router-dom";
import {
  isPersonalPath,
  coursePath,
  personalCoursePath,
} from "../constants/routes";
export function useWorkspacePaths() {
  const personal = isPersonalPath(useLocation().pathname);
  return {
    personal,
    home: personal ? "/my" : "/",
    learning: personal ? "/my/learning" : "/learn",
    course: personal ? personalCoursePath : coursePath,
  };
}
