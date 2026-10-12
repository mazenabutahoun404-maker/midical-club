import { useState } from "react";
import { X, FileText } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { useLocale } from "../../app/providers/LocaleProvider";
import { PdfBook } from "../courses/PdfBook";
import type { Resource } from "../../types/content";
import "./offline-reader.css";

/** A device pack is a saved snapshot. The reader never requires a network annotation fetch. */
export function OfflinePdfReader({
  item,
  onClose,
}: {
  item: Resource;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const [page, setPage] = useState(1);
  return (
    <Modal
      open
      onClose={onClose}
      title={t(item.title)}
      description={t({
        en: "Reading a PDF saved on this device",
        ar: "قراءة ملف PDF محفوظ على هذا الجهاز",
      })}
      className="offline-pdf-dialog"
      hideHeading
      hideClose
      initialFocus=".offline-pdf-close"
    >
      <header className="offline-pdf-titlebar">
        <FileText size={18} aria-hidden="true" />
        <strong>{t(item.title)}</strong>
        <button
          type="button"
          className="offline-pdf-close"
          onClick={onClose}
          aria-label={t({
            en: "Close downloaded PDF",
            ar: "إغلاق الملف المُنزل",
          })}
        >
          <X size={20} />
        </button>
      </header>
      <div className="offline-pdf-canvas">
        <PdfBook
          item={item}
          url={item.fileUrl!}
          initialPage={page}
          onPage={setPage}
        />
      </div>
    </Modal>
  );
}
