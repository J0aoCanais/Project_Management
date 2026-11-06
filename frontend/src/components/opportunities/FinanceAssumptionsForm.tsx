import type { FinanceValues } from "../../api/opportunitiesApi";
import FormField from "../ui/FormField";
import NumberInput from "../ui/NumberInput";
import PanelHeader from "../ui/PanelHeader";

interface Props {
  values: FinanceValues;
  onChange: (values: FinanceValues) => void;
}

const fields: { label: string; key: keyof FinanceValues; suffix: string }[] = [
  { label: "Preço de compra", key: "purchasePrice", suffix: "€" },
  { label: "IMT", key: "imt", suffix: "€" },
  { label: "Imposto do selo", key: "stampDuty", suffix: "€" },
  { label: "Escritura e registos", key: "deedCosts", suffix: "€" },
  { label: "Custo da obra", key: "workCost", suffix: "€" },
  { label: "Preço de venda previsto", key: "expectedSalePrice", suffix: "€" },
  { label: "Prazo previsto (meses)", key: "termMonths", suffix: "meses" },
];

function FinanceAssumptionsForm({ values, onChange }: Props) {
  return (
    <>
      <PanelHeader title="Pressupostos financeiros" />
      <div className="grid gap-3.5 px-3.5 py-4 min-[721px]:grid-cols-2">
        {fields.map((field) => (
          <FormField key={field.key} label={field.label}>
            <NumberInput min={0} suffix={field.suffix} value={values[field.key]} onChange={(value) => onChange({ ...values, [field.key]: value })} />
          </FormField>
        ))}
      </div>
    </>
  );
}

export default FinanceAssumptionsForm;
