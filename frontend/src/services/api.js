/**
 * Centralized API Service for CareerPilot
 * Integrates directly with the FastAPI backend (http://localhost:8000).
 * Handles authentication tokens, timeouts, network error states, and structured JSON parsing.
 */

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://careerpilot-backend-1-mja5.onrender.com';
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

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
      if (response.status >= 500) {
        window.dispatchEvent(new CustomEvent('careerpilot_backend_status', {
          detail: { isDown: true, status: response.status, message: 'Server unavailable' }
        }));
      }
      const errorMsg = (typeof data === 'object' && data?.detail)
        ? data.detail
        : `Request failed with status ${response.status}`;
      throw new ApiError(errorMsg, response.status, data);
    }

    // Response succeeded - notify listeners that backend is reachable
    window.dispatchEvent(new CustomEvent('careerpilot_backend_status', {
      detail: { isDown: false, status: response.status }
    }));

    return data;
  } catch (err) {
    clearTimeout(timeoutId);

    // Notify listeners if connection failed, timed out, or returned 5xx
    if (err.name === 'AbortError' || !(err instanceof ApiError) || err.status === 0 || (err.status >= 500 && err.status <= 599)) {
      window.dispatchEvent(new CustomEvent('careerpilot_backend_status', {
        detail: { isDown: true, error: err.message, status: err.status || 0 }
      }));
    }

    if (err.name === 'AbortError') {
      throw new ApiError('The request timed out. The AI guidance pipeline is deliberating deeply, please retry.', 408);
    }
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      'Unable to connect to the CareerPilot advisory server. Please check your network connection or verify the backend service is active.',
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
  checkHealth: async (timeoutMs = 6000) => {
    try {
      const res = await request('/health', { method: 'GET' }, timeoutMs);
      const isHealthy = res && (res.status === 'healthy' || res.status === 'ok');
      window.dispatchEvent(new CustomEvent('careerpilot_backend_status', {
        detail: { isDown: !isHealthy, data: res }
      }));
      return { status: isHealthy ? 'healthy' : 'offline', data: res };
    } catch (err) {
      window.dispatchEvent(new CustomEvent('careerpilot_backend_status', {
        detail: { isDown: true, error: err.message, status: err.status || 0 }
      }));
      return { status: 'offline', error: err.message, statusCode: err.status || 0 };
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
      // Clean legacy localStorage and any un-namespaced session keys
      localStorage.removeItem('careerpilot_token');
      localStorage.removeItem('careerpilot_user');
      localStorage.removeItem('careerpilot_latest_session_id');
      localStorage.removeItem('careerpilot_completed_sessions');
      localStorage.removeItem('careerpilot_completed_sessions_student.demo@careerpilot.edu');
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
      // Clean legacy localStorage and any un-namespaced session keys
      localStorage.removeItem('careerpilot_token');
      localStorage.removeItem('careerpilot_user');
      localStorage.removeItem('careerpilot_latest_session_id');
      localStorage.removeItem('careerpilot_completed_sessions');
      localStorage.removeItem('careerpilot_completed_sessions_student.demo@careerpilot.edu');
      window.dispatchEvent(new Event('careerpilot_auth_changed'));
    }
    return result;
  },

  getStorageKey: (baseKey, user = null) => {
    const u = user || getStoredUser();
    if (u?.email) {
      return `${baseKey}_${u.email.toLowerCase().trim()}`;
    }
    return baseKey;
  },

  logout: () => {
    try {
      const u = getStoredUser();
      const userEmail = u?.email ? u.email.toLowerCase().trim() : null;
      sessionStorage.removeItem('careerpilot_token');
      sessionStorage.removeItem('careerpilot_user');
      sessionStorage.removeItem('careerpilot_last_active');
      sessionStorage.removeItem('careerpilot_active_profile');
      localStorage.removeItem('careerpilot_token');
      localStorage.removeItem('careerpilot_user');
      localStorage.removeItem('careerpilot_latest_session_id');
      localStorage.removeItem('careerpilot_completed_sessions');
      if (userEmail) {
        localStorage.removeItem(`careerpilot_latest_session_id_${userEmail}`);
        localStorage.removeItem(`careerpilot_completed_sessions_${userEmail}`);
        sessionStorage.removeItem(`careerpilot_assessment_draft_${userEmail}`);
      }
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
      // Send token in Authorization header (preferred); the backend still accepts
      // the query string for legacy compatibility but headers don't end up in logs/history.
      const res = await request(`/auth/validate?email=${emailParam}`, {
        method: 'GET',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
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
      // Fallback to local session storage cache if server is offline.
      // The cache key is scoped to the current user's email to prevent
      // cross-user leakage when localStorage is shared.
      try {
        const user = getStoredUser();
        const userKey = user?.email
          ? `careerpilot_report_${user.email.toLowerCase().trim()}_${sessionId}`
          : `careerpilot_report_${sessionId}`;
        const cached = localStorage.getItem(userKey);
        if (cached) return JSON.parse(cached);
      } catch {}
      throw err;
    }
  },

  getRecentSessions: async (params = {}) => {
    try {
      const currentUser = getStoredUser();
      const email = params?.user_email || currentUser?.email || '';
      const qs = email ? `?user_email=${encodeURIComponent(email)}` : '';
      return await request(`/report${qs}`, { method: 'GET' }, 8000);
    } catch (err) {
      // Return empty array gracefully instead of throwing unhandled error
      return [];
    }
  },

  // Strictly user-isolated session retrieval: only returns assessments for the authenticated user
  getUserSessions: async (user = null) => {
    const currentUser = user || getStoredUser();
    if (!currentUser?.email && !currentUser?.name) {
      return [];
    }

    let sessions = [];

    // 1. Check live backend SQLite sessions strictly matching this authenticated student
    try {
      const res = await api.getRecentSessions({ user_email: currentUser.email });
      const list = Array.isArray(res?.recent_sessions)
        ? res.recent_sessions
        : Array.isArray(res)
        ? res
        : [];

      const userEmail = (currentUser.email || '').toLowerCase().trim();
      const userName = (currentUser.name || '').toLowerCase().trim();

      const matched = list.filter((s) => {
        const sEmail = (s.user_email || '').toLowerCase().trim();
        const sName = (s.student_name || '').toLowerCase().trim();
        if (userEmail && sEmail && sEmail === userEmail) return true;
        if (userName && sName && sName === userName) return true;
        return false;
      });

      if (matched.length > 0) {
        sessions.push(...matched);
      }
    } catch (e) {
      console.warn('Backend session fetch failed:', e);
    }

    // 2. User-specific local storage ONLY for this user's email
    if (currentUser?.email) {
      try {
        const userKey = `careerpilot_completed_sessions_${currentUser.email.toLowerCase().trim()}`;
        const localStored = JSON.parse(localStorage.getItem(userKey) || '[]');
        if (Array.isArray(localStored)) {
          localStored.forEach((item) => {
            if (!sessions.some((s) => s.session_id === item.session_id)) {
              sessions.push(item);
            }
          });
        }
      } catch {}
    }

    // 3. Enrich sessions with cached report details if degree or stream is missing/generic
    sessions = sessions.map((s) => {
      let enriched = { ...s };
      try {
        const cachedRaw =
          sessionStorage.getItem(`report_${s.session_id}`) ||
          localStorage.getItem(`careerpilot_report_${s.session_id}`);
        if (cachedRaw) {
          const rep = JSON.parse(cachedRaw);
          if (
            !enriched.recommended_degree ||
            enriched.recommended_degree === 'Career Guidance Dossier'
          ) {
            enriched.recommended_degree =
              rep.recommendation?.recommended_degree ||
              rep.degree ||
              enriched.recommended_degree;
          }
          if (!enriched.stream || enriched.stream === 'Class 12 Advisory') {
            enriched.stream =
              rep.student_profile?.stream ||
              rep.stream ||
              enriched.stream;
          }
          if (!enriched.student_name || enriched.student_name === 'Class 12 Student') {
            enriched.student_name =
              rep.student_profile?.name ||
              currentUser?.name ||
              enriched.student_name;
          }
        }
      } catch {}
      return enriched;
    });

    return sessions;
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
