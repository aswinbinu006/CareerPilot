import React, { useEffect, useRef } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { Shield, ArrowUpRight, Lock, CheckCircle2 } from 'lucide-react';
import gsap from 'gsap';

export default function PrivacyPolicyPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    );
  }, []);

  const sections = [
    { id: 'information-collected', title: '1. Information We Collect' },
    { id: 'academic-information', title: '2. Academic & Stream Records' },
    { id: 'assessment-data', title: '3. Advisory Assessment Telemetry' },
    { id: 'cookies-tracking', title: '4. Essential Cookies & Local State' },
    { id: 'data-storage', title: '5. Data Persistence & Cryptography' },
    { id: 'third-party', title: '6. Third-Party Search & LLM Grounding' },
    { id: 'user-rights', title: '7. Student & Parental Rights' },
    { id: 'contact', title: '8. Data Governance Contact' },
  ];

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-textPrimary">
      <Navbar />

      <main ref={containerRef} className="flex-1 max-w-7xl w-full mx-auto px-6 py-14">
        {/* Header */}
        <div className="max-w-3xl mb-12 pb-8 border-b border-borderMuted">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-borderMuted text-xs font-mono text-accent mb-4">
            <Shield className="w-3.5 h-3.5" />
            <span>LEGAL DOSSIER • COMPLIANCE 2026</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-textPrimary leading-tight mb-4">
            Privacy Policy & Data Ethics
          </h1>
          <p className="text-textSecondary text-sm sm:text-base leading-relaxed">
            CareerPilot operates with strict fiduciary restraint regarding Class 12 student data. This policy details how academic metrics, psychometric scores, and family financial constraints are processed and shielded from commercial marketing brokers.
          </p>
          <div className="mt-4 text-xs font-mono text-textMuted">
            Last updated: September 2026
          </div>
        </div>

        {/* Layout with Sticky Table of Contents */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Sticky Table of Contents */}
          <aside className="lg:col-span-4 sticky top-28 hidden lg:block p-6 rounded-2xl bg-surface border border-borderMuted">
            <span className="text-xs font-mono uppercase tracking-widest text-textSecondary block mb-4">
              Table of Contents
            </span>
            <nav className="space-y-2 text-xs font-mono">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className="w-full text-left py-1 text-textSecondary hover:text-accent hover:translate-x-1 transition-all cursor-pointer block truncate"
                >
                  {sec.title}
                </button>
              ))}
            </nav>
            <div className="mt-6 pt-6 border-t border-borderMuted/80 text-[11px] text-textMuted leading-normal">
              Questions regarding minors (under 18) are prioritized by our Compliance Officer.
            </div>
          </aside>

          {/* Policy Clauses */}
          <article className="lg:col-span-8 space-y-12 text-sm sm:text-base text-textSecondary leading-relaxed font-sans">
            <section id="information-collected" className="scroll-mt-28">
              <h2 className="font-serif text-2xl sm:text-3xl text-textPrimary mb-3">
                1. Information We Collect
              </h2>
              <p className="mb-3">
                When you create an account or initiate a counseling session, we collect identifiers including your full name, email address, password hash (SHA-256 with salting), and voluntary demographic indicators. We do not require national identity numbers (Aadhaar or PAN) for counseling evaluation. Because CareerPilot is 100% free for all students, we never request, collect, or store credit cards, bank accounts, or financial payment details.
              </p>
            </section>

            <section id="academic-information" className="scroll-mt-28">
              <h2 className="font-serif text-2xl sm:text-3xl text-textPrimary mb-3">
                2. Academic & Stream Records
              </h2>
              <p className="mb-3">
                Our Planner Agent processes self-reported academic metrics: board examination marks (Class 10/12 percentage), stream specialization (PCM, PCB, Commerce, Arts), preferred elective subjects, and intellectual affinities. These records are isolated per session and never sold to private coaching consortiums.
              </p>
            </section>

            <section id="assessment-data" className="scroll-mt-28">
              <h2 className="font-serif text-2xl sm:text-3xl text-textPrimary mb-3">
                3. Advisory Assessment Telemetry
              </h2>
              <p className="mb-3">
                The evaluation scores produced by the Aptitude Agent (including alignment confidence ratios, reasoning traces, and degree recommendations) are stored to enable reproducible counseling dossiers. Students retain the right to delete historical evaluation runs at any time via Profile Settings.
              </p>
            </section>

            <section id="cookies-tracking" className="scroll-mt-28">
              <h2 className="font-serif text-2xl sm:text-3xl text-textPrimary mb-3">
                4. Essential Cookies & Local State
              </h2>
              <p className="mb-3">
                We use strictly functional cookies and sessionStorage to preserve your multi-step assessment draft so progress is not lost upon accidental browser refresh. Optional telemetry cookies can be toggled through our <a href="/cookies" className="text-accent underline">Cookie Preference Center</a>.
              </p>
            </section>

            <section id="data-storage" className="scroll-mt-28">
              <h2 className="font-serif text-2xl sm:text-3xl text-textPrimary mb-3">
                5. Data Persistence & Cryptography
              </h2>
              <p className="mb-3">
                Dossier records are committed to localized SQLite storage with encryption-at-rest. Communications with our FastAPI backend and Groq LLM inference pipelines are strictly routed via TLS 1.3 encrypted conduits.
              </p>
            </section>

            <section id="third-party" className="scroll-mt-28">
              <h2 className="font-serif text-2xl sm:text-3xl text-textPrimary mb-3">
                6. Third-Party Search & LLM Grounding
              </h2>
              <p className="mb-3">
                Real-time admissions data is retrieved via Tavily Search using anonymized query vectors (e.g. "NIRF cutoffs B.Tech 2026"). No personal student identifiers are transmitted to third-party search engines or model providers.
              </p>
            </section>

            <section id="user-rights" className="scroll-mt-28">
              <h2 className="font-serif text-2xl sm:text-3xl text-textPrimary mb-3">
                7. Student & Parental Rights
              </h2>
              <p className="mb-3">
                Under Digital Personal Data Protection standards, students and guardians have the right to request an export of all recorded assessment sessions, rectify erroneous academic marks, or mandate complete deletion of their user profile.
              </p>
            </section>

            <section id="contact" className="scroll-mt-28 pt-6 border-t border-borderMuted">
              <h2 className="font-serif text-2xl sm:text-3xl text-textPrimary mb-3">
                8. Data Governance Contact
              </h2>
              <p className="mb-4">
                To exercise your privacy rights or contact our designated Data Protection Officer, write to:
              </p>
              <div className="p-4 rounded-xl bg-surface border border-borderMuted font-mono text-xs text-textPrimary space-y-1">
                <div>Office of Data Ethics • CareerPilot Educational Technologies</div>
                <div>Email: privacy@careerpilot.advisory</div>
                <div>Response SLA: Within 48 hours for student account queries</div>
              </div>
            </section>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
