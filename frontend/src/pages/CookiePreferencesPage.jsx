import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import MagneticButton from '../components/common/MagneticButton';
import { Cookie, ShieldCheck, Check, AlertCircle, Save } from 'lucide-react';
import gsap from 'gsap';

export default function CookiePreferencesPage() {
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('careerpilot_cookie_prefs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      necessary: true,
      analytics: true,
      functional: true,
      marketing: false,
    };
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    );
  }, []);

  const handleToggle = (category) => {
    if (category === 'necessary') return; // strictly locked
    setPreferences((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const handleSave = () => {
    localStorage.setItem('careerpilot_cookie_prefs', JSON.stringify(preferences));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAcceptAll = () => {
    const all = { necessary: true, analytics: true, functional: true, marketing: true };
    setPreferences(all);
    localStorage.setItem('careerpilot_cookie_prefs', JSON.stringify(all));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleRejectOptional = () => {
    const minimal = { necessary: true, analytics: false, functional: false, marketing: false };
    setPreferences(minimal);
    localStorage.setItem('careerpilot_cookie_prefs', JSON.stringify(minimal));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const categories = [
    {
      id: 'necessary',
      name: 'Essential Counseling Operations',
      locked: true,
      description:
        'Mandatory for session persistence, multi-step assessment memory, authentication tokens, and CSRF protection. Cannot be disabled.',
    },
    {
      id: 'functional',
      name: 'Functional & Display Preferences',
      locked: false,
      description:
        'Remembers your stream filters, assessment drafts, and typography rendering preferences across sessions.',
    },
    {
      id: 'analytics',
      name: 'Curriculum Analytics & Latency Telemetry',
      locked: false,
      description:
        'Collects anonymous timing metrics on how long the 4-agent pipeline takes to compile recommendations, helping us optimize throughput.',
    },
    {
      id: 'marketing',
      name: 'Outreach & Institution Communications',
      locked: false,
      description:
        'Controls notifications regarding verified scholarship application windows and NIRF accreditation updates.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-textPrimary">
      <Navbar />

      <main ref={containerRef} className="flex-1 max-w-4xl w-full mx-auto px-6 py-14">
        {/* Header */}
        <div className="mb-10 pb-6 border-b border-borderMuted">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-borderMuted text-xs font-mono text-accent mb-4">
            <Cookie className="w-3.5 h-3.5" />
            <span>TELEMETRY PREFERENCE CENTER</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-textPrimary mb-3">
            Cookie & Local Storage Preferences
          </h1>
          <p className="text-textSecondary text-sm sm:text-base leading-relaxed">
            We believe educational counseling platforms should be transparent. Manage which categories of cookies and local storage tokens CareerPilot uses during your advisory sessions.
          </p>
        </div>

        {/* Success Alert */}
        {savedSuccess && (
          <div className="mb-8 p-4 rounded-xl bg-accent-light border border-accent/30 text-accent flex items-center gap-3 text-xs font-mono animate-fade-in">
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Your privacy preferences have been securely recorded.</span>
          </div>
        )}

        {/* Category Cards */}
        <div className="space-y-6 mb-10">
          {categories.map((cat) => {
            const isChecked = preferences[cat.id];
            return (
              <div
                key={cat.id}
                className="p-6 rounded-2xl bg-surface border border-borderMuted hover:border-accent/40 transition-colors duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="font-serif text-xl text-textPrimary">
                      {cat.name}
                    </h3>
                    {cat.locked && (
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-background text-textMuted border border-borderMuted">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                {/* Elegant Toggle Control */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    type="button"
                    disabled={cat.locked}
                    onClick={() => handleToggle(cat.id)}
                    aria-label={`Toggle ${cat.name}`}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer disabled:cursor-not-allowed ${
                      isChecked ? 'bg-accent' : 'bg-stone-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isChecked ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-mono uppercase text-textSecondary w-12 text-right">
                    {isChecked ? 'On' : 'Off'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="pt-6 border-t border-borderMuted flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleAcceptAll}
              className="px-5 py-2.5 rounded-full bg-surface hover:bg-surfaceLight text-textPrimary text-xs font-mono border border-borderMuted transition-all active:scale-95 cursor-pointer"
            >
              Accept All
            </button>
            <button
              onClick={handleRejectOptional}
              className="px-5 py-2.5 rounded-full bg-transparent hover:bg-secondary text-textSecondary hover:text-textPrimary text-xs font-mono border border-borderMuted transition-all active:scale-95 cursor-pointer"
            >
              Reject Optional
            </button>
          </div>

          <MagneticButton>
            <Button
              variant="primary"
              size="md"
              icon={Save}
              onClick={handleSave}
            >
              Save Preferences
            </Button>
          </MagneticButton>
        </div>
      </main>

      <Footer />
    </div>
  );
}
