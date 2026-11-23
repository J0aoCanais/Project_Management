import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import Icon from "./Icon";

interface Props {
  title: string;
  /** Linha pequena acima do título, como "Lead". */
  type: string;
  /** Para onde vai o "Voltar". */
  backTo: string;
  /** Conteúdo por baixo do título, como a fase e o responsável. */
  meta?: ReactNode;
  /** Ícone ou fotografia à esquerda do título. */
  media?: ReactNode;
  actions?: ReactNode;
}

function EntityHeader({ title, type, backTo, meta, media, actions }: Props) {
  return (
    <>
      <Link to={backTo} className="mb-3 flex w-fit items-center gap-1 text-[11px] text-muted hover:text-ink">
        <Icon name="chevron" size={14} className="rotate-180" />
        Voltar
      </Link>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {media}
          <div className="min-w-0">
            <p className="text-[11px] text-muted">{type}</p>
            <h1 className="my-0.5 text-[22px] font-bold tracking-[-0.35px] wrap-anywhere">{title}</h1>
            {meta}
          </div>
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </>
  );
}

export default EntityHeader;
