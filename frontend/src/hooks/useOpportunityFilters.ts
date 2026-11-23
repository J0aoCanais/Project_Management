import type { OpportunityCard } from "../api/opportunitiesApi";
import { usePipelineFilters, type PipelineView } from "./usePipelineFilters";

/** Vista e filtros da lista, guardados no URL para sobreviverem à troca de vista e ao recarregar. */
export function useOpportunityFilters(cards: OpportunityCard[]) {
  return usePipelineFilters(cards, (card) => `${card.title} ${card.zone}`);
}

export type OpportunityView = PipelineView;
