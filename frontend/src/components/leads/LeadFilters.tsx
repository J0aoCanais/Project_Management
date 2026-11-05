import Filters from "../ui/Filters";

interface Props {
  query: string;
  status: string;
  source: string;
  zone: string;
  sources: string[];
  onChange: (key: "q" | "estado" | "origem" | "zona", value: string) => void;
}

function LeadFilters({ query, status, source, zone, sources, onChange }: Props) {
  return (
    <Filters
      search={{ placeholder: "Pesquisar por nome, referência ou telemóvel...", value: query, onChange: (value) => onChange("q", value) }}
      selects={[
        { id: "estado", allLabel: "Todos os estados", options: ["Nova", "Contactada", "Qualificada", "Convertida", "Descartada"], value: status, onChange: (value) => onChange("estado", value) },
        { id: "origem", allLabel: "Todas as origens", options: sources, value: source, onChange: (value) => onChange("origem", value) },
        { id: "zona", allLabel: "Todas as zonas", options: ["Baixa", "Alta", "Celas", "Solum", "Santa Clara", "Olivais"], value: zone, onChange: (value) => onChange("zona", value) },
      ]}
    />
  );
}

export default LeadFilters;
