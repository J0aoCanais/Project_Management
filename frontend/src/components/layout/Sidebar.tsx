import Brand from "./Brand";
import { navItems } from "./navigation";
import SidebarNavItem from "./SidebarNavItem";
import SidebarUser from "./SidebarUser";

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[200px] flex-col bg-sidebar px-2.5 pt-[22px] pb-3.5 text-[#d8e6e5] min-[721px]:flex">
      <Brand />
      <nav className="flex flex-col gap-[3px]" aria-label="Menu principal">
        {navItems.map((item) => (
          <SidebarNavItem key={item.path} item={item} />
        ))}
      </nav>
      <SidebarUser />
    </aside>
  );
}

export default Sidebar;
