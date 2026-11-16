import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { OTHER_TYPE, contactType, type ContactInput } from "../api/contactsApi";
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
import { useContacts, useImportContacts } from "../hooks/useContacts";
import { emptyContactForm, formToContactInput } from "../lib/contactForm";
import { sanitizePhone } from "../lib/leadRules";
import { contactImportSample } from "../temp";

const PAGE_SIZE = 20;

/** Para comparar zonas escritas à mão: sem espaços a mais e sem diferença de maiúsculas. */
const normalizeZone = (zone: string) => zone.trim().replace(/\s+/g, " ").toLowerCase();

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
  const contactsQuery = useContacts();
  const importMutation = useImportContacts();
  const query = params.get("q") ?? "";
  const zone = params.get("zona") ?? "";
  const type = params.get("tipo") ?? "";

  const updateFilter = (key: ContactFilterKey, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    // Com outros filtros, a página onde se estava pode já não existir.
    next.delete("pagina");
    setParams(next, { replace: true });
  };

  const goToPage = (value: number) => {
    const next = new URLSearchParams(params);
    if (value > 1) next.set("pagina", String(value));
    else next.delete("pagina");
    setParams(next);
  };

  // Uma opção por zona escrita de formas diferentes ("Baixa", "baixa "); fica a grafia com maiúscula, se houver.
  const zones = useMemo(() => {
    const byKey = new Map<string, string>();
    for (const contact of contactsQuery.data ?? []) {
      const key = normalizeZone(contact.zone);
      const label = contact.zone.trim().replace(/\s+/g, " ");
      const current = byKey.get(key);
      if (key && (!current || (current[0] === current[0].toLowerCase() && label[0] !== label[0].toLowerCase()))) byKey.set(key, label);
    }
    return [...byKey.values()].sort((a, b) => a.localeCompare(b, "pt"));
  }, [contactsQuery.data]);

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    return (contactsQuery.data ?? []).filter(
      (contact) =>
        (!text || [contact.name, contact.company, contact.email, contact.phone].some((value) => value.toLowerCase().includes(text))) &&
        (!zone || normalizeZone(contact.zone) === normalizeZone(zone)) &&
        (!type || contactType(contact) === type),
    );
  }, [contactsQuery.data, query, zone, type]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const requestedPage = Number(params.get("pagina")) || 1;
  const page = Math.min(Math.max(1, Math.floor(requestedPage)), pageCount);
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
    if (!contactsQuery.data.length) return <EmptyState message="Ainda não há contactos. Crie o primeiro ou importe uma lista do Excel." />;
    if (!filtered.length) return <EmptyState message="Nenhum contacto corresponde aos filtros." action={<Button onClick={() => setParams({})}>Limpar filtros</Button>} />;
    return (
      <>
        <ContactsTable contacts={pageRows} onRowClick={(contact) => navigate(`/contactos/${contact.id}${search}`)} />
        <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onChange={goToPage} />
      </>
    );
  };

  return (
    <>
      <PageHeading title="Contactos" actions={actions} />
      <ContactFilters query={query} zone={zone} type={type} zones={zone && !zones.some((item) => normalizeZone(item) === normalizeZone(zone)) ? [...zones, zone] : zones} onChange={updateFilter} />
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
          existingNames={(contactsQuery.data ?? []).map((contact) => contact.name)}
          onClose={() => setImporting(false)}
          onImport={(rows) => importMutation.mutate(rows.map(rowToInput))}
        />
      )}
    </>
  );
}

export default ContactsPage;
