import { matchPath } from 'react-router-dom';

export const routeBreadcrumbs: Record<string, string[]> = {
  '/subscriptions/:subscriptionId/invoices': [
    'subscriptionsPage.title',
    'subscriptionInvoicesPage.title',
  ],
  '/subscriptions': ['subscriptionsPage.title'],
  '/parking_sessions': ['parkingSessionsPage.title'],
  '/vehicles': ['vehiclesPage.title'],
  '/users': ['usersPage.title'],
  '/users/:userCode/user-details': ['usersPage.title'],
  '/roles': ['rolesPage.title'],
  '/terms': ['termsPage.title'],
  '/plans': ['plansPage.title'],
  '/payment_transactions': ['resources.tables.paymentTransactions'],
  '/billing_event_logs': ['billingEventLogsPage.title'],
  '/notifications': ['notificationsPage.title'],
  '/settings': ['breadcrumb.settings'],
};

export const resolveBreadcrumbKeys = (pathname: string): string[] => {
  for (const route in routeBreadcrumbs) {
    const match = matchPath({ path: route, end: true }, pathname);
    if (match) return routeBreadcrumbs[route];
  }
  return [];
};

export const buildBreadcrumbs = (
  pathname: string,
  t: (key: string) => string
) => {
  const crumbs = [{ label: t('breadcrumb.home'), path: '/' }];
  const keys = resolveBreadcrumbKeys(pathname);

  keys.forEach((key) => {
    crumbs.push({
      label: t(key),
      path: pathname,
    });
  });

  return crumbs;
};
