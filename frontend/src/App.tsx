import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import ListPage from './pages/import-export/ListPage';
import CreatePage from './pages/import-export/CreatePage';
import ViewPage from './pages/import-export/ViewPage';
import LoginPage from './pages/auth/LoginPage';
import ClientTrackingPage from './pages/shipments/ClientTrackingPage';
import TransporterListPage from './pages/shipments/TransporterListPage';
import AdminListPage from './pages/shipments/AdminListPage';
import AdminCreatePage from './pages/shipments/AdminCreatePage';
import ShipmentDetailPage from './pages/shipments/ShipmentDetailPage';
import DocumentsListPage from './pages/documents/ListPage';
import DocumentDetailPage from './pages/documents/DetailPage';
import DossierPage from './pages/documents/DossierPage';
import InvoiceDetailPage from './pages/invoices/DetailPage';
import PayPage from './pages/payments/PayPage';
import CatalogPage from './pages/catalog/CatalogPage';
import ProductPage from './pages/catalog/ProductPage';
import OrdersPage from './pages/orders/OrdersPage';
import { clearSession, getSessionUser } from './auth/session';
import { useI18n } from './i18n/I18nProvider';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { AssistantPanel } from './components/AssistantPanel';
import DashboardPage from './pages/admin/DashboardPage';
import SuppliersPage from './pages/admin/SuppliersPage';
import NotificationsPage from './pages/notifications/NotificationsPage';

function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getSessionUser();
  const { t } = useI18n();
  const [assistantOpen, setAssistantOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 shrink-0 bg-white border-e p-4 space-y-4">
        <Link to="/" className="block text-lg font-bold text-gray-800">{t('appName')}</Link>
        <nav className="flex flex-col gap-2 text-sm">
          <Link to="/catalog" className="text-blue-700">{t('navCatalog')}</Link>
          {user && <Link to="/orders" className="text-blue-700">{t('navOrders')}</Link>}
          {user && <Link to="/import-export" className="text-blue-700">{t('navImportExport')}</Link>}
          {user?.role === 'ADMIN' && <Link to="/admin/dashboard" className="text-blue-700">{t('navDashboard')}</Link>}
          {user?.role === 'ADMIN' && <Link to="/admin/suppliers" className="text-blue-700">{t('navSuppliers')}</Link>}
          {user?.role === 'ADMIN' && <Link to="/shipments" className="text-blue-700">{t('navShipments')}</Link>}
          {user?.role === 'CLIENT' && <Link to="/shipments/my" className="text-blue-700">{t('navTracking')}</Link>}
          {user?.role === 'TRANSPORTEUR' && <Link to="/shipments/assigned" className="text-blue-700">{t('navTours')}</Link>}
          {user && <Link to="/documents" className="text-blue-700">{t('navDocuments')}</Link>}
          {user && <Link to="/notifications" className="text-blue-700">{t('navNotifications')}</Link>}
          {(user?.role === 'CLIENT' || user?.role === 'ADMIN') && (
            <Link to="/payments" className="text-blue-700">{t('navPayments')}</Link>
          )}
          {user && (
            <button className="text-start text-blue-700" onClick={() => setAssistantOpen(true)}>
              {t('navAssistant')}
            </button>
          )}
        </nav>
        <LanguageSwitcher />
        {user ? (
          <button
            className="text-sm text-gray-600"
            onClick={() => {
              clearSession();
              navigate('/login');
            }}
          >
            {t('logout')} ({user.role})
          </button>
        ) : (
          <Link to="/login" className="text-sm text-blue-700">{t('login')}</Link>
        )}
      </aside>
      <div className="flex-1 min-w-0">
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      </div>
      <AssistantPanel open={assistantOpen} onClose={() => setAssistantOpen(false)} />
      <span className="sr-only">{location.pathname}</span>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate replace to="/catalog" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/catalog/:id" element={<ProductPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/suppliers" element={<SuppliersPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/import-export" element={<ListPage />} />
          <Route path="/import-export/create" element={<CreatePage />} />
          <Route path="/import-export/view/:id" element={<ViewPage />} />
          <Route path="/shipments" element={<AdminListPage />} />
          <Route path="/shipments/create" element={<AdminCreatePage />} />
          <Route path="/shipments/my" element={<ClientTrackingPage />} />
          <Route path="/shipments/assigned" element={<TransporterListPage />} />
          <Route path="/shipments/:id" element={<ShipmentDetailPage />} />
          <Route path="/documents" element={<DocumentsListPage />} />
          <Route path="/documents/dossier/:orderId" element={<DossierPage />} />
          <Route path="/documents/:id" element={<DocumentDetailPage />} />
          <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
          <Route path="/payments" element={<PayPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
