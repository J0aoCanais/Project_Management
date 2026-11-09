import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import type { OpportunityCard } from "../api/opportunitiesApi";

export type OpportunityView = "quadro" | "lista";

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

/** Vista e filtros da lista, guardados no URL para sobreviverem à troca de vista e ao recarregar. */
export function useOpportunityFilters(cards: OpportunityCard[]) {
  const [params, setParams] = useSearchParams();

  const view: OpportunityView = params.get("vista") === "lista" ? "lista" : "quadro";
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
        (!term || normalize(`${card.title} ${card.zone}`).includes(term)) &&
        (!zone || card.zone === zone) &&
        (!manager || card.owner.name === manager),
    );
  }, [cards, search, zone, manager]);

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
    setView: (value: OpportunityView) => set("vista", value),
    setSearch: (value: string) => set("q", value),
    setZone: (value: string) => set("zona", value),
    setManager: (value: string) => set("gestor", value),
    clear,
  };
}
