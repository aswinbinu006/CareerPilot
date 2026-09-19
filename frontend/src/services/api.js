/**
 * Centralized API Service for CareerPilot
 * Integrates directly with the FastAPI backend (http://localhost:8000).
 * Handles authentication tokens, timeouts, network error states, and structured JSON parsing.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

// Helper to access session storage (auto-cleared when tab/browser is closed)
function getStoredToken() {
  try {
    return sessionStorage.getItem('careerpilot_token') || localStorage.getItem('careerpilot_token');
  } catch {
    return null;
  }
}

function getStoredUser() {
  try {
    const u = sessionStorage.getItem('careerpilot_user') || localStorage.getItem('careerpilot_user');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}

async function request(endpoint, options = {}, timeoutMs = 90000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      if (response.status === 401) {
        // If unauthorized/unauthenticated, clear session state immediately
        api.logout();
      }
      const errorMsg = (typeof data === 'object' && data?.detail)
        ? data.detail
        : `Request failed with status ${response.status}`;
      throw new ApiError(errorMsg, response.status, data);
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new ApiError('The request timed out. The AI guidance pipeline is deliberating deeply, please retry.', 408);
    }
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      'Unable to connect to the CareerPilot advisory server. Please ensure the backend is running on port 8000.',
      0,
      err.message
    );
  }
}

export const api = {
  // Authentication Status Check
  isAuthenticated: () => {
    try {
      const token = getStoredToken();
      const user = getStoredUser();
      return !!(token && user);
    } catch {
      return false;
    }
  },

  getToken: () => getStoredToken(),

  // System Health
  checkHealth: async () => {
    try {
      return await request('/health', { method: 'GET' }, 5000);
    } catch (err) {
      return { status: 'offline', error: err.message };
    }
  },

  // Authentication: Stored in sessionStorage so closing the tab immediately logs the user out
  signup: async (userData) => {
    const result = await request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (result?.token) {
      sessionStorage.setItem('careerpilot_token', result.token);
      sessionStorage.setItem('careerpilot_user', JSON.stringify(result.user));
      sessionStorage.setItem('careerpilot_last_active', Date.now().toString());
      // Clean legacy localStorage
      localStorage.removeItem('careerpilot_token');
      localStorage.removeItem('careerpilot_user');
      window.dispatchEvent(new Event('careerpilot_auth_changed'));
    }
    return result;
  },

  login: async (credentials) => {
    const result = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (result?.token) {
      sessionStorage.setItem('careerpilot_token', result.token);
      sessionStorage.setItem('careerpilot_user', JSON.stringify(result.user));
      sessionStorage.setItem('careerpilot_last_active', Date.now().toString());
      // Clean legacy localStorage
      localStorage.removeItem('careerpilot_token');
      localStorage.removeItem('careerpilot_user');
      window.dispatchEvent(new Event('careerpilot_auth_changed'));
    }
    return result;
  },

  logout: () => {
    try {
      sessionStorage.removeItem('careerpilot_token');
      sessionStorage.removeItem('careerpilot_user');
      sessionStorage.removeItem('careerpilot_last_active');
      localStorage.removeItem('careerpilot_token');
      localStorage.removeItem('careerpilot_user');
      window.dispatchEvent(new Event('careerpilot_auth_changed'));
    } catch {}
  },

  getCurrentUser: () => getStoredUser(),

  // Validates user presence against backend SQLite database
  validateSession: async () => {
    const user = getStoredUser();
    const token = getStoredToken();
    if (!user && !token) return false;

    try {
      const emailParam = encodeURIComponent(user?.email || '');
      const tokenParam = encodeURIComponent(token || '');
      const res = await request(`/auth/validate?email=${emailParam}&token=${tokenParam}`, {
        method: 'GET',
      }, 5000);
      if (res && res.valid) {
        return true;
      }
    } catch (err) {
      // User not in DB (e.g., cleared database) -> log out immediately
      api.logout();
      return false;
    }
    return false;
  },

  // Assessment & Report
  startAssessment: (studentProfile) =>
    request('/assessment', {
      method: 'POST',
      body: JSON.stringify(studentProfile),
    }, 120000), // 120s timeout for full multi-agent deliberation

  getReport: async (sessionId) => {
    try {
      return await request(`/report/${sessionId}?format=json`, { method: 'GET' });
    } catch (err) {
      // Fallback to local session storage cache if server is offline
      try {
        const cached = localStorage.getItem(`careerpilot_report_${sessionId}`);
        if (cached) return JSON.parse(cached);
      } catch {}
      throw err;
    }
  },

  getRecentSessions: async () => {
    try {
      return await request('/report', { method: 'GET' }, 8000);
    } catch (err) {
      // Return empty array gracefully instead of throwing unhandled error
      return [];
    }
  },

  // Career Mentor AI
  sendMentorMessage: (message, sessionId = null, userEmail = null) =>
    request('/mentor/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        session_id: sessionId,
        user_email: userEmail,
      }),
    }, 60000),

  getMentorHistory: async (sessionId = null, userEmail = null) => {
    try {
      const params = new URLSearchParams();
      if (sessionId) params.append('session_id', sessionId);
      if (userEmail) params.append('user_email', userEmail);
      return await request(`/mentor/history?${params.toString()}`, { method: 'GET' }, 10000);
    } catch (err) {
      return { history: [] };
    }
  },

  clearMentorHistory: async (sessionId = null, userEmail = null) => {
    try {
      const params = new URLSearchParams();
      if (sessionId) params.append('session_id', sessionId);
      if (userEmail) params.append('user_email', userEmail);
      return await request(`/mentor/history?${params.toString()}`, { method: 'DELETE' }, 10000);
    } catch (err) {
      return { status: 'error' };
    }
  },

  getMentorStarters: async (sessionId = null, userEmail = null) => {
    try {
      const params = new URLSearchParams();
      if (sessionId) params.append('session_id', sessionId);
      if (userEmail) params.append('user_email', userEmail);
      return await request(`/mentor/starters?${params.toString()}`, { method: 'GET' }, 10000);
    } catch (err) {
      return { starters: [] };
    }
  },
};

export { ApiError };
