import type { FormEvent, ReactNode } from "react";

import type { ContactFormErrors, ContactFormValues } from "../../lib/contactForm";
import { CONTACT_TEXT_LIMITS, sanitizeNif } from "../../lib/contactRules";
import { LEAD_TEXT_LIMITS, sanitizePhone } from "../../lib/leadRules";
import { useContactTypes } from "../../hooks/useContacts";
import { useZones } from "../../hooks/useZones";
import { consentChannelOptions } from "../../temp";
import FormField from "../ui/FormField";
import Select from "../ui/Select";
import { inputClasses } from "../ui/inputClasses";

interface Props {
  /** Valores controlados pelo pai, que também calcula os erros com `contactFormErrors`. */
  values: ContactFormValues;
  onChange: (values: ContactFormValues) => void;
  errors: ContactFormErrors;
  /** Os erros só aparecem depois de tentar submeter. */
  showErrors: boolean;
  /** Esconde o tipo, ex.: num investidor o papel é sempre Investidor. */
  showType?: boolean;
  /**
   * Dentro de outro formulário (ex.: "Novo investidor", nova lead): só os campos, sem `<form>` próprio.
   * Sem `embedded`, o `ContactForm` é o `<form>` e chama `onSubmit`; o botão de submeter usa `form={formId}`.
   */
  embedded?: boolean;
  formId?: string;
  onSubmit?: () => void;
  /** Conteúdo antes dos campos, ex.: o aviso de erro do servidor. */
  header?: ReactNode;
}

/** Campos de um contacto. Partilhado por criar, editar, "Novo investidor" e a nova lead (tarefa 10). */
function ContactForm({ values, onChange, errors, showErrors, showType = true, embedded = false, formId, onSubmit, header }: Props) {
  const contactTypeOptions = useContactTypes();
  const zones = useZones();
  const set = <K extends keyof ContactFormValues>(key: K, value: ContactFormValues[K]) => onChange({ ...values, [key]: value });
  const error = (key: keyof ContactFormErrors) => (showErrors ? errors[key] : undefined);
  // Um tipo que entretanto foi apagado continua visível até se escolher outro.
  const typeOptions = values.type && !contactTypeOptions.includes(values.type) ? [...contactTypeOptions, values.type] : contactTypeOptions;
  const zoneOptions = (zones.data ?? []).map((zone) => ({ value: String(zone.id), label: zone.name }));

  const fields = (
    <>
      {header}
      <FormField label="Nome" error={error("name")}>
        <input className={inputClasses} value={values.name} maxLength={CONTACT_TEXT_LIMITS.name} onChange={(e) => set("name", e.target.value)} autoFocus={!embedded} />
      </FormField>
      {showType && (
        <FormField label="Tipo de contacto" error={error("type")}>
          <Select value={values.type} onChange={(value) => set("type", value)} options={typeOptions} placeholder="Selecionar tipo…" invalid={!!error("type")} />
        </FormField>
      )}
      <FormField label="Email (opcional)" error={error("email")}>
        <input className={inputClasses} type="email" inputMode="email" placeholder="nome@exemplo.pt" value={values.email} maxLength={CONTACT_TEXT_LIMITS.email} onChange={(e) => set("email", e.target.value.replace(/\s/g, ""))} />
      </FormField>
      <FormField label="Telemóvel (opcional)" error={error("phone")}>
        <input className={inputClasses} type="tel" inputMode="tel" placeholder="912 345 678" value={values.phone} maxLength={LEAD_TEXT_LIMITS.phone} onChange={(e) => set("phone", sanitizePhone(e.target.value))} />
      </FormField>
      <FormField label="Empresa (opcional)" error={error("company")}>
        <input className={inputClasses} value={values.company} maxLength={CONTACT_TEXT_LIMITS.company} onChange={(e) => set("company", e.target.value)} />
      </FormField>
      <FormField label="Zona (opcional)">
        <Select
          value={values.zoneId}
          onChange={(value) => set("zoneId", value)}
          options={zoneOptions}
          placeholder={zones.isPending ? "A carregar zonas…" : zones.isError ? "Não foi possível carregar as zonas" : "Sem zona"}
          disabled={zones.isPending}
        />
      </FormField>
      <FormField label="NIF (opcional)" error={error("nif")}>
        <input className={inputClasses} inputMode="numeric" placeholder="9 dígitos" value={values.nif} maxLength={CONTACT_TEXT_LIMITS.nif} onChange={(e) => set("nif", sanitizeNif(e.target.value))} />
      </FormField>
      <FormField label="Morada (opcional)" error={error("address")}>
        <textarea className={`${inputClasses} resize-none wrap-anywhere`} rows={2} value={values.address} maxLength={CONTACT_TEXT_LIMITS.address} onChange={(e) => set("address", e.target.value)} />
      </FormField>
      <FormField label="Notas (opcional)" error={error("notes")}>
        <textarea className={`${inputClasses} resize-none wrap-anywhere`} rows={3} value={values.notes} maxLength={CONTACT_TEXT_LIMITS.notes} onChange={(e) => set("notes", e.target.value)} />
      </FormField>
      <label className="flex items-center gap-2 text-xs">
        <input type="checkbox" className="accent-brand" checked={values.consentGiven} onChange={(e) => set("consentGiven", e.target.checked)} />
        Deu consentimento RGPD para tratamento dos dados
      </label>
      {values.consentGiven && (
        <FormField label="Canal do consentimento" error={error("consentChannel")}>
          <Select value={values.consentChannel} onChange={(value) => set("consentChannel", value)} options={consentChannelOptions} placeholder="Selecionar canal…" />
        </FormField>
      )}
    </>
  );

  if (embedded) return fields;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit?.();
  };

  return (
    <form id={formId} noValidate onSubmit={handleSubmit} className="grid gap-3 rounded-panel border border-line bg-white p-3.5">
      {fields}
    </form>
  );
}

export default ContactForm;
