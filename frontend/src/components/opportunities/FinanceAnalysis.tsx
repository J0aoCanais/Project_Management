import { useState } from "react";

import type { ExtraCost, FinanceValues } from "../../api/opportunitiesApi";
import { calcFinance } from "../../lib/finance";
import { extraCostErrors, financeErrors } from "../../lib/opportunityRules";
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
  // Os erros só aparecem depois de tentar guardar, para não pintar de vermelho enquanto se escreve.
  const [showErrors, setShowErrors] = useState(false);
  const result = calcFinance(values, extras);
  const valueErrors = financeErrors(values);
  const extrasErrors = extraCostErrors(extras);
  const hasErrors = Object.keys(valueErrors).length > 0 || Object.keys(extrasErrors).length > 0;

  const handleSave = () => {
    setShowErrors(true);
    if (!hasErrors) onSave();
  };

  let status: string | false = dirty ? "Alterações por guardar" : saved && "Análise guardada";
  if (showErrors && hasErrors) status = "Corrija os campos assinalados.";

  return (
    <div className="grid items-start gap-3.5 min-[1051px]:grid-cols-[1.3fr_.7fr]">
      <Panel>
        <FinanceAssumptionsForm values={values} errors={showErrors ? valueErrors : {}} onChange={onValuesChange} />
        <CommissionSection values={values} commission={result.commission} errors={showErrors ? valueErrors : {}} onChange={onValuesChange} />
        <ExtraCostsEditor extras={extras} total={result.other} errors={showErrors ? extrasErrors : {}} onChange={onExtrasChange} />
        <div className="mx-3.5 flex flex-col gap-2 border-t border-line py-3.5 min-[721px]:flex-row min-[721px]:items-center min-[721px]:justify-end">
          <div role="status" className={`text-xs ${showErrors && hasErrors ? "text-danger" : "text-muted"}`}>
            {status}
          </div>
          <Button variant="primary" disabled={!dirty || saving} onClick={handleSave}>
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
