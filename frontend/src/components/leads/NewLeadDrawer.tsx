import { useState } from "react";
import type { NewLeadInput } from "../../api/leadsApi";
import Button from "../ui/Button";
import Drawer from "../ui/Drawer";
import FormField from "../ui/FormField";
import SegmentedChoice from "../ui/SegmentedChoice";
import { inputClasses } from "../ui/inputClasses";

interface Props {
  open: boolean;
  sources: string[];
  onClose: () => void;
  onCreate: (input: NewLeadInput) => void;
}

const contacts = ["Ana Lourenço", "Rodrigo Mendes", "Joana Costa"];

function NewLeadDrawer({ open, sources, onClose, onCreate }: Props) {
  const [mode, setMode] = useState<"existing" | "new">("new");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [zone, setZone] = useState("Baixa");
  const [source, setSource] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  if (!open) return null;
  const submit = () => {
    if ((mode === "new" && (!contactName.trim() || !phone.trim())) || (mode === "existing" && !contactName)) {
      setError("Indique o contacto e o telemóvel.");
      return;
    }
    if (!source) {
      setError("Indique a origem.");
      return;
    }
    onCreate({ contactName: contactName.trim(), phone: phone.trim(), referredBy, zone, source, message });
  };
  return (
    <Drawer title="Nova lead" subtitle="Novo registo comercial" onClose={onClose} footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" onClick={submit}>Criar lead</Button></>}>
      <fieldset className="grid gap-2 border-0 p-0">
        <legend className="mb-1 text-xs font-bold">Contacto</legend>
        <SegmentedChoice label="Tipo de contacto" value={mode} onChange={setMode} options={[{ value: "existing", label: "Escolher existente" }, { value: "new", label: "Criar novo" }]} />
        {mode === "existing" ? (
          <FormField label="Contacto" error={error && !contactName ? error : undefined}><select className={inputClasses} value={contactName} onChange={(event) => setContactName(event.target.value)}><option value="">Selecionar contacto</option>{contacts.map((contact) => <option key={contact}>{contact}</option>)}</select></FormField>
        ) : (
          <><FormField label="Nome" error={error && !contactName ? error : undefined}><input className={inputClasses} value={contactName} onChange={(event) => setContactName(event.target.value)} /></FormField><FormField label="Telemóvel" error={error && !phone ? error : undefined}><input className={inputClasses} value={phone} onChange={(event) => setPhone(event.target.value)} /></FormField></>
        )}
      </fieldset>
      <fieldset className="grid gap-2 border-0 border-t border-line pt-3">
        <legend className="mb-1 text-xs font-bold">Origem</legend>
        <FormField label="Origem" error={error && !source ? error : undefined}><select className={inputClasses} value={source} onChange={(event) => setSource(event.target.value)}><option value="">Selecionar origem</option>{sources.map((item) => <option key={item}>{item}</option>)}</select></FormField>
        <FormField label="Referenciado por"><input className={inputClasses} value={referredBy} onChange={(event) => setReferredBy(event.target.value)} /></FormField>
        <FormField label="Mensagem recebida"><textarea className={inputClasses} rows={3} value={message} onChange={(event) => setMessage(event.target.value)} /></FormField>
      </fieldset>
    </Drawer>
  );
}

export default NewLeadDrawer;
