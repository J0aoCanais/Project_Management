import Button from "./Button";

interface Props {
  /** Página atual, a começar em 1. */
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}

/** "21–40 de 57" com Anterior/Seguinte. Não aparece quando tudo cabe numa página. */
function Pagination({ page, pageSize, total, onChange }: Props) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  return (
    <nav aria-label="Paginação" className="flex items-center justify-between gap-2 border-t border-line px-3 py-2 text-xs text-muted">
      <span>
        {first}–{last} de {total}
      </span>
      <div className="flex items-center gap-2">
        <Button disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Anterior
        </Button>
        <span className="tabular-nums max-[720px]:hidden">
          Página {page} de {pages}
        </span>
        <Button disabled={page >= pages} onClick={() => onChange(page + 1)}>
          Seguinte
        </Button>
      </div>
    </nav>
  );
}

export default Pagination;
