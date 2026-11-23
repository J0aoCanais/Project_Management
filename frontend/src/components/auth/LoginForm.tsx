import { useState, type FormEvent } from "react";

import { ApiError } from "../../api/client";
import { useLogin } from "../../hooks/useSession";
import { LOGIN_LIMITS, loginErrors } from "../../lib/authRules";
import Button from "../ui/Button";
import FormField from "../ui/FormField";
import Notice from "../ui/Notice";
import PasswordInput from "../ui/PasswordInput";
import { inputClasses } from "../ui/inputClasses";

interface Props {
  /** Chamado depois de entrar. */
  onSuccess: () => void;
}

function failureMessage(error: Error): string {
  if (error instanceof ApiError && error.status === 429) return "Demasiadas tentativas. Aguarde um minuto e tente novamente.";
  if (error instanceof ApiError && (error.status === 401 || error.status === 400)) return error.message;
  return "Não foi possível entrar. Verifique a ligação e tente novamente.";
}

function LoginForm({ onSuccess }: Props) {
  const login = useLogin();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const errors = loginErrors(username, password);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    if (Object.keys(errors).length) return;
    login.mutate({ username: username.trim(), password }, {
        onSuccess,
        // Limpa a palavra-passe errada sem mostrar "Indique a palavra-passe" por baixo da mensagem do servidor.
        onError: () => {
          setPassword("");
          setShowErrors(false);
        },
      });
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="grid gap-3.5">
      {login.isError && (
        <div role="alert">
          <Notice tone="warning">{failureMessage(login.error)}</Notice>
        </div>
      )}
      <FormField label="Email" error={showErrors ? errors.username : undefined}>
        <input
          type="email"
          autoComplete="username"
          autoFocus
          maxLength={LOGIN_LIMITS.username}
          className={`${inputClasses} h-[38px] ${showErrors && errors.username ? "border-danger" : ""}`}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="nome@empresa.pt"
        />
      </FormField>
      <FormField label="Palavra-passe" error={showErrors ? errors.password : undefined}>
        <PasswordInput autoComplete="current-password" maxLength={LOGIN_LIMITS.password} value={password} onChange={setPassword} invalid={showErrors && !!errors.password} />
      </FormField>
      <Button variant="primary" type="submit" icon="lock" className="mt-1 w-full" disabled={login.isPending}>
        {login.isPending ? "A entrar…" : "Entrar"}
      </Button>
    </form>
  );
}

export default LoginForm;
