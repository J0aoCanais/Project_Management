import type { InvestorProfile } from "../../api/investorsApi";
import { INVESTOR_TEXT_LIMITS, type InvestorProfileErrors } from "../../lib/investorRules";
import { MONEY } from "../../lib/opportunityRules";
import { relationStatusOptions, riskProfileOptions, zoneOptions } from "../../temp";
import CheckboxGroup from "../ui/CheckboxGroup";
import FormField from "../ui/FormField";
import NumberInput from "../ui/NumberInput";
import Select from "../ui/Select";
import { inputClasses } from "../ui/inputClasses";

interface Props {
  values: InvestorProfile;
  onChange: (values: InvestorProfile) => void;
  errors: InvestorProfileErrors;
  /** Os erros só aparecem depois de tentar submeter. */
  showErrors: boolean;
}

/** Campos do perfil de investidor. Partilhado por criar e editar. */
function InvestorProfileForm({ values, onChange, errors, showErrors }: Props) {
  const set = <K extends keyof InvestorProfile>(key: K, value: InvestorProfile[K]) => onChange({ ...values, [key]: value });
  const error = (key: keyof InvestorProfile) => (showErrors ? errors[key] : undefined);
  const money = (key: "availableCapital" | "minAmount" | "maxAmount") => (
    <NumberInput min={MONEY.min} max={MONEY.max} decimals={MONEY.decimals} suffix="€" value={values[key]} onChange={(value) => set(key, value)} invalid={!!error(key)} />
  );

  return (
    <>
      <FormField label="Capital disponível" error={error("availableCapital")}>
        {money("availableCapital")}
      </FormField>
      <div className="grid gap-3 min-[721px]:grid-cols-2">
        <FormField label="Montante mínimo" error={error("minAmount")}>
          {money("minAmount")}
        </FormField>
        <FormField label="Montante máximo" error={error("maxAmount")}>
          {money("maxAmount")}
        </FormField>
      </div>
      <FormField label="Perfil de risco" error={error("riskProfile")}>
        <Select value={values.riskProfile} onChange={(value) => set("riskProfile", value)} options={riskProfileOptions} placeholder="Selecionar perfil…" />
      </FormField>
      <CheckboxGroup label="Zonas preferidas (opcional)" options={zoneOptions} value={values.preferredZones} onChange={(value) => set("preferredZones", value)} />
      <FormField label="Prazos preferidos (opcional)" error={error("preferredTerms")}>
        <textarea
          className={`${inputClasses} resize-none wrap-anywhere`}
          rows={2}
          placeholder="Ex.: 8 a 18 meses, retorno mínimo de 8%"
          value={values.preferredTerms}
          maxLength={INVESTOR_TEXT_LIMITS.preferredTerms}
          onChange={(e) => set("preferredTerms", e.target.value)}
        />
      </FormField>
      <FormField label="Estado da relação" error={error("relationStatus")}>
        <Select value={values.relationStatus} onChange={(value) => set("relationStatus", value)} options={relationStatusOptions} placeholder="Selecionar estado…" />
      </FormField>
    </>
  );
}

export default InvestorProfileForm;
