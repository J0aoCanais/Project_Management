import { useState } from "react";
import type { LeadContactEntry } from "../../api/leadsApi";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import FormField from "../ui/FormField";
import { inputClasses } from "../ui/inputClasses";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (entry: Omit<LeadContactEntry, "id">) => void;
}

function RegisterContactDialog({ open, onClose, onConfirm }: Props) {
  const [channel, setChannel] = useState("Telefone");
  const [owner, setOwner] = useState("");
  const [result, setResult] = useState("");
  const [note, setNote] = useState("");
  if (!open) return null;
  return <Dialog title="Registar contacto" onClose={onClose} footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" disabled={!owner || !result} onClick={() => onConfirm({ date: new Date().toISOString(), channel, owner, result, note })}>Guardar</Button></>}>
    <FormField label="Canal"><select className={inputClasses} value={channel} onChange={(event) => setChannel(event.target.value)}><option>Telefone</option><option>Email</option><option>Reunião</option></select></FormField>
    <FormField label="Responsável"><input className={inputClasses} value={owner} onChange={(event) => setOwner(event.target.value)} /></FormField>
    <FormField label="Resultado"><input className={inputClasses} value={result} onChange={(event) => setResult(event.target.value)} /></FormField>
    <FormField label="Nota"><textarea className={inputClasses} rows={3} value={note} onChange={(event) => setNote(event.target.value)} /></FormField>
  </Dialog>;
}

export default RegisterContactDialog;
