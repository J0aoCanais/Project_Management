import type { ReactNode } from "react";

import { useSession } from "../../hooks/useSession";
import ErrorState from "../ui/ErrorState";
import LoadingState from "../ui/LoadingState";

interface Props {
  children: ReactNode;
}

/**
 * Só mostra a aplicação depois de confirmar a sessão. Sem sessão, o pedido a /api/me
 * leva logo à página de login (e depois de entrar volta à página pedida).
 */
function AuthGate({ children }: Props) {
  const session = useSession();
  if (session.isPending) return <LoadingState message="A verificar a sessão…" />;
  if (session.isError) return <ErrorState message="Não foi possível verificar a sessão." onRetry={() => void session.refetch()} />;
  return <>{children}</>;
}

export default AuthGate;
