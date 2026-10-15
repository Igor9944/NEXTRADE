import React, { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getSessionUser, clearSession } from '../../auth/session';
import { logout } from '../../services/authService';
import { AssistantPanel, AssistantToggle } from '../../components/AssistantPanel';
import { AppSidebar, NavItem } from '../../components/layout/AppSidebar';
import { AppHeader } from '../../components/layout/AppHeader';
import { MobileDrawer } from '../../components/layout/MobileDrawer';
import { useI18n } from '../../i18n/I18nProvider';
import {
  IconDashboard,
  IconCatalog,
  IconOrders,
  IconShipment,
  IconDocument,
  IconNotification,
  IconUser,
  IconSettings,
  IconVerification,
  IconPricing,
  IconInventory,
} from '../../components/icons';

const SupplierAppShell: React.FC = () => {
  const { t } = useI18n();
  const location = useLocation();
  const user = getSessionUser();
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  const navigation: NavItem[] = [
    { path: '/supplier/dashboard',      label: t('supplierNavDashboard'),      icon: <IconDashboard className="h-5 w-5" /> },
    { path: '/supplier/products',       label: t('supplierNavProducts'),       icon: <IconCatalog className="h-5 w-5" /> },
    { path: '/supplier/pricing',        label: t('supplierNavPricing'),        icon: <IconPricing className="h-5 w-5" /> },
    { path: '/supplier/inventory',      label: t('supplierNavInventory'),      icon: <IconInventory className="h-5 w-5" /> },
    { path: '/supplier/orders',         label: t('supplierNavOrders'),         icon: <IconOrders className="h-5 w-5" /> },
    { path: '/supplier/shipments',      label: t('supplierNavShipments'),      icon: <IconShipment className="h-5 w-5" /> },
    { path: '/supplier/documents',      label: t('supplierNavDocuments'),      icon: <IconDocument className="h-5 w-5" /> },
    { path: '/supplier/verification',   label: t('supplierNavVerification'),   icon: <IconVerification className="h-5 w-5" /> },
    { path: '/supplier/notifications',  label: t('supplierNavNotifications'),  icon: <IconNotification className="h-5 w-5" /> },
    { path: '/supplier/profile',        label: t('supplierNavProfile'),        icon: <IconUser className="h-5 w-5" /> },
    { path: '/supplier/settings',       label: t('supplierNavSettings'),       icon: <IconSettings className="h-5 w-5" /> },
  ];

  const handleLogout = async () => {
    await logout();
    clearSession();
    window.location.assign('/login');
  };

  // Breadcrumbs simples
  const breadcrumbs = (() => {
    const found = navigation.find((n) => n.path === location.pathname);
    if (!found) return [{ label: t('supplierNavDashboard'), href: '/supplier/dashboard' }];
    return [
      { label: t('supplierNavDashboard'), href: '/supplier/dashboard' },
      { label: found.label },
    ];
  })();

  return (
    <div className="flex min-h-screen bg-nextrade-soft">
      {/* Skip link */}
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-panel"
        href="#supplier-main"
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
          logoLink="/supplier/dashboard"
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
        logoLink="/supplier/dashboard"
      />

      {/* Contenu */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          userEmail={user.email}
          userRole={user.role}
          onMenuOpen={() => setMobileOpen(true)}
          onLogout={handleLogout}
          breadcrumbs={breadcrumbs}
        />

        <main
          id="supplier-main"
          tabIndex={-1}
          className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>

      <AssistantToggle open={assistantOpen} onOpenChange={setAssistantOpen} />
      <AssistantPanel open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </div>
  );
};

export default SupplierAppShell;
