import Panel from "../ui/Panel";
import PanelHeader from "../ui/PanelHeader";
import ButtonLink from "../ui/ButtonLink";
import AlertRow, { type AlertItem } from "./AlertRow";

interface Props {
  alerts: AlertItem[];
}

function AlertsPanel({ alerts }: Props) {
  return (
    <Panel className="pb-2">
      <PanelHeader
        title="Alertas"
        action={
          <ButtonLink to="/definicoes" variant="text">
            Limites
          </ButtonLink>
        }
      />
      {alerts.length > 0 ? (
        <div className="mt-2">
          {alerts.map((alert) => (
            <AlertRow key={alert.id} alert={alert} />
          ))}
        </div>
      ) : (
        <p className="px-3.5 py-12 text-center text-xs text-muted">Sem alertas pendentes.</p>
      )}
    </Panel>
  );
}

export default AlertsPanel;
