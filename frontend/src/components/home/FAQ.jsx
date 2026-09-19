import React, { useState, useRef, useEffect } from 'react';
import SectionHeader from '../common/SectionHeader';
import { Plus } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  const containerRef = useRef(null);

  const faqs = [
    {
      q: 'Which Class 12 education boards and streams are supported?',
      a: 'CareerPilot supports students from CBSE, CISCE (ISC), and all State Higher Secondary Boards across India. We provide specialized counseling tracks for PCM (Physics, Chemistry, Maths), PCB (Physics, Chemistry, Biology), Commerce (with or without Maths), and Arts & Humanities.',
    },
    {
      q: 'How does CareerPilot account for family budgets and state quotas?',
      a: 'During the assessment, students define their anticipated annual or total course budget and preferred geographic location. Our research agents cross-reference these inputs with government university fee caps (e.g., NITs, IITs, Central Universities) versus premier private colleges and highlight eligible state domicile cutoffs and scholarships.',
    },
    {
      q: 'What happens if a student has low marks or doubts about their stream?',
      a: 'If academic marks or interests conflict with traditional choices, the Aptitude Agent calculates an alignment confidence score. When confidence is below 0.65, our LangGraph router initiates a refinement loop to identify alternative high-growth applied degrees and parallel backup trajectories.',
    },
    {
      q: 'Is CareerPilot integrated with actual entrance exam dates and NIRF rankings?',
      a: 'Yes. The Pathway Agent utilizes Tavily real-time search to retrieve verified 2025/2026 entrance exam details (JEE Main/Advanced, NEET, CUET, CLAT, BITSAT, IPMAT) and NIRF-accredited institutions matching the student’s profile.',
    },
    {
      q: 'Is CareerPilot really 100% free for students?',
      a: 'Yes, absolutely. CareerPilot is an open public educational resource built to democratize high-grade academic guidance for Class 12 students across India. There are no paid subscriptions, hidden fees, locked features, or credit card requirements.',
    },
    {
      q: 'Can I print or save my final Career Guidance Report?',
      a: 'Yes. Every generated report is persisted in our SQLite database under a permanent session ID and can be printed as a clean, publication-grade A4 document or exported for family discussions and school counselors.',
    },
  ];

  const toggle = (idx) => {
    setOpenIndex((prev) => (prev === idx ? -1 : idx));
  };

  // Scroll reveal on viewport entrance
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const items = containerRef.current.querySelectorAll('.faq-item');
      gsap.fromTo(
        items,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="faq" className="w-full py-24 bg-background border-t border-borderMuted">
      <div ref={containerRef} className="max-w-4xl mx-auto px-6">
        <SectionHeader
          tag="FACTUAL QUESTIONS"
          title="Frequently asked questions."
          description="Straightforward answers about our counseling methodology, data grounding, and student privacy."
          align="left"
        />

        <div className="mt-4 text-xs font-mono text-textMuted">
          Last updated: September 2026
        </div>

        <div className="divide-y divide-borderMuted border-y border-borderMuted mt-8">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="faq-item py-6 transition-colors duration-200">
                <button
                  onClick={() => toggle(idx)}
                  data-cursor={isOpen ? 'Close' : 'Read'}
                  className="w-full flex items-center justify-between text-left gap-6 group focus:outline-hidden cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif text-xl sm:text-2xl text-textPrimary group-hover:text-accent transition-colors duration-200">
                    {faq.q}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-full border border-borderMuted flex items-center justify-center text-textSecondary transition-all duration-300 group-hover:border-accent/40 ${
                      isOpen
                        ? 'rotate-45 bg-charcoal text-white border-charcoal shadow-xs'
                        : 'bg-surface hover:bg-surfaceLight rotate-0'
                    }`}
                  >
                    <Plus className="w-4 h-4 stroke-[2]" />
                  </div>
                </button>

                {/* Notion-style smooth grid height accordion */}
                <div
                  className={`grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isOpen
                      ? 'grid-rows-[1fr] opacity-100 mt-4'
                      : 'grid-rows-[0fr] opacity-0 mt-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-textSecondary text-sm sm:text-base leading-relaxed pr-8 pb-2">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
