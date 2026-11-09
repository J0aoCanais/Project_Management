import { useState, type FormEvent } from "react";

import { useCreateLead, useLeadSources } from "../../hooks/useLeads";
import { LEAD_TEXT_LIMITS, leadNameError, maxLengthError, phoneError, sanitizePhone } from "../../lib/leadRules";
import { leadContactOptions, leadZoneOptions } from "../../temp";
import Button from "../ui/Button";
import Drawer from "../ui/Drawer";
import FormField from "../ui/FormField";
import Notice from "../ui/Notice";
import Select from "../ui/Select";
import SegmentedChoice from "../ui/SegmentedChoice";
import { inputClasses } from "../ui/inputClasses";

interface Props {
  onClose: () => void;
}

const FORM_ID = "nova-lead";

function NewLeadDrawer({ onClose }: Props) {
  const { data: sources = [] } = useLeadSources();
  const create = useCreateLead();
  const [mode, setMode] = useState<"existing" | "new">("new");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [zone, setZone] = useState("");
  const [source, setSource] = useState("");
  const [message, setMessage] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const errors = {
    contactName: mode === "new" ? leadNameError(contactName) : contactName ? undefined : "Escolha o contacto.",
    phone: mode === "new" ? phoneError(phone) : undefined,
    zone: zone ? undefined : "Escolha a zona.",
    source: source ? undefined : "Indique a origem.",
    referredBy: maxLengthError(referredBy, LEAD_TEXT_LIMITS.referredBy),
    message: maxLengthError(message, LEAD_TEXT_LIMITS.message),
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    if (Object.values(errors).some(Boolean)) return;
    create.mutate(
      { contactName: contactName.trim(), phone: phone.trim(), referredBy: referredBy.trim(), zone, source, message: message.trim() },
      { onSuccess: onClose },
    );
  };

  return (
    <Drawer
      title="Nova lead"
      subtitle="Entra com o estado Nova"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form={FORM_ID} disabled={create.isPending}>
            Criar lead
          </Button>
        </>
      }
    >
      <form id={FORM_ID} noValidate onSubmit={handleSubmit} className="grid gap-3 rounded-panel border border-line bg-white p-3.5">
        {create.isError && <Notice tone="warning">Não foi possível criar a lead. Tente novamente.</Notice>}
        <SegmentedChoice
          label="Tipo de contacto"
          value={mode}
          onChange={(value) => {
            setMode(value);
            setContactName("");
          }}
          options={[
            { value: "existing", label: "Escolher existente" },
            { value: "new", label: "Criar novo" },
          ]}
        />
        {mode === "existing" ? (
          <FormField label="Contacto" error={showErrors ? errors.contactName : undefined}>
            <Select value={contactName} onChange={setContactName} options={leadContactOptions} placeholder="Selecionar contacto…" />
          </FormField>
        ) : (
          <>
            <FormField label="Nome" error={showErrors ? errors.contactName : undefined}>
              <input className={inputClasses} value={contactName} maxLength={LEAD_TEXT_LIMITS.contactName} onChange={(e) => setContactName(e.target.value)} autoFocus />
            </FormField>
            <FormField label="Telemóvel" error={showErrors ? errors.phone : undefined}>
              <input className={inputClasses} type="tel" inputMode="tel" placeholder="912 345 678" value={phone} maxLength={LEAD_TEXT_LIMITS.phone} onChange={(e) => setPhone(sanitizePhone(e.target.value))} />
            </FormField>
          </>
        )}
        <FormField label="Zona" error={showErrors ? errors.zone : undefined}>
          <Select value={zone} onChange={setZone} options={leadZoneOptions} placeholder="Selecionar zona…" />
        </FormField>
        <FormField label="Origem" error={showErrors ? errors.source : undefined}>
          <Select value={source} onChange={setSource} options={sources} placeholder="Selecionar origem…" />
        </FormField>
        <FormField label="Referenciado por (opcional)" error={showErrors ? errors.referredBy : undefined}>
          <input className={inputClasses} value={referredBy} maxLength={LEAD_TEXT_LIMITS.referredBy} onChange={(e) => setReferredBy(e.target.value)} />
        </FormField>
        <FormField label="Mensagem recebida (opcional)" error={showErrors ? errors.message : undefined}>
          <textarea className={`${inputClasses} resize-none`} rows={3} value={message} maxLength={LEAD_TEXT_LIMITS.message} onChange={(e) => setMessage(e.target.value)} />
        </FormField>
      </form>
    </Drawer>
  );
}

export default NewLeadDrawer;
