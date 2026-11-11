import { Link } from "react-router-dom";

import type { WorkDetail } from "../../api/worksApi";
import { formatIsoDate, formatMoney } from "../../lib/format";
import { calcWorkDeviation } from "../../lib/workRules";
import Panel from "../ui/Panel";
import Pill from "../ui/Pill";
import RecordFields from "../ui/RecordFields";
import StackedTrack from "../ui/StackedTrack";

interface Props {
  work: WorkDetail;
}

function WorkSummary({ work }: Props) {
  const isCompleted = work.state === "Concluída";
  const deviation = calcWorkDeviation(work.plannedEndDate, work.realEndDate, isCompleted);

  const budgetSegments = [
    { label: "Previsto", value: work.totalBudget, tone: "dark" as const },
    { label: "Contratado", value: work.totalContracted, tone: "light" as const },
    { label: "Executado", value: work.totalExecuted, tone: "main" as const },
    { label: "Faturado", value: work.totalInvoiced, tone: "amber" as const },
    { label: "Pago", value: work.totalPaid, tone: "green" as const },
  ];

  const fields: { label: string; value: React.ReactNode; wide?: boolean }[] = [
    {
      label: "Início previsto",
      value: work.plannedStartDate ? formatIsoDate(work.plannedStartDate) : "—",
    },
    {
      label: "Fim previsto",
      value: work.plannedEndDate ? formatIsoDate(work.plannedEndDate) : "—",
    },
    {
      label: "Início real",
      value: work.realStartDate ? formatIsoDate(work.realStartDate) : "—",
    },
    {
      label: "Fim real",
      value: work.realEndDate ? formatIsoDate(work.realEndDate) : "—",
    },
    {
      label: "Desvio em dias",
      value: <Pill tone={deviation.tone}>{deviation.label}</Pill>,
    },
    {
      label: "Operação associada",
      value: (
        <Link to={`/operacoes/${work.operationId}`} className="text-brand hover:underline">
          {work.operationCode} · {work.operationName}
        </Link>
      ),
    },
  ];

  if (work.notes) {
    fields.push({
      label: "Observações",
      value: work.notes,
      wide: true,
    });
  }

  return (
    <div className="grid gap-3.5">
      <RecordFields title="Cronograma e planeamento" fields={fields} />

      <Panel className="p-3.5">
        <h2 className="mb-3 text-xs font-bold text-ink">Resumo orçamental consolidado</h2>
        <div className="rounded-control border border-line bg-surface p-3">
          <StackedTrack segments={budgetSegments} formatValue={formatMoney} />
        </div>
      </Panel>
    </div>
  );
}

export default WorkSummary;
