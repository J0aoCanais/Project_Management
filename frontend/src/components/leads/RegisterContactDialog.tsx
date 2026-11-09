import { useState } from "react";

import { useAddLeadContact } from "../../hooks/useLeads";
import { LEAD_TEXT_LIMITS } from "../../lib/leadRules";
import { contactChannelOptions } from "../../temp";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import FormField from "../ui/FormField";
import Notice from "../ui/Notice";
import Select from "../ui/Select";
import { inputClasses } from "../ui/inputClasses";

interface Props {
  leadId: number;
  onClose: () => void;
}

function RegisterContactDialog({ leadId, onClose }: Props) {
  const add = useAddLeadContact(leadId);
  const [channel, setChannel] = useState(contactChannelOptions[0]);
  const [owner, setOwner] = useState("");
  const [result, setResult] = useState("");
  const [note, setNote] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const handleConfirm = () => {
    setShowErrors(true);
    if (!owner.trim() || !result.trim()) return;
    add.mutate(
      { date: new Date().toISOString(), channel, owner: owner.trim(), result: result.trim(), note: note.trim() },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog
      title="Registar contacto"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" disabled={add.isPending} onClick={handleConfirm}>
            Guardar
          </Button>
        </>
      }
    >
      {add.isError && <Notice tone="warning">Não foi possível guardar. Tente novamente.</Notice>}
      <FormField label="Canal">
        <Select value={channel} onChange={setChannel} options={contactChannelOptions} />
      </FormField>
      <FormField label="Responsável" error={showErrors && !owner.trim() ? "Indique o responsável." : undefined}>
        <input className={inputClasses} value={owner} maxLength={LEAD_TEXT_LIMITS.contactOwner} onChange={(e) => setOwner(e.target.value)} autoFocus />
      </FormField>
      <FormField label="Resultado" error={showErrors && !result.trim() ? "Indique o resultado." : undefined}>
        <input className={inputClasses} value={result} maxLength={LEAD_TEXT_LIMITS.contactResult} onChange={(e) => setResult(e.target.value)} />
      </FormField>
      <FormField label="Nota (opcional)">
        <textarea className={`${inputClasses} resize-none`} rows={3} value={note} maxLength={LEAD_TEXT_LIMITS.contactNote} onChange={(e) => setNote(e.target.value)} />
      </FormField>
    </Dialog>
  );
}

export default RegisterContactDialog;
