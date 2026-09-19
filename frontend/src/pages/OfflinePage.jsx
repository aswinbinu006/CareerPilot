import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import MagneticButton from '../components/common/MagneticButton';
import { WifiOff, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import gsap from 'gsap';

export default function OfflinePage() {
  const [checking, setChecking] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const cardRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      if (navigator.onLine) {
        setIsOnline(true);
        navigate(-1);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-textPrimary">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div
          ref={cardRef}
          className="max-w-md w-full bg-surface p-8 sm:p-10 rounded-3xl border border-borderMuted shadow-md text-center"
        >
          <div className="w-16 h-16 rounded-full bg-stone-200 text-textSecondary flex items-center justify-center mx-auto mb-6 shadow-xs">
            <WifiOff className="w-8 h-8 stroke-[1.75]" />
          </div>

          <span className="text-xs font-mono uppercase tracking-widest text-textSecondary block mb-2">
            NETWORK DISCONNECTED
          </span>

          <h1 className="font-serif text-3xl text-textPrimary mb-3">
            Offline Advisory State
          </h1>

          <p className="text-xs sm:text-sm text-textSecondary leading-relaxed mb-6">
            We are currently unable to reach our FastAPI advisory engine or the Tavily university cutoff index. Your local assessment draft remains preserved in browser session memory.
          </p>

          <div className="p-4 rounded-xl bg-background border border-borderMuted text-xs font-mono text-left text-textSecondary space-y-1.5 mb-8">
            <div className="flex items-center gap-2 text-accent">
              <CheckCircle2 className="w-4 h-4" />
              <span>Session Assessment Draft Cached</span>
            </div>
            <p className="text-[11px] text-textMuted leading-normal">
              Reconnection will automatically resume your assessment without loss of inputted board marks.
            </p>
          </div>

          <MagneticButton className="w-full">
            <Button
              variant="primary"
              size="md"
              icon={RefreshCw}
              disabled={checking}
              onClick={handleRetry}
              className="w-full justify-center"
            >
              <span>{checking ? 'Checking Connection...' : 'Retry Connection'}</span>
            </Button>
          </MagneticButton>
        </div>
      </main>

      <Footer />
    </div>
  );
}
