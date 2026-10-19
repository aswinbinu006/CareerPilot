import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ServerOff, RefreshCw, X, CheckCircle2, Wrench, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

/**
 * BackendStatusBar
 * Monitors FastAPI backend availability via /health.
 * Displays a prominent notification whenever the backend is down (503, offline, or network failure),
 * informing visitors that the owner is working on the backend, with auto-retry and manual retry capabilities.
 */
export default function BackendStatusBar() {
  const [isDown, setIsDown] = useState(false);
  const [restored, setRestored] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastCheckError, setLastCheckError] = useState(null);

  const { showToast } = useToast();
  const hasNotifiedToast = useRef(false);
  const wasDownRef = useRef(false);

  // Health check handler
  const performHealthCheck = useCallback(async (isManualRetry = false) => {
    if (isManualRetry) {
      setIsRetrying(true);
    }

    try {
      const res = await api.checkHealth(7000);
      const healthy = res?.status === 'healthy';

      if (!healthy) {
        setIsDown(true);
        setLastCheckError(res?.error || 'Server unreachable');

        // Notify user via toast on first site visit detection or status transition
        if (!hasNotifiedToast.current || !wasDownRef.current) {
          showToast(
            'Backend is down. The owner is working on the backend.',
            'error',
            8000
          );
          hasNotifiedToast.current = true;
        }
        wasDownRef.current = true;
      } else {
        if (wasDownRef.current) {
          // It was previously down, now restored!
          setRestored(true);
          showToast('Backend connection restored! All AI services are operational.', 'success', 4000);
          setTimeout(() => setRestored(false), 4500);
        }
        setIsDown(false);
        setIsDismissed(false);
        setLastCheckError(null);
        wasDownRef.current = false;
      }
    } catch (err) {
      setIsDown(true);
      setLastCheckError(err?.message || 'Server unreachable');

      if (!hasNotifiedToast.current || !wasDownRef.current) {
        showToast(
          'Backend is down. The owner is working on the backend.',
          'error',
          8000
        );
        hasNotifiedToast.current = true;
      }
      wasDownRef.current = true;
    } finally {
      if (isManualRetry) {
        setIsRetrying(false);
      }
    }
  }, [showToast]);

  // Initial site visit health check
  useEffect(() => {
    // Check backend health immediately when visitor lands on the site
    performHealthCheck();

    // Listen to global backend status events dispatched by api.js
    const handleBackendStatus = (e) => {
      const { isDown: serverDown, error } = e.detail || {};
      if (serverDown) {
        setIsDown(true);
        setLastCheckError(error || 'Server unavailable');
        if (!hasNotifiedToast.current || !wasDownRef.current) {
          showToast(
            'Backend is down. The owner is working on the backend.',
            'error',
            8000
          );
          hasNotifiedToast.current = true;
        }
        wasDownRef.current = true;
      } else if (serverDown === false && wasDownRef.current) {
        setIsDown(false);
        setRestored(true);
        showToast('Backend connection restored! All AI services are operational.', 'success', 4000);
        setTimeout(() => setRestored(false), 4500);
        wasDownRef.current = false;
      }
    };

    // Re-check when browser comes back online
    const handleOnline = () => {
      performHealthCheck();
    };

    window.addEventListener('careerpilot_backend_status', handleBackendStatus);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('careerpilot_backend_status', handleBackendStatus);
      window.removeEventListener('online', handleOnline);
    };
  }, [performHealthCheck, showToast]);

  // Auto-retry polling every 30 seconds if the backend is down
  useEffect(() => {
    if (!isDown) return;

    const intervalId = setInterval(() => {
      performHealthCheck(false);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [isDown, performHealthCheck]);

  // If restored, show temporary recovery bar
  if (restored) {
    return (
      <aside
        aria-label="Backend status notice"
        className="w-full py-2 px-4 bg-emerald-500/15 dark:bg-emerald-950/80 border-b border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs font-mono text-center flex items-center justify-center gap-2 animate-fade-in no-print"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
        <span>
          <strong>Backend Connected:</strong> AI advisory engine and live assessment services are online.
        </span>
      </aside>
    );
  }

  // If not down or user dismissed the banner, don't render the top bar
  if (!isDown || isDismissed) {
    return null;
  }

  return (
    <aside
      aria-label="Backend status notice"
      className="w-full relative z-40 bg-gradient-to-r from-amber-500/15 via-red-500/10 to-amber-500/15 dark:from-red-950/80 dark:via-amber-950/70 dark:to-red-950/80 border-b border-amber-500/30 dark:border-red-500/30 backdrop-blur-md px-4 py-3 text-textPrimary shadow-sm transition-all duration-300 no-print"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Left side: Alert badge & Primary Message */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400">
            <ServerOff className="w-4 h-4 animate-pulse" />
          </div>

          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-red-700 dark:text-red-300 text-sm">
                Backend is down. The owner is working on the backend.
              </span>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20">
                <Wrench className="w-2.5 h-2.5" /> Maintenance In Progress
              </span>
            </div>
            <p className="text-textSecondary text-[11px] mt-0.5">
              Live AI assessment processing, report generation, and career mentor chat are temporarily paused while updates are applied.
            </p>
          </div>
        </div>

        {/* Right side: Action controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => performHealthCheck(true)}
            disabled={isRetrying}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface dark:bg-surface/80 border border-borderMuted hover:border-accent text-textPrimary hover:text-accent font-medium text-xs shadow-xs transition-colors disabled:opacity-50"
            title="Check backend status now"
          >
            <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin text-accent' : ''}`} />
            <span>{isRetrying ? 'Checking...' : 'Retry Connection'}</span>
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-lg text-textMuted hover:text-textPrimary hover:bg-surface transition-colors"
            aria-label="Dismiss backend maintenance notification"
            title="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
