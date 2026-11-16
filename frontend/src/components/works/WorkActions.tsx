import type { WorkDetail } from "../../api/worksApi";
import Button from "../ui/Button";

interface Props {
  work: WorkDetail;
  onEdit: () => void;
  onMarkCompleted: () => void;
  isPending?: boolean;
}

function WorkActions({ work, onEdit, onMarkCompleted, isPending = false }: Props) {
  const isCompleted = work.state === "Concluída";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button icon="edit" onClick={onEdit} disabled={isPending}>
        Editar
      </Button>
      {!isCompleted && (
        <Button variant="primary" icon="check" onClick={onMarkCompleted} disabled={isPending}>
          Marcar como concluída
        </Button>
      )}
    </div>
  );
}

export default WorkActions;
