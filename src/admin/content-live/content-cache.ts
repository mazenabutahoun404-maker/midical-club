import type { QueryClient } from "@tanstack/react-query";
export async function refreshContent(client: QueryClient) {
  await Promise.all(
    [
      "native-content",
      "resources",
      "course-content",
      "site",
      "published-page",
      "artwork",
      "journal",
      "courses",
      "academics",
    ].map((key) => client.invalidateQueries({ queryKey: [key] })),
  );
}
