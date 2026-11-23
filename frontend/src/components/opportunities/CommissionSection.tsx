import type { FinanceValues } from "../../api/opportunitiesApi";
import { formatMoney, formatPercent } from "../../lib/format";
import { PERCENT } from "../../lib/opportunityRules";
import FormField from "../ui/FormField";
import NumberInput from "../ui/NumberInput";
import FinanceSection from "./FinanceSection";

interface Props {
  values: FinanceValues;
  commission: number;
  /** Mensagens de erro por campo; só se mostram as que vierem. */
  errors: Partial<Record<keyof FinanceValues, string>>;
  onChange: (values: FinanceValues) => void;
}

/** "5" → "5%", "5.5" → "5,50%": sem casas decimais quando não são precisas. */
const rate = (value: number) => formatPercent(value, Number.isInteger(value) ? 0 : 2);

function CommissionSection({ values, commission, errors, onChange }: Props) {
  return (
    <FinanceSection title="Comissão imobiliária" description="Percentagem sobre o preço de venda previsto, acrescida de IVA. Entra no custo total.">
      <div className="mt-3 grid items-end gap-3.5 min-[721px]:grid-cols-3">
        <FormField label="Comissão (%)" error={errors.commissionPercent}>
          <NumberInput
            min={PERCENT.min}
            max={PERCENT.max}
            decimals={PERCENT.decimals}
            invalid={!!errors.commissionPercent}
            suffix="%"
            value={values.commissionPercent}
            onChange={(commissionPercent) => onChange({ ...values, commissionPercent })}
          />
        </FormField>
        <FormField label="IVA sobre a comissão (%)" error={errors.commissionVatPercent}>
          <NumberInput
            min={PERCENT.min}
            max={PERCENT.max}
            decimals={PERCENT.decimals}
            invalid={!!errors.commissionVatPercent}
            suffix="%"
            value={values.commissionVatPercent}
            onChange={(commissionVatPercent) => onChange({ ...values, commissionVatPercent })}
          />
        </FormField>
        <div className="min-w-0 wrap-anywhere">
          <span className="block text-[11px] text-muted">Valor da comissão</span>
          <strong className="block text-base tabular-nums">{formatMoney(commission)}</strong>
          <small className="block text-[11px] text-muted">
            {rate(values.commissionPercent)} × {formatMoney(values.expectedSalePrice)} + IVA {rate(values.commissionVatPercent)}
          </small>
        </div>
      </div>
    </FinanceSection>
  );
}

export default CommissionSection;
