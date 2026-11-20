import { OTHER_TYPE, contactType, type Contact, type ContactInput } from "../api/contactsApi";
import { contactErrors, type ContactErrors, type ContactFields } from "./contactRules";

/** O que o `ContactForm` edita: os campos do contacto, o tipo (um só papel) e a zona (id em texto, "" sem zona). */
export interface ContactFormValues extends ContactFields {
  type: string;
  zoneId: string;
}

export type ContactFormErrors = ContactErrors & { type?: string };

export const emptyContactForm: ContactFormValues = {
  name: "",
  type: "",
  email: "",
  phone: "",
  company: "",
  zoneId: "",
  nif: "",
  address: "",
  notes: "",
  consentGiven: false,
  consentChannel: "",
};

export function contactToForm(contact: Contact): ContactFormValues {
  const { name, email, phone, company, nif, address, notes, consentGiven, consentChannel } = contact;
  const type = contactType(contact);
  return {
    name, email, phone, company, nif, address, notes, consentGiven, consentChannel,
    // Um contacto antigo sem papel aparece como "Outro"; ao editar tem de escolher um tipo.
    type: type === OTHER_TYPE ? "" : type,
    zoneId: contact.zoneId === null ? "" : String(contact.zoneId),
  };
}

/**
 * Erros do formulário. O tipo de contacto é obrigatório sempre que o campo aparece
 * (num investidor não aparece: o papel é sempre Investidor).
 */
export function contactFormErrors(values: ContactFormValues, requireType = true): ContactFormErrors {
  const errors: ContactFormErrors = contactErrors(values);
  if (requireType && !values.type) errors.type = "Escolha o tipo de contacto.";
  return errors;
}

/**
 * Formulário → dados a enviar. O formulário só mostra um papel (o tipo); ao editar, os outros
 * (ex.: Investidor) ficam, tal como a data do consentimento se ele já tinha sido dado.
 */
export function formToContactInput(form: ContactFormValues, previous?: Contact): ContactInput {
  const shown = previous ? contactType(previous).toLowerCase() : "";
  const kept = (previous?.roles ?? []).filter((role) => role.toLowerCase() !== shown && role.toLowerCase() !== form.type.toLowerCase());
  return {
    name: form.name.trim(),
    roles: form.type ? [...kept, form.type] : kept,
    email: form.email.trim(),
    phone: form.phone.trim(),
    company: form.company.trim(),
    zoneId: form.zoneId ? Number(form.zoneId) : null,
    nif: form.nif.trim(),
    address: form.address.trim(),
    notes: form.notes.trim(),
    consentGiven: form.consentGiven,
    consentDate: form.consentGiven && previous?.consentGiven ? previous.consentDate : undefined,
    consentChannel: form.consentGiven ? form.consentChannel : "",
  };
}
