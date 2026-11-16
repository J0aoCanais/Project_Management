import { useState, type FormEvent } from "react";

import { useCancelOperation } from "../../hooks/useOperations";
import { cancellationReasonError, OPERATION_TEXT_LIMITS } from "../../lib/operationRules";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import FormField from "../ui/FormField";
import Notice from "../ui/Notice";
import { inputClasses } from "../ui/inputClasses";

interface Props {
  operationId: number;
  onClose: () => void;
}

function CancelOperationDialog({ operationId, onClose }: Props) {
  const cancel = useCancelOperation();
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const error = cancellationReasonError(reason);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (error) return;
    cancel.mutate({ id: operationId, reason }, { onSuccess: onClose });
  };

  return (
    <Dialog
      title="Cancelar operação"
      description="Esta operação deixa de aparecer no pipeline. Indique o motivo."
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Voltar</Button>
          <Button variant="danger" type="submit" form="cancelar-operacao" disabled={cancel.isPending}>Confirmar cancelamento</Button>
        </>
      }
    >
      <form id="cancelar-operacao" noValidate onSubmit={handleSubmit} className="grid gap-3">
        {cancel.isError && <Notice tone="warning">Não foi possível cancelar a operação. Tente novamente.</Notice>}
        <FormField label="Motivo" error={submitted ? error : undefined}>
          <textarea
            className={`${inputClasses} resize-y`}
            rows={4}
            maxLength={OPERATION_TEXT_LIMITS.cancellationReason}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            autoFocus
          />
        </FormField>
      </form>
    </Dialog>
  );
}

export default CancelOperationDialog;
