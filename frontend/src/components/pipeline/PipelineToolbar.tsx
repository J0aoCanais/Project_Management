import type { PipelineFilters } from "../../hooks/usePipelineFilters";
import Filters from "../ui/Filters";
import SegmentedChoice from "../ui/SegmentedChoice";

interface Props {
  filters: PipelineFilters;
  zones: string[];
  managers: string[];
  searchPlaceholder: string;
}

function PipelineToolbar({ filters, zones, managers, searchPlaceholder }: Props) {
  return (
    <div className="mb-3.5 flex flex-col gap-2 min-[721px]:flex-row min-[721px]:items-start min-[721px]:justify-between">
      <SegmentedChoice
        label="Vista"
        value={filters.view}
        onChange={filters.setView}
        options={[
          { value: "quadro", label: "Quadro", icon: "board" },
          { value: "lista", label: "Lista", icon: "list" },
        ]}
      />
      <Filters
        compact
        search={{ placeholder: searchPlaceholder, value: filters.search, onChange: filters.setSearch }}
        selects={[
          { id: "zona", allLabel: "Todas as zonas", options: zones, value: filters.zone, onChange: filters.setZone },
          { id: "gestor", allLabel: "Todos os gestores", options: managers, value: filters.manager, onChange: filters.setManager },
        ]}
      />
    </div>
  );
}

export default PipelineToolbar;
