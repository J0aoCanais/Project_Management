import type { FinanceNumberKey, FinanceValues } from "../../api/opportunitiesApi";
import { FINANCE_RULES } from "../../lib/opportunityRules";
import { fromPassiveProfile, toPassiveProfile } from "../../lib/taxRules";
import InvestorStructureFields from "../investors/InvestorStructureFields";
import FormField from "../ui/FormField";
import NumberInput from "../ui/NumberInput";
import PanelHeader from "../ui/PanelHeader";

interface Props {
  values: FinanceValues;
  /** Mensagens de erro por campo; só se mostram as que vierem. */
  errors: Partial<Record<keyof FinanceValues, string>>;
  onChange: (values: FinanceValues) => void;
}

const fields: { label: string; key: FinanceNumberKey; suffix: string }[] = [
  { label: "Preço de compra", key: "purchasePrice", suffix: "€" },
  { label: "IMT", key: "imt", suffix: "€" },
  { label: "Imposto do selo", key: "stampDuty", suffix: "€" },
  { label: "Escritura e registos", key: "deedCosts", suffix: "€" },
  { label: "Custo da obra", key: "workCost", suffix: "€" },
  { label: "Preço de venda previsto", key: "expectedSalePrice", suffix: "€" },
  { label: "Prazo previsto (meses)", key: "termMonths", suffix: "meses" },
  { label: "Percentagem do investidor ativo", key: "investorSharePercent", suffix: "%" },
];

function FinanceAssumptionsForm({ values, errors, onChange }: Props) {
  return (
    <>
      <PanelHeader title="Pressupostos financeiros" />
      <div className="grid gap-3.5 px-3.5 py-4 min-[721px]:grid-cols-2">
        {fields.map((field) => {
          const rule = FINANCE_RULES[field.key];
          return (
            <FormField key={field.key} label={field.label} error={errors[field.key]}>
              <NumberInput
                min={rule.min}
                max={rule.max}
                decimals={rule.decimals}
                suffix={field.suffix}
                value={values[field.key]}
                invalid={!!errors[field.key]}
                onChange={(value) => onChange({ ...values, [field.key]: value })}
              />
            </FormField>
          );
        })}
      </div>
      <PanelHeader title="Estrutura do investidor" />
      <div className="grid gap-3.5 px-3.5 py-4 min-[721px]:grid-cols-2">
        <InvestorStructureFields
          value={fromPassiveProfile(values.investorProfile)}
          onChange={(structure) => onChange({ ...values, investorProfile: toPassiveProfile(structure) })}
          hint="Só para simular: o imposto da estrutura aplica-se à parte do investidor, depois do IRC da operação. Ao gerar o relatório para um investidor, usa-se a estrutura do perfil dele."
        />
      </div>
    </>
  );
}

export default FinanceAssumptionsForm;
