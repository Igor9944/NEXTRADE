import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { getSessionUser, clearSession } from '../../auth/session';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { AssistantPanel, AssistantToggle } from '../../components/AssistantPanel';
import { useI18n } from '../../i18n/I18nProvider';
import { logout } from '../../services/authService';

const navigation = [
  { path: '/supplier/dashboard', key: 'supplierNavDashboard' },
  { path: '/supplier/products', key: 'supplierNavProducts' },
  { path: '/supplier/pricing', key: 'supplierNavPricing' },
  { path: '/supplier/inventory', key: 'supplierNavInventory' },
  { path: '/supplier/orders', key: 'supplierNavOrders' },
  { path: '/supplier/shipments', key: 'supplierNavShipments' },
  { path: '/supplier/documents', key: 'supplierNavDocuments' },
  { path: '/supplier/verification', key: 'supplierNavVerification' },
  { path: '/supplier/notifications', key: 'supplierNavNotifications' },
  { path: '/supplier/profile', key: 'supplierNavProfile' },
  { path: '/supplier/settings', key: 'supplierNavSettings' }
] as const;

const SupplierAppShell: React.FC = () => {
  const { t } = useI18n();
  const location = useLocation();
  const user = getSessionUser();
  const [assistantOpen, setAssistantOpen] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    clearSession();
    window.location.assign('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 rtl:text-slate-900">
      <a href="#supplier-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-white focus:px-4 focus:py-2">
        {t('skipToContent')}
      </a>
      <header className="sticky top-0 z-30 border-b bg-white px-4 py-3 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link to="/supplier/dashboard" className="text-lg font-bold text-blue-800">{t('appName')}</Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher showAssistant={false} />
            <button type="button" onClick={handleLogout} className="rounded border px-2 py-1 text-xs">{t('logout')}</button>
          </div>
        </div>
      </header>

      <div className="md:grid md:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-screen flex-col border-e bg-white px-4 py-6 md:flex">
          <Link to="/supplier/dashboard" className="mb-8 px-2 text-xl font-bold tracking-tight text-blue-800">
            {t('appName')}
          </Link>
          <nav aria-label={t('privateNavigation')} className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                {t(item.key)}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto space-y-3 border-t pt-4">
            <LanguageSwitcher showAssistant={false} />
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{user.role}</p>
              <p className="mt-1 truncate text-sm text-slate-700">{user.email}</p>
            </div>
            <button type="button" onClick={handleLogout} className="w-full rounded-lg border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
              {t('logout')}
            </button>
          </div>
        </aside>

        <main id="supplier-main" tabIndex={-1} className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <nav aria-label={t('breadcrumb')} className="mb-5 flex items-center gap-2 overflow-x-auto text-xs text-slate-500">
              <Link to="/supplier/dashboard" className="hover:text-blue-700">{t('supplierNavDashboard')}</Link>
              <span aria-hidden="true">/</span>
              <span className="whitespace-nowrap">{navigation.find((item) => item.path === location.pathname)?.key ? t(navigation.find((item) => item.path === location.pathname)!.key) : t('supplierNavDashboard')}</span>
            </nav>
            <Outlet />
          </div>
        </main>
      </div>

      <nav aria-label={t('supplierMobileNavigation')} className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-white px-2 pb-[env(safe-area-inset-bottom)] pt-2 md:hidden">
        {navigation.slice(0, 5).map((item) => (
          <NavLink key={item.path} to={item.path} className={({ isActive }) => `flex flex-col items-center gap-1 rounded px-1 py-1 text-[10px] ${isActive ? 'text-blue-700' : 'text-slate-500'}`}>
            <span aria-hidden="true">{item.path === '/supplier/dashboard' ? '⌂' : item.path === '/supplier/products' ? '▦' : item.path === '/supplier/pricing' ? '€' : item.path === '/supplier/inventory' ? '▤' : '↗'}</span>
            {t(item.key).split(' ')[0]}
          </NavLink>
        ))}
      </nav>

      <AssistantToggle open={assistantOpen} onOpenChange={setAssistantOpen} />
      <AssistantPanel open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </div>
  );
};

export default SupplierAppShell;