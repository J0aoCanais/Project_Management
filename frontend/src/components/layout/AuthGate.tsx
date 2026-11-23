import { useSession } from "../../hooks/useSession";
import AppLayout from "./AppLayout";
import ErrorState from "../ui/ErrorState";
import LoadingState from "../ui/LoadingState";

/**
 * Rota-mãe de todas as páginas com sessão: só mostra o AppLayout depois de confirmar a sessão. Sem sessão, o pedido a /api/me
 * leva logo à página de login (e depois de entrar volta à página pedida).
 */
function AuthGate() {
  const session = useSession();
  if (session.isPending) return <LoadingState message="A verificar a sessão…" />;
  if (session.isError) return <ErrorState message="Não foi possível verificar a sessão." onRetry={() => void session.refetch()} />;
  return <AppLayout />;
}

export default AuthGate;
