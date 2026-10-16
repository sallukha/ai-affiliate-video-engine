import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Server,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Save,
  Globe,
  Clock,
  Ratio,
  Sliders,
  DollarSign,
  Bell,
  Code2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ApiEndpointStatus, VideoLanguage, VideoTone, VideoDuration, VideoAspectRatio } from '../types';

export const SettingsPage: React.FC = () => {
  const {
    apiBaseUrl,
    updateApiBaseUrl,
    health,
    isCheckingHealth,
    refreshHealth,
    settings,
    updateSettings,
    dataMode,
    setDataMode,
    addToast
  } = useApp();

  const [urlInput, setUrlInput] = useState(apiBaseUrl);
  const [formData, setFormData] = useState({
    userName: settings.userName,
    userEmail: settings.userEmail,
    defaultLanguage: settings.defaultLanguage,
    defaultDuration: settings.defaultDuration,
    defaultAspectRatio: settings.defaultAspectRatio,
    defaultTone: settings.defaultTone,
    defaultCurrency: settings.defaultCurrency,
    notificationsEnabled: settings.notificationsEnabled
  });

  const endpointsMatrix: ApiEndpointStatus[] = [
    {
      method: 'POST',
      path: '/videos',
      status: health?.connected ? 'available' : 'checking',
      required: true,
      description: 'Trigger video generation with product info and creative parameters'
    },
    {
      method: 'GET',
      path: '/videos',
      status: health?.connected ? 'available' : 'checking',
      required: true,
      description: 'Fetch list of all generated videos and current status'
    },
    {
      method: 'GET',
      path: '/videos/:id',
      status: health?.connected ? 'available' : 'checking',
      required: true,
      description: 'Get single video status and polling progress during render'
    },
    {
      method: 'POST',
      path: '/videos/:id/retry',
      status: health?.connected ? 'available' : 'missing',
      required: false,
      description: 'Restart failed video generation pipeline from last failed stage'
    },
    {
      method: 'POST',
      path: '/videos/:id/cancel',
      status: health?.connected ? 'available' : 'missing',
      required: false,
      description: 'Terminate active Remotion / FFmpeg rendering process'
    },
    {
      method: 'GET',
      path: '/products',
      status: health?.connected ? 'available' : 'checking',
      required: true,
      description: 'Fetch catalogue of saved affiliate products'
    },
    {
      method: 'POST',
      path: '/products',
      status: health?.connected ? 'available' : 'checking',
      required: true,
      description: 'Add new manual product to catalogue'
    },
    {
      method: 'POST',
      path: '/products/import',
      status: health?.connected ? 'available' : 'missing',
      required: false,
      description: 'Batch upload CSV of products into catalogue'
    },
    {
      method: 'GET',
      path: '/workflows',
      status: health?.connected ? 'available' : 'missing',
      required: false,
      description: 'Fetch stage-by-stage pipeline logs for auditing'
    },
    {
      method: 'GET',
      path: '/analytics/overview',
      status: health?.connected ? 'available' : 'missing',
      required: false,
      description: 'Retrieve aggregated throughput and latency metrics'
    }
  ];

  const handleSaveApiUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      updateApiBaseUrl(urlInput.trim());
      addToast({
        type: 'success',
        title: 'API Base URL Updated',
        message: `Set to ${urlInput.trim()}. Probing connection...`
      });
    }
  };

  const handleSaveDefaults = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Platform Settings & Integrations</h2>
        <p className="mt-1 text-xs text-slate-500">
          Configure video generation backend connectivity, pipeline defaults, and local preferences.
        </p>
      </div>

      {/* 1. Backend API Connection & Diagnostics */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 border border-teal-100">
              <Server className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Backend API Connection</h3>
              <p className="text-xs text-slate-500">Configure the API address for your video pipeline service</p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
              health?.connected ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                health?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
              }`}
            />
            {health?.connected ? `Connected (${health.latencyMs}ms)` : 'Server Unreachable'}
          </span>
        </div>

        <form onSubmit={handleSaveApiUrl} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              API Base URL (VITE_API_BASE_URL)
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="http://localhost:5000/api/v1"
                className="flex-1 rounded-lg border border-slate-300 py-2 px-3 text-xs font-mono text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700"
              >
                Save & Connect
              </button>
              <button
                type="button"
                onClick={refreshHealth}
                disabled={isCheckingHealth}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isCheckingHealth ? 'animate-spin text-teal-600' : ''}`} />
                Test Ping
              </button>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Default is <code className="font-mono text-slate-600">http://localhost:5000/api/v1</code>. Saved locally in browser storage.
            </p>
          </div>

          {health && (
            <div
              className={`rounded-xl border p-3.5 text-xs ${
                health.connected
                  ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
                  : 'border-amber-200 bg-amber-50/70 text-amber-900'
              }`}
            >
              <div className="font-semibold flex items-center gap-1.5">
                {health.connected ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-amber-600" />}
                {health.message}
              </div>
              <div className="mt-1 text-[11px] opacity-80">
                Target endpoint: {health.baseUrl}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* 2. Backend Endpoint Contract Matrix */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-teal-600" />
            <h3 className="text-sm font-semibold text-slate-900">Backend API Endpoint Contracts</h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Checklist of endpoints used by this dashboard. If an endpoint is missing from your backend, the frontend gracefully isolates it.
          </p>
        </div>

        <div className="mt-4 divide-y divide-slate-100 text-xs">
          {endpointsMatrix.map((ep, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 gap-2">
              <div className="flex items-center gap-2.5">
                <span
                  className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                    ep.method === 'GET'
                      ? 'bg-blue-50 text-blue-700'
                      : ep.method === 'POST'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {ep.method}
                </span>
                <span className="font-mono text-xs font-semibold text-slate-800">{ep.path}</span>
                {ep.required ? (
                  <span className="text-[10px] text-amber-600 font-medium">Required</span>
                ) : (
                  <span className="text-[10px] text-slate-400">Optional</span>
                )}
              </div>

              <div className="text-slate-500 text-[11px] sm:text-right max-w-sm">
                {ep.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Creative & Video Defaults */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-sm font-semibold text-slate-900">Video Generation Defaults</h3>
          <p className="text-xs text-slate-500">
            Set default values for newly created video projects. (Stored in frontend browser state).
          </p>
        </div>

        <form onSubmit={handleSaveDefaults} className="mt-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Default Language</label>
              <select
                value={formData.defaultLanguage}
                onChange={(e) => setFormData({ ...formData, defaultLanguage: e.target.value as VideoLanguage })}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-slate-900 focus:border-teal-500 focus:outline-none"
              >
                <option value="Hinglish">Hinglish</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Default Tone</label>
              <select
                value={formData.defaultTone}
                onChange={(e) => setFormData({ ...formData, defaultTone: e.target.value as VideoTone })}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-slate-900 focus:border-teal-500 focus:outline-none"
              >
                <option value="Energetic">Energetic</option>
                <option value="Promotional">Promotional</option>
                <option value="Informative">Informative</option>
                <option value="Professional">Professional</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Default Duration</label>
              <select
                value={formData.defaultDuration}
                onChange={(e) => setFormData({ ...formData, defaultDuration: Number(e.target.value) as VideoDuration })}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-slate-900 focus:border-teal-500 focus:outline-none"
              >
                <option value={15}>15 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={60}>60 seconds</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Default Aspect Ratio</label>
              <select
                value={formData.defaultAspectRatio}
                onChange={(e) => setFormData({ ...formData, defaultAspectRatio: e.target.value as VideoAspectRatio })}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-slate-900 focus:border-teal-500 focus:outline-none"
              >
                <option value="9:16">9:16 (Shorts / Reels)</option>
                <option value="16:9">16:9 (Landscape)</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 font-semibold text-white shadow-xs hover:bg-teal-700"
            >
              <Save className="h-3.5 w-3.5" /> Save Preferences
            </button>
          </div>
        </form>
      </div>

      {/* 4. User Profile & Local State Notice */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs text-xs">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-semibold text-slate-900">User Profile & Session</h3>
          <p className="text-slate-500">Active operator profile</p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Operator Name</label>
            <input
              type="text"
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              className="w-full rounded-lg border border-slate-300 py-2 px-3 text-slate-900 focus:border-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={formData.userEmail}
              onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
              className="w-full rounded-lg border border-slate-300 py-2 px-3 text-slate-900 focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-500 flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
          <span>
            <strong>Persistence Note:</strong> This frontend persists preferences and configuration in browser localStorage until you configure a dedicated backend settings endpoint.
          </span>
        </div>
      </div>
    </div>
  );
};
