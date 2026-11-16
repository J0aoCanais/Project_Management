import type { Movement } from "../../api/financeApi";
import Button from "../ui/Button";
import EntityHeader from "../ui/EntityHeader";
import Icon from "../ui/Icon";
import MovementAmount from "./MovementAmount";
import MovementStatusPill from "./MovementStatusPill";

interface Props {
  movement: Movement;
  onEdit: () => void;
  onMarkDone: () => void;
}

function MovementHeader({ movement, onEdit, onMarkDone }: Props) {
  return (
    <EntityHeader
      title={movement.notes ?? movement.category}
      type={`Movimento financeiro · ${movement.category}`}
      backTo="/financas"
      media={
        <span className="grid size-11 shrink-0 place-items-center rounded-panel bg-brand-soft text-brand max-[720px]:hidden">
          <Icon name="euro" />
        </span>
      }
      meta={
        <div className="flex flex-wrap items-center gap-2">
          <MovementStatusPill status={movement.status} />
          <MovementAmount amount={movement.amount} direction={movement.direction} className="text-xs" />
        </div>
      }
      actions={
        <>
          <Button onClick={onEdit}>Editar</Button>
          {movement.status !== "Realizado" && (
            <Button variant="primary" onClick={onMarkDone}>
              Marcar como realizado
            </Button>
          )}
        </>
      }
    />
  );
}

export default MovementHeader;
