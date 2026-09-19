import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shield, X, ShieldCheck } from 'lucide-react';
import gsap from 'gsap';

export default function PrivacyNotice() {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('careerpilot_privacy_consent');
      if (!consent) {
        // Show after a brief delay for a polished entrance
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (isVisible && containerRef.current) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion) {
        gsap.fromTo(
          containerRef.current,
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
        );
      }
    }
  }, [isVisible]);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem('careerpilot_privacy_consent', 'all');
      localStorage.setItem(
        'careerpilot_privacy_prefs',
        JSON.stringify({ necessary: true, analytics: true, functional: true, marketing: false })
      );
    } catch {}
    setIsVisible(false);
  };

  const handleRejectOptional = () => {
    try {
      localStorage.setItem('careerpilot_privacy_consent', 'essential');
      localStorage.setItem(
        'careerpilot_privacy_prefs',
        JSON.stringify({ necessary: true, analytics: false, functional: false, marketing: false })
      );
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Privacy & Data Preferences"
      className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-40 p-6 rounded-3xl bg-surface/95 backdrop-blur-xl border border-borderMuted shadow-2xl text-textPrimary animate-fade-in no-print"
    >
      <div className="flex items-start gap-3.5 mb-3">
        <div className="w-8 h-8 rounded-xl bg-accent-light text-accent border border-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4 stroke-[1.75]" />
        </div>
        <div className="flex-1">
          <h4 className="font-serif text-base text-textPrimary leading-tight mb-1">
            Fiduciary Privacy & Student Data Notice
          </h4>
          <p className="text-xs text-textSecondary leading-relaxed">
            CareerPilot preserves session memory to protect your 8-step evaluation draft. We do not sell student demographic indicators to commercial marketing aggregators.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-borderMuted/80 text-xs font-mono">
        <Link
          to="/cookies"
          onClick={() => setIsVisible(false)}
          className="px-3 py-1.5 text-textSecondary hover:text-textPrimary transition-colors"
        >
          Manage Preferences
        </Link>
        <button
          onClick={handleRejectOptional}
          className="px-3.5 py-1.5 rounded-full bg-background border border-borderMuted text-textPrimary hover:bg-surfaceLight transition-colors cursor-pointer"
        >
          Reject Optional
        </button>
        <button
          onClick={handleAcceptAll}
          className="px-4 py-1.5 rounded-full bg-charcoal text-white hover:bg-accent transition-colors shadow-xs cursor-pointer font-medium"
        >
          Accept All
        </button>
      </div>
    </div>
  );
}
