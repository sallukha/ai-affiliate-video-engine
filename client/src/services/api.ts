import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Default base URL from env or fallback to standard local backend URL
const DEFAULT_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const savedUrl = localStorage.getItem('affiliateops_api_base_url');
    if (savedUrl && savedUrl.trim()) {
      return savedUrl.trim();
    }
  }
  return DEFAULT_BASE_URL;
};

export const setApiBaseUrl = (url: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('affiliateops_api_base_url', url.trim());
    // Update active axios instance base URL
    apiClient.defaults.baseURL = url.trim();
  }
};

export const resetApiBaseUrl = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('affiliateops_api_base_url');
    apiClient.defaults.baseURL = DEFAULT_BASE_URL;
  }
};

export const resolveBackendAssetUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  const apiBaseUrl = getApiBaseUrl();
  try {
    const origin = new URL(apiBaseUrl).origin;
    return new URL(url, origin).toString();
  } catch {
    return url;
  }
};

export type AppDataMode = 'live' | 'demo';

export const getDataMode = (): AppDataMode => {
  if (typeof window !== 'undefined') {
    const mode = localStorage.getItem('affiliateops_data_mode') as AppDataMode | null;
    if (mode === 'live' || mode === 'demo') {
      return mode;
    }
  }
  // Default to 'demo' if in preview/testing so dashboard isn't blank, but allow 1-click switch to 'live'
  return 'live';
};

export const setDataMode = (mode: AppDataMode): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('affiliateops_data_mode', mode);
  }
};

// Create primary Axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.baseURL = getApiBaseUrl();
    return config;
  },
  (error) => Promise.reject(error)
);

export interface HealthCheckResult {
  connected: boolean;
  statusCode?: number;
  latencyMs?: number;
  message: string;
  baseUrl: string;
}

/**
 * Checks connection to backend service.
 */
export async function checkBackendHealth(): Promise<HealthCheckResult> {
  const baseUrl = getApiBaseUrl();
  const startTime = performance.now();

  try {
    // Attempt health endpoint or root API probe
    const response = await axios.get(`${baseUrl}/health`, {
      timeout: 5000,
      validateStatus: () => true // Allow any status to see if server is listening
    });

    const latencyMs = Math.round(performance.now() - startTime);

    if (response.status >= 200 && response.status < 400) {
      return {
        connected: true,
        statusCode: response.status,
        latencyMs,
        message: 'Backend server is active and responding',
        baseUrl
      };
    } else if (response.status === 404) {
      // Server is online, but /health endpoint might not exist yet
      return {
        connected: true,
        statusCode: response.status,
        latencyMs,
        message: 'Server reachable (GET /health returned 404, endpoint pending)',
        baseUrl
      };
    } else {
      return {
        connected: true,
        statusCode: response.status,
        latencyMs,
        message: `Server returned status ${response.status}`,
        baseUrl
      };
    }
  } catch (err: unknown) {
    const error = err as AxiosError;
    const latencyMs = Math.round(performance.now() - startTime);

    if (error.code === 'ECONNABORTED') {
      return {
        connected: false,
        latencyMs,
        message: `Connection timed out after 5000ms at ${baseUrl}`,
        baseUrl
      };
    }

    if (error.code === 'ERR_NETWORK' || !error.response) {
      return {
        connected: false,
        latencyMs,
        message: `Cannot reach backend at ${baseUrl}. Ensure backend server is running and CORS is enabled.`,
        baseUrl
      };
    }

    return {
      connected: false,
      statusCode: error.response?.status,
      latencyMs,
      message: error.message || 'Unknown network error',
      baseUrl
    };
  }
}
