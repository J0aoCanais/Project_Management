import { OTHER_TYPE, contactType, type Contact, type ContactInput } from "../api/contactsApi";
import type { ContactFields } from "./contactRules";

/** O que o `ContactForm` edita: os campos do contacto e o tipo (um só papel). */
export interface ContactFormValues extends ContactFields {
  type: string;
}

export const emptyContactForm: ContactFormValues = {
  name: "",
  type: OTHER_TYPE,
  email: "",
  phone: "",
  company: "",
  zone: "",
  nif: "",
  address: "",
  notes: "",
  consentGiven: false,
  consentChannel: "",
};

export function contactToForm(contact: Contact): ContactFormValues {
  const { name, email, phone, company, zone, nif, address, notes, consentGiven, consentChannel } = contact;
  return { name, email, phone, company, zone, nif, address, notes, consentGiven, consentChannel, type: contactType(contact) };
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
    roles: form.type === OTHER_TYPE ? kept : [...kept, form.type],
    email: form.email.trim(),
    phone: form.phone.trim(),
    company: form.company.trim(),
    zone: form.zone.trim(),
    nif: form.nif.trim(),
    address: form.address.trim(),
    notes: form.notes.trim(),
    consentGiven: form.consentGiven,
    consentDate: form.consentGiven && previous?.consentGiven ? previous.consentDate : undefined,
    consentChannel: form.consentGiven ? form.consentChannel : "",
  };
}
