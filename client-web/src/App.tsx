import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "./lib/stripe";

import HomePage from "./pages/HomePage";
import SessionPage from "./pages/SessionPage";
import PlanPage from "./pages/PlanPage";
import ClientLayout from "./components/layout/ClientLayout";
import ProfilePage from "./pages/profilePage";
import InvoicesPage from "./pages/InvoicesPage";
import CheckoutPage from "./pages/CheckoutPage";
import { AppAuthProvider } from "./contexts/AppAuthContext";
import "./App.css";

function App() {
  return (
    <AppAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="plan/checkout"
            element={
              <Elements stripe={stripePromise}>
                <CheckoutPage />
              </Elements>
            }
          />
          <Route path="/*" element={<ClientLayout />}>
            <Route index element={<HomePage />} />
            <Route path="sessions" element={<SessionPage />} />
            <Route
              path="profile"
              element={
                <Elements stripe={stripePromise}>
                  <ProfilePage />
                </Elements>
              }
            />
            <Route path="plan" element={<PlanPage />} />
            <Route
              path="invoices"
              element={
                <Elements stripe={stripePromise}>
                  <InvoicesPage />
                </Elements>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppAuthProvider>
  );
}

export default App;
