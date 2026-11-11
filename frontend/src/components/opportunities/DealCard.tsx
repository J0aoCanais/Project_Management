import type { OpportunityCard } from "../../api/opportunitiesApi";
import type { Phase } from "../../lib/phases";
import PipelineCard from "../pipeline/PipelineCard";

interface Props {
  card: OpportunityCard;
  phases: Phase[];
  /** Alternativa ao arrastar, para teclado e telemóvel. */
  onMove: (phaseIndex: number) => void;
}

function DealCard({ card, phases, onMove }: Props) {
  return (
    <PipelineCard
      href={`/oportunidades/${card.id}`}
      title={card.title}
      subtitle={card.zone}
      badge={card.typology}
      primaryLabel="Preço pedido"
      primaryValue={card.askingPrice}
      secondaryLabel="VVR"
      secondaryValue={card.vvr}
      marginLabel="Lucro estimado"
      marginValue={card.estimatedProfit}
      phaseIndex={card.phaseIndex}
      daysInPhase={card.daysInPhase}
      owner={card.owner.name}
      phases={phases}
      onMove={onMove}
    />
  );
}

export default DealCard;
