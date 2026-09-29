import { Bookmark, Check } from "lucide-react";
import { useOverlays } from "../providers/OverlayProvider";
import { useLocale } from "../providers/LocaleProvider";
import { useSavedItems } from "../providers/SavedItemsProvider";
import { ResourceDetails } from "../../features/resources/ResourceDetails";
import { EventDetails } from "../../features/events/EventDetails";
import { OpportunityDetails } from "../../features/opportunities/OpportunityDetails";
import { ArticleDetails } from "../../features/community/ArticleDetails";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/button";
export function AppOverlays() {
  const { detail, closeDetail } = useOverlays();
  const { t, label } = useLocale();
  const { saved, toggle, isPending } = useSavedItems();
  return (
    <>
      {detail && (
        <Modal
          open
          onClose={closeDetail}
          title={t(detail.item.title)}
          description={t(
            detail.kind === "article"
              ? detail.item.excerpt
              : detail.item.description,
          )}
          className="detail-modal"
        >
          <span className="eyebrow">
            {label(detail.kind)} · {label("sample")}
          </span>
          {detail.kind === "resource" ? (
            <ResourceDetails item={detail.item} />
          ) : detail.kind === "event" ? (
            <EventDetails item={detail.item} />
          ) : detail.kind === "opportunity" ? (
            <OpportunityDetails item={detail.item} />
          ) : (
            <ArticleDetails item={detail.item} />
          )}{" "}
          <Button
            className="button button-primary"
            disabled={isPending}
            aria-pressed={saved.includes(detail.item.id)}
            onClick={() => toggle(detail.item.id)}
          >
            {saved.includes(detail.item.id) ? (
              <Check size={17} />
            ) : (
              <Bookmark size={17} />
            )}{" "}
            {label(saved.includes(detail.item.id) ? "saved" : "saveToLibrary")}
          </Button>
        </Modal>
      )}
    </>
  );
}
