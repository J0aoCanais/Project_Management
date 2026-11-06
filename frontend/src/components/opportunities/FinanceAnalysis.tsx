import type { ExtraCost, FinanceValues } from "../../api/opportunitiesApi";
import { calcFinance } from "../../lib/finance";
import Button from "../ui/Button";
import Notice from "../ui/Notice";
import Panel from "../ui/Panel";
import CommissionSection from "./CommissionSection";
import ExtraCostsEditor from "./ExtraCostsEditor";
import FinanceAssumptionsForm from "./FinanceAssumptionsForm";
import FinanceResultsCard from "./FinanceResultsCard";

interface Props {
  values: FinanceValues;
  extras: ExtraCost[];
  onValuesChange: (values: FinanceValues) => void;
  onExtrasChange: (extras: ExtraCost[]) => void;
  dirty: boolean;
  saving: boolean;
  saved: boolean;
  saveFailed: boolean;
  onSave: () => void;
}

function FinanceAnalysis({ values, extras, onValuesChange, onExtrasChange, dirty, saving, saved, saveFailed, onSave }: Props) {
  const result = calcFinance(values, extras);
  return (
    <div className="grid items-start gap-3.5 min-[1051px]:grid-cols-[1.3fr_.7fr]">
      <Panel>
        <FinanceAssumptionsForm values={values} onChange={onValuesChange} />
        <CommissionSection values={values} commission={result.commission} onChange={onValuesChange} />
        <ExtraCostsEditor extras={extras} total={result.other} onChange={onExtrasChange} />
        <div className="mx-3.5 flex flex-col gap-2 border-t border-line py-3.5 min-[721px]:flex-row min-[721px]:items-center min-[721px]:justify-end">
          <div role="status" className="text-xs text-muted">
            {dirty ? "Alterações por guardar" : saved && "Análise guardada"}
          </div>
          <Button variant="primary" disabled={!dirty || saving} onClick={onSave}>
            Guardar análise
          </Button>
        </div>
        {saveFailed && (
          <div role="alert" className="mx-3.5 mb-3.5">
            <Notice tone="warning">Não foi possível guardar a análise. As alterações mantêm-se; tente novamente.</Notice>
          </div>
        )}
      </Panel>
      <FinanceResultsCard values={values} result={result} />
    </div>
  );
}

export default FinanceAnalysis;
