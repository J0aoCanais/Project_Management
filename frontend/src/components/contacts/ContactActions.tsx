import { useState } from "react";

import type { Contact } from "../../api/contactsApi";
import Button from "../ui/Button";
import DeleteContactDialog from "./DeleteContactDialog";
import NewContactDrawer from "./NewContactDrawer";

interface Props {
  contact: Contact;
  /** Chamado depois de eliminar, para voltar à lista. */
  onDeleted: () => void;
}

function ContactActions({ contact, onDeleted }: Props) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <>
      {/* TODO: botão "Perfil de investidor" quando os investidores usarem o backend (hoje são de exemplo e os ids não correspondem). */}
      <Button variant="danger" onClick={() => setDeleting(true)}>
        Eliminar
      </Button>
      <Button variant="primary" onClick={() => setEditing(true)}>
        Editar
      </Button>
      {editing && <NewContactDrawer contact={contact} onClose={() => setEditing(false)} />}
      {deleting && <DeleteContactDialog contactId={contact.id} name={contact.name} onClose={() => setDeleting(false)} onDeleted={onDeleted} />}
    </>
  );
}

export default ContactActions;
