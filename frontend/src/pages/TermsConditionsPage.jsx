import React, { useEffect, useRef } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { Scale, AlertTriangle, FileText } from 'lucide-react';
import gsap from 'gsap';

export default function TermsConditionsPage() {
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
    { id: 'eligibility', title: '1. User Eligibility' },
    { id: 'free-charter', title: '2. Free Educational Access & No Fees' },
    { id: 'user-responsibilities', title: '3. Student Responsibilities' },
    { id: 'ai-disclaimer', title: '4. AI Advisory & Counseling Disclaimer' },
    { id: 'intellectual-property', title: '5. Intellectual Property & Dossiers' },
    { id: 'account-suspension', title: '6. Account Security & Suspension' },
    { id: 'liability', title: '7. Limitation of Liability' },
    { id: 'contact', title: '8. Governing Jurisdiction & Contact' },
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
            <Scale className="w-3.5 h-3.5" />
            <span>TERMS OF ENGAGEMENT • 2026 EDITION</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-textPrimary leading-tight mb-4">
            Terms & Conditions of Advisory Service
          </h1>
          <p className="text-textSecondary text-sm sm:text-base leading-relaxed">
            Please read these terms carefully before utilizing the CareerPilot multi-agent advisory framework. By initiating an assessment or generating a career dossier, you acknowledge these operational terms and counseling limitations.
          </p>
          <div className="mt-4 text-xs font-mono text-textMuted">
            Last updated: September 2026
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Table of Contents */}
          <aside className="lg:col-span-4 sticky top-28 hidden lg:block p-6 rounded-2xl bg-surface border border-borderMuted">
            <span className="text-xs font-mono uppercase tracking-widest text-textSecondary block mb-4">
              Contract Navigation
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
              Formal agreement between student/guardian and CareerPilot Advisory.
            </div>
          </aside>

          {/* Legal Clauses */}
          <article className="lg:col-span-8 space-y-12 text-sm sm:text-base text-textSecondary leading-relaxed font-sans">
            <section id="eligibility" className="scroll-mt-28">
              <h2 className="font-serif text-2xl sm:text-3xl text-textPrimary mb-3">
                1. User Eligibility
              </h2>
              <p>
                CareerPilot is calibrated specifically for secondary school students (Grades 10 through 12) and recent high school graduates seeking undergraduate admissions guidance. If you are under 18 years of age, you affirm that you have reviewed these terms with a parent or legal guardian.
              </p>
            </section>

            <section id="free-charter" className="scroll-mt-28 p-6 rounded-2xl bg-accent-light/40 border border-accent/20">
              <h2 className="font-serif text-2xl sm:text-3xl text-textPrimary mb-3">
                2. Free Educational Access & Zero Monetization Policy
              </h2>
              <p className="text-textPrimary">
                CareerPilot is 100% free of charge for all students, parents, and high school counselors. We do not operate paid tiers, subscriptions, paywalls, premium unlocked reports, or checkout obligations. All student dossiers, psychometric analyses, AI-powered roadmaps, and college cutoff matches are provided openly without financial cost or commercial solicitation.
              </p>
            </section>

            <section id="user-responsibilities" className="scroll-mt-28">
              <h2 className="font-serif text-2xl sm:text-3xl text-textPrimary mb-3">
                3. Student Responsibilities & Data Accuracy
              </h2>
              <p>
                Our agentic models compute cutoff projections and recommendation confidence scores directly from your inputted board marks, stream affinities, and budgetary constraints. Providing fabricated marks or conflicting stream credentials directly impairs the reliability of the resulting career dossier.
              </p>
            </section>

            <section id="ai-disclaimer" className="scroll-mt-28 p-6 rounded-2xl bg-surface border border-borderMuted">
              <div className="flex items-center gap-2 text-accent font-mono text-xs uppercase tracking-wider mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Critical Counseling Disclaimer</span>
              </div>
              <h2 className="font-serif text-2xl text-textPrimary mb-3">
                4. AI-Generated Recommendations Disclaimer
              </h2>
              <p className="text-sm leading-relaxed mb-3">
                CareerPilot utilizes an agentic ensemble (LangGraph, Groq Llama-3.3, and Tavily search) to synthesize academic recommendations. While our algorithms query current NIRF rankings, NTA exam dates, and state eligibility thresholds, recommendations constitute <strong>deliberative guidance rather than a guarantee of admission or employment</strong>.
              </p>
              <p className="text-xs text-textSecondary leading-relaxed">
                Final university cutoffs are determined independently by respective university admission authorities (JoSAA, MCC, CSAS, CLAT Consortium). Students are advised to verify critical application deadlines on official government portals.
              </p>
            </section>

            <section id="intellectual-property" className="scroll-mt-28">
              <h2 className="font-serif text-2xl sm:text-3xl text-textPrimary mb-3">
                5. Intellectual Property & Dossier Rights
              </h2>
              <p>
                The underlying agent orchestrations, evaluation schemas, four-year milestone designs, and platform typography are the proprietary intellectual property of CareerPilot. Generated career dossiers are licensed to the individual student for personal educational and family counseling use.
              </p>
            </section>

            <section id="account-suspension" className="scroll-mt-28">
              <h2 className="font-serif text-2xl sm:text-3xl text-textPrimary mb-3">
                6. Account Security & Abuse Prevention
              </h2>
              <p>
                Users agree not to scrape, reverse-engineer, automated-probe, or subject our backend API endpoints to denial-of-service attempts. Accounts engaging in credential stuffing or automated script executions will be suspended immediately without notice.
              </p>
            </section>

            <section id="liability" className="scroll-mt-28">
              <h2 className="font-serif text-2xl sm:text-3xl text-textPrimary mb-3">
                7. Limitation of Liability
              </h2>
              <p>
                To the fullest extent permitted by applicable law, CareerPilot and its academic contributors shall not be liable for any indirect, consequential, or incidental decisions resulting from college admissions choices or examination results.
              </p>
            </section>

            <section id="contact" className="scroll-mt-28 pt-6 border-t border-borderMuted">
              <h2 className="font-serif text-2xl sm:text-3xl text-textPrimary mb-3">
                8. Governing Jurisdiction & Contact
              </h2>
              <p className="mb-4">
                These terms are governed by the laws of India. For disputes or contractual clarifications, contact:
              </p>
              <div className="p-4 rounded-xl bg-surface border border-borderMuted font-mono text-xs text-textPrimary space-y-1">
                <div>Legal Advisory Cell • CareerPilot Technologies</div>
                <div>Email: legal@careerpilot.advisory</div>
              </div>
            </section>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
