import { useEffect, useMemo, useState } from "react";
import type { PersonalHomeData } from "./usePersonalHome";

export const campusBuildingIds = [
  "learning",
  "media",
  "community",
  "mentorship",
  "contribution",
  "journals",
] as const;
export type CampusLevels = Record<(typeof campusBuildingIds)[number], number>;
const empty = () =>
  Object.fromEntries(campusBuildingIds.map((id) => [id, 0])) as CampusLevels;
export const campusGrowthKey = (owner: string) =>
  `medclub:personal-campus:${encodeURIComponent(owner)}:v1`;
function readLevels(owner: string) {
  const result = empty();
  try {
    const value = JSON.parse(
      localStorage.getItem(campusGrowthKey(owner)) || "null",
    );
    for (const id of campusBuildingIds)
      if (Number.isInteger(value?.[id]))
        result[id] = Math.max(0, Math.min(3, value[id]));
  } catch {}
  return result;
}
const stage = (count: number, thresholds = [1, 5, 15]) =>
  thresholds.filter((limit) => count >= limit).length;
export function useCampusGrowth(data: PersonalHomeData) {
  const [levels, setLevels] = useState(() => readLevels(data.owner));
  const [persistent, setPersistent] = useState(true);
  const [upgrade, setUpgrade] = useState<string | null>(null);
  const measured = useMemo(() => {
    const reviews = (data.cards.data || []).filter(
      (card) => card.reviews > 0,
    ).length;
    // Study milestones can develop every building; social participation is optional.
    const academic = stage(data.reviewed.length + reviews, [6, 18, 36]);
    const verified = (data.claims.data || []).filter(
      (claim) => claim.status === "verified",
    );
    const savedIds = new Set(
      data.workspace.state.savedIds.filter((id) =>
        data.myResources.some((r) => r.id === id),
      ),
    );
    const saved = savedIds.size;
    const collections = data.workspace.state.collections.filter(
      (c) => c.itemIds.filter((id) => savedIds.has(id)).length >= 3,
    ).length;
    return {
      learning: stage(data.reviewed.length),
      media: stage(reviews),
      community: Math.max(
        academic,
        stage(
          verified.filter(
            (c) => c.kind === "activity" || c.kind === "volunteering",
          ).length +
            (data.rooms.data || []).filter(
              (r) =>
                r.phase === "finished" &&
                r.members.some((m) => m.userId === data.owner),
            ).length,
          [1, 3, 6],
        ),
      ),
      mentorship: Math.max(
        academic,
        stage(
          (data.mentorship.data || []).filter((r) => r.status === "accepted")
            .length,
          [1, 3, 6],
        ),
      ),
      contribution: Math.max(
        academic,
        stage(
          (data.contributions.data || []).filter(
            (r) => r.status === "approved" || r.status === "published",
          ).length,
          [1, 3, 6],
        ),
      ),
      journals: Math.max(
        stage(saved, [1, 5, 12]),
        stage(collections, [1, 2, 3]),
      ),
    } as CampusLevels;
  }, [
    data.reviewed.length,
    data.cards.data,
    data.claims.data,
    data.rooms.data,
    data.mentorship.data,
    data.contributions.data,
    data.workspace.state.savedIds,
    data.workspace.state.collections,
    data.myResources,
    data.owner,
  ]);
  const signature = JSON.stringify(measured);
  useEffect(() => {
    const stored = readLevels(data.owner);
    const next = Object.fromEntries(
      campusBuildingIds.map((id) => [
        id,
        Math.max(levels[id], stored[id], measured[id]),
      ]),
    ) as CampusLevels;
    if (campusBuildingIds.every((id) => next[id] === levels[id])) return;
    setUpgrade(campusBuildingIds.find((id) => next[id] > levels[id]) || null);
    setLevels(next);
    try {
      localStorage.setItem(campusGrowthKey(data.owner), JSON.stringify(next));
      setPersistent(true);
    } catch {
      setPersistent(false);
    }
  }, [signature, data.owner]);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== campusGrowthKey(data.owner) && event.key !== null)
        return;
      const stored = readLevels(data.owner);
      setLevels(
        (current) =>
          Object.fromEntries(
            campusBuildingIds.map((id) => [
              id,
              Math.max(current[id], stored[id]),
            ]),
          ) as CampusLevels,
      );
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [data.owner]);
  return { levels, upgrade, persistent };
}
