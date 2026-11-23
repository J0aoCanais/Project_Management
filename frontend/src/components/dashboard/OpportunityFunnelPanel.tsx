import Panel from "../ui/Panel";
import PanelHeader from "../ui/PanelHeader";
import ButtonLink from "../ui/ButtonLink";
import VerticalBarChart from "../ui/VerticalBarChart";
import type { DashboardSummary } from "../../api/dashboardApi";

interface Props {
  funnel: DashboardSummary["funnel"];
}

function OpportunityFunnelPanel({ funnel }: Props) {
  const items = funnel.map((item) => ({
    label: item.phase,
    value: item.count,
  }));

  return (
    <Panel>
      <PanelHeader
        title="Funil de oportunidades"
        action={
          <ButtonLink to="/oportunidades" variant="text" trailingIcon="arrow">
            Ver todas
          </ButtonLink>
        }
      />
      {items.length > 0 ? (
        <VerticalBarChart items={items} />
      ) : (
        <p className="px-3.5 py-12 text-center text-xs text-muted">Sem oportunidades no funil.</p>
      )}
    </Panel>
  );
}

export default OpportunityFunnelPanel;
