import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export type PipelineView = "quadro" | "lista";

export interface PipelineFilters {
  view: PipelineView;
  search: string;
  zone: string;
  manager: string;
  setView: (value: PipelineView) => void;
  setSearch: (value: string) => void;
  setZone: (value: string) => void;
  setManager: (value: string) => void;
  clear: () => void;
}

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export function usePipelineFilters<T extends { zone: string; owner: { name: string } }>(
  cards: T[],
  getSearchText: (card: T) => string,
): PipelineFilters & { filtered: T[] } {
  const [params, setParams] = useSearchParams();

  const view: PipelineView = params.get("vista") === "lista" ? "lista" : "quadro";
  const search = params.get("q") ?? "";
  const zone = params.get("zona") ?? "";
  const manager = params.get("gestor") ?? "";

  const set = (name: string, value: string) =>
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value) next.set(name, value);
        else next.delete(name);
        return next;
      },
      { replace: true },
    );

  const filtered = useMemo(() => {
    const term = normalize(search.trim());
    return cards.filter(
      (card) =>
        (!term || normalize(getSearchText(card)).includes(term)) &&
        (!zone || card.zone === zone) &&
        (!manager || card.owner.name === manager),
    );
  }, [cards, getSearchText, search, zone, manager]);

  const clear = () =>
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        ["q", "zona", "gestor"].forEach((name) => next.delete(name));
        return next;
      },
      { replace: true },
    );

  return {
    view,
    search,
    zone,
    manager,
    filtered,
    setView: (value) => set("vista", value),
    setSearch: (value) => set("q", value),
    setZone: (value) => set("zona", value),
    setManager: (value) => set("gestor", value),
    clear,
  };
}
