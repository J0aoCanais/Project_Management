import { useState, type FormEvent } from "react";

import { useChangePassword } from "../../hooks/useSettings";
import { passwordError, SETTINGS_LIMITS } from "../../lib/settingsRules";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import FormField from "../ui/FormField";
import Notice from "../ui/Notice";
import { inputClasses } from "../ui/inputClasses";

interface Props {
  onClose: () => void;
}

function ChangePasswordDialog({ onClose }: Props) {
  const change = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const errors = {
    currentPassword: currentPassword ? undefined : "Indique a palavra-passe atual.",
    newPassword: passwordError(newPassword, currentPassword),
    confirmation: confirmation === newPassword ? undefined : "As palavras-passe não coincidem.",
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;
    change.mutate({ currentPassword, newPassword }, { onSuccess: onClose });
  };

  return (
    <Dialog
      title="Alterar palavra-passe"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="alterar-palavra-passe" disabled={change.isPending}>Guardar</Button>
        </>
      }
    >
      <form id="alterar-palavra-passe" noValidate onSubmit={handleSubmit} className="grid gap-3">
        {change.isError && <Notice tone="warning">Não foi possível alterar a palavra-passe. Verifique os campos e tente novamente.</Notice>}
        <FormField label="Palavra-passe atual" error={submitted ? errors.currentPassword : undefined}>
          <input className={inputClasses} type="password" autoComplete="current-password" maxLength={SETTINGS_LIMITS.password} value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
        </FormField>
        <FormField label="Nova palavra-passe" error={submitted ? errors.newPassword : undefined}>
          <input className={inputClasses} type="password" autoComplete="new-password" maxLength={SETTINGS_LIMITS.password} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
        </FormField>
        <FormField label="Confirmar nova palavra-passe" error={submitted ? errors.confirmation : undefined}>
          <input className={inputClasses} type="password" autoComplete="new-password" maxLength={SETTINGS_LIMITS.password} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
        </FormField>
        <p className="m-0 text-[11px] text-muted">Pelo menos 10 caracteres, com uma letra e um número, e diferente da atual.</p>
      </form>
    </Dialog>
  );
}

export default ChangePasswordDialog;
