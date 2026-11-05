import { Route, Routes } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import { navItems } from "./components/layout/navigation";
import HealthPage from "./pages/HealthPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import LeadsPage from "./pages/LeadsPage";
import LeadDetailPage from "./pages/LeadDetailPage";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* TODO: substituir cada PlaceholderPage pela página real à medida que forem implementadas */}
        {navItems.map((item) => {
          if (item.path === "/leads") return <Route key={item.path} path="leads" element={<LeadsPage />} />;
          return item.path === "/" ? (
            <Route key={item.path} index element={<PlaceholderPage title={item.label} />} />
          ) : (
            <Route key={item.path} path={item.path.slice(1)} element={<PlaceholderPage title={item.label} />} />
          );
        })}
        <Route path="leads/:id" element={<LeadDetailPage />} />
        <Route path="health" element={<HealthPage />} />
        <Route path="*" element={<PlaceholderPage title="Página não encontrada" />} />
      </Route>
    </Routes>
  );
}

export default App;
