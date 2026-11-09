import { useState } from "react";

import { useUpdateLeadStatus } from "../../hooks/useLeads";
import { discardReasonOptions } from "../../temp";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import FormField from "../ui/FormField";
import Notice from "../ui/Notice";
import Select from "../ui/Select";

interface Props {
  leadId: number;
  onClose: () => void;
}

function DiscardLeadDialog({ leadId, onClose }: Props) {
  const update = useUpdateLeadStatus(leadId);
  const [reason, setReason] = useState("");
  const [missing, setMissing] = useState(false);

  const handleConfirm = () => {
    setMissing(!reason);
    if (reason) update.mutate({ status: "Descartada", discardReason: reason }, { onSuccess: onClose });
  };

  return (
    <Dialog
      title="Descartar lead"
      description="A lead sai da lista ativa, mas o registo mantém-se."
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="danger" disabled={update.isPending} onClick={handleConfirm}>
            Confirmar
          </Button>
        </>
      }
    >
      {update.isError && <Notice tone="warning">Não foi possível guardar. Tente novamente.</Notice>}
      <FormField label="Motivo" error={missing ? "Indique o motivo." : undefined}>
        <Select value={reason} onChange={setReason} options={discardReasonOptions} placeholder="Selecionar motivo…" autoFocus />
      </FormField>
    </Dialog>
  );
}

export default DiscardLeadDialog;
