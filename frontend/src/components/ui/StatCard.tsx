interface Props {
  label: string;
  value: string;
  meta?: string;
  positive?: boolean;
  /** Pinta o valor de vermelho, como um saldo negativo. */
  negative?: boolean;
}

/** Indicador: valor, rótulo e nota. Fica dentro de uma grelha com borda exterior. */
function StatCard({ label, value, meta, positive = false, negative = false }: Props) {
  return (
    <article className="min-w-0 px-4 py-3 text-right tabular-nums">
      <strong className={`block text-[17px] font-bold min-[721px]:text-[22px] ${negative ? "text-danger" : ""}`}>{value}</strong>
      <span className="mt-0.5 block text-[11px] text-muted">{label}</span>
      {meta && <small className={`mt-0.5 block text-[11px] ${positive ? "text-success" : "text-muted"}`}>{meta}</small>}
    </article>
  );
}

export default StatCard;
