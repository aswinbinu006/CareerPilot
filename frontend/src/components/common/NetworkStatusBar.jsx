import React, { useState, useEffect } from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';

export default function NetworkStatusBar() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setRestored(true);
      setTimeout(() => setRestored(false), 3500);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setRestored(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline && !restored) return null;

  return (
    <div
      role="alert"
      className={`w-full py-2 px-4 text-xs font-mono text-center flex items-center justify-center gap-2 transition-all no-print ${
        isOffline
          ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-b border-amber-300 dark:border-amber-800'
          : 'bg-accent-light dark:bg-accent/20 text-accent dark:text-accent-light border-b border-accent/20'
      }`}
    >
      {isOffline ? (
        <>
          <WifiOff className="w-3.5 h-3.5" />
          <span>Network Disconnected — Assessment draft remains cached locally on this device.</span>
        </>
      ) : (
        <>
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Connection Restored — Live synchronization active with FastAPI advisory engine.</span>
        </>
      )}
    </div>
  );
}
