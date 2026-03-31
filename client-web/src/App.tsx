import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage";
import SessionPage from "./pages/SessionPage";
import VehiclePage from "./pages/VehiclePage";
import PlanPage from "./pages/PlanPage";
import CheckoutPage from "./pages/CheckoutPage";
import ClientLayout from "./components/layout/ClientLayout";
import ProfilePage from "./pages/profilePage";
import InvoicesPage from "./pages/InvoicesPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ClientLayout />}>
          <Route index element={<HomePage />} />
          <Route path="sessions" element={<SessionPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="plan" element={<PlanPage />} />
          <Route path="plan/checkout" element={<CheckoutPage />} />
          <Route path="vehicle" element={<VehiclePage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
