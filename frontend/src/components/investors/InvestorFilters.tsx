import { relationStatusOptions, riskProfileOptions } from "../../temp";
import Filters from "../ui/Filters";

export type InvestorFilterKey = "q" | "risco" | "estado";

interface Props {
  query: string;
  risk: string;
  status: string;
  onChange: (key: InvestorFilterKey, value: string) => void;
}

function InvestorFilters({ query, risk, status, onChange }: Props) {
  return (
    <Filters
      search={{ placeholder: "Pesquisar por nome, email ou telemóvel...", value: query, onChange: (value) => onChange("q", value) }}
      selects={[
        { id: "risco", allLabel: "Todos os perfis de risco", options: riskProfileOptions, value: risk, onChange: (value) => onChange("risco", value) },
        { id: "estado", allLabel: "Todos os estados", options: relationStatusOptions, value: status, onChange: (value) => onChange("estado", value) },
      ]}
    />
  );
}

export default InvestorFilters;
