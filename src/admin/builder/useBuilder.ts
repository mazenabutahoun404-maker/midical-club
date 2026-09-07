import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServices } from "../../app/providers/ServicesProvider";
import type {
  BuilderBlock,
  BuilderPageDocument,
  BuilderSchedule,
  CreateBuilderPageInput,
} from "../../types/builder";
import type { Text } from "../../types/content";

export function useBuilderPages() {
  const services = useServices();
  return useQuery({
    queryKey: ["builder", "pages"],
    queryFn: services.builder.listPages,
  });
}

export function useBuilderPage(pageId?: string) {
  const services = useServices();
  return useQuery({
    queryKey: ["builder", "page", pageId],
    queryFn: () => services.builder.getPage(pageId || ""),
    enabled: !!pageId,
  });
}

export function useBuilderTemplates() {
  const services = useServices();
  return useQuery({
    queryKey: ["builder", "templates"],
    queryFn: services.builder.listTemplates,
  });
}

export function useBuilderVersions(pageId?: string) {
  const services = useServices();
  return useQuery({
    queryKey: ["builder", "versions", pageId],
    queryFn: () => services.builder.listVersions(pageId || ""),
    enabled: !!pageId,
  });
}

export function useBuilderActions() {
  const services = useServices();
  const client = useQueryClient();
  const refresh = async (pageId?: string) => {
    await Promise.all([
      client.invalidateQueries({ queryKey: ["builder", "pages"] }),
      client.invalidateQueries({ queryKey: ["builder", "templates"] }),
      client.invalidateQueries({ queryKey: ["builder", "versions"] }),
      ...(pageId
        ? [
            client.invalidateQueries({
              queryKey: ["builder", "page", pageId],
            }),
          ]
        : []),
    ]);
  };
  const create = useMutation({
    mutationFn: (input: CreateBuilderPageInput) =>
      services.builder.createPage(input),
    onSuccess: (page) => refresh(page.id),
  });
  const duplicate = useMutation({
    mutationFn: (pageId: string) => services.builder.duplicatePage(pageId),
    onSuccess: (page) => refresh(page.id),
  });
  const save = useMutation({
    mutationFn: (page: BuilderPageDocument) => services.builder.saveDraft(page),
  });
  const publish = useMutation({
    mutationFn: (pageId: string) => services.builder.publish(pageId),
    onSuccess: (page) => refresh(page.id),
  });
  const schedule = useMutation({
    mutationFn: ({
      pageId,
      value,
    }: {
      pageId: string;
      value: BuilderSchedule;
    }) => services.builder.schedule(pageId, value),
    onSuccess: (page) => refresh(page.id),
  });
  const template = useMutation({
    mutationFn: ({
      name,
      description,
      block,
    }: {
      name: Text;
      description: Text;
      block: BuilderBlock;
    }) => services.builder.saveTemplate(name, description, block),
    onSuccess: () => refresh(),
  });
  const restore = useMutation({
    mutationFn: ({
      pageId,
      versionId,
    }: {
      pageId: string;
      versionId: string;
    }) => services.builder.restoreVersion(pageId, versionId),
    onSuccess: (page) => refresh(page.id),
  });
  return {
    create: create.mutateAsync,
    duplicate: duplicate.mutateAsync,
    save: save.mutateAsync,
    publish: publish.mutateAsync,
    schedule: schedule.mutateAsync,
    saveTemplate: template.mutateAsync,
    restore: restore.mutateAsync,
    isMutating:
      create.isPending ||
      duplicate.isPending ||
      save.isPending ||
      publish.isPending ||
      schedule.isPending ||
      template.isPending ||
      restore.isPending,
  };
}
