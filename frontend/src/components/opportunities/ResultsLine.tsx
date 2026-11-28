interface Props {
  label: string;
  value: string;
  /** Linha de destaque (ex.: o que o investidor recebe). */
  strong?: boolean;
}

/** Uma linha "rótulo · valor" do cartão escuro de resultados. */
function ResultsLine({ label, value, strong = false }: Props) {
  return (
    <li className={`flex justify-between gap-2.5 text-[11px] ${strong ? "text-white" : "text-results-muted"}`}>
      <span>{label}</span>
      <b className={`shrink-0 text-white ${strong ? "font-bold" : "font-semibold"}`}>{value}</b>
    </li>
  );
}

export default ResultsLine;
