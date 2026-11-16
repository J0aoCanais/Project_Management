import { useState } from "react";

import { ApiError } from "../../api/client";
import type { Movement } from "../../api/financeApi";
import { useMarkMovementDone } from "../../hooks/useFinance";
import { effectiveDateError } from "../../lib/financeRules";
import { todayIso } from "../../lib/format";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import FormField from "../ui/FormField";
import Notice from "../ui/Notice";
import { inputClasses } from "../ui/inputClasses";
import MovementAmount from "./MovementAmount";

interface Props {
  movement: Movement;
  onClose: () => void;
}

function MarkPaidDialog({ movement, onClose }: Props) {
  const markDone = useMarkMovementDone(movement.id);
  const today = todayIso();
  // Se a data prevista já passou, é a sugestão mais provável; senão, hoje.
  const [date, setDate] = useState(movement.expectedDate && movement.expectedDate <= today ? movement.expectedDate : today);
  const [showError, setShowError] = useState(false);
  const error = effectiveDateError(date, today, true);

  const handleConfirm = () => {
    setShowError(true);
    if (!error) markDone.mutate(date, { onSuccess: onClose });
  };

  return (
    <Dialog
      title="Marcar como realizado"
      description={
        <>
          {movement.category}
          {movement.notes && ` · ${movement.notes}`} · <MovementAmount amount={movement.amount} direction={movement.direction} />
        </>
      }
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" disabled={markDone.isPending} onClick={handleConfirm}>
            Confirmar
          </Button>
        </>
      }
    >
      {markDone.isError && (
        <Notice tone="warning">{markDone.error instanceof ApiError && markDone.error.status === 422 ? markDone.error.message : "Não foi possível guardar. Tente novamente."}</Notice>
      )}
      <FormField label="Data efetiva" error={showError ? error : undefined}>
        <input type="date" autoFocus max={today} className={`${inputClasses} ${showError && error ? "border-danger" : ""}`} value={date} onChange={(e) => setDate(e.target.value)} />
      </FormField>
    </Dialog>
  );
}

export default MarkPaidDialog;
