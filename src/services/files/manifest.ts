import { ApiError } from "../api/client";
export function manifestPath(file: File) {
  const path = (file.webkitRelativePath || file.name).replace(/\\/g, "/");
  if (
    !path ||
    path.startsWith("/") ||
    path.split("/").some((part) => !part || part === ".." || part === ".")
  )
    throw new ApiError(
      "Invalid relative file path.",
      422,
      "IMPORT_PATH_INVALID",
    );
  return path;
}
