import type { ExtraCost } from "../../api/opportunitiesApi";
import { formatMoney } from "../../lib/format";
import Button from "../ui/Button";
import NumberInput from "../ui/NumberInput";
import { inputClasses } from "../ui/inputClasses";
import FinanceSection from "./FinanceSection";

interface Props {
  extras: ExtraCost[];
  total: number;
  onChange: (extras: ExtraCost[]) => void;
}

let nextId = 1;

function ExtraCostsEditor({ extras, total, onChange }: Props) {
  const update = (id: string, changes: Partial<ExtraCost>) => onChange(extras.map((extra) => (extra.id === id ? { ...extra, ...changes } : extra)));
  return (
    <FinanceSection title="Outros custos" description="Acrescente todos os custos que não estão acima.">
      <div className="mt-3 grid gap-1.5">
        {extras.map((extra) => (
          <div key={extra.id} className="grid grid-cols-[1fr_110px_34px] items-center gap-1.5 min-[721px]:grid-cols-[1fr_160px_34px]">
            <input
              aria-label="Descrição do custo"
              placeholder="Descrição do custo"
              className={`${inputClasses} h-[38px] min-w-0`}
              value={extra.label}
              onChange={(e) => update(extra.id, { label: e.target.value })}
            />
            <NumberInput aria-label={`Valor de ${extra.label || "custo"}`} min={0} suffix="€" value={extra.value} onChange={(value) => update(extra.id, { value })} />
            <Button variant="icon" icon="x" aria-label="Remover custo" onClick={() => onChange(extras.filter((item) => item.id !== extra.id))} />
          </div>
        ))}
      </div>
      <div className="mt-2.5 flex flex-col gap-2.5 text-xs text-muted min-[721px]:flex-row min-[721px]:items-center min-[721px]:justify-between">
        <Button icon="plus" onClick={() => onChange([...extras, { id: `new-${nextId++}`, label: "", value: 0 }])}>
          Adicionar custo
        </Button>
        <span>
          Total de outros custos <strong className="ml-1.5 text-[13px] text-ink tabular-nums">{formatMoney(total)}</strong>
        </span>
      </div>
    </FinanceSection>
  );
}

export default ExtraCostsEditor;
