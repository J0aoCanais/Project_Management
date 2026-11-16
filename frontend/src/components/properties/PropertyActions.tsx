import { useState } from "react";

import type { PropertyDetail } from "../../api/propertiesApi";
import NewOpportunityDrawer from "../opportunities/NewOpportunityDrawer";
import Button from "../ui/Button";
import NewPropertyDrawer from "./NewPropertyDrawer";

interface Props {
  property: PropertyDetail;
}

function PropertyActions({ property }: Props) {
  const [open, setOpen] = useState<"edit" | "opportunity" | null>(null);
  const close = () => setOpen(null);
  return (
    <>
      <Button onClick={() => setOpen("edit")}>Editar</Button>
      <Button variant="primary" icon="target" onClick={() => setOpen("opportunity")}>
        Criar oportunidade
      </Button>
      {open === "edit" && <NewPropertyDrawer property={property} onClose={close} />}
      {open === "opportunity" && (
        <NewOpportunityDrawer
          onClose={close}
          initial={{ title: property.address, typology: property.typology, zone: property.zone, askingPrice: property.askingPrice, vvr: property.vvr, propertyId: property.id }}
        />
      )}
    </>
  );
}

export default PropertyActions;
