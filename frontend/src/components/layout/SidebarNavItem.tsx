import { NavLink } from "react-router-dom";

import Icon from "../ui/Icon";
import type { NavItem } from "./navigation";

interface Props {
  item: NavItem;
}

function SidebarNavItem({ item }: Props) {
  return (
    <NavLink
      to={item.path}
      end={item.path === "/"}
      className={({ isActive }) =>
        `relative flex items-center gap-3 rounded-control px-2.5 py-2 text-left text-xs transition-colors ${
          isActive ? "bg-sidebar-hover text-white" : "text-sidebar-text hover:bg-sidebar-hover hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <span className="absolute left-0 h-5 w-[3px] rounded bg-sidebar-accent" aria-hidden="true" />}
          <Icon name={item.icon} />
          <span>{item.label}</span>
          {item.badge !== undefined && (
            <b className="ml-auto rounded-[10px] bg-sidebar-badge px-[7px] py-px text-[10px] font-bold">{item.badge}</b>
          )}
        </>
      )}
    </NavLink>
  );
}

export default SidebarNavItem;
