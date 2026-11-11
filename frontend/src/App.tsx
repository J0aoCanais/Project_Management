import type { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import { navItems } from "./components/layout/navigation";
import HealthPage from "./pages/HealthPage";
import OpportunitiesPage from "./pages/OpportunitiesPage";
import OpportunityDetailPage from "./pages/OpportunityDetailPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import LeadsPage from "./pages/LeadsPage";
import LeadDetailPage from "./pages/LeadDetailPage";
import DashboardPage from "./pages/DashboardPage";
import WorksPage from "./pages/WorksPage";
import WorkDetailPage from "./pages/WorkDetailPage";

// Páginas do menu já implementadas.
const pages: Record<string, ReactNode> = {
  "/": <DashboardPage />,
  "/leads": <LeadsPage />,
  "/oportunidades": <OpportunitiesPage />,
  "/obras": <WorksPage />,
};

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* TODO: substituir cada PlaceholderPage pela página real à medida que forem implementadas */}
        {navItems.map((item) =>
          item.path === "/" ? (
            <Route key={item.path} index element={pages[item.path]} />
          ) : (
            <Route key={item.path} path={item.path.slice(1)} element={pages[item.path] ?? <PlaceholderPage title={item.label} />} />
          ),
        )}
        <Route path="leads/:id" element={<LeadDetailPage />} />
        <Route path="oportunidades/:id" element={<OpportunityDetailPage />} />
        <Route path="obras/:id" element={<WorkDetailPage />} />
        {/* TODO: trocar pelo detalhe da operação; é para aqui que "Converter em operação" navega. */}
        <Route path="operacoes/:id" element={<PlaceholderPage title="Operação" />} />
        <Route path="health" element={<HealthPage />} />
        <Route path="*" element={<PlaceholderPage title="Página não encontrada" />} />
      </Route>
    </Routes>
  );
}

export default App;
