import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SessionPage from "./pages/SessionPage";
import PlanPage from "./pages/PlanPage";
import ClientLayout from "./components/layout/ClientLayout";
import ProfilePage from "./pages/profilePage";
import InvoicesPage from "./pages/InvoicesPage";
import CheckoutPage from "./pages/CheckoutPage";
import { AppAuthProvider } from "./contexts/AppAuthContext";
import VehiclePage from "./pages/VehiclePage";
import UserSubscriptionsPage from "./pages/UserSubscriptionsPage";
import "./App.css";

function App() {
  return (
    <AppAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="plan/checkout" element={<CheckoutPage />} />
          <Route path="/*" element={<ClientLayout />}>
            <Route index element={<HomePage />} />
            <Route path="sessions" element={<SessionPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="plan" element={<PlanPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="profile/subscriptions" element={<UserSubscriptionsPage />} />
            <Route path="profile/vehicles" element={<VehiclePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppAuthProvider>
  );
}

export default App;
