import { useState } from "react";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import FormField from "../ui/FormField";
import { inputClasses } from "../ui/inputClasses";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

function DiscardLeadDialog({ open, onClose, onConfirm }: Props) {
  const [reason, setReason] = useState("");
  if (!open) return null;
  return <Dialog title="Descartar lead" description="Indique obrigatoriamente o motivo." onClose={onClose} footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="danger" disabled={!reason} onClick={() => onConfirm(reason)}>Confirmar</Button></>}>
    <FormField label="Motivo"><select className={inputClasses} value={reason} onChange={(event) => setReason(event.target.value)}><option value="">Selecionar motivo</option><option>Sem interesse do proprietário</option><option>Fora dos critérios de investimento</option><option>Preço não negociável</option></select></FormField>
  </Dialog>;
}

export default DiscardLeadDialog;
