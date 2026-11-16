import type { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";

import AuthGate from "./components/layout/AuthGate";
import { navItems } from "./components/layout/navigation";
import HealthPage from "./pages/HealthPage";
import LoginPage from "./pages/LoginPage";
import OpportunitiesPage from "./pages/OpportunitiesPage";
import OpportunityDetailPage from "./pages/OpportunityDetailPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import LeadsPage from "./pages/LeadsPage";
import LeadDetailPage from "./pages/LeadDetailPage";
import DashboardPage from "./pages/DashboardPage";
import OperationsPage from "./pages/OperationsPage";
import OperationDetailPage from "./pages/OperationDetailPage";
import SettingsPage from "./pages/SettingsPage";
import ContactsPage from "./pages/ContactsPage";
import ContactDetailPage from "./pages/ContactDetailPage";
import InvestorsPage from "./pages/InvestorsPage";
import InvestorDetailPage from "./pages/InvestorDetailPage";
import DocumentsPage from "./pages/DocumentsPage";
import FinancePage from "./pages/FinancePage";
import MovementDetailPage from "./pages/MovementDetailPage";
import PropertiesPage from "./pages/PropertiesPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import WorksPage from "./pages/WorksPage";
import WorkDetailPage from "./pages/WorkDetailPage";

// Páginas do menu já implementadas.
const pages: Record<string, ReactNode> = {
  "/": <DashboardPage />,
  "/leads": <LeadsPage />,
  "/oportunidades": <OpportunitiesPage />,
  "/operacoes": <OperationsPage />,
  "/definicoes": <SettingsPage />,
  "/contactos": <ContactsPage />,
  "/investidores": <InvestorsPage />,
  "/imoveis": <PropertiesPage />,
  "/financas": <FinancePage />,
  "/documentos": <DocumentsPage />,
  "/obras": <WorksPage />,
};

function App() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route element={<AuthGate />}>
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
        <Route path="operacoes/:id" element={<OperationDetailPage />} />
        <Route path="contactos/:id" element={<ContactDetailPage />} />
        <Route path="obras/:id" element={<WorkDetailPage />} />
        <Route path="investidores/:id" element={<InvestorDetailPage />} />
        <Route path="imoveis/:id" element={<PropertyDetailPage />} />
        <Route path="financas/:id" element={<MovementDetailPage />} />
        <Route path="health" element={<HealthPage />} />
        <Route path="*" element={<PlaceholderPage title="Página não encontrada" />} />
      </Route>
    </Routes>
  );
}

export default App;
