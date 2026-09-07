import { useLocation } from "react-router-dom";
import {
  isPersonalPath,
  isAdminPath,
  coursePath,
  personalCoursePath,
} from "../constants/routes";
export function useWorkspacePaths() {
  const pathname = useLocation().pathname;
  const personal = isPersonalPath(pathname);
  const admin = isAdminPath(pathname);
  return {
    personal,
    admin,
    home: admin ? "/admin" : personal ? "/my" : "/",
    learning: personal ? "/my/learning" : "/learn",
    course: personal ? personalCoursePath : coursePath,
  };
}
