import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AppSettings, HealthCheckResult, ProductItem } from '../types';
import {
  getApiBaseUrl,
  setApiBaseUrl as saveApiBaseUrl,
  getDataMode,
  setDataMode as saveLocalDataMode,
  checkBackendHealth,
  AppDataMode
} from '../services/api';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface AppContextType {
  dataMode: AppDataMode;
  setDataMode: (mode: AppDataMode) => void;
  apiBaseUrl: string;
  updateApiBaseUrl: (url: string) => void;
  health: HealthCheckResult | null;
  isCheckingHealth: boolean;
  refreshHealth: () => Promise<void>;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  selectedProductForVideo: ProductItem | null;
  setSelectedProductForVideo: (product: ProductItem | null) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  apiBaseUrl: getApiBaseUrl(),
  userEmail: 'sallukhan54154@gmail.com',
  userName: 'Sallu Khan',
  defaultLanguage: 'Hinglish',
  defaultDuration: 30,
  defaultAspectRatio: '9:16',
  defaultTone: 'Energetic',
  defaultCurrency: 'INR',
  notificationsEnabled: true
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dataMode, setDataModeState] = useState<AppDataMode>(getDataMode());
  const [apiBaseUrl, setApiBaseUrlState] = useState<string>(getApiBaseUrl());
  const [health, setHealth] = useState<HealthCheckResult | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedProductForVideo, setSelectedProductForVideo] = useState<ProductItem | null>(null);

  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('affiliateops_settings');
      if (saved) {
        try {
          return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
        } catch {
          // Ignore parse errors
        }
      }
    }
    return DEFAULT_SETTINGS;
  });

  const refreshHealth = useCallback(async () => {
    setIsCheckingHealth(true);
    try {
      const res = await checkBackendHealth();
      setHealth(res);
    } catch {
      setHealth({
        connected: false,
        message: 'Could not connect to backend server',
        baseUrl: apiBaseUrl
      });
    } finally {
      setIsCheckingHealth(false);
    }
  }, [apiBaseUrl]);

  // Initial health check on mount
  useEffect(() => {
    refreshHealth();
  }, [refreshHealth]);

  const handleSetDataMode = (mode: AppDataMode) => {
    saveLocalDataMode(mode);
    setDataModeState(mode);
    addToast({
      type: 'info',
      title: mode === 'live' ? 'Switched to Live API Mode' : 'Switched to Demo Sandbox Mode',
      message: mode === 'live'
        ? `Requests are routed directly to ${apiBaseUrl}`
        : 'Using sample sandbox data for previewing without live backend dependencies.'
    });
  };

  const updateApiBaseUrl = (url: string) => {
    saveApiBaseUrl(url);
    setApiBaseUrlState(url);
    setSettings((prev) => ({ ...prev, apiBaseUrl: url }));
    refreshHealth();
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (typeof window !== 'undefined') {
        localStorage.setItem('affiliateops_settings', JSON.stringify(updated));
      }
      return updated;
    });
    addToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'Your preferences have been updated locally.'
    });
  };

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after 4.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        dataMode,
        setDataMode: handleSetDataMode,
        apiBaseUrl,
        updateApiBaseUrl,
        health,
        isCheckingHealth,
        refreshHealth,
        settings,
        updateSettings,
        toasts,
        addToast,
        removeToast,
        selectedProductForVideo,
        setSelectedProductForVideo
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
