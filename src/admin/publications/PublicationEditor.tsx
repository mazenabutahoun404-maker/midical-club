import { ConflictReview } from "./ConflictReview";
import { ApiError } from "../../services/api/client";
import { publicationActions } from "./actions";
import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/button";
import {
  usePublicationAction,
  usePublicationConnection,
} from "../../features/publications/shared";
import { Fields, DocumentJson } from "./Fields";
import type { PublicationSection } from "../../services/api/publication-contracts";
import { checkPublicationDocument } from "../../services/api/publication-contracts";
import { publicationTitle } from "../../features/publications/model";
import { record, string } from "../../services/api/mapping";
import type { Document } from "./actions";
const metadata: Record<PublicationSection, string[]> = {
  activities: [
    "activityCategoryId",
    "participantCount",
    "impactEn",
    "impactAr",
    "startsAt",
    "endsAt",
    "timezoneId",
    "locationNameEn",
    "locationNameAr",
    "mapUrl",
    "organizerEn",
    "organizerAr",
  ],
  "journal-issues": ["issueNumber", "volumeNumber", "releaseDate", "canvaUrl"],
  conferences: [
    "startsAt",
    "endsAt",
    "timezoneId",
    "locationNameEn",
    "locationNameAr",
    "mapUrl",
    "organizerEn",
    "organizerAr",
  ],
  "executive-bodies": ["termStartDate", "termEndDate"],
  "honor-plate": [
    "honorCategoryId",
    "honoreeType",
    "linkedUserId",
    "linkedAlumniProfileId",
    "honorTitleEn",
    "honorTitleAr",
    "achievementEn",
    "achievementAr",
    "honoredOn",
    "grantingEntityEn",
    "grantingEntityAr",
  ],
  alumni: [
    "fullNameEn",
    "fullNameAr",
    "graduationYear",
    "batchLabel",
    "specialtyEn",
    "specialtyAr",
    "workplaceEn",
    "workplaceAr",
    "jobTitleEn",
    "jobTitleAr",
    "bioEn",
    "bioAr",
    "linkedinUrl",
    "mentorshipOptIn",
  ],
  campaigns: ["startsOn", "endsOn"],
  albums: ["campaignId", "coverAssetId", "startsOn", "endsOn"],
};
export function PublicationEditor({
  section,
  snapshot,
  onSave,
  onClose,
}: {
  section: PublicationSection;
  snapshot?: unknown;
  onSave: (
    doc: Document,
    summary: string,
    version?: string,
  ) => Promise<unknown>;
  onClose: () => void;
}) {
  const { api } = usePublicationConnection();
  const { t, locale } = useLocale(),
    saved = record(snapshot),
    [version, setVersion] = useState(string(saved.version)),
    [doc, setDoc] = useState<Record<string, unknown>>(() =>
      saved.document
        ? structuredClone(record(saved.document))
        : {
            slug: "",
            titleEn: "",
            titleAr: "",
            isFeatured: false,
            assets: [],
            links: [],
          },
    ),
    [summary, setSummary] = useState(""),
    action = usePublicationAction();
  return (
    <Modal
      open
      title={
        saved.id
          ? t({ en: "Edit publication draft", ar: "تعديل مسودة المنشور" })
          : t({ en: "New publication draft", ar: "مسودة منشور جديدة" })
      }
      description={t({
        en: "Saving creates a draft. Publication is a separate action.",
        ar: "ينشئ الحفظ مسودة. النشر إجراء منفصل.",
      })}
      className="publication-modal"
      onClose={onClose}
    >
      {section === "journal-issues" && (
        <p>
          {t({
            en: "Add the Canva viewing link and attach an accessible PDF edition under Linked assets before publishing. Readers can use the PDF if the embed is unavailable.",
            ar: "أضف رابط عرض Canva وأرفق نسخة PDF متاحة في الملفات المرتبطة قبل النشر، ليستخدمها القراء إذا تعذّر التضمين.",
          })}
        </p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void action.run(async () => {
            checkPublicationDocument(doc);
            return onSave(doc as Document, summary, version || undefined);
          }, onClose);
        }}
      >
        <Fields
          schema="PublicContentDocument"
          keys={[
            "slug",
            "titleEn",
            "titleAr",
            "summaryEn",
            "summaryAr",
            "descriptionEn",
            "descriptionAr",
            "isFeatured",
            "featuredOrder",
            "displayOrder",
            ...metadata[section],
          ]}
          value={doc}
          onChange={setDoc}
          disabled={action.busy}
        />
        <DocumentJson
          value={doc}
          onApply={(v) => {
            checkPublicationDocument(v);
            setDoc(v);
          }}
        />
        <label>
          {t({ en: "Change summary", ar: "ملخص التغيير" })}
          <input value={summary} onChange={(e) => setSummary(e.target.value)} />
        </label>
        {version && (
          <p className="muted">
            {t({ en: "Reviewed record", ar: "السجل المراجع" })}:{" "}
            {publicationTitle(record(saved.document), locale) ||
              (saved.slug as string)}{" "}
            · <code>{version}</code>
          </p>
        )}
        {action.feedback}
        {saved.id &&
        action.error instanceof ApiError &&
        action.error.status === 409 ? (
          <ConflictReview
            load={() => publicationActions(api, section).get(string(saved.id))}
            onUse={setVersion}
          />
        ) : null}
        <Button type="submit" disabled={action.busy}>
          {t({ en: "Save draft", ar: "حفظ المسودة" })}
        </Button>
      </form>
    </Modal>
  );
}
