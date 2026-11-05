import { Outlet } from "react-router-dom";

import MobileNav from "./MobileNav";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

/** Estrutura comum às páginas do CRM: sidebar, barra superior e conteúdo da rota. */
function AppLayout() {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="min-w-0 min-[721px]:ml-[200px]">
        <Topbar />
        <section className="mx-auto max-w-[1600px] px-2.5 pt-3.5 pb-[78px] min-[721px]:px-6 min-[721px]:pt-5 min-[721px]:pb-12">
          <Outlet />
        </section>
      </main>
      <MobileNav />
    </div>
  );
}

export default AppLayout;
