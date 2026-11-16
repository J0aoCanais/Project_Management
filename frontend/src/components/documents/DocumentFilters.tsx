import Filters from "../ui/Filters";

interface Props {
  query: string;
  type: string;
  owner: string;
  types: string[];
  owners: string[];
  onChange: (key: "q" | "tipo" | "associado", value: string) => void;
}

function DocumentFilters({ query, type, owner, types, owners, onChange }: Props) {
  return (
    <Filters
      search={{ placeholder: "Pesquisar pelo nome do documento...", value: query, onChange: (value) => onChange("q", value) }}
      selects={[
        { id: "tipo", allLabel: "Todos os tipos", options: types, value: type, onChange: (value) => onChange("tipo", value) },
        { id: "associado", allLabel: "Associado a qualquer registo", options: owners, value: owner, onChange: (value) => onChange("associado", value) },
      ]}
    />
  );
}

export default DocumentFilters;
