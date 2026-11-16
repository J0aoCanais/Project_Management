import { propertyTypeOptions, typologyOptions, zoneOptions } from "../../temp";
import Filters from "../ui/Filters";

export type PropertyFilterKey = "q" | "zona" | "tipologia" | "tipo";

interface Props {
  values: Record<PropertyFilterKey, string>;
  onChange: (key: PropertyFilterKey, value: string) => void;
}

function PropertyFilters({ values, onChange }: Props) {
  return (
    <Filters
      search={{ placeholder: "Pesquisar pela morada ou código...", value: values.q, onChange: (value) => onChange("q", value) }}
      selects={[
        { id: "zona", allLabel: "Todas as zonas", options: zoneOptions, value: values.zona, onChange: (value) => onChange("zona", value) },
        { id: "tipologia", allLabel: "Todas as tipologias", options: typologyOptions, value: values.tipologia, onChange: (value) => onChange("tipologia", value) },
        { id: "tipo", allLabel: "Todos os tipos de imóvel", options: propertyTypeOptions, value: values.tipo, onChange: (value) => onChange("tipo", value) },
      ]}
    />
  );
}

export default PropertyFilters;
