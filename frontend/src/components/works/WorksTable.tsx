import { useMemo } from "react";

import type { WorkCard } from "../../api/worksApi";
import { formatIsoDate, formatMoney } from "../../lib/format";
import type { WorkState } from "../../lib/workRules";
import Pill, { type PillTone } from "../ui/Pill";
import StackedTrack from "../ui/StackedTrack";
import Table, { type TableColumn } from "../ui/Table";

interface Props {
  works: WorkCard[];
  onRowClick?: (work: WorkCard) => void;
  hideOperationColumn?: boolean;
}

const stateTones: Record<WorkState, PillTone> = {
  Planeada: "neutral",
  "Em curso": "amber",
  Concluída: "green",
  Atrasada: "red",
};

function WorksTable({ works, onRowClick, hideOperationColumn = false }: Props) {
  const columns = useMemo<TableColumn<WorkCard>[]>(() => {
    const cols: TableColumn<WorkCard>[] = [
      {
        key: "name",
        header: "Obra",
        render: (work) => <strong className="font-semibold text-ink">{work.name}</strong>,
      },
    ];

    if (!hideOperationColumn) {
      cols.push({
        key: "operation",
        header: "Operação",
        render: (work) => <span className="text-muted">{work.operationCode}</span>,
      });
    }

    cols.push(
      {
        key: "state",
        header: "Estado",
        render: (work) => <Pill tone={stateTones[work.state]}>{work.state}</Pill>,
      },
      {
        key: "plannedStart",
        header: "Início previsto",
        render: (work) => (work.plannedStartDate ? formatIsoDate(work.plannedStartDate) : "—"),
      },
      {
        key: "plannedEnd",
        header: "Fim previsto",
        render: (work) => (work.plannedEndDate ? formatIsoDate(work.plannedEndDate) : "—"),
      },
      {
        key: "budget",
        header: "Orçamento",
        align: "right",
        render: (work) => <span className="tabular-nums font-semibold">{formatMoney(work.totalBudget)}</span>,
      },
      {
        key: "executed",
        header: "Executado",
        align: "right",
        render: (work) => {
          const base = work.totalContracted > 0 ? work.totalContracted : work.totalBudget;
          const remaining = Math.max(0, base - work.totalExecuted);
          return (
            <div className="flex justify-end">
              <StackedTrack
                compact
                segments={[
                  { label: "Executado", value: work.totalExecuted, tone: "main" },
                  { label: "Restante", value: remaining, tone: "light" },
                ]}
              />
            </div>
          );
        },
      },
    );

    return cols;
  }, [hideOperationColumn]);

  return <Table columns={columns} rows={works} getRowKey={(work) => work.id} onRowClick={onRowClick} />;
}

export default WorksTable;
