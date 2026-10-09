import type { AuthService } from "../types/auth";
import type { GovernanceService } from "../types/governance";
import {
  artworkSections,
  type ArtworkSection,
  type ArtworkService,
  type PageArtwork,
} from "../types/artwork";
export const artworkKey = "medclub:page-artwork:v1";
export async function validateArtworkFile(file: File) {
  if (
    !file.size ||
    file.size > 5_000_000 ||
    !["image/png", "image/jpeg", "image/webp"].includes(file.type)
  )
    throw new Error("IMAGE_FILE_INVALID");
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const png =
    bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71;
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp =
    new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
    new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  if (!(
    (file.type === "image/png" && png) ||
    (file.type === "image/jpeg" && jpeg) ||
    (file.type === "image/webp" && webp)
  ))
    throw new Error("IMAGE_FILE_INVALID");
}
function read(): Partial<Record<ArtworkSection, PageArtwork>> {
  try {
    const raw = JSON.parse(localStorage.getItem(artworkKey) || "{}");
    return Object.fromEntries(
      artworkSections.flatMap((section) => {
        const item = raw?.[section];
        return item &&
          typeof item.dataUrl === "string" &&
          item.dataUrl.length <= 1_400_000 &&
          /^data:image\/(?:jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(
            item.dataUrl,
          ) &&
          typeof item.alt?.en === "string" &&
          typeof item.alt?.ar === "string"
          ? [
              [
                section,
                {
                  section,
                  dataUrl: item.dataUrl,
                  alt: {
                    en: item.alt.en.slice(0, 240),
                    ar: item.alt.ar.slice(0, 240),
                  },
                  updatedAt:
                    typeof item.updatedAt === "string" ? item.updatedAt : "",
                },
              ],
            ]
          : [];
      }),
    );
  } catch {
    return {};
  }
}
/** Public artwork, device-local CMS writes, checked again after image processing. */
export function createLocalArtworkService(
  auth: Pick<AuthService, "getSnapshot">,
  governance: Pick<GovernanceService, "getAccess">,
): ArtworkService {
  async function authorize() {
    const [session, access] = await Promise.all([
      auth.getSnapshot(),
      governance.getAccess(),
    ]);
    if (
      session.status !== "authenticated" ||
      !session.user ||
      !access.capabilities.some((capability) =>
        ["builder.manage", "content.publish"].includes(capability),
      )
    )
      throw new Error("ARTWORK_FORBIDDEN");
  }
  function verifySection(section: ArtworkSection) {
    if (!artworkSections.includes(section))
      throw new Error("INVALID_ARTWORK_SECTION");
  }
  function write(data: ReturnType<typeof read>) {
    localStorage.setItem(artworkKey, JSON.stringify(data));
  }
  return {
    get: async (section) => {
      verifySection(section);
      return read()[section] || null;
    },
    replace: async (section, file, alt) => {
      verifySection(section);
      await authorize();
      await validateArtworkFile(file);
      if (
        !alt.en.trim() ||
        !alt.ar.trim() ||
        alt.en.length > 240 ||
        alt.ar.length > 240
      )
        throw new Error("IMAGE_DESCRIPTION_REQUIRED");
      const url = URL.createObjectURL(file);
      try {
        const image = await new Promise<HTMLImageElement>((resolve, reject) => {
          const value = new Image();
          value.onload = () => resolve(value);
          value.onerror = () => reject(new Error("IMAGE_DECODE_FAILED"));
          value.src = url;
        });
        if (
          image.naturalWidth < 64 ||
          image.naturalHeight < 64 ||
          image.naturalWidth * image.naturalHeight > 20_000_000
        )
          throw new Error("IMAGE_DIMENSIONS_INVALID");
        const scale = Math.min(1, 1280 / image.naturalWidth),
          canvas = document.createElement("canvas");
        canvas.width = Math.round(image.naturalWidth * scale);
        canvas.height = Math.round(image.naturalHeight * scale);
        const context = canvas.getContext("2d");
        if (!context) throw new Error("IMAGE_DECODE_FAILED");
        context.fillStyle = "#fff9f1";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/webp", 0.82);
        if (
          !/^data:image\/(?:webp|jpeg);base64,/.test(dataUrl) ||
          dataUrl.length > 1_400_000
        )
          throw new Error("IMAGE_OUTPUT_TOO_LARGE");
        await authorize();
        const item: PageArtwork = {
          section,
          dataUrl,
          alt: { en: alt.en.trim(), ar: alt.ar.trim() },
          updatedAt: new Date().toISOString(),
        };
        write({ ...read(), [section]: item });
        return item;
      } finally {
        URL.revokeObjectURL(url);
      }
    },
    reset: async (section) => {
      verifySection(section);
      await authorize();
      const data = read();
      delete data[section];
      write(data);
    },
  };
}
