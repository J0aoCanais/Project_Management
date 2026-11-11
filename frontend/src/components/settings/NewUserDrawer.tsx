import { useState, type FormEvent } from "react";

import type { NewUser } from "../../api/settingsApi";
import { useCreateUser, useRoles } from "../../hooks/useSettings";
import { newUserErrors, SETTINGS_LIMITS } from "../../lib/settingsRules";
import Button from "../ui/Button";
import Drawer from "../ui/Drawer";
import FormField from "../ui/FormField";
import Notice from "../ui/Notice";
import Select from "../ui/Select";
import { inputClasses } from "../ui/inputClasses";

interface Props {
  onClose: () => void;
}

const FORM_ID = "novo-utilizador";

function NewUserDrawer({ onClose }: Props) {
  const { data: roles = [], isError: rolesFailed } = useRoles();
  const create = useCreateUser();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [accessLevel, setAccessLevel] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const input: NewUser = { username, email, accessLevel, password };
  const errors = newUserErrors(input);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;
    create.mutate(input, { onSuccess: onClose });
  };

  return (
    <Drawer
      title="Novo utilizador"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form={FORM_ID} disabled={create.isPending || rolesFailed || !roles.length}>Criar utilizador</Button>
        </>
      }
    >
      <form id={FORM_ID} noValidate onSubmit={handleSubmit} className="grid gap-3 rounded-panel border border-line bg-white p-3.5">
        {create.isError && <Notice tone="warning">Não foi possível criar o utilizador. O nome ou email pode já estar em uso.</Notice>}
        {rolesFailed && <Notice tone="warning">Não foi possível carregar os níveis de acesso.</Notice>}
        <FormField label="Nome de utilizador" error={submitted ? errors.username : undefined}>
          <input className={inputClasses} value={username} maxLength={SETTINGS_LIMITS.username} onChange={(event) => setUsername(event.target.value)} autoFocus />
        </FormField>
        <FormField label="Email" error={submitted ? errors.email : undefined}>
          <input className={inputClasses} type="email" autoComplete="email" value={email} maxLength={SETTINGS_LIMITS.email} onChange={(event) => setEmail(event.target.value)} />
        </FormField>
        <FormField label="Nível de acesso" error={submitted ? errors.accessLevel : undefined}>
          <Select value={accessLevel} onChange={setAccessLevel} options={roles.map((role) => role.name)} placeholder="Selecionar nível…" />
        </FormField>
        <FormField label="Palavra-passe inicial" error={submitted ? errors.password : undefined}>
          <input className={inputClasses} type="password" autoComplete="new-password" value={password} maxLength={SETTINGS_LIMITS.password} onChange={(event) => setPassword(event.target.value)} />
        </FormField>
        <p className="m-0 text-[11px] text-muted">Pelo menos 10 caracteres, com uma letra e um número.</p>
      </form>
    </Drawer>
  );
}

export default NewUserDrawer;
