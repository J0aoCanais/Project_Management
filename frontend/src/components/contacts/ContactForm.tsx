import type { ContactFormValues } from "../../lib/contactForm";
import { CONTACT_TEXT_LIMITS, sanitizeNif, type ContactErrors } from "../../lib/contactRules";
import { LEAD_TEXT_LIMITS, sanitizePhone } from "../../lib/leadRules";
import { consentChannelOptions, contactTypeOptions, zoneOptions } from "../../temp";
import FormField from "../ui/FormField";
import Select from "../ui/Select";
import { inputClasses } from "../ui/inputClasses";

interface Props {
  values: ContactFormValues;
  onChange: (values: ContactFormValues) => void;
  errors: ContactErrors;
  /** Os erros só aparecem depois de tentar submeter. */
  showErrors: boolean;
  /** Esconde o tipo, ex.: num investidor o papel é sempre Investidor. */
  showType?: boolean;
}

/** Campos de um contacto. Partilhado por criar, editar e "Novo investidor". */
function ContactForm({ values, onChange, errors, showErrors, showType = true }: Props) {
  const set = <K extends keyof ContactFormValues>(key: K, value: ContactFormValues[K]) => onChange({ ...values, [key]: value });
  const error = (key: keyof ContactErrors) => (showErrors ? errors[key] : undefined);

  return (
    <>
      <FormField label="Nome" error={error("name")}>
        <input className={inputClasses} value={values.name} maxLength={CONTACT_TEXT_LIMITS.name} onChange={(e) => set("name", e.target.value)} autoFocus />
      </FormField>
      {showType && (
        <FormField label="Tipo">
          <Select value={values.type} onChange={(value) => set("type", value)} options={contactTypeOptions} />
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
        <Select value={values.zone} onChange={(value) => set("zone", value)} options={zoneOptions} placeholder="Sem zona" />
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
}

export default ContactForm;
