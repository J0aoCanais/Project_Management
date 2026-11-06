import { Link, useLocation } from "react-router-dom";

import type { OpportunityCard } from "../../api/opportunitiesApi";
import { formatMoney } from "../../lib/format";
import { isStalled, OPPORTUNITY_PHASES } from "../../lib/phases";
import Avatar from "../ui/Avatar";
import DropdownMenu from "../ui/DropdownMenu";
import Icon from "../ui/Icon";
import Pill from "../ui/Pill";

interface Props {
  card: OpportunityCard;
  /** Alternativa ao arrastar, para teclado e telemóvel. */
  onMove: (phaseIndex: number) => void;
}

function DealCard({ card, onMove }: Props) {
  const { search } = useLocation();
  const late = isStalled(OPPORTUNITY_PHASES[card.phaseIndex], card.daysInPhase);
  const moveItems = OPPORTUNITY_PHASES.map((phase, index) => ({ phase, index }))
    .filter(({ index }) => index !== card.phaseIndex)
    .map(({ phase, index }) => ({ label: `Mover para ${phase.name}`, onSelect: () => onMove(index) }));

  return (
    <article className="relative cursor-grab rounded-control border border-line bg-white p-2.5 hover:border-brand/40">
      <div className="flex items-start justify-between">
        <Pill>{card.typology}</Pill>
        <div className="relative z-10">
          <DropdownMenu label={`Ações de ${card.title}`} items={moveItems} />
        </div>
      </div>
      <h3 className="mt-1.5 mb-1 text-xs font-bold">
        {/* O link estica-se a todo o cartão. Não é arrastável para o cartão inteiro ser a origem do arrastar. */}
        <Link
          to={`/oportunidades/${card.id}`}
          state={{ listSearch: search }}
          draggable={false}
          className="after:absolute after:inset-0 after:content-[''] hover:text-brand"
        >
          {card.title}
        </Link>
      </h3>
      <p className="flex items-center gap-1 text-[11px] text-muted">
        <Icon name="home" size={14} />
        {card.zone}
      </p>
      <dl className="mt-3 mb-2 flex justify-between">
        <div>
          <dt className="text-[11px] text-muted">Preço pedido</dt>
          <dd className="m-0 mt-0.5 text-xs font-semibold tabular-nums">{formatMoney(card.askingPrice)}</dd>
        </div>
        <div className="text-right">
          <dt className="text-[11px] text-muted">VVR</dt>
          <dd className="m-0 mt-0.5 text-xs font-semibold tabular-nums">{formatMoney(card.vvr)}</dd>
        </div>
      </dl>
      <div className="flex items-center justify-between border-y border-line py-2">
        <span className="text-[11px] text-muted">Lucro estimado</span>
        <strong className="text-xs text-success tabular-nums">{formatMoney(card.estimatedProfit)}</strong>
      </div>
      <footer className="flex items-center gap-1 pt-2 text-[11px] text-muted">
        <Icon name="clock" size={14} />
        <span className={late ? "font-semibold text-danger" : ""}>
          {card.daysInPhase} {card.daysInPhase === 1 ? "dia" : "dias"} nesta fase
        </span>
        <span className="sr-only">Responsável: {card.owner.name}</span>
        <Avatar name={card.owner.name} size="sm" className="ml-auto" />
      </footer>
    </article>
  );
}

export default DealCard;
