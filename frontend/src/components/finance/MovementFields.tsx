import type { Movement } from "../../api/financeApi";
import { formatIsoDate } from "../../lib/format";
import RecordFields from "../ui/RecordFields";
import MovementAmount from "./MovementAmount";
import MovementLinkText from "./MovementLinkText";
import MovementStatusPill from "./MovementStatusPill";

interface Props {
  movement: Movement;
}

/** Separador "Dados" de um movimento. */
function MovementFields({ movement }: Props) {
  return (
    <RecordFields
      title="Dados do movimento"
      fields={[
        { label: "Direção", value: movement.direction },
        { label: "Categoria", value: movement.category },
        { label: "Valor", value: <MovementAmount amount={movement.amount} direction={movement.direction} /> },
        { label: "Estado", value: <MovementStatusPill status={movement.status} /> },
        { label: "Data prevista", value: movement.expectedDate ? formatIsoDate(movement.expectedDate) : "—" },
        { label: "Data efetiva", value: movement.effectiveDate ? formatIsoDate(movement.effectiveDate) : "—" },
        { label: "Associado a", value: <MovementLinkText link={movement.link} /> },
      ]}
    >
      <div className="px-3 py-3">
        <h3 className="mb-1 text-[11px] font-normal text-muted">Notas</h3>
        <p className="text-xs leading-relaxed whitespace-pre-line wrap-anywhere">{movement.notes ?? "Sem notas."}</p>
      </div>
    </RecordFields>
  );
}

export default MovementFields;
