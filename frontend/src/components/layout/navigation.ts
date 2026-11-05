import type { IconName } from "../ui/Icon";

export interface NavItem {
  label: string;
  path: string;
  icon: IconName;
  /** Número a mostrar ao lado do item (ex.: leads por tratar). */
  badge?: number;
}

// Menu principal, pela ordem do mockup. Os 5 primeiros aparecem na barra inferior em telemóvel.
export const navItems: NavItem[] = [
  { label: "Painel", path: "/", icon: "grid" },
  { label: "Leads", path: "/leads", icon: "users" },
  { label: "Oportunidades", path: "/oportunidades", icon: "target" },
  { label: "Operações", path: "/operacoes", icon: "briefcase" },
  { label: "Obras", path: "/obras", icon: "hammer" },
  { label: "Imóveis", path: "/imoveis", icon: "home" },
  { label: "Contactos", path: "/contactos", icon: "contact" },
  { label: "Investidores", path: "/investidores", icon: "wallet" },
  { label: "Finanças", path: "/financas", icon: "chart" },
  { label: "Documentos", path: "/documentos", icon: "file" },
  { label: "Definições", path: "/definicoes", icon: "settings" },
];

export const MOBILE_NAV_COUNT = 5;

/** Item do menu correspondente a um caminho (inclui páginas de detalhe, ex.: /leads/12 → Leads). */
export function findNavItem(pathname: string): NavItem | undefined {
  if (pathname === "/") return navItems[0];
  return navItems.find((item) => item.path !== "/" && (pathname === item.path || pathname.startsWith(item.path + "/")));
}
