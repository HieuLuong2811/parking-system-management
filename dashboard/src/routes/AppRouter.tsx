import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { RequireAdmin } from '../components/auth/RequireAdmin';
import { Layout } from '../components/layout/Layout';
import { AccessDeniedPage } from '../pages/accessDeniedPage';
import { UsersPage } from '../pages/usersPage';
import { SettingsPage } from '../pages/SettingsPage';
import { NotFoundPage } from '../pages/notFoundPage';
import { InvoicesPage } from '../pages/invoicesPage';
import { RolesPage } from '../pages/rolesPage';
import { TermsPage } from '../pages/termsPage';
import { SubscriptionPlansPage } from '../pages/subscriptionPlansPage';
import { SubscriptionsPage } from '../pages/subscriptionsPage';
import { ParkingSessionsPage } from '../pages/parkingSessionsPage';
import { ParkingAccessCardsPage } from '../pages/parkingAccessCardsPage';
import { PaymentTransactionsPage } from '../pages/paymentTransactionsPage';
import { SubscriptionInvoicesPage } from '../pages/subscriptionInvoicesPage';
import { NotificationsPage } from '../pages/notificationsPage';
import { UserProfilePage } from '../pages/userProfilePage';
import { PaymentPlansPage } from '../pages/paymentPlansPage';
import { MyProfilePage } from '../pages/myProfilePage';
import { useAuth } from '../contexts/useAuth';
import { Navigate } from 'react-router-dom';
import React from 'react';

const RoleHome: React.FC = () => {
  const { user } = useAuth();
  const roles = (user?.roles || []).map((r) => String(r || '').trim().toUpperCase());
  if (roles.includes('SECURITY') && !roles.includes('ADMIN')) {
    return <Navigate to="/parking_sessions" replace />;
  }
  return <HomePage />;
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/access-denied" element={<AccessDeniedPage />} />
        <Route element={<RequireAdmin />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<RoleHome />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="/users/:userCode/user-details" element={<UserProfilePage />} />
            <Route path="invoices/overview" element={<InvoicesPage />} />
            <Route path="parking_sessions" element={<ParkingSessionsPage />} />
            <Route path="parking_access_cards" element={<ParkingAccessCardsPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="plans" element={<SubscriptionPlansPage />} />
            <Route path="payment_plans" element={<PaymentPlansPage />} />
            <Route path="subscriptions" element={<SubscriptionsPage />} />
            <Route path="subscriptions/:subscriptionId/invoices" element={<SubscriptionInvoicesPage />} />
            <Route path="payment_transactions" element={<PaymentTransactionsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<MyProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
