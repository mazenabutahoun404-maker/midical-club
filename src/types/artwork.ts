import type { Text } from "./content";
export const artworkSections = [
  "home",
  "learn",
  "community",
  "mentorship",
  "team",
  "involved",
  "store",
  "batch-gate",
] as const;
export type ArtworkSection = (typeof artworkSections)[number];
export interface PageArtwork {
  section: ArtworkSection;
  dataUrl: string;
  alt: Text;
  updatedAt: string;
}
export interface ArtworkService {
  get: (section: ArtworkSection) => Promise<PageArtwork | null>;
  replace: (
    section: ArtworkSection,
    file: File,
    alt: Text,
  ) => Promise<PageArtwork>;
  reset: (section: ArtworkSection) => Promise<void>;
}
