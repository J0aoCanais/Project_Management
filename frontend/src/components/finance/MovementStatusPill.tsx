import type { MovementStatus } from "../../api/financeApi";
import Pill, { type PillTone } from "../ui/Pill";

const tones: Record<MovementStatus, PillTone> = { Previsto: "amber", Realizado: "green", Atrasado: "red" };

function MovementStatusPill({ status }: { status: MovementStatus }) {
  return <Pill tone={tones[status]}>{status}</Pill>;
}

export default MovementStatusPill;
