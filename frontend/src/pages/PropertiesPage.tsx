import { useMemo, useState } from "react";

import PropertiesTable from "../components/properties/PropertiesTable";
import PropertyFilters, { type PropertyFilterKey } from "../components/properties/PropertyFilters";
import NewPropertyDrawer from "../components/properties/NewPropertyDrawer";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import PageHeading from "../components/ui/PageHeading";
import Panel from "../components/ui/Panel";
import { useProperties } from "../hooks/useProperties";
import { useUrlFilters } from "../hooks/useUrlFilters";

const FILTER_KEYS: PropertyFilterKey[] = ["q", "zona", "tipologia", "tipo"];

const normalize = (text: string) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

function PropertiesPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const properties = useProperties();
  const { values, set, clear, active } = useUrlFilters(FILTER_KEYS);

  const filtered = useMemo(() => {
    const term = normalize(values.q.trim());
    return (properties.data ?? []).filter(
      (property) =>
        (!term || normalize(`${property.address} ${property.code}`).includes(term)) &&
        (!values.zona || property.zone === values.zona) &&
        (!values.tipologia || property.typology === values.tipologia) &&
        (!values.tipo || property.propertyType === values.tipo),
    );
  }, [properties.data, values.q, values.zona, values.tipologia, values.tipo]);

  return (
    <div>
      <PageHeading
        title="Imóveis"
        actions={
          <Button variant="primary" icon="plus" onClick={() => setDrawerOpen(true)}>
            Novo imóvel
          </Button>
        }
      />
      <PropertyFilters values={values} onChange={set} />
      <Panel className="overflow-hidden">
        {properties.isPending ? (
          <LoadingState />
        ) : properties.isError ? (
          <ErrorState onRetry={() => void properties.refetch()} />
        ) : filtered.length ? (
          <PropertiesTable properties={filtered} />
        ) : active ? (
          <EmptyState message="Nenhum imóvel corresponde aos filtros." action={<Button onClick={clear}>Limpar filtros</Button>} />
        ) : (
          <EmptyState message="Ainda não há imóveis registados." action={<Button onClick={() => setDrawerOpen(true)}>Registar o primeiro imóvel</Button>} />
        )}
      </Panel>
      {drawerOpen && <NewPropertyDrawer onClose={() => setDrawerOpen(false)} />}
    </div>
  );
}

export default PropertiesPage;
