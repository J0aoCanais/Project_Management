import type { ReactNode } from "react";

import KanbanColumn from "./KanbanColumn";

export interface KanbanColumnConfig {
  id: string;
  title: string;
  dotClassName?: string;
}

interface Props<T> {
  columns: KanbanColumnConfig[];
  items: T[];
  getItemId: (item: T) => string;
  getColumnId: (item: T) => string;
  renderCard: (item: T) => ReactNode;
  onMove: (itemId: string, columnId: string) => void;
  /** Número da primeira coluna: 1 nas oportunidades, 9 nas operações. */
  startAt?: number;
}

/** Quadro genérico com arrastar e largar. O arrastar não basta: a página tem de oferecer também uma alternativa pelo teclado. */
function KanbanBoard<T>({ columns, items, getItemId, getColumnId, renderCard, onMove, startAt = 1 }: Props<T>) {
  return (
    <div className="flex snap-x snap-mandatory gap-1.5 overflow-x-auto pb-3.5 min-[721px]:snap-none">
      {columns.map((column, index) => {
        const cards = items.filter((item) => getColumnId(item) === column.id);
        return (
          <KanbanColumn
            key={column.id}
            title={`${startAt + index}. ${column.title}`}
            count={cards.length}
            dotClassName={column.dotClassName}
            onDropItem={(itemId) => onMove(itemId, column.id)}
          >
            {cards.map((item) => (
              <div
                key={getItemId(item)}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", getItemId(item))}
              >
                {renderCard(item)}
              </div>
            ))}
          </KanbanColumn>
        );
      })}
    </div>
  );
}

export default KanbanBoard;
