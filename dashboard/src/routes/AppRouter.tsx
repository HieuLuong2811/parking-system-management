import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { RequireAdmin } from '../components/auth/RequireAdmin';
import { Layout } from '../components/layout/layout';
import { AccessDeniedPage } from '../pages/accessDeniedPage';
import { UsersPage } from '../pages/usersPage';
import { SettingsPage } from '../pages/settingsPage';
import { NotFoundPage } from '../pages/notFoundPage';
import { InvoicesPage } from '../pages/invoicesPage';
import { VehiclesPage } from '../pages/vehiclesPage';
import { RolesPage } from '../pages/rolesPage';
import { TermsPage } from '../pages/termsPage';
import { SubscriptionPlansPage } from '../pages/subscriptionPlansPage';
import { SubscriptionsPage } from '../pages/subscriptionsPage';
import { ParkingSessionsPage } from '../pages/parkingSessionsPage';
import { PaymentTransactionsPage } from '../pages/paymentTransactionsPage';
import { BillingEventLogsPage } from '../pages/billingEventLogsPage';
import { SubscriptionInvoicesPage } from '../pages/subscriptionInvoicesPage';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/access-denied" element={<AccessDeniedPage />} />
        <Route element={<RequireAdmin />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="invoices/overview" element={<InvoicesPage />} />
            <Route path="parking_sessions" element={<ParkingSessionsPage />} />
            <Route path="vehicles" element={<VehiclesPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="plans" element={<SubscriptionPlansPage />} />
            <Route path="subscriptions" element={<SubscriptionsPage />} />
            <Route path="subscriptions/:subscriptionId/invoices" element={<SubscriptionInvoicesPage />} />
            <Route path="payment_transactions" element={<PaymentTransactionsPage />} />
            <Route path="billing_event_logs" element={<BillingEventLogsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
