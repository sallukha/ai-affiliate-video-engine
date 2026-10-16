import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Video,
  Film,
  ShoppingBag,
  GitCommit,
  BarChart3,
  Settings,
  Sparkles,
  Server,
  Radio,
  ChevronRight,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { dataMode, health, apiBaseUrl } = useApp();

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/create', label: 'Create Video', icon: Video, badge: 'New' },
    { to: '/videos', label: 'Video Library', icon: Film },
    { to: '/products', label: 'Products', icon: ShoppingBag },
    { to: '/workflows', label: 'Workflow History', icon: GitCommit },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col bg-[#0b132b] text-slate-200 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold tracking-tight text-white text-base">AffiliateOps</span>
                <span className="text-[10px] font-semibold tracking-wider text-teal-400 uppercase">Studio</span>
              </div>
              <div className="text-[11px] text-slate-400">AI Video Engine</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close Sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-500/15 text-teal-400 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-4.5 w-4.5 transition-colors ${
                          isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="rounded bg-teal-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-teal-300">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Backend Pipeline Engine Status Footer */}
        <div className="border-t border-slate-800/80 p-3">
          <div className="rounded-lg bg-slate-900/90 p-3 text-xs">
            <div className="flex items-center justify-between pb-1.5">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Server className="h-3.5 w-3.5 text-slate-400" />
                Pipeline Engine
              </span>
              <span className="flex items-center gap-1 text-[11px]">
                <span
                  className={`h-2 w-2 rounded-full ${
                    dataMode === 'live'
                      ? health?.connected
                        ? 'bg-emerald-400 animate-pulse'
                        : 'bg-amber-400'
                      : 'bg-teal-400'
                  }`}
                />
                <span
                  className={
                    dataMode === 'live'
                      ? health?.connected
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                      : 'text-teal-400'
                  }
                >
                  {dataMode === 'live'
                    ? health?.connected
                      ? 'Live'
                      : 'Offline'
                    : 'Sandbox'}
                </span>
              </span>
            </div>

            <div className="truncate text-[11px] text-slate-400" title={apiBaseUrl}>
              {dataMode === 'live' ? apiBaseUrl.replace('http://', '') : 'Interactive Demo Mode'}
            </div>

            <div className="mt-2.5 flex items-center justify-between border-t border-slate-800 pt-2 text-[11px] text-slate-400">
              <span>Remotion + Gemini</span>
              <NavLink
                to="/settings"
                className="flex items-center gap-0.5 text-teal-400 hover:text-teal-300"
              >
                Configure <ChevronRight className="h-3 w-3" />
              </NavLink>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
