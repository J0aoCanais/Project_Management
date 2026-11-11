import type { ReactNode } from "react";

import type { Phase } from "../../lib/phases";
import KanbanBoard from "../ui/KanbanBoard";

interface Props<T> {
  items: T[];
  phases: Phase[];
  startAt: number;
  getDotClassName?: (index: number) => string | undefined;
  getItemId: (item: T) => string;
  getPhaseIndex: (item: T) => number;
  renderCard: (item: T) => ReactNode;
  onMove: (itemId: string, phaseIndex: number) => void;
}

function PipelineBoard<T>({ items, phases, startAt, getDotClassName, getItemId, getPhaseIndex, renderCard, onMove }: Props<T>) {
  return (
    <KanbanBoard
      columns={phases.map((phase, index) => ({ id: String(index), title: phase.name, dotClassName: getDotClassName?.(index) }))}
      items={items}
      startAt={startAt}
      getItemId={getItemId}
      getColumnId={(item) => String(getPhaseIndex(item))}
      renderCard={renderCard}
      onMove={(itemId, phaseIndex) => onMove(itemId, Number(phaseIndex))}
    />
  );
}

export default PipelineBoard;
