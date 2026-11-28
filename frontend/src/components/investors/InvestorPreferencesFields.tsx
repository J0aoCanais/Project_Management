import type { InvestorProfile } from "../../api/investorsApi";
import { useZones } from "../../hooks/useZones";
import { INVESTOR_TEXT_LIMITS, type InvestorProfileErrors } from "../../lib/investorRules";
import { MONEY } from "../../lib/opportunityRules";
import CheckboxGroup from "../ui/CheckboxGroup";
import FormField from "../ui/FormField";
import NumberInput from "../ui/NumberInput";
import { inputClasses } from "../ui/inputClasses";

type PreferenceKey = "preferredZones" | "minAmount" | "maxAmount" | "preferredTerms";

interface Props {
  values: Pick<InvestorProfile, PreferenceKey | "availableCapital">;
  onChange: <K extends PreferenceKey>(key: K, value: InvestorProfile[K]) => void;
  /** Só os erros a mostrar (depois de tentar submeter). */
  error: (key: keyof InvestorProfileErrors) => string | undefined;
}

/** Preferências do investidor: zonas, montantes mínimo e máximo (só no perfil) e prazos. */
function InvestorPreferencesFields({ values, onChange, error }: Props) {
  const zones = useZones();
  // Zonas da tabela de zonas; uma zona já escolhida que deixou de existir continua visível.
  const zoneNames = (zones.data ?? []).map((zone) => zone.name);
  const zoneOptions = [...zoneNames, ...values.preferredZones.filter((zone) => !zoneNames.includes(zone))];
  const amount = (key: "minAmount" | "maxAmount", label: string) => (
    <FormField label={label} error={error(key)}>
      <NumberInput
        min={MONEY.min}
        max={MONEY.max}
        decimals={MONEY.decimals}
        suffix="€"
        value={values[key]}
        onChange={(value) => onChange(key, value)}
        invalid={!!error(key)}
      />
    </FormField>
  );

  return (
    <fieldset className="grid gap-3 border-0 p-0">
      <legend className="mb-1 text-[11px] font-semibold text-muted">Preferências</legend>
      {zones.isError ? (
        <p className="text-[11px] text-muted">Não foi possível carregar as zonas.</p>
      ) : (
        <CheckboxGroup label="Zonas (opcional)" options={zoneOptions} value={values.preferredZones} onChange={(value) => onChange("preferredZones", value)} />
      )}
      <div className="grid gap-3 min-[721px]:grid-cols-2">
        {amount("minAmount", "Montante mínimo")}
        {amount("maxAmount", "Montante máximo")}
      </div>
      <p className="text-[11px] text-muted">Mínimo ≤ máximo ≤ capital disponível.</p>
      <FormField label="Prazos (opcional)" error={error("preferredTerms")}>
        <textarea
          className={`${inputClasses} resize-none wrap-anywhere`}
          rows={2}
          placeholder="Ex.: 8 a 18 meses, retorno mínimo de 8%"
          value={values.preferredTerms}
          maxLength={INVESTOR_TEXT_LIMITS.preferredTerms}
          onChange={(e) => onChange("preferredTerms", e.target.value)}
        />
      </FormField>
    </fieldset>
  );
}

export default InvestorPreferencesFields;
