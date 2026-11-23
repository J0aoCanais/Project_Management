export class ApiError extends Error {
  status: number;
  /** Erros por campo devolvidos pelo servidor, ex.: `{ email: ["Not a valid email address."] }`. */
  fields: Record<string, string[]>;
  constructor(status: number, message: string, fields: Record<string, string[]> = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

let devCsrfToken: string | null = null;

// O Flask põe o token CSRF num <meta> nas páginas que servem o React. Com o Vite (dev)
// não há <meta>: pede-se o token a /csrf-token, que o proxy do Vite reencaminha para o Flask.
async function csrfToken(): Promise<string> {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
  if (meta) return meta;
  if (devCsrfToken === null) {
    const res = await fetch("/csrf-token", { credentials: "same-origin", headers: { Accept: "application/json" } });
    devCsrfToken = res.ok ? ((await res.json()) as { csrf_token: string }).csrf_token : "";
  }
  return devCsrfToken;
}

function goToLogin(): never {
  // Já na página de login não há para onde ir (e não se volta para ela depois de entrar).
  if (window.location.pathname !== "/login") {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.assign(`/login?next=${next}`);
  }
  throw new ApiError(401, "Not authenticated");
}

/** Mensagem de um erro do Flask: `{ error: { message } }` ou `{ errors: { campo: ["…"] } }`. */
function errorMessage(body: unknown, fallback: string): { message: string; fields: Record<string, string[]> } {
  const data = (body ?? {}) as { error?: { message?: string }; errors?: Record<string, string[] | string> };
  const fields: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(data.errors ?? {})) fields[key] = Array.isArray(value) ? value.map(String) : [String(value)];
  const first = Object.values(fields)[0]?.[0];
  return { message: data.error?.message ?? first ?? fallback, fields };
}

/** Pequeno invólucro de fetch para /api: cookies da sessão, CSRF e erros em JSON. */
interface ApiFetchOptions {
  /** Com `false`, um 401 é devolvido como erro em vez de levar à página de login (ex.: o próprio login). */
  loginRedirect?: boolean;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}, { loginRedirect = true }: ApiFetchOptions = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (method !== "GET" && method !== "HEAD") {
    headers.set("X-CSRFToken", await csrfToken());
  }

  const res = await fetch(`/api${path}`, {
    ...init,
    method,
    headers,
    credentials: "same-origin",
  });

  // Sem sessão o Flask-Login redireciona para /login (o fetch segue o redirect e recebe HTML).
  const toLogin = res.status === 401 || (res.redirected && new URL(res.url).pathname === "/login");
  if (toLogin && (loginRedirect || res.redirected)) goToLogin();
  if (res.status === 204) return undefined as T;
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    // Um 400 sem JSON é normalmente o token CSRF expirado: pede-se outro no próximo pedido.
    if (res.status === 400 && body === null) devCsrfToken = null;
    const { message, fields } = errorMessage(body, res.statusText);
    throw new ApiError(res.status, message, fields);
  }
  return (await res.json()) as T;
}
