import { useState } from "react";

import { useRejectOpportunity } from "../../hooks/useOpportunities";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import FormField from "../ui/FormField";
import Notice from "../ui/Notice";
import { inputClasses } from "../ui/inputClasses";

interface Props {
  opportunityId: number;
  onClose: () => void;
}

function RejectOpportunityDialog({ opportunityId, onClose }: Props) {
  const reject = useRejectOpportunity();
  const [reason, setReason] = useState("");
  const [missing, setMissing] = useState(false);

  const handleConfirm = () => {
    const text = reason.trim();
    setMissing(!text);
    if (text) reject.mutate({ id: opportunityId, reason: text }, { onSuccess: onClose });
  };

  return (
    <Dialog
      title="Marcar como rejeitada/perdida"
      description="A oportunidade sai do quadro, mas o registo mantém-se."
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="danger" disabled={reject.isPending} onClick={handleConfirm}>
            Confirmar
          </Button>
        </>
      }
    >
      {reject.isError && <Notice tone="warning">Não foi possível guardar. Tente novamente.</Notice>}
      <FormField label="Motivo" error={missing ? "Indique o motivo." : undefined}>
        <textarea rows={4} autoFocus className={inputClasses} value={reason} onChange={(e) => setReason(e.target.value)} />
      </FormField>
    </Dialog>
  );
}

export default RejectOpportunityDialog;
