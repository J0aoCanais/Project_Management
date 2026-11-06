import { Link } from "react-router-dom";
import Icon from "../ui/Icon";

export interface AlertItem {
  id: string;
  date: string;
  record: string;
  description: string;
  to: string;
}

interface Props {
  alert: AlertItem;
}

function AlertRow({ alert }: Props) {
  return (
    <Link
      to={alert.to}
      className="grid h-9 grid-cols-[68px_90px_1fr_14px] items-center gap-2 border-b border-[#edf0ef] px-3.5 text-xs transition-colors hover:bg-surface last:border-b-0"
    >
      <time className="tabular-nums text-muted">{alert.date}</time>
      <b className="truncate font-semibold text-ink">{alert.record}</b>
      <span className="truncate text-muted">{alert.description}</span>
      <Icon name="arrow" size={14} className="text-muted" />
    </Link>
  );
}

export default AlertRow;
