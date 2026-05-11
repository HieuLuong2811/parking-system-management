import { matchPath } from 'react-router-dom';

export type BreadcrumbCrumb = {
  label: string;
  path: string;
  clickable?: boolean;
  icon?: 'home';
};

type BreadcrumbRouteItem = {
  key: string;
  path?: string;
  clickable?: boolean;
};

export const routeBreadcrumbs: Record<string, BreadcrumbRouteItem[]> = {
  '/subscriptions/:subscriptionId/invoices': [
    { key: 'sideBar.parents.billing', clickable: false },
    { key: 'sideBar.children.subscriptions', path: '/subscriptions' },
    { key: 'subscriptionInvoicesPage.title', clickable: false },
  ],
  '/subscriptions': [{ key: 'sideBar.children.subscriptions', clickable: false }],
  '/parking_sessions': [{ key: 'sideBar.children.parkingSessions', clickable: false }],
  '/vehicles': [{ key: 'sideBar.children.vehicles', clickable: false }],
  '/users': [
    { key: 'sideBar.parents.userManagement', clickable: false },
    { key: 'sideBar.children.users', clickable: false },
  ],
  '/users/:userCode/user-details': [
    { key: 'sideBar.parents.userManagement', clickable: false },
    { key: 'sideBar.children.users', path: '/users' },
    { key: 'breadcrumb.userDetail', clickable: false },
  ],
  '/roles': [
    { key: 'sideBar.parents.userManagement', clickable: false },
    { key: 'sideBar.children.roles', clickable: false },
  ],
  '/terms': [{ key: 'sideBar.children.terms', clickable: false }],
  '/plans': [{ key: 'sideBar.children.plans', clickable: false }],
  '/payment_transactions': [
    { key: 'sideBar.parents.billing', clickable: false },
    { key: 'sideBar.children.paymentTransactions', clickable: false },
  ],
  '/billing_event_logs': [
    { key: 'sideBar.parents.billing', clickable: false },
    { key: 'billingEventLogsPage.title', clickable: false },
  ],
  '/notifications': [{ key: 'sideBar.children.notifications', clickable: false }],
  '/settings': [{ key: 'breadcrumb.settings', clickable: false }],
};

export const resolveBreadcrumbRoute = (pathname: string): BreadcrumbRouteItem[] => {
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
  const crumbs: BreadcrumbCrumb[] = [{ label: t('breadcrumb.home'), path: '/', icon: 'home' }];
  const items = resolveBreadcrumbRoute(pathname);

  items.forEach((item) => {
    crumbs.push({
      label: t(item.key),
      path: item.path ?? pathname,
      clickable: item.clickable ?? Boolean(item.path),
    });
  });

  return crumbs;
};
