import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import ListPage from './pages/import-export/ListPage';
import CreatePage from './pages/import-export/CreatePage';
import ViewPage from './pages/import-export/ViewPage';
import LoginPage from './pages/auth/LoginPage';
import ClientTrackingPage from './pages/shipments/ClientTrackingPage';
import TransporterListPage from './pages/shipments/TransporterListPage';
import AdminListPage from './pages/shipments/AdminListPage';
import AdminCreatePage from './pages/shipments/AdminCreatePage';
import ShipmentDetailPage from './pages/shipments/ShipmentDetailPage';
import { clearSession, getSessionUser } from './auth/session';

function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const user = getSessionUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Link to="/" className="text-xl font-bold text-gray-800">NexTrade</Link>
          <nav className="flex flex-wrap gap-3 text-sm">
            <Link to="/import-export" className="text-blue-700">Import/Export</Link>
            {user?.role === 'ADMIN' && <Link to="/shipments" className="text-blue-700">Expéditions</Link>}
            {user?.role === 'CLIENT' && <Link to="/shipments/my" className="text-blue-700">Suivi</Link>}
            {user?.role === 'TRANSPORTEUR' && <Link to="/shipments/assigned" className="text-blue-700">Mes tournées</Link>}
            {user ? (
              <button
                className="text-gray-600"
                onClick={() => {
                  clearSession();
                  navigate('/login');
                }}
              >
                Déconnexion ({user.role})
              </button>
            ) : (
              <Link to="/login" className="text-blue-700">Connexion</Link>
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

function App() {
  const [apiStatus] = useState<'connected' | 'disconnected' | 'checking'>('connected');

  return (
    <BrowserRouter>
      <Layout>
        <p className="sr-only">API {apiStatus}</p>
        <Routes>
          <Route path="/" element={<Navigate replace to="/import-export" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/import-export" element={<ListPage />} />
          <Route path="/import-export/create" element={<CreatePage />} />
          <Route path="/import-export/view/:id" element={<ViewPage />} />
          <Route path="/shipments" element={<AdminListPage />} />
          <Route path="/shipments/create" element={<AdminCreatePage />} />
          <Route path="/shipments/my" element={<ClientTrackingPage />} />
          <Route path="/shipments/assigned" element={<TransporterListPage />} />
          <Route path="/shipments/:id" element={<ShipmentDetailPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
