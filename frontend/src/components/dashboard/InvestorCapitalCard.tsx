import Panel from "../ui/Panel";
import StackedTrack from "../ui/StackedTrack";
import { formatMoney } from "../../lib/format";
import type { DashboardSummary } from "../../api/dashboardApi";

interface Props {
  capital: DashboardSummary["investorCapital"];
}

function InvestorCapitalCard({ capital }: Props) {
  const segments = [
    { label: "Comprometido", value: capital.committed, tone: "dark" as const },
    { label: "Investido", value: capital.invested, tone: "main" as const },
    { label: "Disponível", value: capital.available, tone: "light" as const },
  ];

  return (
    <Panel className="p-3.5">
      <div className="flex flex-col gap-3 min-[721px]:flex-row min-[721px]:items-center min-[721px]:gap-6">
        <div className="shrink-0 min-[721px]:w-[180px]">
          <span className="block text-[11px] text-muted">Capital dos investidores</span>
          <strong className="block text-base font-bold tabular-nums text-ink">
            {formatMoney(capital.total)}
          </strong>
        </div>
        <StackedTrack segments={segments} formatValue={formatMoney} />
      </div>
    </Panel>
  );
}

export default InvestorCapitalCard;
