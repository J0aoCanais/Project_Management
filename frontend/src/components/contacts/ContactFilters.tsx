import { useContactTypes } from "../../hooks/useContacts";
import Filters from "../ui/Filters";

export type ContactFilterKey = "q" | "zona" | "tipo";

interface Props {
  query: string;
  zone: string;
  type: string;
  /** Zonas que existem nos contactos (a zona é texto livre). */
  zones: string[];
  onChange: (key: ContactFilterKey, value: string) => void;
}

function ContactFilters({ query, zone, type, zones, onChange }: Props) {
  const contactTypeOptions = useContactTypes();
  return (
    <Filters
      search={{ placeholder: "Pesquisar por nome, empresa, email ou telemóvel...", value: query, onChange: (value) => onChange("q", value) }}
      selects={[
        { id: "zona", allLabel: "Todas as zonas", options: zones, value: zone, onChange: (value) => onChange("zona", value) },
        { id: "tipo", allLabel: "Todos os tipos", options: contactTypeOptions, value: type, onChange: (value) => onChange("tipo", value) },
      ]}
    />
  );
}

export default ContactFilters;
