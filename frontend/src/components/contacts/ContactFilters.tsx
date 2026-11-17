import { useContactRoleNames } from "../../hooks/useContacts";
import Filters from "../ui/Filters";

export type ContactFilterKey = "q" | "tipo";

interface Props {
  query: string;
  type: string;
  onChange: (key: ContactFilterKey, value: string) => void;
}

// Só os filtros que o GET /api/contacts/search aceita (q e role_id). Não há filtro por zona no backend.
function ContactFilters({ query, type, onChange }: Props) {
  const roleNames = useContactRoleNames();
  // Um tipo vindo do URL aparece mesmo antes de os papéis carregarem.
  const options = type && !roleNames.includes(type) ? [...roleNames, type] : roleNames;
  return (
    <Filters
      search={{ placeholder: "Pesquisar por nome, email, telemóvel ou NIF...", value: query, onChange: (value) => onChange("q", value) }}
      selects={[{ id: "tipo", allLabel: "Todos os tipos", options, value: type, onChange: (value) => onChange("tipo", value) }]}
    />
  );
}

export default ContactFilters;
