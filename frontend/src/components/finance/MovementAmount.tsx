import type { MovementDirection } from "../../api/financeApi";
import { formatSignedMoney } from "../../lib/format";

interface Props {
  amount: number;
  direction: MovementDirection;
  className?: string;
}

/** Valor com sinal: entradas a verde, saídas a vermelho. */
function MovementAmount({ amount, direction, className = "" }: Props) {
  const inflow = direction === "Entrada";
  return <span className={`font-semibold tabular-nums ${inflow ? "text-success" : "text-danger"} ${className}`}>{formatSignedMoney(amount, inflow)}</span>;
}

export default MovementAmount;
