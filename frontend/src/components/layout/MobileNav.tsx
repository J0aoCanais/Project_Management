import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import Icon from "../ui/Icon";
import MobileMenuSheet from "./MobileMenuSheet";
import { MOBILE_NAV_COUNT, navItems } from "./navigation";

const shortLabels: Record<string, string> = { Oportunidades: "Oportun." };

const itemClass = (active: boolean) =>
  `flex w-1/6 flex-col items-center justify-center gap-1 text-[8px] ${active ? "text-brand" : "text-[#71807f]"}`;

/** Barra de navegação inferior, só em telemóvel (≤720px). */
function MobileNav() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const main = navItems.slice(0, MOBILE_NAV_COUNT);
  const rest = navItems.slice(MOBILE_NAV_COUNT);
  const restActive = rest.some((item) => pathname === item.path || pathname.startsWith(item.path + "/"));

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex h-[68px] justify-around border-t border-line bg-white pb-[env(safe-area-inset-bottom)] min-[721px]:hidden"
        aria-label="Menu principal"
      >
        {main.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.path === "/"} className={({ isActive }) => itemClass(isActive)}>
            <Icon name={item.icon} />
            <span>{shortLabels[item.label] ?? item.label}</span>
          </NavLink>
        ))}
        <button type="button" onClick={() => setOpen(true)} className={itemClass(restActive)} aria-haspopup="dialog">
          <Icon name="more" />
          <span>Mais</span>
        </button>
      </nav>
      {open && <MobileMenuSheet items={rest} onClose={() => setOpen(false)} />}
    </>
  );
}

export default MobileNav;
