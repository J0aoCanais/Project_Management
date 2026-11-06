import type { OpportunityCard } from "../../api/opportunitiesApi";
import { OPPORTUNITY_PHASES } from "../../lib/phases";
import KanbanBoard, { type KanbanColumnConfig } from "../ui/KanbanBoard";
import DealCard from "./DealCard";

interface Props {
  cards: OpportunityCard[];
  onMove: (id: number, phaseIndex: number) => void;
}

// Cores dos pontos do mockup: neutro nas primeiras fases, âmbar a meio, verde no fim.
function dotFor(index: number): string | undefined {
  if (index === 4 || index === 5) return "bg-warning";
  if (index >= 6) return "bg-success";
  return undefined;
}

const columns: KanbanColumnConfig[] = OPPORTUNITY_PHASES.map((phase, index) => ({
  id: String(index),
  title: phase.name,
  dotClassName: dotFor(index),
}));

function OpportunityBoard({ cards, onMove }: Props) {
  return (
    <KanbanBoard
      columns={columns}
      items={cards}
      startAt={1}
      getItemId={(card) => String(card.id)}
      getColumnId={(card) => String(card.phaseIndex)}
      renderCard={(card) => <DealCard card={card} onMove={(phaseIndex) => onMove(card.id, phaseIndex)} />}
      onMove={(itemId, columnId) => onMove(Number(itemId), Number(columnId))}
    />
  );
}

export default OpportunityBoard;
