import { useState, type FormEvent } from "react";

import { isInvestor, type Contact } from "../../api/contactsApi";
import { useCreateContact, useUpdateContact } from "../../hooks/useContacts";
import { contactToForm, emptyContactForm, formToContactInput } from "../../lib/contactForm";
import { contactErrors } from "../../lib/contactRules";
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
  const errors = contactErrors(values);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
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
      <form id={FORM_ID} noValidate onSubmit={handleSubmit} className="grid gap-3 rounded-panel border border-line bg-white p-3.5">
        {mutation.isError && <Notice tone="warning">Não foi possível guardar o contacto. Confirme os dados e tente novamente.</Notice>}
        <ContactForm values={values} onChange={setValues} errors={errors} showErrors={showErrors} showType={!contact || !isInvestor(contact)} />
      </form>
    </Drawer>
  );
}

export default NewContactDrawer;
