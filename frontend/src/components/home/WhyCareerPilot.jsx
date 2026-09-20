import React, { useEffect, useRef } from 'react';
import SectionHeader from '../common/SectionHeader';
import { Compass, BookOpen, Scale } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function WhyCareerPilot() {
  const containerRef = useRef(null);

  const pillars = [
    {
      icon: Compass,
      title: 'Navigating Cross-Stream Uncertainty',
      tag: 'THE DILEMMA',
      description:
        'Following Class 12 board results, thousands of students feel trapped between societal expectations, parental advice, and their genuine intellectual interests. Without structured clarity, decisions are often driven by panic rather than personal aptitude.',
    },
    {
      icon: Scale,
      title: 'Grounding Ambitions in Reality',
      tag: 'PRACTICAL REALISM',
      description:
        'True career guidance cannot ignore financial constraints or competitive entrance realities. CareerPilot systematically evaluates annual fee budgets, preferred geographic locations, and verified exam timelines before suggesting any institution.',
    },
    {
      icon: BookOpen,
      title: 'Building a Four-Year Runway',
      tag: 'LONG-TERM CLARITY',
      description:
        'A degree title alone is insufficient for modern industry careers. We design an actionable, year-by-year skill roadmap from foundational year-one courses to final-year capstones, high-ROI internships, and resilient backup degrees.',
    },
  ];

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const cards = containerRef.current.querySelectorAll('.pillar-card');
      gsap.fromTo(
        cards,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.14,
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
    <section id="why-careerpilot" className="w-full py-24 bg-secondary/50 border-y border-borderMuted">
      <div ref={containerRef} className="max-w-7xl mx-auto px-6">
        <SectionHeader
          tag="THE ADVISORY CHALLENGE"
          title="Designed for students standing at the crossroads of their future."
          description="Career decision-making in Class 12 has traditionally relied on fragmented internet forums or biased coaching advertisements. We replace confusion with deliberate, verifiable counseling."
          align="left"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                data-cursor="Read"
                className="pillar-card p-8 rounded-2xl bg-surface border border-borderMuted transition-all duration-300 hover:border-accent/50 hover:shadow-xl hover:-translate-y-1.5 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 rounded-xl bg-background border border-borderMuted flex items-center justify-center text-accent transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-2xs">
                      <Icon className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <span className="text-xs font-mono tracking-wider text-textSecondary px-2.5 py-1 rounded bg-secondary">
                      {pillar.tag}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl text-textPrimary mb-3 leading-snug group-hover:text-accent transition-colors duration-200">
                    {pillar.title}
                  </h3>

                  <p className="text-textSecondary text-sm leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-borderMuted/60 text-xs font-mono text-textMuted flex items-center justify-between">
                  <span>Phase 0{idx + 1}</span>
                  <span className="group-hover:text-textPrimary transition-colors">Counseling Principle</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
