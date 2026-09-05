import { useLocale } from "../../app/providers/LocaleProvider";
import { useOverlays } from "../../app/providers/OverlayProvider";
import { useWorkspacePaths } from "../../hooks/useWorkspacePaths";
import { Modal } from "../../components/ui/Modal";
import { SearchPanel } from "./SearchPanel";
export function SearchDialog() {
  const { label } = useLocale();
  const paths = useWorkspacePaths();
  const { searchOpen, closeSearch } = useOverlays();
  return (
    <Modal
      open={searchOpen}
      onClose={closeSearch}
      title={label(paths.personal ? "personalSearch" : "searchLabel")}
      description={label("searchMetadataNote")}
      className="search-modal"
      hideHeading
    >
      <SearchPanel compact />
    </Modal>
  );
}
