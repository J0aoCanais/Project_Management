import type { OpportunityDetail } from "../../api/opportunitiesApi";
import { formatActivityDate } from "../../lib/format";
import Panel from "../ui/Panel";
import PanelHeader from "../ui/PanelHeader";
import Timeline from "../ui/Timeline";

interface Props {
  activity: OpportunityDetail["activity"];
}

function OpportunityActivity({ activity }: Props) {
  return (
    <Panel>
      <PanelHeader title="Atividade recente" />
      <Timeline events={activity.map((event, index) => ({ id: index, date: formatActivityDate(event.date), text: event.text }))} />
    </Panel>
  );
}

export default OpportunityActivity;
