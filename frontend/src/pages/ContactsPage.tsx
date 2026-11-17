import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { MIN_SEARCH_LENGTH, OTHER_TYPE, type ContactInput } from "../api/contactsApi";
import ContactFilters, { type ContactFilterKey } from "../components/contacts/ContactFilters";
import ContactsTable from "../components/contacts/ContactsTable";
import NewContactDrawer from "../components/contacts/NewContactDrawer";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import ImportExcel, { type ImportConfig } from "../components/ui/ImportExcel";
import LoadingState from "../components/ui/LoadingState";
import Notice from "../components/ui/Notice";
import PageHeading from "../components/ui/PageHeading";
import Pagination from "../components/ui/Pagination";
import Panel from "../components/ui/Panel";
import { useContactSearch, useContacts, useImportContacts } from "../hooks/useContacts";
import { emptyContactForm, formToContactInput } from "../lib/contactForm";
import { sanitizePhone } from "../lib/leadRules";
import { contactImportSample } from "../temp";

/** Contactos por página, pedidos ao backend (per_page). */
const PAGE_SIZE = 20;

const importConfig: ImportConfig = {
  title: "Importar contactos",
  templateName: "template_contactos.csv",
  columns: ["Nome", "Empresa", "Email", "Telemóvel", "Zona"],
  sample: contactImportSample,
};

function rowToInput([name = "", company = "", email = "", phone = "", zone = ""]: string[]): ContactInput {
  return formToContactInput({ ...emptyContactForm, type: OTHER_TYPE, name, company, email: email.trim(), phone: sanitizePhone(phone), zone });
}

function ContactsPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  const importMutation = useImportContacts();
  const query = params.get("q") ?? "";
  const type = params.get("tipo") ?? "";
  const page = Math.max(1, Math.floor(Number(params.get("pagina")) || 1));
  const contactsQuery = useContactSearch({ q: query, type, page, perPage: PAGE_SIZE });
  // A lista completa só é lida ao importar, para avisar dos nomes repetidos.
  const allContacts = useContacts(importing);
  const hasFilters = query.trim().length >= MIN_SEARCH_LENGTH || Boolean(type);

  // Parte do URL atual (não do render em que foi criada): a pesquisa só chega meio segundo depois de escrever.
  const updateFilter = (key: ContactFilterKey, value: string) =>
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value) next.set(key, value);
        else next.delete(key);
        // Com outros filtros, a página onde se estava pode já não existir.
        next.delete("pagina");
        return next;
      },
      { replace: true },
    );

  const goToPage = (value: number) =>
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      if (value > 1) next.set("pagina", String(value));
      else next.delete("pagina");
      return next;
    });

  const search = params.toString() ? `?${params.toString()}` : "";
  const actions = (
    <>
      <Button onClick={() => setImporting(true)}>Importar de Excel</Button>
      <Button variant="primary" icon="plus" onClick={() => setCreating(true)}>
        Novo contacto
      </Button>
    </>
  );

  const renderContent = () => {
    if (contactsQuery.isPending) return <LoadingState />;
    if (contactsQuery.isError) return <ErrorState onRetry={() => void contactsQuery.refetch()} />;
    const { contacts, total, pages } = contactsQuery.data;
    // Página que já não existe (ex.: depois de apagar contactos): o backend devolve-a vazia.
    if (!contacts.length && page > 1 && total > 0)
      return <EmptyState message="Esta página já não tem contactos." action={<Button onClick={() => goToPage(pages)}>Ir para a última página</Button>} />;
    if (!total && !hasFilters) return <EmptyState message="Ainda não há contactos. Crie o primeiro ou importe uma lista do Excel." />;
    if (!total) return <EmptyState message="Nenhum contacto corresponde aos filtros." action={<Button onClick={() => setParams({})}>Limpar filtros</Button>} />;
    return (
      <>
        {/* Enquanto a nova página chega, a anterior fica esbatida. */}
        <div aria-busy={contactsQuery.isPlaceholderData} className={contactsQuery.isPlaceholderData ? "opacity-60 transition-opacity" : "transition-opacity"}>
          <ContactsTable contacts={contacts} onRowClick={(contact) => navigate(`/contactos/${contact.id}${search}`)} />
        </div>
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={goToPage} />
      </>
    );
  };

  return (
    <>
      <PageHeading title="Contactos" actions={actions} />
      <ContactFilters query={query} type={type} onChange={updateFilter} />
      {importMutation.isSuccess && (
        <div role="status" className="mb-2">
          <Notice>
            {importMutation.data.created} {importMutation.data.created === 1 ? "contacto importado" : "contactos importados"}
            {importMutation.data.skipped > 0 && ` · ${importMutation.data.skipped} ignorados (repetidos ou com dados inválidos)`}.
          </Notice>
        </div>
      )}
      {importMutation.isError && (
        <div role="alert" className="mb-2">
          <Notice tone="warning">Não foi possível importar os contactos. Tente novamente.</Notice>
        </div>
      )}
      <Panel className="overflow-hidden">{renderContent()}</Panel>
      {creating && <NewContactDrawer onClose={() => setCreating(false)} />}
      {importing && (
        <ImportExcel
          config={importConfig}
          existingNames={(allContacts.data ?? []).map((contact) => contact.name)}
          onClose={() => setImporting(false)}
          onImport={(rows) => importMutation.mutate(rows.map(rowToInput))}
        />
      )}
    </>
  );
}

export default ContactsPage;
