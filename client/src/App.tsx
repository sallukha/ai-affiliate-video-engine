import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
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
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
