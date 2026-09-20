import React, { useEffect, useRef } from 'react';
import SectionHeader from '../common/SectionHeader';
import { UserCheck, BrainCircuit, Search, FileText } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function HowItWorks() {
  const containerRef = useRef(null);
  const lineRef = useRef(null);

  const steps = [
    {
      number: '01',
      title: 'Planner Agent — Profile Intake & Verification',
      role: 'Compassionate Student Counsellor',
      description:
        'Analyzes Class 12 board marks, favorite subjects, intellectual passions, and constraints. Structures the raw student context into a coherent academic profile and registers session memory in SQLite.',
      icon: UserCheck,
    },
    {
      number: '02',
      title: 'Aptitude Agent — Psychometric & Stream Alignment',
      role: 'Career Strategist & Evaluator',
      description:
        'Evaluates academic readiness, determines the most fitting undergraduate degree, and computes a mathematical confidence score (0.0 to 1.0). If confidence falls below 0.65, our LangGraph router triggers a refinement loop.',
      icon: BrainCircuit,
    },
    {
      number: '03',
      title: 'Pathway Agent — Real-time Admissions Grounding',
      role: 'Educational Admissions Researcher',
      description:
        'Formulates targeted search parameters to query live entrance examination calendars (2025/2026), NIRF university rankings, fee structures, and verified central/state scholarship programs.',
      icon: Search,
    },
    {
      number: '04',
      title: 'Guidance Agent — Final Editorial Synthesis',
      role: 'Master Academic Mentor',
      description:
        'Synthesizes all deliberations into a comprehensive, printable career dossier featuring target degrees, entrance roadmaps, emerging skill prerequisites, and resilient parallel backup plans.',
      icon: FileText,
    },
  ];

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Dynamic progressive line drawing on scroll
      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleY: 0, transformOrigin: 'top center' },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 70%',
              end: 'bottom 80%',
              scrub: 1,
            },
          }
        );
      }

      // 2. Staggered reveal for timeline stages
      const stageCards = containerRef.current.querySelectorAll('.timeline-stage');
      stageCards.forEach((card, index) => {
        gsap.fromTo(
          card,
          { opacity: 0, x: 28 },
          {
            opacity: 1,
            x: 0,
            duration: 0.75,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 82%',
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="how-it-works" className="w-full py-24 bg-background overflow-hidden relative">
      <span id="methodology" className="absolute -top-24 pointer-events-none" />
      <div ref={containerRef} className="max-w-7xl mx-auto px-6">
        <SectionHeader
          tag="Agentic Architecture"
          title="Four specialized minds. One coherent recommendation."
          description="Unlike single-prompt conversational bots, CareerPilot coordinates four distinct agents via LangGraph. Each specialist contributes their domain expertise to form a verified career dossier."
          align="left"
        />

        {/* Vertical Editorial Timeline */}
        <div className="relative mt-16 max-w-4xl">
          {/* Background Track Line: Terminating cleanly at final stage icon */}
          <div className="absolute left-6 md:left-8 top-6 bottom-[88px] md:bottom-[80px] w-[2px] bg-borderMuted" />

          {/* Animated Progress Line */}
          <div
            ref={lineRef}
            className="absolute left-6 md:left-8 top-6 bottom-[88px] md:bottom-[80px] w-[2px] bg-accent z-0"
          />

          <div className="space-y-12">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="timeline-stage relative flex items-start gap-4 md:gap-6 group"
                >
                  {/* Step Node with hover micro-interaction */}
                  <div className="relative z-10 flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full bg-surface border-2 border-borderMuted flex items-center justify-center text-accent shadow-xs group-hover:scale-110 group-hover:border-accent transition-all duration-300">
                    <Icon className="w-5 h-5 md:w-6 md:h-6 stroke-[1.75] transition-transform duration-300 group-hover:rotate-6" />
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 pt-1 md:pt-2">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="font-mono text-xs text-textSecondary uppercase tracking-wider">
                        STAGE {step.number}
                      </span>
                      <span className="text-borderMuted">•</span>
                      <span className="text-xs font-mono font-medium text-accent bg-accent-light px-2.5 py-0.5 rounded border border-accent/20">
                        {step.role}
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl md:text-3xl text-textPrimary mb-3 group-hover:text-accent transition-colors duration-200">
                      {step.title}
                    </h3>

                    <p className="text-textSecondary text-sm md:text-base leading-relaxed max-w-2xl">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
