import type { OpportunityCard } from "../../api/opportunitiesApi";
import { OPPORTUNITY_PHASES, type Phase } from "../../lib/phases";
import PipelineBoard from "../pipeline/PipelineBoard";
import DealCard from "./DealCard";

interface Props {
  cards: OpportunityCard[];
  phases?: Phase[];
  onMove: (id: number, phaseIndex: number) => void;
}

const dotFor = (index: number): string | undefined => (index === 4 || index === 5 ? "bg-warning" : index >= 6 ? "bg-success" : undefined);

function OpportunityBoard({ cards, phases = OPPORTUNITY_PHASES, onMove }: Props) {
  return (
    <PipelineBoard
      items={cards}
      phases={phases}
      startAt={1}
      getDotClassName={dotFor}
      getItemId={(card) => String(card.id)}
      getPhaseIndex={(card) => card.phaseIndex}
      renderCard={(card) => <DealCard card={card} phases={phases} onMove={(phaseIndex) => onMove(card.id, phaseIndex)} />}
      onMove={(itemId, phaseIndex) => onMove(Number(itemId), phaseIndex)}
    />
  );
}

export default OpportunityBoard;
