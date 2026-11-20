import Pill, { type PillTone } from "../ui/Pill";

interface Props {
  status: string;
}

const tones: Record<string, PillTone> = {
  Ativo: "green",
  Qualificado: "blue",
  "Por contactar": "amber",
  Inativo: "neutral",
};

function InvestorStatusPill({ status }: Props) {
  return <Pill tone={tones[status] ?? "neutral"}>{status}</Pill>;
}

export default InvestorStatusPill;
