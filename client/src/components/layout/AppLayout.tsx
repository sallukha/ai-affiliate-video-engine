import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useApp } from '../../context/AppContext';
import { AlertCircle, X, CheckCircle, Info, AlertTriangle, ArrowRight } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { dataMode, setDataMode, health, isCheckingHealth, apiBaseUrl, toasts, removeToast } = useApp();
  const [dismissBanner, setDismissBanner] = useState(false);

  const isBackendUnreachable = dataMode === 'live' && !health?.connected && !isCheckingHealth;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans antialiased text-slate-800">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* Informative Backend Health Banner (when in Live mode and server is unreachable) */}
        {isBackendUnreachable && !dismissBanner && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>
                  <strong>Backend offline:</strong> No service detected at{' '}
                  <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-[11px] text-amber-800">
                    {apiBaseUrl}
                  </code>
                  . Launch your video backend, or switch to Demo Sandbox mode to test with mock workflows.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDataMode('demo')}
                  className="inline-flex items-center gap-1 rounded bg-teal-600 px-2.5 py-1 font-medium text-white hover:bg-teal-700"
                >
                  Switch to Demo Sandbox <ArrowRight className="h-3 w-3" />
                </button>
                <button
                  onClick={() => setDismissBanner(true)}
                  className="rounded p-1 text-amber-700 hover:bg-amber-100"
                  aria-label="Dismiss banner"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let Icon = Info;
          let colorStyles = 'bg-white border-slate-200 text-slate-800';
          let iconColor = 'text-teal-600';

          if (toast.type === 'success') {
            Icon = CheckCircle;
            iconColor = 'text-emerald-600';
          } else if (toast.type === 'error') {
            Icon = AlertCircle;
            iconColor = 'text-rose-600';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            iconColor = 'text-amber-600';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2 ${colorStyles}`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${iconColor} mt-0.5`} />
              <div className="flex-1 text-xs">
                <div className="font-semibold text-slate-900">{toast.title}</div>
                {toast.message && <div className="mt-0.5 text-slate-600">{toast.message}</div>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 rounded p-1 text-slate-400 hover:text-slate-600"
                aria-label="Close notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
