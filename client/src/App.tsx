import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { CreateVideoPage } from './pages/CreateVideoPage';
import { VideoProgressPage } from './pages/VideoProgressPage';
import { VideoLibraryPage } from './pages/VideoLibraryPage';
import { ProductsPage } from './pages/ProductsPage';
import { WorkflowHistoryPage } from './pages/WorkflowHistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';

const ProtectedApp: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Checking your session…</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AuthProvider>
        <Routes>
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route element={<ProtectedApp />}>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<Navigate to="/" replace />} />
            <Route path="create" element={<CreateVideoPage />} />
            <Route path="videos" element={<VideoLibraryPage />} />
            <Route path="videos/progress/:id" element={<VideoProgressPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="workflows" element={<WorkflowHistoryPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          </Route>
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </AppProvider>
  );
}
