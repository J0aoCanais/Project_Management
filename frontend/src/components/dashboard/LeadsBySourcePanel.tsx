import Panel from "../ui/Panel";
import PanelHeader from "../ui/PanelHeader";
import HorizontalBars from "../ui/HorizontalBars";
import type { DashboardSummary } from "../../api/dashboardApi";

interface Props {
  leadsBySource: DashboardSummary["leadsBySource"];
}

function LeadsBySourcePanel({ leadsBySource }: Props) {
  const total = leadsBySource.reduce((acc, item) => acc + item.count, 0);
  const items = leadsBySource.map((item) => ({
    label: item.source,
    value: item.count,
  }));

  return (
    <Panel>
      <PanelHeader
        title="Leads por origem · últimos 7 dias"
        action={<strong className="text-sm font-bold tabular-nums text-ink">{total}</strong>}
      />
      {items.length > 0 ? (
        <HorizontalBars items={items} />
      ) : (
        <p className="px-3.5 py-12 text-center text-xs text-muted">Sem leads nos últimos 7 dias.</p>
      )}
    </Panel>
  );
}

export default LeadsBySourcePanel;
