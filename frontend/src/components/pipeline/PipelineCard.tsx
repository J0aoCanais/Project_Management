import { Link, useLocation } from "react-router-dom";

import type { Phase } from "../../lib/phases";
import { formatMoney } from "../../lib/format";
import { isStalled } from "../../lib/phases";
import Avatar from "../ui/Avatar";
import DropdownMenu from "../ui/DropdownMenu";
import Icon from "../ui/Icon";
import Pill from "../ui/Pill";

interface Props {
  href: string;
  title: string;
  subtitle: string;
  badge: string;
  primaryLabel: string;
  primaryValue: number;
  secondaryLabel: string;
  secondaryValue: number;
  marginLabel: string;
  marginValue: number;
  phaseIndex: number;
  daysInPhase: number;
  owner: string;
  phases: Phase[];
  onMove: (phaseIndex: number) => void;
}

function PipelineCard({
  href,
  title,
  subtitle,
  badge,
  primaryLabel,
  primaryValue,
  secondaryLabel,
  secondaryValue,
  marginLabel,
  marginValue,
  phaseIndex,
  daysInPhase,
  owner,
  phases,
  onMove,
}: Props) {
  const { search } = useLocation();
  const late = isStalled(phases[phaseIndex], daysInPhase);
  const moveItems = phases
    .map((phase, index) => ({ phase, index }))
    .filter(({ index }) => index !== phaseIndex)
    .map(({ phase, index }) => ({ label: `Mover para ${phase.name}`, onSelect: () => onMove(index) }));

  return (
    <article className="relative cursor-grab rounded-control border border-line bg-white p-2.5 hover:border-brand/40">
      <div className="flex items-start justify-between">
        <Pill>{badge}</Pill>
        <div className="relative z-10">
          <DropdownMenu label={`Ações de ${title}`} items={moveItems} />
        </div>
      </div>
      <h3 className="mt-1.5 mb-1 text-xs font-bold wrap-anywhere">
        <Link
          to={href}
          state={{ listSearch: search }}
          draggable={false}
          className="after:absolute after:inset-0 after:content-[''] hover:text-brand"
        >
          {title}
        </Link>
      </h3>
      <p className="flex min-w-0 items-center gap-1 text-[11px] text-muted">
        <Icon name="home" size={14} />
        <span className="truncate">{subtitle}</span>
      </p>
      <dl className="mt-3 mb-2 flex justify-between gap-2">
        <div>
          <dt className="text-[11px] text-muted">{primaryLabel}</dt>
          <dd className="m-0 mt-0.5 text-xs font-semibold tabular-nums">{formatMoney(primaryValue)}</dd>
        </div>
        <div className="text-right">
          <dt className="text-[11px] text-muted">{secondaryLabel}</dt>
          <dd className="m-0 mt-0.5 text-xs font-semibold tabular-nums">{formatMoney(secondaryValue)}</dd>
        </div>
      </dl>
      <div className="flex items-center justify-between border-y border-line py-2">
        <span className="text-[11px] text-muted">{marginLabel}</span>
        <strong className="text-xs text-success tabular-nums">{formatMoney(marginValue)}</strong>
      </div>
      <footer className="flex items-center gap-1 pt-2 text-[11px] text-muted">
        <Icon name="clock" size={14} />
        <span className={late ? "font-semibold text-danger" : ""}>
          {daysInPhase} {daysInPhase === 1 ? "dia" : "dias"} nesta fase
        </span>
        <span className="sr-only">Responsável: {owner}</span>
        <Avatar name={owner} size="sm" className="ml-auto" />
      </footer>
    </article>
  );
}

export default PipelineCard;
