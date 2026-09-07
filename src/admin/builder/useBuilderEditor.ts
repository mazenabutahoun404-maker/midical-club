import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServices } from "../../app/providers/ServicesProvider";
import type { BuilderPageDocument } from "../../types/builder";

export type BuilderSaveState = "saved" | "dirty" | "saving" | "error";

export function useBuilderEditor(initial?: BuilderPageDocument | null) {
  const services = useServices();
  const client = useQueryClient();
  const [page, setPage] = useState<BuilderPageDocument | null>(null);
  const [past, setPast] = useState<BuilderPageDocument[]>([]);
  const [future, setFuture] = useState<BuilderPageDocument[]>([]);
  const [saveState, setSaveState] = useState<BuilderSaveState>("saved");
  const loadedId = useRef<string | null>(null);
  const pageRef = useRef<BuilderPageDocument | null>(null);
  const changeRef = useRef(0);
  pageRef.current = page;

  useEffect(() => {
    if (!initial || loadedId.current === initial.id) return;
    loadedId.current = initial.id;
    const copy = structuredClone(initial);
    setPage(copy);
    setPast([]);
    setFuture([]);
    setSaveState("saved");
    changeRef.current = 0;
  }, [initial]);

  const change = useCallback(
    (updater: (current: BuilderPageDocument) => BuilderPageDocument) => {
      setPage((current) => {
        if (!current) return current;
        setPast((items) => [...items.slice(-29), structuredClone(current)]);
        setFuture([]);
        changeRef.current += 1;
        setSaveState("dirty");
        return updater(structuredClone(current));
      });
    },
    [],
  );

  const saveNow = useCallback(async () => {
    const current = pageRef.current;
    if (!current) return null;
    const token = changeRef.current;
    setSaveState("saving");
    try {
      const saved = await services.builder.saveDraft(current);
      if (token === changeRef.current) {
        setPage(saved);
        setSaveState("saved");
      } else {
        setSaveState("dirty");
      }
      await client.invalidateQueries({ queryKey: ["builder", "pages"] });
      return saved;
    } catch (error) {
      setSaveState("error");
      throw error;
    }
  }, [client, services]);

  useEffect(() => {
    if (saveState !== "dirty") return;
    const timer = window.setTimeout(
      () => void saveNow().catch(() => undefined),
      900,
    );
    return () => window.clearTimeout(timer);
  }, [page, saveNow, saveState]);

  const undo = useCallback(() => {
    setPast((items) => {
      const previous = items.at(-1);
      if (!previous) return items;
      setPage((current) => {
        if (current)
          setFuture((next) => [structuredClone(current), ...next].slice(0, 30));
        return structuredClone(previous);
      });
      changeRef.current += 1;
      setSaveState("dirty");
      return items.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((items) => {
      const next = items[0];
      if (!next) return items;
      setPage((current) => {
        if (current)
          setPast((previous) => [
            ...previous.slice(-29),
            structuredClone(current),
          ]);
        return structuredClone(next);
      });
      changeRef.current += 1;
      setSaveState("dirty");
      return items.slice(1);
    });
  }, []);

  const acceptServerPage = useCallback((next: BuilderPageDocument) => {
    setPage(structuredClone(next));
    setPast([]);
    setFuture([]);
    setSaveState("saved");
    changeRef.current = 0;
  }, []);

  return {
    page,
    change,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    saveNow,
    saveState,
    acceptServerPage,
  };
}
