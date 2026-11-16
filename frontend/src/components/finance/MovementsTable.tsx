import { useNavigate } from "react-router-dom";

import type { Movement } from "../../api/financeApi";
import { movementDate } from "../../lib/financeRules";
import { formatIsoDate } from "../../lib/format";
import Table, { type TableColumn } from "../ui/Table";
import MovementAmount from "./MovementAmount";
import MovementLinkText from "./MovementLinkText";
import MovementStatusPill from "./MovementStatusPill";

interface Props {
  movements: Movement[];
  onMarkDone?: (movement: Movement) => void;
  onEdit?: (movement: Movement) => void;
  /** Esconde "Associado a" quando a tabela já está dentro do detalhe dessa entidade (operação, investimento, obra). */
  hideLink?: boolean;
}

const action = "text-xs font-semibold text-brand hover:text-brand-dark";

/** Tabela de movimentos. A mesma em Finanças e nos detalhes de operação, investimento e obra. */
function MovementsTable({ movements, onMarkDone, onEdit, hideLink = false }: Props) {
  const navigate = useNavigate();
  const columns: TableColumn<Movement>[] = [
    {
      key: "category",
      header: "Categoria",
      render: (movement) => (
        <span className="block max-w-[210px] truncate" title={movement.notes}>
          {movement.category}
          {movement.notes && <span className="font-normal text-muted"> · {movement.notes}</span>}
        </span>
      ),
    },
    {
      key: "date",
      header: "Data",
      render: (movement) => {
        const date = movementDate(movement);
        if (!date) return "—";
        return (
          <>
            {formatIsoDate(date)}
            {!movement.effectiveDate && <span className="ml-1 text-[11px] text-muted max-[720px]:hidden">prevista</span>}
          </>
        );
      },
    },
    ...(hideLink ? [] : [{ key: "link", header: "Associado a", render: (movement: Movement) => <span className="block max-w-[230px] truncate"><MovementLinkText link={movement.link} /></span> }]),
    { key: "status", header: "Estado", render: (movement) => <MovementStatusPill status={movement.status} /> },
    ...(onMarkDone || onEdit
      ? [
          {
            key: "actions",
            header: "Ações",
            render: (movement: Movement) => (
              <span className="flex gap-3" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                {onMarkDone && movement.status !== "Realizado" && (
                  <button type="button" className={action} onClick={() => onMarkDone(movement)}>
                    Marcar como realizado
                  </button>
                )}
                {onEdit && (
                  <button type="button" className={action} onClick={() => onEdit(movement)}>
                    Editar
                  </button>
                )}
              </span>
            ),
          },
        ]
      : []),
    { key: "amount", header: "Valor", align: "right", render: (movement) => <MovementAmount amount={movement.amount} direction={movement.direction} /> },
  ];
  return <Table columns={columns} rows={movements} getRowKey={(movement) => movement.id} onRowClick={(movement) => navigate(`/financas/${movement.id}`)} />;
}

export default MovementsTable;
