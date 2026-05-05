import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InstrumentsPage from './pages/InstrumentsPage';
import InstrumentDetailPage from './pages/InstrumentDetailPage';
import ReportsPage from './pages/ReportsPage';
import CalibrationsPage from './pages/CalibrationsPage';
import AssetsPage from './pages/AssetsPage';

// Componente que protege as rotas internas
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8">Carregando...</div>;
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            {/* Redireciona a raiz para o dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/instruments" element={<InstrumentsPage />} />
            <Route path="/calibrations" element={<CalibrationsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/instruments/:id" element={<InstrumentDetailPage />} />
            
            {/* Captura qualquer outra rota não mapeada dentro da área protegida */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}