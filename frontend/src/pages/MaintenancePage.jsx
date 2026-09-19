import React, { useState, useEffect, useRef } from 'react';
import { Compass, Clock, Bell, Check, Send, ExternalLink } from 'lucide-react';
import gsap from 'gsap';
import AnimatedBackground from '../components/common/AnimatedBackground';
import Button from '../components/common/Button';
import MagneticButton from '../components/common/MagneticButton';

export default function MaintenancePage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    );
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-textPrimary relative overflow-hidden">
      <AnimatedBackground />

      {/* Minimal Top Brand Bar */}
      <header className="w-full px-6 py-8 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white">
            <Compass className="w-4 h-4" />
          </div>
          <span className="font-serif text-2xl text-textPrimary">CareerPilot</span>
        </div>
        <span className="text-xs font-mono uppercase tracking-widest text-accent bg-accent-light px-3 py-1 rounded border border-accent/20">
          Curriculum Re-indexing
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div
          ref={cardRef}
          className="max-w-xl w-full bg-surface/95 backdrop-blur-md p-8 sm:p-12 rounded-3xl border border-borderMuted shadow-lg text-center"
        >
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-background border border-borderMuted text-xs font-mono text-accent mb-6 shadow-xs">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>Scheduled Admissions Database Upgrade</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-textPrimary leading-tight mb-4">
            Calibrating NIRF 2026 Examination Cutoffs
          </h1>

          <p className="text-sm sm:text-base text-textSecondary max-w-md mx-auto leading-relaxed mb-8">
            Our data pipelines are actively re-indexing latest NTA testing calendars, Central University (CUET) fee changes, and state domicile quota matrices.
          </p>

          {/* Progress Indicator */}
          <div className="p-5 rounded-2xl bg-background border border-borderMuted mb-8 text-left">
            <div className="flex items-center justify-between text-xs font-mono text-textSecondary mb-2">
              <span>Database Migration Progress:</span>
              <span className="text-accent font-semibold">78% Complete</span>
            </div>
            <div className="w-full h-2 bg-surface rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-accent rounded-full shadow-xs"
                style={{ width: '78%' }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-textMuted">
              <span>Commenced: 02:00 AM IST</span>
              <span>Estimated Resumption: 04:30 AM IST</span>
            </div>
          </div>

          {/* Email Notification Form */}
          {subscribed ? (
            <div className="p-4 rounded-xl bg-accent-light border border-accent/30 text-accent text-xs font-mono flex items-center justify-center gap-2 animate-fade-in mb-6">
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>You will receive an alert the second counseling engines resume.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-3 mb-8">
              <span className="block text-xs font-mono uppercase tracking-wider text-textSecondary">
                Get Notified Upon Resumption
              </span>
              <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-2.5 rounded-full bg-background border border-borderMuted text-xs text-textPrimary placeholder:text-textMuted focus:outline-hidden focus:border-accent"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-charcoal hover:bg-accent text-white rounded-full text-xs font-mono tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <span>Notify Me</span>
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </form>
          )}

          {/* Social Links / Live Status */}
          <div className="pt-6 border-t border-borderMuted/80 text-xs font-mono text-textMuted flex flex-wrap items-center justify-center gap-6">
            <a href="https://nta.ac.in" target="_blank" rel="noopener noreferrer" className="hover:text-textPrimary inline-flex items-center gap-1">
              <span>NTA Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a href="https://nirfindia.org" target="_blank" rel="noopener noreferrer" className="hover:text-textPrimary inline-flex items-center gap-1">
              <span>NIRF Rankings</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-textMuted">• Live Status Feed: status.careerpilot.advisory</span>
          </div>
        </div>
      </main>

      <footer className="w-full text-center py-6 text-xs font-mono text-textMuted border-t border-borderMuted">
        &copy; {new Date().getFullYear()} CareerPilot Advisory Infrastructure.
      </footer>
    </div>
  );
}
