import type { OpportunityDetail } from "../../api/opportunitiesApi";
import { formatIsoDate, isToday } from "../../lib/format";
import { OPPORTUNITY_PHASES } from "../../lib/phases";
import EntityHeader from "../ui/EntityHeader";
import Icon from "../ui/Icon";
import Pill from "../ui/Pill";
import OpportunityActions from "./OpportunityActions";

interface Props {
  detail: OpportunityDetail;
  backTo: string;
  busy: boolean;
  onReport: () => void;
  onReject: () => void;
  onAdvance: () => void;
  onConvert: () => void;
}

function OpportunityHeader({ detail, backTo, busy, onReport, onReject, onAdvance, onConvert }: Props) {
  const updated = isToday(detail.updatedAt) ? "hoje" : `em ${formatIsoDate(detail.updatedAt)}`;
  return (
    <EntityHeader
      title={detail.title}
      type={`Oportunidades · Registo atualizado ${updated}`}
      backTo={backTo}
      media={
        <span className="grid size-11 shrink-0 place-items-center rounded-panel bg-brand-soft text-brand max-[720px]:hidden">
          <Icon name="target" />
        </span>
      }
      meta={
        <div className="flex flex-wrap items-center gap-2">
          {detail.rejection ? <Pill tone="red">Rejeitada/perdida</Pill> : <Pill tone="green">{OPPORTUNITY_PHASES[detail.phaseIndex].name}</Pill>}
          <span className="text-[11px] text-muted">Responsável: {detail.owner.name}</span>
        </div>
      }
      actions={<OpportunityActions detail={detail} busy={busy} onReport={onReport} onReject={onReject} onAdvance={onAdvance} onConvert={onConvert} />}
    />
  );
}

export default OpportunityHeader;
