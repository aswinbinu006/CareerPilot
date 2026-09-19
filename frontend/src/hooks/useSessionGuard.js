import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';

/**
 * useSessionGuard
 * 
 * Provides three layers of session security:
 * 
 * 1. TAB CLOSE AUTO-LOGOUT:
 *    Auth tokens are stored in sessionStorage (not localStorage), so closing
 *    the browser tab or window automatically destroys the session.
 * 
 * 2. DATABASE VALIDATION:
 *    On mount and periodically, validates the user's account still exists
 *    in the backend SQLite database. If the DB was cleared, the frontend
 *    immediately logs out and redirects to /auth.
 * 
 * 3. INACTIVITY TIMEOUT (1 hour):
 *    Monitors mouse movement, keyboard presses, clicks, scrolls, and touches.
 *    If no activity is detected for 60 minutes, the user is automatically
 *    logged out and redirected to /session-expired.
 */

const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour in milliseconds
const DB_VALIDATION_INTERVAL_MS = 5 * 60 * 1000; // Re-validate every 5 minutes

export function useSessionGuard() {
  const navigate = useNavigate();
  const location = useLocation();
  const inactivityTimerRef = useRef(null);
  const validationIntervalRef = useRef(null);
  const isLoggingOutRef = useRef(false);

  // Public pages that don't require auth — skip guard on these
  const publicPaths = ['/', '/auth', '/login', '/signup', '/privacy', '/terms',
    '/cookies', '/support', '/contact', '/verify-email', '/reset-password',
    '/403', '/maintenance', '/session-expired', '/account-locked', '/offline', '/404'];

  const isPublicPage = publicPaths.includes(location.pathname);

  const performLogout = useCallback((redirectTo = '/session-expired') => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    api.logout();
    navigate(redirectTo, { replace: true });

    // Reset after a short delay so future logins can trigger logout again
    setTimeout(() => { isLoggingOutRef.current = false; }, 1000);
  }, [navigate]);

  // --- Inactivity Timer ---
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Record last activity timestamp
    try {
      sessionStorage.setItem('careerpilot_last_active', Date.now().toString());
    } catch {}

    inactivityTimerRef.current = setTimeout(() => {
      if (api.isAuthenticated()) {
        performLogout('/session-expired');
      }
    }, INACTIVITY_TIMEOUT_MS);
  }, [performLogout]);

  // --- Database Validation ---
  const validateWithBackend = useCallback(async () => {
    if (!api.isAuthenticated()) return;

    const isValid = await api.validateSession();
    if (!isValid) {
      performLogout('/auth');
    }
  }, [performLogout]);

  useEffect(() => {
    // Skip guard entirely on public pages
    if (isPublicPage) return;

    // If user is not authenticated, skip (ProtectedRoute handles redirect)
    if (!api.isAuthenticated()) return;

    // --- 1. Clean any legacy localStorage tokens (migrate to sessionStorage) ---
    try {
      const legacyToken = localStorage.getItem('careerpilot_token');
      const legacyUser = localStorage.getItem('careerpilot_user');
      if (legacyToken || legacyUser) {
        localStorage.removeItem('careerpilot_token');
        localStorage.removeItem('careerpilot_user');
      }
    } catch {}

    // --- 2. Validate session against backend database on mount ---
    validateWithBackend();

    // --- 3. Set up periodic DB validation every 5 minutes ---
    validationIntervalRef.current = setInterval(validateWithBackend, DB_VALIDATION_INTERVAL_MS);

    // --- 4. Set up inactivity monitoring ---
    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetInactivityTimer();
    };

    // Start the inactivity timer
    resetInactivityTimer();

    // Listen for user activity
    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // --- 5. Check if session was already stale on mount (e.g., left tab open overnight) ---
    try {
      const lastActive = parseInt(sessionStorage.getItem('careerpilot_last_active') || '0', 10);
      if (lastActive > 0 && Date.now() - lastActive > INACTIVITY_TIMEOUT_MS) {
        performLogout('/session-expired');
        return;
      }
    } catch {}

    // Cleanup
    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (validationIntervalRef.current) clearInterval(validationIntervalRef.current);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isPublicPage, resetInactivityTimer, validateWithBackend, performLogout]);
}
