import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  RefreshCw,
  Server,
  Sparkles,
  ExternalLink,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
  User,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { dataMode, setDataMode, health, isCheckingHealth, refreshHealth, settings, addToast } = useApp();
  const { user, logout } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Determine page title based on path
  const getPageMeta = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') {
      return { title: 'Overview Dashboard', subtitle: 'Monitor video generation pipelines, queue health, and recent runs' };
    }
    if (path.startsWith('/create')) {
      return { title: 'Create Video', subtitle: 'Transform product URLs or manual specs into automated affiliate videos' };
    }
    if (path.startsWith('/videos/progress')) {
      return { title: 'Pipeline Execution', subtitle: 'Live 5-stage progress tracking with Remotion & Gemini status' };
    }
    if (path.startsWith('/videos')) {
      return { title: 'Video Library', subtitle: 'Browse, preview, and download completed affiliate marketing videos' };
    }
    if (path.startsWith('/products')) {
      return { title: 'Products', subtitle: 'Manage affiliate catalogue, price tags, and imagery for instant generation' };
    }
    if (path.startsWith('/workflows')) {
      return { title: 'Workflow History', subtitle: 'Audit stage-by-stage pipeline logs, execution latencies, and errors' };
    }
    if (path.startsWith('/analytics')) {
      return { title: 'Analytics', subtitle: 'Pipeline metrics, rendering benchmarks, and conversion performance' };
    }
    if (path.startsWith('/settings')) {
      return { title: 'Settings', subtitle: 'API integration endpoints, video defaults, and engine configurations' };
    }
    return { title: 'AffiliateOps Studio', subtitle: 'AI Video Automation Platform' };
  };

  const pageMeta = getPageMeta();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/videos?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      {/* Left: Mobile trigger & Page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
            {pageMeta.title}
          </h1>
          <p className="hidden text-xs font-medium text-slate-500 md:block">
            {pageMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Middle: Quick Search */}
      <div className="hidden max-w-xs flex-1 px-4 lg:block">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos, products..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pr-3 pl-9 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </form>
      </div>

      {/* Right: Mode Switcher, Health, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Data Mode Switcher Segmented Control */}
        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs">
          <button
            onClick={() => setDataMode('live')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
              dataMode === 'live'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Directly connect to your backend service (VITE_API_BASE_URL)"
          >
            <Server className="h-3.5 w-3.5 text-slate-600" />
            <span className="hidden sm:inline">Live API</span>
          </button>

          <button
            onClick={() => setDataMode('demo')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
              dataMode === 'demo'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Use sandbox preview fixtures without backend dependencies"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Demo Sandbox</span>
          </button>
        </div>

        {/* Backend Connectivity Status Button */}
        <button
          onClick={refreshHealth}
          disabled={isCheckingHealth}
          className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 sm:flex"
          title={`Click to probe backend: ${settings.apiBaseUrl}`}
        >
          <RefreshCw className={`h-3 w-3 ${isCheckingHealth ? 'animate-spin text-teal-600' : 'text-slate-400'}`} />
          {health?.connected ? (
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {health.latencyMs}ms
            </span>
          ) : (
            <span className="flex items-center gap-1 text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              {isCheckingHealth ? 'Checking...' : 'Unreachable'}
            </span>
          )}
        </button>

        {/* Notifications Popover Trigger */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="View notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-teal-500" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-semibold text-slate-900">Notifications</span>
                <span className="text-[10px] text-teal-600 font-medium">2 unread</span>
              </div>
              <div className="mt-2 space-y-2 text-xs">
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <div className="flex items-center gap-1.5 font-medium text-slate-900">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                    Video Rendering Complete
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    AeroGlide Ultra Ergonomic Mouse (30s Hinglish Reel) is ready to preview.
                  </div>
                  <div className="mt-1.5 text-[10px] text-slate-400">12 minutes ago</div>
                </div>

                <div className="rounded-lg bg-amber-50/70 p-2.5">
                  <div className="flex items-center gap-1.5 font-medium text-amber-900">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    TTS Rate Limit Notice
                  </div>
                  <div className="mt-1 text-[11px] text-amber-800">
                    Job vid-8825 experienced a voiceover timeout. Manual retry available.
                  </div>
                  <div className="mt-1.5 text-[10px] text-amber-700/80">35 minutes ago</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 rounded-lg p-1 text-left hover:bg-slate-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 font-medium text-xs text-white">
              {(user?.name ?? settings.userName).split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
              <div className="border-b border-slate-100 px-3 py-2 text-xs">
                <div className="font-semibold text-slate-900">{user?.name ?? settings.userName}</div>
                <div className="truncate text-[11px] text-slate-500">{user?.email ?? settings.userEmail}</div>
              </div>

              <div className="py-1">
                <Link
                  to="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
                >
                  <Settings className="h-3.5 w-3.5 text-slate-400" />
                  API & Engine Settings
                </Link>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    addToast({
                      type: 'info',
                      title: 'Backend Integration Docs',
                      message: 'Check Settings page to view the backend endpoint contract matrix.'
                    });
                    navigate('/settings');
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
                >
                  <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                  Integration Guide
                </button>
                <button
                  onClick={async () => {
                    setShowProfileMenu(false);
                    try { await logout(); navigate('/login', { replace: true }); }
                    catch (error) { addToast({ type: 'error', title: 'Could not log out', message: error instanceof Error ? error.message : 'Please try again.' }); }
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
                >
                  <LogOut className="h-3.5 w-3.5 text-slate-400" />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
