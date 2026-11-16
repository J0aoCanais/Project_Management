import { useSearchParams } from "react-router-dom";

import LoginForm from "../components/auth/LoginForm";
import LoginShowcase from "../components/auth/LoginShowcase";
import { safeNext } from "../lib/authRules";

/** Fora do AppLayout: é a única página que se vê sem sessão. */
function LoginPage() {
  const [params] = useSearchParams();
  // Recarrega a aplicação no destino para começar com a sessão nova (token CSRF incluído).
  const goToApp = () => window.location.assign(safeNext(params.get("next")));

  return (
    <div className="grid min-h-dvh bg-surface min-[901px]:grid-cols-[minmax(380px,1fr)_minmax(420px,1fr)]">
      <LoginShowcase />
      <main className="flex flex-col items-center justify-center px-4 py-10">
        <div className="mb-6 rounded-panel bg-sidebar px-4 pt-3 min-[901px]:hidden">
          <span className="block text-lg font-bold tracking-[-0.5px] text-white">ImoVentures</span>
          <small className="block pb-3 text-[8px] tracking-[2px] text-sidebar-muted">CRM</small>
        </div>
        <div className="w-full max-w-[380px] rounded-panel border border-line bg-white p-6">
          <h1 className="text-[22px] font-bold tracking-[-0.35px]">Entrar</h1>
          <p className="mt-1 mb-5 text-xs text-muted">Use o email e a palavra-passe da sua conta.</p>
          <LoginForm onSuccess={goToApp} />
        </div>
        <p className="mt-4 max-w-[380px] text-center text-[11px] text-muted">Não tem conta ou esqueceu-se da palavra-passe? Fale com o administrador.</p>
      </main>
    </div>
  );
}

export default LoginPage;
