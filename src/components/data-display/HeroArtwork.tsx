import art0_640 from "../../assets/section-art/learn-640.webp";
import art0_1280 from "../../assets/section-art/learn-1280.webp";
import art1_640 from "../../assets/section-art/community-640.webp";
import art1_1280 from "../../assets/section-art/community-1280.webp";
import art2_640 from "../../assets/section-art/mentorship-640.webp";
import art2_1280 from "../../assets/section-art/mentorship-1280.webp";
import art3_640 from "../../assets/section-art/team-640.webp";
import art3_1280 from "../../assets/section-art/team-1280.webp";
import art4_640 from "../../assets/section-art/involved-640.webp";
import art4_1280 from "../../assets/section-art/involved-1280.webp";
import art5_640 from "../../assets/section-art/store-640.webp";
import art5_1280 from "../../assets/section-art/store-1280.webp";
import art6_640 from "../../assets/section-art/batch-gate-640.webp";
import art6_1280 from "../../assets/section-art/batch-gate-1280.webp";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, ImageUp, RotateCcw } from "lucide-react";
import { useAuth } from "../../app/providers/AuthProvider";
import { useServices } from "../../app/providers/ServicesProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useAccess } from "../../admin/governance/useGovernance";
import { Modal } from "../ui/Modal";
import type { ArtworkSection } from "../../types/artwork";
import type { Text } from "../../types/content";
import "../../styles/hero-artwork.css";
import "../../styles/hero-composition-v1314.css";
const files: Record<string, string> = {
  "../../assets/section-art/learn-640.webp": art0_640,
  "../../assets/section-art/learn-1280.webp": art0_1280,
  "../../assets/section-art/community-640.webp": art1_640,
  "../../assets/section-art/community-1280.webp": art1_1280,
  "../../assets/section-art/mentorship-640.webp": art2_640,
  "../../assets/section-art/mentorship-1280.webp": art2_1280,
  "../../assets/section-art/team-640.webp": art3_640,
  "../../assets/section-art/team-1280.webp": art3_1280,
  "../../assets/section-art/involved-640.webp": art4_640,
  "../../assets/section-art/involved-1280.webp": art4_1280,
  "../../assets/section-art/store-640.webp": art5_640,
  "../../assets/section-art/store-1280.webp": art5_1280,
  "../../assets/section-art/batch-gate-640.webp": art6_640,
  "../../assets/section-art/batch-gate-1280.webp": art6_1280,
};
const descriptions: Record<ArtworkSection, Text> = {
  home: { en: "MedClub medical student campus.", ar: "حرم ميدكلب لطلبة الطب." },
  learn: {
    en: "An inviting medical library and study desk.",
    ar: "مكتبة طبية ومكتب دراسة يدعوان للتعلّم.",
  },
  community: {
    en: "Medical students sharing ideas in a campus courtyard.",
    ar: "طلبة طب يتبادلون الأفكار في ساحة الحرم.",
  },
  mentorship: {
    en: "Students learning together with a mentor.",
    ar: "طلبة يتعلّمون مع مرشد.",
  },
  team: {
    en: "A student team planning a campus project.",
    ar: "فريق طلابي يخطط لمشروع جامعي.",
  },
  involved: {
    en: "A welcoming campus activity and volunteer pavilion.",
    ar: "جناح جامعي مرحّب للأنشطة والتطوّع.",
  },
  store: {
    en: "Notebooks, stationery and clothing in a campus shop.",
    ar: "دفاتر وقرطاسية وملابس في متجر الحرم.",
  },
  "batch-gate": {
    en: "An open university gateway to a bright library courtyard.",
    ar: "بوابة جامعية مفتوحة تؤدي إلى ساحة مكتبة مضيئة.",
  },
};
export function usePageArtwork(section: ArtworkSection) {
  const services = useServices();
  return useQuery({
    queryKey: ["page-artwork", section],
    queryFn: () => services.artwork?.get(section) ?? Promise.resolve(null),
  });
}
export function HeroArtwork({
  section,
  className = "",
}: {
  section: Exclude<ArtworkSection, "home">;
  className?: string;
}) {
  const { t } = useLocale(),
    query = usePageArtwork(section);
  const large = files["../../assets/section-art/" + section + "-1280.webp"],
    small = files["../../assets/section-art/" + section + "-640.webp"];
  return (
    <figure
      className={"hero-artwork " + className}
      data-artwork-section={section}
    >
      <picture>
        {!query.data && (
          <source
            srcSet={small + " 640w, " + large + " 1280w"}
            sizes="(max-width:1280px) 100vw, 1280px"
          />
        )}
        <img
          src={query.data?.dataUrl || large}
          alt={t(query.data?.alt || descriptions[section])}
          width={1280}
          height={853}
          decoding="async"
          onError={(event) => {
            if (!event.currentTarget.dataset.fallback) {
              event.currentTarget.dataset.fallback = "true";
              event.currentTarget.src = large;
            }
          }}
        />
      </picture>
      <ArtworkEditor section={section} />
    </figure>
  );
}
export function ArtworkEditor({ section }: { section: ArtworkSection }) {
  const { t } = useLocale(),
    auth = useAuth(),
    access = useAccess(),
    services = useServices(),
    client = useQueryClient(),
    current = usePageArtwork(section);
  const [open, setOpen] = useState(false),
    [file, setFile] = useState<File | null>(null),
    [preview, setPreview] = useState<string | null>(null),
    [alt, setAlt] = useState<Text>(descriptions[section]),
    [pending, setPending] = useState(false),
    [error, setError] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const allowed =
    auth.snapshot.status === "authenticated" &&
    !!services.artwork &&
    !!access.data?.capabilities.some((capability) =>
      ["builder.manage", "content.publish"].includes(capability),
    );
  useEffect(() => {
    if (!allowed) setOpen(false);
  }, [allowed]);
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  if (!allowed) return null;
  return (
    <>
      <button
        type="button"
        ref={trigger}
        className="hero-artwork-edit"
        aria-label={t({ en: "Edit hero artwork", ar: "تعديل صورة المقدمة" })}
        onClick={() => {
          setAlt(current.data?.alt || descriptions[section]);
          setFile(null);
          setError(false);
          setOpen(true);
        }}
      >
        <ImagePlus size={16} />
        <span>{t({ en: "Edit image", ar: "تعديل الصورة" })}</span>
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        onAfterClose={() => trigger.current?.focus({ preventScroll: true })}
        title={t({ en: "Page artwork", ar: "صورة الصفحة" })}
        description={t({
          en: "Choose a section image. Changes are visible on this device until shared storage is connected.",
          ar: "اختر صورة للقسم. تظهر التغييرات على هذا الجهاز حتى ربط التخزين المشترك.",
        })}
        className="hero-artwork-modal"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!file || !services.artwork || pending) return;
            setPending(true);
            setError(false);
            void services.artwork
              .replace(section, file, alt)
              .then(async () => {
                await client.invalidateQueries({
                  queryKey: ["page-artwork", section],
                });
                setOpen(false);
              })
              .catch(() => setError(true))
              .finally(() => setPending(false));
          }}
        >
          {(preview || current.data) && (
            <img
              className="hero-artwork-preview"
              src={preview || current.data!.dataUrl}
              alt={t(alt)}
            />
          )}
          <label className="hero-artwork-upload">
            <ImageUp size={23} />
            <span>
              {t({
                en: "Choose PNG, JPEG or WebP · up to 5 MB",
                ar: "اختر PNG أو JPEG أو WebP · حتى ٥ ميغابايت",
              })}
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={pending}
              onChange={(event) => {
                setFile(event.target.files?.[0] || null);
                setError(false);
              }}
            />
          </label>
          {(["en", "ar"] as const).map((locale) => (
            <label key={locale}>
              {t(
                locale === "en"
                  ? {
                      en: "Image description · English",
                      ar: "وصف الصورة · الإنجليزية",
                    }
                  : {
                      en: "Image description · Arabic",
                      ar: "وصف الصورة · العربية",
                    },
              )}
              <input
                dir={locale === "ar" ? "rtl" : "ltr"}
                value={alt[locale]}
                required
                maxLength={240}
                disabled={pending}
                onChange={(event) =>
                  setAlt({ ...alt, [locale]: event.target.value })
                }
              />
            </label>
          ))}
          {error && (
            <p role="alert">
              {t({
                en: "Could not save the image. Check its type, size and descriptions, or available storage.",
                ar: "تعذّر حفظ الصورة. تحقق من نوعها وحجمها ووصفها أو مساحة التخزين.",
              })}
            </p>
          )}
          <div>
            <button
              type="submit"
              className="button button-primary"
              disabled={!file || pending}
            >
              {t(
                pending
                  ? { en: "Saving…", ar: "جارٍ الحفظ…" }
                  : { en: "Use this image", ar: "استخدام هذه الصورة" },
              )}
            </button>
            <button
              type="button"
              className="button button-outline"
              disabled={pending || !current.data}
              onClick={() => {
                if (!services.artwork) return;
                setPending(true);
                setError(false);
                void services.artwork
                  .reset(section)
                  .then(async () => {
                    await client.invalidateQueries({
                      queryKey: ["page-artwork", section],
                    });
                    setFile(null);
                  })
                  .catch(() => setError(true))
                  .finally(() => setPending(false));
              }}
            >
              <RotateCcw size={16} />
              {t({ en: "Restore original", ar: "استعادة الأصل" })}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
