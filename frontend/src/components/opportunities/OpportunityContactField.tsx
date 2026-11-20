import { useContacts } from "../../hooks/useContacts";
import FormField from "../ui/FormField";
import Select from "../ui/Select";

interface Props {
  /** Id do contacto em texto, "" sem contacto. */
  value: string;
  onChange: (value: string) => void;
}

/** Contacto associado à oportunidade (`Opportunity.contact_id`), escolhido dos contactos com pesquisa. */
function OpportunityContactField({ value, onChange }: Props) {
  const contacts = useContacts();
  const options = (contacts.data ?? []).map((contact) => ({ value: String(contact.id), label: contact.email ? `${contact.name} · ${contact.email}` : contact.name }));
  return (
    <FormField label="Contacto (opcional)">
      <Select
        searchable
        label="Contacto"
        value={value}
        onChange={onChange}
        options={options}
        placeholder={contacts.isPending ? "A carregar contactos…" : contacts.isError ? "Não foi possível carregar os contactos" : "Sem contacto"}
      />
    </FormField>
  );
}

export default OpportunityContactField;
