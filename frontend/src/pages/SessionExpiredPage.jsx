import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import MagneticButton from '../components/common/MagneticButton';
import { Clock, LogIn, ArrowRight } from 'lucide-react';
import gsap from 'gsap';

export default function SessionExpiredPage() {
  const [secondsLeft, setSecondsLeft] = useState(8);
  const navigate = useNavigate();
  const cardRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
      );
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate('/auth');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-textPrimary">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div
          ref={cardRef}
          className="max-w-md w-full bg-surface p-8 sm:p-10 rounded-3xl border border-borderMuted shadow-md text-center"
        >
          <div className="w-16 h-16 rounded-full bg-stone-200 text-textSecondary flex items-center justify-center mx-auto mb-6 shadow-xs">
            <Clock className="w-8 h-8 stroke-[1.75]" />
          </div>

          <span className="text-xs font-mono uppercase tracking-widest text-textSecondary block mb-2">
            SECURITY INTERVAL TERMINATED
          </span>

          <h1 className="font-serif text-3xl text-textPrimary mb-3">
            Your Session Has Expired
          </h1>

          <p className="text-xs sm:text-sm text-textSecondary leading-relaxed mb-6">
            To safeguard student evaluation telemetry and stored academic credentials, inactive sessions are automatically decommissioned.
          </p>

          <div className="p-4 rounded-xl bg-background border border-borderMuted text-xs font-mono text-textSecondary mb-8 flex items-center justify-between">
            <span>Auto-redirecting to Sign In:</span>
            <span className="font-semibold text-accent">{secondsLeft} seconds</span>
          </div>

          <MagneticButton className="w-full">
            <Link to="/auth">
              <Button
                variant="primary"
                size="md"
                icon={LogIn}
                className="w-full justify-center"
              >
                Sign In Again
              </Button>
            </Link>
          </MagneticButton>
        </div>
      </main>

      <Footer />
    </div>
  );
}
