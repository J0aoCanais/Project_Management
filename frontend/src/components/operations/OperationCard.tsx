import type { OperationCard as OperationCardData } from "../../api/operationsApi";
import type { Phase } from "../../lib/phases";
import PipelineCard from "../pipeline/PipelineCard";

interface Props {
  operation: OperationCardData;
  phases: Phase[];
  onMove: (phaseIndex: number) => void;
}

function OperationCard({ operation, phases, onMove }: Props) {
  return (
    <PipelineCard
      href={`/operacoes/${operation.id}`}
      title={operation.code}
      subtitle={`${operation.typology} · ${operation.title} · ${operation.zone}`}
      badge={operation.typology}
      primaryLabel="Preço de compra"
      primaryValue={operation.realPurchasePrice}
      secondaryLabel="Preço anunciado"
      secondaryValue={operation.advertisedPrice}
      marginLabel="Margem prevista"
      marginValue={operation.expectedMargin}
      phaseIndex={operation.phaseIndex}
      daysInPhase={operation.daysInPhase}
      owner={operation.owner.name}
      phases={phases}
      onMove={onMove}
    />
  );
}

export default OperationCard;
