import { Routes, Route, Navigate } from "react-router-dom";

import HealthPage from "./pages/HealthPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/health" replace />} />

      <Route path="/health" element={<HealthPage />} />

      <Route
        path="*"
        element={<h1>404 - Page not found</h1>}
      />
    </Routes>
  );
}

export default App;