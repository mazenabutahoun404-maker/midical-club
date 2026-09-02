import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspacePaths } from "../../hooks/useWorkspacePaths";
import { Button } from "../../components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, FileText, LoaderCircle } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useOverlays } from "../../app/providers/OverlayProvider";
import { useServices } from "../../app/providers/ServicesProvider";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { Modal } from "../../components/ui/Modal";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "../../components/ui/command";
export function SearchDialog() {
  const navigate = useNavigate();
  const paths = useWorkspacePaths();
  const { label, t } = useLocale();
  const { searchOpen, closeSearch, openDetail } = useOverlays();
  const { search, personal } = useServices();
  const [query, setQuery] = useState("");
  useEffect(() => setQuery(""), [paths.personal]);
  const value = useDebouncedValue(query);
  const result = useQuery({
    queryKey: ["search", paths.personal ? "personal" : "public", value],
    queryFn: async () => {
      if (!paths.personal) return search.query(value);
      const [results, profile] = await Promise.all([
        search.query(value),
        personal.getProfile(),
      ]);
      return results.filter(({ record }) =>
        record.kind === "course"
          ? profile.courseIds.includes(record.item.id)
          : record.kind === "resource" &&
            profile.courseIds.includes(record.item.courseId),
      );
    },
    enabled: searchOpen,
  });
  const pending = result.isPending || value !== query;
  return (
    <Modal
      open={searchOpen}
      onClose={closeSearch}
      title={label(paths.personal ? "personalSearch" : "searchLabel")}
      description={label(
        paths.personal ? "personalSearchPlaceholder" : "searchPlaceholder",
      )}
      className="search-modal"
      hideHeading
    >
      <Command shouldFilter={false} label={label("search")}>
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder={label(
            paths.personal ? "personalSearchPlaceholder" : "searchPlaceholder",
          )}
          aria-label={label("search")}
        />
        <CommandList aria-label={label("searchResults")}>
          {pending ? (
            <div className="search-loading" role="status">
              <LoaderCircle className="animate-spin" />
              <span>{label("loading")}</span>
            </div>
          ) : result.isError ? (
            <div className="search-loading" role="alert">
              {label("searchFailed")}
              <Button variant="outline" onClick={() => void result.refetch()}>
                {label("retry")}
              </Button>
            </div>
          ) : (
            <>
              <CommandEmpty>
                {label(paths.personal ? "personalSearchEmpty" : "searchEmpty")}
              </CommandEmpty>
              <CommandGroup
                heading={label(query ? "searchResults" : "searchExplore")}
              >
                {result.data?.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => {
                      if (item.record.kind === "course") {
                        closeSearch();
                        navigate(paths.course(item.record.item.slug));
                      } else openDetail(item.record);
                    }}
                  >
                    <FileText size={18} />
                    <div className="search-result-copy">
                      {t(item.title)}
                      <small>{t(item.subtitle)}</small>
                    </div>
                    <ArrowUpRight className="directional" size={16} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
      <div className="search-footer">{label("searchHelp")}</div>
    </Modal>
  );
}
