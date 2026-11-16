import Brand from "../layout/Brand";
import Icon, { type IconName } from "../ui/Icon";

const highlights: { icon: IconName; title: string; text: string }[] = [
  { icon: "target", title: "Oportunidades", text: "Da primeira visita à análise financeira e ao CPCV." },
  { icon: "hammer", title: "Operações e obras", text: "Orçamentos, desvios e fotografias de cada obra." },
  { icon: "chart", title: "Finanças e investidores", text: "Previsto vs. realizado e capital de cada investidor." },
];

/** Painel escuro à esquerda do login, com as cores da barra lateral. Escondido em telemóvel. */
function LoginShowcase() {
  return (
    <aside className="hidden flex-col justify-between bg-sidebar p-10 text-sidebar-text min-[901px]:flex">
      <Brand />
      <div className="max-w-[380px]">
        <h2 className="text-[28px] leading-tight font-bold tracking-[-0.5px] text-white">Investimento imobiliário, do primeiro contacto à venda.</h2>
        <ul className="mt-8 grid gap-5">
          {highlights.map((item) => (
            <li key={item.title} className="flex gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-panel bg-sidebar-hover text-sidebar-accent">
                <Icon name={item.icon} size={18} />
              </span>
              <span>
                <strong className="block text-xs text-white">{item.title}</strong>
                <span className="text-xs leading-relaxed">{item.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <small className="text-[11px] text-sidebar-muted">© {new Date().getFullYear()} ImoVentures</small>
    </aside>
  );
}

export default LoginShowcase;
