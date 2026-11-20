import type { InvestorProfile } from "../../api/investorsApi";
import { useZones } from "../../hooks/useZones";
import { INVESTOR_TEXT_LIMITS, type InvestorProfileErrors } from "../../lib/investorRules";
import { MONEY } from "../../lib/opportunityRules";
import { CAEP_TERMS, INVESTOR_KINDS, IRS_RATE, taxRate, type CaepTerm, type InvestorKind } from "../../lib/taxRules";
import { relationStatusOptions, riskProfileOptions } from "../../temp";
import CheckboxGroup from "../ui/CheckboxGroup";
import FormField from "../ui/FormField";
import NumberInput from "../ui/NumberInput";
import SegmentedChoice from "../ui/SegmentedChoice";
import Select from "../ui/Select";
import { inputClasses } from "../ui/inputClasses";

interface Props {
  values: InvestorProfile;
  onChange: (values: InvestorProfile) => void;
  errors: InvestorProfileErrors;
  /** Os erros só aparecem depois de tentar submeter. */
  showErrors: boolean;
}

/**
 * Campos do perfil de investidor, pela ordem pedida pelo cliente (o contacto fica no drawer, antes destes):
 * zona, capital disponível, perfil de risco, estado e notas. A estrutura (particular/empresa e CAEP) vem antes,
 * porque decide o imposto. Partilhado por criar e editar.
 */
function InvestorProfileForm({ values, onChange, errors, showErrors }: Props) {
  const zones = useZones();
  const set = <K extends keyof InvestorProfile>(key: K, value: InvestorProfile[K]) => onChange({ ...values, [key]: value });
  const error = (key: keyof InvestorProfile) => (showErrors ? errors[key] : undefined);
  // Zonas da tabela de zonas; uma zona já escolhida que deixou de existir continua visível.
  const zoneNames = (zones.data ?? []).map((zone) => zone.name);
  const zoneOptions = [...zoneNames, ...values.preferredZones.filter((zone) => !zoneNames.includes(zone))];

  // TODO: confirmar com o cliente o que é o campo "inbv" antes de o implementar.
  return (
    <>
      <FormField label="Estrutura do investidor" error={error("investorKind")}>
        <Select
          value={values.investorKind}
          onChange={(value) => set("investorKind", value as InvestorKind)}
          options={INVESTOR_KINDS}
          placeholder="Particular ou empresa…"
          invalid={!!error("investorKind")}
        />
      </FormField>
      {values.investorKind === "Empresa" ? (
        <div>
          <span className="mb-1 block text-[11px] text-muted">CAEP</span>
          <SegmentedChoice<CaepTerm>
            label="Prazo do CAEP"
            value={values.caepTerm}
            onChange={(value) => set("caepTerm", value)}
            options={CAEP_TERMS.map((term) => ({ value: term, label: `${term} · IRC ${taxRate("Empresa", term)}%` }))}
          />
        </div>
      ) : (
        values.investorKind === "Particular" && <p className="text-[11px] text-muted">Um particular paga IRS de {IRS_RATE}% sobre o lucro.</p>
      )}
      {zones.isError ? (
        <p className="text-[11px] text-muted">Não foi possível carregar as zonas.</p>
      ) : (
        <CheckboxGroup label="Zona (opcional)" options={zoneOptions} value={values.preferredZones} onChange={(value) => set("preferredZones", value)} />
      )}
      <FormField label="Capital disponível" error={error("availableCapital")}>
        <NumberInput
          min={MONEY.min}
          max={MONEY.max}
          decimals={MONEY.decimals}
          suffix="€"
          value={values.availableCapital}
          onChange={(value) => set("availableCapital", value)}
          invalid={!!error("availableCapital")}
        />
      </FormField>
      <FormField label="Perfil de risco" error={error("riskProfile")}>
        <Select value={values.riskProfile} onChange={(value) => set("riskProfile", value)} options={riskProfileOptions} placeholder="Selecionar perfil…" />
      </FormField>
      <FormField label="Estado" error={error("relationStatus")}>
        <Select value={values.relationStatus} onChange={(value) => set("relationStatus", value)} options={relationStatusOptions} placeholder="Selecionar estado…" />
      </FormField>
      <FormField label="Notas (opcional)" error={error("notes")}>
        <textarea
          className={`${inputClasses} resize-none wrap-anywhere`}
          rows={4}
          value={values.notes}
          maxLength={INVESTOR_TEXT_LIMITS.notes}
          onChange={(e) => set("notes", e.target.value)}
        />
      </FormField>
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
    </>
  );
}

export default InvestorProfileForm;
