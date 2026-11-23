import { Link } from "react-router-dom";
import Panel from "../ui/Panel";
import PanelHeader from "../ui/PanelHeader";
import ButtonLink from "../ui/ButtonLink";
import Icon from "../ui/Icon";
import { formatMoney, formatPercent } from "../../lib/format";
import type { DashboardSummary } from "../../api/dashboardApi";

interface Props {
  operationsByPhase: DashboardSummary["operationsByPhase"];
}

function OperationsByPhasePanel({ operationsByPhase }: Props) {
  return (
    <Panel>
      <PanelHeader
        title="Operações ativas por fase"
        action={
          <ButtonLink to="/operacoes" variant="text" trailingIcon="arrow">
            Ver operações
          </ButtonLink>
        }
      />
      {operationsByPhase.length > 0 ? (
        <div className="py-2">
          {operationsByPhase.map((group) => (
            <div key={group.phase}>
              <div className="flex h-[27px] items-center justify-between border-y border-line bg-[#f0f2f1] px-3.5 text-[11px]">
                <strong className="font-semibold text-ink">{group.phase}</strong>
                <span className="tabular-nums text-muted">
                  Subtotal capital: {formatMoney(group.capitalSubtotal)}
                </span>
              </div>
              <div>
                {group.operations.map((op) => (
                  <Link
                    key={op.id}
                    to={`/operacoes/${op.id}`}
                    className="grid h-[34px] grid-cols-[90px_1fr_auto_14px] items-center gap-2 border-b border-[#edf0ef] px-3.5 text-xs transition-colors hover:bg-surface last:border-b-0"
                  >
                    <b className="truncate font-semibold text-ink">{op.code}</b>
                    <span className="truncate text-muted">{op.zone}</span>
                    <em className="whitespace-nowrap not-italic text-right tabular-nums text-muted">
                      {formatMoney(op.capital)} · margem {formatPercent(op.margin)}
                    </em>
                    <Icon name="arrow" size={14} className="text-muted" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="px-3.5 py-12 text-center text-xs text-muted">Sem operações ativas.</p>
      )}
    </Panel>
  );
}

export default OperationsByPhasePanel;
