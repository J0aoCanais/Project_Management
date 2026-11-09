import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { ApiError } from "../api/client";
import { contactType } from "../api/contactsApi";
import ContactActions from "../components/contacts/ContactActions";
import ContactOperations from "../components/contacts/ContactOperations";
import ButtonLink from "../components/ui/ButtonLink";
import EmptyState from "../components/ui/EmptyState";
import EntityHeader from "../components/ui/EntityHeader";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import Pill from "../components/ui/Pill";
import RecordFields from "../components/ui/RecordFields";
import { useContact, useContactOperations } from "../hooks/useContacts";
import { formatIsoDate } from "../lib/format";

function ContactDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const contactId = Number(id);
  const query = useContact(contactId);
  const operations = useContactOperations(contactId);
  const backTo = `/contactos${params.toString() ? `?${params.toString()}` : ""}`;

  if (!Number.isFinite(contactId) || (query.error instanceof ApiError && query.error.status === 404)) {
    return <EmptyState message="Este contacto não existe ou foi eliminado." action={<ButtonLink to="/contactos">Voltar a contactos</ButtonLink>} />;
  }
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;
  const contact = query.data;

  return (
    <>
      <EntityHeader
        title={contact.name}
        type="Contacto"
        backTo={backTo}
        meta={<Pill>{contactType(contact)}</Pill>}
        actions={<ContactActions contact={contact} onDeleted={() => navigate(backTo, { replace: true })} />}
      />
      <div className="grid gap-3">
        <div className="grid gap-3 min-[1051px]:grid-cols-[2fr_1fr]">
          <RecordFields
            fields={[
              { label: "Email", value: contact.email || "—", wide: true },
              { label: "Telemóvel", value: contact.phone || "—" },
              { label: "NIF", value: contact.nif || "—" },
              { label: "Empresa", value: contact.company || "—" },
              { label: "Zona", value: contact.zone || "—" },
              { label: "Tipo", value: contactType(contact) },
              { label: "Morada", value: contact.address || "—", wide: true },
              { label: "Notas", value: contact.notes || "—", wide: true },
            ]}
          />
          <RecordFields
            title="Consentimento RGPD"
            fields={[
              { label: "Consentimento", value: <Pill tone={contact.consentGiven ? "green" : "amber"}>{contact.consentGiven ? "Sim" : "Não"}</Pill> },
              { label: "Data", value: contact.consentGiven && contact.consentDate ? formatIsoDate(contact.consentDate) : "—" },
              { label: "Canal", value: contact.consentGiven ? contact.consentChannel || "—" : "—" },
            ]}
          />
        </div>
        {operations.isError ? (
          <ErrorState message="Não foi possível carregar as operações." onRetry={() => void operations.refetch()} />
        ) : operations.isPending ? (
          <LoadingState />
        ) : (
          <ContactOperations operations={operations.data} />
        )}
      </div>
    </>
  );
}

export default ContactDetailPage;
