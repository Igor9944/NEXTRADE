import React, { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getSessionUser, UserRole } from '../../auth/session';
import { logout } from '../../services/authService';
import { AppSidebar, NavItem } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { MobileDrawer } from './MobileDrawer';
import { AssistantPanel, AssistantToggle } from '../AssistantPanel';
import { useI18n } from '../../i18n/I18nProvider';
import {
  IconDashboard,
  IconCatalog,
  IconOrders,
  IconShipment,
  IconDocument,
  IconPayment,
  IconNotification,
  IconImportExport,
  IconSupplier,
} from '../icons';

function roleHome(role: UserRole): string {
  if (role === 'ADMIN') return '/admin/dashboard';
  if (role === 'TRANSPORTEUR') return '/shipments/assigned';
  if (role === 'FOURNISSEUR') return '/supplier/dashboard';
  return '/catalog';
}

function buildNavigation(role: UserRole, t: (k: string) => string): NavItem[] {
  const all: Record<string, NavItem> = {
    dashboard: {
      path: '/admin/dashboard',
      label: t('navDashboard'),
      icon: <IconDashboard className="h-5 w-5" />,
    },
    suppliers: {
      path: '/admin/suppliers',
      label: t('navSuppliers'),
      icon: <IconSupplier className="h-5 w-5" />,
    },
    catalog: {
      path: '/catalog',
      label: t('navCatalog'),
      icon: <IconCatalog className="h-5 w-5" />,
    },
    orders: {
      path: '/orders',
      label: t('navOrders'),
      icon: <IconOrders className="h-5 w-5" />,
    },
    shipments: {
      path: '/shipments',
      label: t('navShipments'),
      icon: <IconShipment className="h-5 w-5" />,
    },
    myShipments: {
      path: '/shipments/my',
      label: t('navTracking'),
      icon: <IconShipment className="h-5 w-5" />,
    },
    assignedShipments: {
      path: '/shipments/assigned',
      label: t('navTours'),
      icon: <IconShipment className="h-5 w-5" />,
    },
    importExport: {
      path: '/import-export',
      label: t('navImportExport'),
      icon: <IconImportExport className="h-5 w-5" />,
    },
    documents: {
      path: '/documents',
      label: t('navDocuments'),
      icon: <IconDocument className="h-5 w-5" />,
    },
    payments: {
      path: '/payments',
      label: t('navPayments'),
      icon: <IconPayment className="h-5 w-5" />,
    },
    notifications: {
      path: '/notifications',
      label: t('navNotifications'),
      icon: <IconNotification className="h-5 w-5" />,
    },
  };

  const byRole: Record<UserRole, (keyof typeof all)[]> = {
    ADMIN: [
      'dashboard', 'suppliers', 'shipments', 'catalog', 'orders',
      'importExport', 'documents', 'payments', 'notifications',
    ],
    CLIENT: [
      'catalog', 'orders', 'importExport', 'myShipments',
      'documents', 'payments', 'notifications',
    ],
    FOURNISSEUR: ['catalog', 'importExport', 'documents', 'notifications'],
    COMMERCANT: [
      'catalog', 'orders', 'myShipments', 'importExport',
      'documents', 'payments', 'notifications',
    ],
    TRANSPORTEUR: ['assignedShipments', 'documents', 'notifications'],
  };

  return (byRole[role] ?? []).map((key) => all[key]).filter(Boolean);
}

/** Breadcrumbs simples calculés depuis la route */
function useBreadcrumbs(t: (k: string) => string): { label: string; href?: string }[] {
  const location = useLocation();
  const parts = location.pathname.split('/').filter(Boolean);
  if (parts.length === 0) return [];

  const labelMap: Record<string, string> = {
    admin: 'Admin',
    dashboard: t('navDashboard'),
    suppliers: t('navSuppliers'),
    catalog: t('navCatalog'),
    orders: t('navOrders'),
    shipments: t('navShipments'),
    documents: t('navDocuments'),
    invoices: t('navDocuments'),
    payments: t('navPayments'),
    notifications: t('navNotifications'),
    'import-export': t('navImportExport'),
    create: 'Créer',
    view: 'Détail',
    dossier: 'Dossier',
    assigned: t('navTours'),
    my: t('navTracking'),
  };

  return parts.map((part, index) => {
    const label = labelMap[part] ?? part;
    const href = '/' + parts.slice(0, index + 1).join('/');
    const isLast = index === parts.length - 1;
    // Masquer les UUID dans les breadcrumbs
    const isUUID = /^[0-9a-f-]{8,}$/.test(part);
    return {
      label: isUUID ? '…' : label,
      href: isLast || isUUID ? undefined : href,
    };
  });
}

export const AuthenticatedLayout: React.FC = () => {
  const { t } = useI18n();
  const location = useLocation();
  const user = getSessionUser();
  const [assistantOpen, setAssistantOpen] = useState(
    () => (location.state as { openAssistant?: boolean } | null)?.openAssistant === true
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const breadcrumbs = useBreadcrumbs(t);

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const navigation = buildNavigation(user.role, t);

  const handleLogout = async () => {
    await logout();
    window.location.assign('/login');
  };

  return (
    <div className="flex min-h-screen bg-nextrade-soft">
      {/* Skip link */}
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-panel"
        href="#main-content"
      >
        {t('skipToContent')}
      </a>

      {/* Sidebar desktop */}
      <div className="hidden md:flex md:shrink-0">
        <AppSidebar
          navigation={navigation}
          userEmail={user.email}
          userRole={user.role}
          onLogout={handleLogout}
          onAssistantOpen={() => setAssistantOpen(true)}
          assistantOpen={assistantOpen}
          logoLink={roleHome(user.role)}
        />
      </div>

      {/* Drawer mobile */}
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navigation={navigation}
        userEmail={user.email}
        userRole={user.role}
        onLogout={handleLogout}
        onAssistantOpen={() => setAssistantOpen(true)}
        logoLink={roleHome(user.role)}
      />

      {/* Zone principale */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          userEmail={user.email}
          userRole={user.role}
          onMenuOpen={() => setMobileOpen(true)}
          onLogout={handleLogout}
          breadcrumbs={breadcrumbs}
        />

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Assistant IA */}
      <AssistantToggle open={assistantOpen} onOpenChange={setAssistantOpen} />
      <AssistantPanel open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </div>
  );
};
