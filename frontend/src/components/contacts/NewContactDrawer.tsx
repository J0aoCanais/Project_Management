import { useState } from "react";

import { isInvestor, type Contact } from "../../api/contactsApi";
import { useCreateContact, useUpdateContact } from "../../hooks/useContacts";
import { contactFormErrors, contactToForm, emptyContactForm, formToContactInput } from "../../lib/contactForm";
import Button from "../ui/Button";
import Drawer from "../ui/Drawer";
import Notice from "../ui/Notice";
import ContactForm from "./ContactForm";

interface Props {
  onClose: () => void;
  /** Com um contacto, o drawer edita-o em vez de criar um novo. */
  contact?: Contact;
}

const FORM_ID = "contacto";

function NewContactDrawer({ onClose, contact }: Props) {
  const create = useCreateContact();
  const update = useUpdateContact(contact?.id ?? Number.NaN);
  const mutation = contact ? update : create;
  const [values, setValues] = useState(() => (contact ? contactToForm(contact) : emptyContactForm));
  const [showErrors, setShowErrors] = useState(false);
  // Um investidor só tem o papel Investidor: o tipo não aparece nem é pedido.
  const showType = !contact || !isInvestor(contact);
  const errors = contactFormErrors(values, showType);

  const handleSubmit = () => {
    setShowErrors(true);
    if (Object.keys(errors).length) return;
    const input = formToContactInput(values, contact);
    if (contact) update.mutate(input, { onSuccess: onClose });
    else create.mutate(input, { onSuccess: onClose });
  };

  return (
    <Drawer
      title={contact ? "Editar contacto" : "Novo contacto"}
      subtitle={contact ? contact.name : "Fica disponível em leads, operações e obras"}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form={FORM_ID} disabled={mutation.isPending}>
            {contact ? "Guardar alterações" : "Criar contacto"}
          </Button>
        </>
      }
    >
      <ContactForm
        formId={FORM_ID}
        onSubmit={handleSubmit}
        values={values}
        onChange={setValues}
        errors={errors}
        showErrors={showErrors}
        showType={showType}
        header={mutation.isError && <Notice tone="warning">Não foi possível guardar o contacto. Confirme os dados e tente novamente.</Notice>}
      />
    </Drawer>
  );
}

export default NewContactDrawer;
