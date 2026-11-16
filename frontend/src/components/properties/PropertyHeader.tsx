import type { PropertyDetail } from "../../api/propertiesApi";
import EntityHeader from "../ui/EntityHeader";
import Icon from "../ui/Icon";
import Pill from "../ui/Pill";
import PropertyActions from "./PropertyActions";

interface Props {
  property: PropertyDetail;
  backTo: string;
}

function PropertyHeader({ property, backTo }: Props) {
  return (
    <EntityHeader
      title={property.address}
      type={`Imóveis · ${property.code}`}
      backTo={backTo}
      media={
        <span className="grid size-11 shrink-0 place-items-center rounded-panel bg-brand-soft text-brand max-[720px]:hidden">
          <Icon name="home" />
        </span>
      }
      meta={
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone="green">{property.zone}</Pill>
          <span className="text-[11px] text-muted">
            {property.propertyType} · {property.typology} · {property.areaM2.toLocaleString("pt-PT")} m²
          </span>
        </div>
      }
      actions={<PropertyActions property={property} />}
    />
  );
}

export default PropertyHeader;
