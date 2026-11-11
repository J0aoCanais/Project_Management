import { useOpportunityOptions } from "../../hooks/useOpportunities";
import type { useOpportunityFilters } from "../../hooks/useOpportunityFilters";
import PipelineToolbar from "../pipeline/PipelineToolbar";

interface Props {
  filters: ReturnType<typeof useOpportunityFilters>;
}

function OpportunityToolbar({ filters }: Props) {
  const { data: options } = useOpportunityOptions();
  return <PipelineToolbar filters={filters} zones={options?.zones ?? []} managers={options?.managers ?? []} searchPlaceholder="Pesquisar oportunidades..." />;
}

export default OpportunityToolbar;
