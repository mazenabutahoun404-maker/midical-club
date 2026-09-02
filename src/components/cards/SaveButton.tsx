import { Bookmark } from "lucide-react";
import { useSavedItems } from "../../app/providers/SavedItemsProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { IconButton } from "../ui/IconButton";
export function SaveButton({ id, title }: { id: string; title: string }) {
  const { saved, toggle } = useSavedItems();
  const { label } = useLocale();
  const active = saved.includes(id);
  return (
    <IconButton
      className="save-button"
      label={`${label(active ? "unsave" : "save")} ${title}`}
      aria-pressed={active}
      onClick={() => toggle(id)}
    >
      <Bookmark size={18} fill={active ? "currentColor" : "none"} />
    </IconButton>
  );
}
