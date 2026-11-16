import type { MovementOptions } from "../../api/financeApi";
import { MOVEMENT_STATUSES, NO_OPERATION } from "../../lib/financeRules";
import Filters from "../ui/Filters";

export type MovementFilterKey = "q" | "categoria" | "direcao" | "estado" | "operacao";

interface Props {
  values: Record<MovementFilterKey, string>;
  options?: MovementOptions;
  onChange: (key: MovementFilterKey, value: string) => void;
}

function MovementFilters({ values, options, onChange }: Props) {
  return (
    <Filters
      search={{ placeholder: "Pesquisar nas notas...", value: values.q, onChange: (value) => onChange("q", value) }}
      selects={[
        { id: "categoria", allLabel: "Todas as categorias", options: options?.categories.map((category) => category.name) ?? [], value: values.categoria, onChange: (value) => onChange("categoria", value) },
        { id: "direcao", allLabel: "Entradas e saídas", options: ["Entrada", "Saída"], value: values.direcao, onChange: (value) => onChange("direcao", value) },
        { id: "estado", allLabel: "Todos os estados", options: MOVEMENT_STATUSES, value: values.estado, onChange: (value) => onChange("estado", value) },
        {
          id: "operacao",
          allLabel: "Todas as operações",
          options: [...(options?.operations.map((operation) => operation.label) ?? []), NO_OPERATION],
          value: values.operacao,
          onChange: (value) => onChange("operacao", value),
        },
      ]}
    />
  );
}

export default MovementFilters;
