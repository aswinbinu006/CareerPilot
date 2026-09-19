import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import MagneticButton from '../components/common/MagneticButton';
import { Mail, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';
import gsap from 'gsap';

export default function VerifyEmailPage() {
  const [countdown, setCountdown] = useState(45);
  const [resent, setResent] = useState(false);
  const envelopeRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    if (envelopeRef.current) {
      gsap.to(envelopeRef.current, {
        y: -10,
        rotateZ: 3,
        duration: 3.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }

    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = () => {
    setResent(true);
    setCountdown(60);
    setTimeout(() => setResent(false), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-textPrimary">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div
          ref={containerRef}
          className="max-w-md w-full bg-surface p-8 sm:p-10 rounded-3xl border border-borderMuted shadow-md text-center"
        >
          {/* Floating Envelope Icon */}
          <div
            ref={envelopeRef}
            className="w-18 h-18 rounded-3xl bg-accent text-white flex items-center justify-center mx-auto mb-6 shadow-md"
          >
            <Mail className="w-8 h-8 stroke-[1.75]" />
          </div>

          <span className="text-xs font-mono uppercase tracking-widest text-accent block mb-2">
            AUTHENTICATION STEP 2/2
          </span>

          <h1 className="font-serif text-3xl text-textPrimary mb-3">
            We've Sent a Verification Email
          </h1>

          <p className="text-xs sm:text-sm text-textSecondary leading-relaxed mb-6">
            We dispatched a single-use authorization link to your student email address. Click the link in your inbox to unlock unconstrained dossier exports.
          </p>

          {resent && (
            <div className="mb-6 p-3 rounded-xl bg-accent-light border border-accent/20 text-accent text-xs font-mono flex items-center justify-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>A fresh authorization link has been queued.</span>
            </div>
          )}

          <div className="p-4 rounded-xl bg-background border border-borderMuted text-xs font-mono text-textSecondary mb-8 text-left space-y-1">
            <div className="flex justify-between">
              <span>Link Expiration:</span>
              <span className="text-textPrimary font-medium">15 Minutes</span>
            </div>
            <div className="flex justify-between">
              <span>Origin Server:</span>
              <span className="text-accent font-medium">auth.careerpilot.advisory</span>
            </div>
          </div>

          <div className="space-y-4">
            <button
              disabled={countdown > 0}
              onClick={handleResend}
              className="w-full py-3 rounded-full bg-background hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed border border-borderMuted text-xs font-mono uppercase tracking-wider text-textPrimary transition-all cursor-pointer"
            >
              {countdown > 0 ? `Resend Available in ${countdown}s` : 'Resend Verification Email'}
            </button>

            <MagneticButton className="w-full">
              <Link to="/dashboard">
                <Button variant="primary" size="md" icon={ArrowRight} className="w-full justify-center">
                  Continue to Dossier
                </Button>
              </Link>
            </MagneticButton>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
