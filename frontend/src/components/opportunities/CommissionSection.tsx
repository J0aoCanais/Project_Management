import type { FinanceValues } from "../../api/opportunitiesApi";
import { formatMoney, formatPercent } from "../../lib/format";
import FormField from "../ui/FormField";
import NumberInput from "../ui/NumberInput";
import FinanceSection from "./FinanceSection";

interface Props {
  values: FinanceValues;
  commission: number;
  onChange: (values: FinanceValues) => void;
}

/** "5" → "5%", "5.5" → "5,50%": sem casas decimais quando não são precisas. */
const rate = (value: number) => formatPercent(value, Number.isInteger(value) ? 0 : 2);

function CommissionSection({ values, commission, onChange }: Props) {
  return (
    <FinanceSection title="Comissão imobiliária" description="Percentagem sobre o preço de venda previsto, acrescida de IVA. Entra no custo total.">
      <div className="mt-3 grid items-end gap-3.5 min-[721px]:grid-cols-3">
        <FormField label="Comissão (%)">
          <NumberInput min={0} suffix="%" value={values.commissionPercent} onChange={(commissionPercent) => onChange({ ...values, commissionPercent })} />
        </FormField>
        <FormField label="IVA sobre a comissão (%)">
          <NumberInput min={0} suffix="%" value={values.commissionVatPercent} onChange={(commissionVatPercent) => onChange({ ...values, commissionVatPercent })} />
        </FormField>
        <div>
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
