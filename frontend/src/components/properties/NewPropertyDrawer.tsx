import { useNavigate } from "react-router-dom";

import { ApiError } from "../../api/client";
import type { PropertyDetail, PropertyInput } from "../../api/propertiesApi";
import { useCreateProperty, useUpdateProperty } from "../../hooks/useProperties";
import Button from "../ui/Button";
import Drawer from "../ui/Drawer";
import PropertyForm from "./PropertyForm";

interface Props {
  onClose: () => void;
  /** Com um imóvel, o drawer edita-o em vez de criar um novo. */
  property?: PropertyDetail;
}

const FORM_ID = "imovel";

function toInput(property: PropertyDetail): PropertyInput {
  const { address, typology, zone, propertyType, areaM2, constructionYear, askingPrice, vvr, visitDate, sourceUrl, notes } = property;
  return { address, typology, zone, propertyType, areaM2, constructionYear, askingPrice, vvr, visitDate, sourceUrl, notes };
}

function serverMessage(error: Error | null): string | undefined {
  if (!error) return undefined;
  return error instanceof ApiError && error.status === 422 ? error.message : "Não foi possível guardar o imóvel. Tente novamente.";
}

function NewPropertyDrawer({ onClose, property }: Props) {
  const navigate = useNavigate();
  const create = useCreateProperty();
  const update = useUpdateProperty(property?.id ?? 0);
  const mutation = property ? update : create;

  const handleSubmit = (input: PropertyInput) => {
    if (property) update.mutate(input, { onSuccess: onClose });
    else create.mutate(input, { onSuccess: (detail) => navigate(`/imoveis/${detail.id}`) });
  };

  return (
    <Drawer
      title={property ? "Editar imóvel" : "Novo imóvel"}
      subtitle={property?.code}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form={FORM_ID} disabled={mutation.isPending}>
            {property ? "Guardar alterações" : "Criar imóvel"}
          </Button>
        </>
      }
    >
      <PropertyForm formId={FORM_ID} initial={property && toInput(property)} serverError={serverMessage(mutation.error)} onSubmit={handleSubmit} />
    </Drawer>
  );
}

export default NewPropertyDrawer;
