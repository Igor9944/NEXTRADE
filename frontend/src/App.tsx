import React from 'react';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation
} from 'react-router-dom';
import ListPage from './pages/import-export/ListPage';
import CreatePage from './pages/import-export/CreatePage';
import ViewPage from './pages/import-export/ViewPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
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
import { getSessionUser, UserRole } from './auth/session';
const DashboardPage = React.lazy(() => import('./pages/admin/DashboardPage'));
import SuppliersPage from './pages/admin/SuppliersPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import { LandingPage, PublicLayout } from './pages/public/PublicPages';
import SupplierAppShell from './pages/supplier/SupplierAppShell';
import SupplierDashboardPage from './pages/supplier/SupplierDashboardPage';
import SupplierDocumentsPage from './pages/supplier/SupplierDocumentsPage';
import SupplierNotificationsPage from './pages/supplier/SupplierNotificationsPage';
import SupplierPlaceholderPage from './pages/supplier/SupplierPlaceholderPage';
import SupplierProfilePage from './pages/supplier/SupplierProfilePage';
import SupplierProductsPage from './pages/supplier/SupplierProductsPage';
import SupplierOrdersPage from './pages/supplier/SupplierOrdersPage';
import { AuthenticatedLayout } from './components/layout/AuthenticatedLayout';

type NavigationItem = { path: string; label: string };

const roleHome = (role: UserRole): string => {
  if (role === 'ADMIN') return '/admin/dashboard';
  if (role === 'TRANSPORTEUR') return '/shipments/assigned';
  if (role === 'FOURNISSEUR') return '/supplier/dashboard';
  return '/catalog';
};

function roleCanVisitPath(role: UserRole, path: string): boolean {
  // eslint-disable-next-line no-param-reassign
  path = path.length > 1 ? path.replace(/\/+$/, '') : path;
  if (path.startsWith('/supplier/')) return role === 'FOURNISSEUR';
  if (path.startsWith('/admin/')) return role === 'ADMIN';
  if (path === '/shipments' || path === '/shipments/create') return role === 'ADMIN';
  if (path === '/shipments/assigned') return role === 'TRANSPORTEUR';
  if (path === '/shipments/my') return role === 'CLIENT' || role === 'COMMERCANT';
  if (/^\/shipments\/[^/]+$/.test(path)) {
    return ['ADMIN', 'TRANSPORTEUR', 'CLIENT', 'COMMERCANT'].includes(role);
  }
  if (path === '/payments') return role === 'CLIENT' || role === 'ADMIN';
  if (path === '/orders') return ['CLIENT', 'COMMERCANT', 'ADMIN'].includes(role);
  if (path === '/notifications') return ['ADMIN', 'CLIENT', 'FOURNISSEUR', 'COMMERCANT', 'TRANSPORTEUR'].includes(role);
  if (path === '/documents' || path.startsWith('/documents/') || path.startsWith('/invoices/')) {
    return ['ADMIN', 'CLIENT', 'FOURNISSEUR', 'COMMERCANT', 'TRANSPORTEUR'].includes(role);
  }
  if (path.startsWith('/import-export')) {
    return ['ADMIN', 'CLIENT', 'FOURNISSEUR', 'COMMERCANT'].includes(role);
  }
  if (path.startsWith('/catalog')) {
    return ['CLIENT', 'COMMERCANT', 'FOURNISSEUR', 'ADMIN'].includes(role);
  }
  return false;
}

function PublicEntry() {
  const user = getSessionUser();
  return user
    ? <Navigate to={roleHome(user.role)} replace />
    : <PublicLayout><LandingPage /></PublicLayout>;
}

function PublicLogin() {
  const user = getSessionUser();
  return user
    ? <Navigate to={roleHome(user.role)} replace />
    : (
      <PublicLayout showSignIn={false}>
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <LoginPage />
        </div>
      </PublicLayout>
    );
}

function PublicRegister() {
  const user = getSessionUser();
  return user
    ? <Navigate to={roleHome(user.role)} replace />
    : (
      <PublicLayout showSignIn={false}>
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <RegisterPage />
        </div>
      </PublicLayout>
    );
}

function AssistantEntry() {
  const location = useLocation();
  const user = getSessionUser();
  return user
    ? <Navigate to={roleHome(user.role)} replace state={{ openAssistant: true }} />
    : <Navigate to="/login" replace state={{ from: location }} />;
}

function RequireAuth() {
  const location = useLocation();
  const user = getSessionUser();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (!roleCanVisitPath(user.role, location.pathname)) {
    return <Navigate to={roleHome(user.role)} replace />;
  }
  return <Outlet />;
}



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicEntry />} />
        <Route path="/login" element={<PublicLogin />} />
        <Route path="/register" element={<PublicRegister />} />
        <Route path="/assistant" element={<AssistantEntry />} />
        <Route path="/ai" element={<AssistantEntry />} />
        <Route path="/chat" element={<AssistantEntry />} />
        <Route element={<RequireAuth />}>
          <Route element={<SupplierAppShell />}>
            <Route path="/supplier/dashboard" element={<SupplierDashboardPage />} />
            <Route path="/supplier/products" element={<SupplierProductsPage />} />
            <Route path="/supplier/orders" element={<SupplierOrdersPage />} />
            <Route path="/supplier/pricing" element={<SupplierPlaceholderPage titleKey="supplierNavPricing" descriptionKey="supplierPricingDescription" />} />
            <Route path="/supplier/inventory" element={<SupplierPlaceholderPage titleKey="supplierNavInventory" descriptionKey="supplierInventoryDescription" />} />
            <Route path="/supplier/shipments" element={<SupplierPlaceholderPage titleKey="supplierNavShipments" descriptionKey="supplierShipmentsDescription" />} />
            <Route path="/supplier/documents" element={<SupplierDocumentsPage />} />
            <Route path="/supplier/verification" element={<SupplierPlaceholderPage titleKey="supplierNavVerification" descriptionKey="supplierVerificationDescription" />} />
            <Route path="/supplier/notifications" element={<SupplierNotificationsPage />} />
            <Route path="/supplier/profile" element={<SupplierProfilePage />} />
            <Route path="/supplier/settings" element={<SupplierPlaceholderPage titleKey="supplierNavSettings" descriptionKey="supplierSettingsDescription" />} />
          </Route>
          <Route element={<AuthenticatedLayout />}>{/* routes authentifiées */}
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/catalog/:id" element={<ProductPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route
              path="/admin/dashboard"
              element={(
                <React.Suspense fallback={<div className="sr-only" role="status">Chargement du tableau de bord…</div>}>
                  <DashboardPage />
                </React.Suspense>
              )}
            />
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
            <Route path="*" element={<Navigate to={roleHome(getSessionUser()?.role ?? 'CLIENT')} replace />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;