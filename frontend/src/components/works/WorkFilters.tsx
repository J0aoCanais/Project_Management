import { WORK_STATES } from "../../lib/workRules";
import Filters from "../ui/Filters";

interface Props {
  query: string;
  status: string;
  operation: string;
  operationOptions: string[];
  onChange: (key: "q" | "estado" | "operacao", value: string) => void;
}

function WorkFilters({ query, status, operation, operationOptions, onChange }: Props) {
  return (
    <Filters
      search={{
        placeholder: "Pesquisar por obra ou operação...",
        value: query,
        onChange: (value) => onChange("q", value),
      }}
      selects={[
        {
          id: "estado",
          allLabel: "Todos os estados",
          options: [...WORK_STATES],
          value: status,
          onChange: (value) => onChange("estado", value),
        },
        {
          id: "operacao",
          allLabel: "Todas as operações",
          options: operationOptions,
          value: operation,
          onChange: (value) => onChange("operacao", value),
        },
      ]}
    />
  );
}

export default WorkFilters;
