import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import MagneticButton from '../components/common/MagneticButton';
import { Lock, ShieldAlert, Mail, HelpCircle } from 'lucide-react';
import gsap from 'gsap';

export default function AccountLockedPage() {
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
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-textPrimary">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div
          ref={cardRef}
          className="max-w-md w-full bg-surface p-8 sm:p-10 rounded-3xl border border-borderMuted shadow-md text-center"
        >
          <div className="w-16 h-16 rounded-full bg-stone-200 text-textSecondary flex items-center justify-center mx-auto mb-6 shadow-xs">
            <Lock className="w-8 h-8 stroke-[1.75]" />
          </div>

          <span className="text-xs font-mono uppercase tracking-widest text-textSecondary block mb-2">
            DEFENSIVE SECURITY HOLD
          </span>

          <h1 className="font-serif text-3xl text-textPrimary mb-3">
            Account Access Suspended
          </h1>

          <p className="text-xs sm:text-sm text-textSecondary leading-relaxed mb-6">
            Consecutive unsuccessful authentication attempts were detected from your network address. To protect your career dossier from unauthorized access, the account has been temporarily placed on hold.
          </p>

          <div className="p-4 rounded-xl bg-background border border-borderMuted text-xs font-mono text-left text-textSecondary space-y-2 mb-8">
            <div className="flex justify-between">
              <span>Automatic Release:</span>
              <span className="text-textPrimary font-semibold">30 Minutes</span>
            </div>
            <div className="flex justify-between">
              <span>Alternative Resolution:</span>
              <span className="text-accent font-semibold">Password Reset Token</span>
            </div>
          </div>

          <div className="space-y-3">
            <MagneticButton className="w-full">
              <Link to="/reset-password">
                <Button variant="primary" size="md" className="w-full justify-center">
                  Initiate Secure Unlock
                </Button>
              </Link>
            </MagneticButton>

            <Link
              to="/support"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-accent hover:underline pt-1"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact Identity Governance Desk</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
