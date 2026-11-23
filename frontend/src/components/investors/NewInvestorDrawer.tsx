import { useState, type FormEvent } from "react";

import type { InvestorDetail } from "../../api/investorsApi";
import { useContacts } from "../../hooks/useContacts";
import { useCreateInvestor, useUpdateInvestor } from "../../hooks/useInvestors";
import { emptyContactForm, formToContactInput } from "../../lib/contactForm";
import { contactErrors } from "../../lib/contactRules";
import { emptyInvestorProfile, investorProfileErrors } from "../../lib/investorRules";
import ContactForm from "../contacts/ContactForm";
import Button from "../ui/Button";
import Drawer from "../ui/Drawer";
import FormField from "../ui/FormField";
import Notice from "../ui/Notice";
import SegmentedChoice from "../ui/SegmentedChoice";
import Select from "../ui/Select";
import InvestorProfileForm from "./InvestorProfileForm";

interface Props {
  onClose: () => void;
  /** Com um investidor, o drawer edita só o perfil. */
  investor?: InvestorDetail;
}

const FORM_ID = "investidor";

function NewInvestorDrawer({ onClose, investor }: Props) {
  const contacts = useContacts();
  const create = useCreateInvestor();
  const update = useUpdateInvestor(investor?.id ?? Number.NaN);
  const mutation = investor ? update : create;
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [contactId, setContactId] = useState("");
  const [contact, setContact] = useState(emptyContactForm);
  const [profile, setProfile] = useState(investor?.profile ?? emptyInvestorProfile);
  const [showErrors, setShowErrors] = useState(false);

  const profileErrors = investorProfileErrors(profile);
  const newContactErrors = !investor && mode === "new" ? contactErrors(contact) : {};
  const contactIdError = !investor && mode === "existing" && !contactId ? "Escolha o contacto." : undefined;
  const contactOptions = (contacts.data ?? []).map((item) => ({ value: String(item.id), label: item.email ? `${item.name} · ${item.email}` : item.name }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    if (Object.keys(profileErrors).length || Object.keys(newContactErrors).length || contactIdError) return;
    if (investor) update.mutate(profile, { onSuccess: onClose });
    else if (mode === "existing") create.mutate({ profile, contactId: Number(contactId) }, { onSuccess: onClose });
    else create.mutate({ profile, contact: formToContactInput(contact) }, { onSuccess: onClose });
  };

  return (
    <Drawer
      title={investor ? "Editar perfil de investidor" : "Novo investidor"}
      subtitle={investor ? investor.name : "Um contacto com perfil de investidor"}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form={FORM_ID} disabled={mutation.isPending}>
            {investor ? "Guardar alterações" : "Criar investidor"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} noValidate onSubmit={handleSubmit} className="grid gap-3">
        {mutation.isError && <Notice tone="warning">Não foi possível guardar o investidor. Confirme os dados e tente novamente.</Notice>}
        {!investor && (
          <section className="grid gap-3 rounded-panel border border-line bg-white p-3.5">
            <h3 className="text-xs font-bold">Contacto</h3>
            <SegmentedChoice
              label="Contacto do investidor"
              value={mode}
              onChange={setMode}
              options={[
                { value: "existing", label: "Contacto existente" },
                { value: "new", label: "Novo contacto" },
              ]}
            />
            {mode === "existing" ? (
              <FormField label="Contacto" error={showErrors ? contactIdError : undefined}>
                <Select value={contactId} onChange={setContactId} options={contactOptions} placeholder={contacts.isPending ? "A carregar contactos…" : "Selecionar contacto…"} />
              </FormField>
            ) : (
              <ContactForm values={contact} onChange={setContact} errors={newContactErrors} showErrors={showErrors} showType={false} />
            )}
          </section>
        )}
        <section className="grid gap-3 rounded-panel border border-line bg-white p-3.5">
          <h3 className="text-xs font-bold">Perfil de investidor</h3>
          <InvestorProfileForm values={profile} onChange={setProfile} errors={profileErrors} showErrors={showErrors} />
        </section>
      </form>
    </Drawer>
  );
}

export default NewInvestorDrawer;
