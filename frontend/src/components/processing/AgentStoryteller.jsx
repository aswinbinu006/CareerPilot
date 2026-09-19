import React, { useEffect, useState, useRef } from 'react';
import { UserCheck, BrainCircuit, Search, FileText, Check, Clock } from 'lucide-react';
import gsap from 'gsap';

export default function AgentStoryteller({ studentName = 'Student' }) {
  const [activeStage, setActiveStage] = useState(0);
  const containerRef = useRef(null);
  const lineProgressRef = useRef(null);

  const stages = [
    {
      id: 'planner',
      name: 'Planner Agent',
      action: 'Structuring Academic Profile & Intake',
      detail: `Consolidating 12th stream credentials, favorite subjects, and financial parameters for ${studentName}.`,
      icon: UserCheck,
      duration: '3-4s',
    },
    {
      id: 'aptitude',
      name: 'Aptitude Agent',
      action: 'Evaluating Psychometric Strengths & Degree Fit',
      detail: 'Analyzing academic alignment, calculating confidence score, and validating cutoff thresholds.',
      icon: BrainCircuit,
      duration: '4-5s',
    },
    {
      id: 'pathway',
      name: 'Pathway Agent',
      action: 'Researching 2025/2026 Entrance Exams & Institutions',
      detail: 'Executing real-time searches for NTA calendars, NIRF accredited colleges, state quotas, and scholarships.',
      icon: Search,
      duration: '4-5s',
    },
    {
      id: 'guidance',
      name: 'Guidance Agent',
      action: 'Synthesizing Four-Year Actionable Dossier',
      detail: 'Drafting publication-grade recommendations, skills roadmap, semester milestones, and parallel backups.',
      icon: FileText,
      duration: '3-4s',
    },
  ];

  // Advance stages to communicate progressive mechanical deliberation
  useEffect(() => {
    const timer1 = setTimeout(() => setActiveStage(1), 3200);
    const timer2 = setTimeout(() => setActiveStage(2), 7500);
    const timer3 = setTimeout(() => setActiveStage(3), 12500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // GSAP animation for connecting line and checkmark pop
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // Fluid height transition on the connecting line
      if (lineProgressRef.current) {
        const targetPercent = ((activeStage + 1) / stages.length) * 100;
        gsap.to(lineProgressRef.current, {
          height: `${targetPercent}%`,
          duration: 0.8,
          ease: 'power2.out',
        });
      }

      // Gentle checkmark entrance for active stage
      const activeNode = containerRef.current.querySelector(`.node-${activeStage}`);
      if (activeNode) {
        gsap.fromTo(
          activeNode,
          { scale: 0.85 },
          { scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [activeStage]);

  return (
    <div ref={containerRef} className="w-full max-w-2xl mx-auto py-12 px-6">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-borderMuted text-xs font-mono text-textSecondary mb-4">
          <Clock className="w-3.5 h-3.5 text-accent animate-spin" />
          <span>Deliberative Agentic Pipeline Active</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl text-textPrimary mb-2">
          Consulting the Academic Advisory Board
        </h2>
        <p className="text-textSecondary text-sm max-w-md mx-auto leading-relaxed">
          Four specialist agents are sequentially evaluating your 12th profile, university requirements, and career trajectory.
        </p>
      </div>

      {/* Storytelling Timeline */}
      <div className="relative pl-6 md:pl-8 space-y-8">
        {/* Continuous Connecting Line Background */}
        <div className="absolute left-2.5 md:left-3.5 top-4 bottom-4 w-[2px] bg-borderMuted rounded-full">
          {/* Animated Connecting Line Fill */}
          <div
            ref={lineProgressRef}
            className="w-full bg-accent rounded-full shadow-[0_0_8px_rgba(74,92,70,0.35)]"
            style={{
              height: `${((activeStage + 1) / stages.length) * 100}%`,
            }}
          />
        </div>

        {stages.map((stage, idx) => {
          const isComplete = idx < activeStage;
          const isCurrent = idx === activeStage;
          const isUpcoming = idx > activeStage;
          const Icon = stage.icon;

          return (
            <div
              key={stage.id}
              className={`relative transition-all duration-500 ${
                isUpcoming ? 'opacity-40 translate-x-1' : 'opacity-100 translate-x-0'
              }`}
            >
              {/* Checkpoint Node */}
              <div
                className={`node-${idx} absolute -left-6 md:-left-8 top-1 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  isComplete
                    ? 'bg-accent border-accent text-white shadow-xs'
                    : isCurrent
                    ? 'bg-surface border-accent text-accent animate-pulse shadow-xs ring-4 ring-accent/15'
                    : 'bg-background border-borderMuted text-transparent'
                }`}
              >
                {isComplete ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Stage Card */}
              <div
                className={`p-5 rounded-2xl border transition-all duration-300 ${
                  isCurrent
                    ? 'bg-surface border-accent/60 shadow-md translate-x-1'
                    : 'bg-background border-borderMuted hover:border-borderMuted/80'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-textSecondary uppercase tracking-wide">
                      STAGE 0{idx + 1}
                    </span>
                    <span className="text-borderMuted">•</span>
                    <span className="font-semibold text-xs text-textPrimary">
                      {stage.name}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                      isComplete
                        ? 'text-accent bg-accent-light'
                        : isCurrent
                        ? 'text-textPrimary bg-secondary font-semibold'
                        : 'text-textMuted'
                    }`}
                  >
                    {isComplete ? 'COMPLETED' : isCurrent ? 'DELIBERATING...' : 'QUEUED'}
                  </span>
                </div>

                <h3 className="font-serif text-lg text-textPrimary mb-1">
                  {stage.action}
                </h3>
                <p className="text-xs text-textSecondary leading-relaxed">
                  {stage.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
