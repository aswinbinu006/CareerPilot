import React, { useEffect, useRef } from 'react';
import { Target, CheckCircle2 } from 'lucide-react';
import gsap from 'gsap';

export default function BestCareerMatch({ recommendation, confidence }) {
  const degree = recommendation?.recommended_degree || 'Undergraduate Recommendation';
  const stream = recommendation?.career_stream || recommendation?.stream || 'Class 12 Pathway';
  const reasoning = recommendation?.reasoning || recommendation?.rationale || '';
  const jobRoles = Array.isArray(recommendation?.primary_job_roles) ? recommendation.primary_job_roles : [];
  
  const rawConfidence = typeof confidence === 'number' && confidence > 0 
    ? confidence 
    : typeof recommendation?.confidence === 'number' && recommendation.confidence > 0 
    ? recommendation.confidence 
    : null;

  const confidencePercent = rawConfidence !== null ? Math.round(rawConfidence * 100) : null;

  const containerRef = useRef(null);
  const counterRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => {
    if (confidencePercent === null) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // Counter animation
      if (counterRef.current) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: confidencePercent,
          duration: 1.2,
          ease: 'power2.out',
          onUpdate: () => {
            if (counterRef.current) {
              counterRef.current.textContent = `${Math.round(obj.val)}%`;
            }
          },
        });
      }

      // Progress bar fill animation
      if (barRef.current) {
        gsap.fromTo(
          barRef.current,
          { width: '0%' },
          { width: `${confidencePercent}%`, duration: 1.3, ease: 'power2.out', delay: 0.1 }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [confidencePercent]);

  return (
    <div
      ref={containerRef}
      className="w-full p-8 rounded-2xl bg-surface border border-borderMuted mb-10 shadow-xs hover:border-accent/40 transition-all duration-300"
    >
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent mb-2">
            <Target className="w-3.5 h-3.5" />
            <span>PRIMARY DEGREE RECOMMENDATION</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-textPrimary leading-tight mb-2">
            {degree}
          </h2>
          <span className="inline-block text-xs font-mono text-textSecondary uppercase tracking-wider bg-background px-3 py-1 rounded border border-borderMuted">
            {stream}
          </span>
        </div>

        {/* Confidence Indicator with GSAP Counter */}
        <div className="lg:w-48 p-4 rounded-xl bg-background border border-borderMuted flex flex-col justify-between flex-shrink-0 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-mono text-textSecondary mb-2">
            <span>Aptitude Match</span>
            <span ref={counterRef} className="font-semibold text-textPrimary">
              {confidencePercent !== null ? `${confidencePercent}%` : '—'}
            </span>
          </div>
          <div className="w-full h-2 bg-surface rounded-full overflow-hidden mb-2">
            <div
              ref={barRef}
              className="h-full bg-accent rounded-full shadow-[0_0_6px_rgba(74,92,70,0.4)]"
              style={{ width: confidencePercent !== null ? `${confidencePercent}%` : '0%' }}
            />
          </div>
          <span className="text-[10px] font-mono text-textMuted">
            {confidencePercent !== null
              ? confidencePercent >= 80
                ? 'High Correlation'
                : 'Balanced Correlation'
              : 'Confidence is being calculated'}
          </span>
        </div>
      </div>

      {/* Rationale */}
      {reasoning ? (
        <p className="text-textSecondary text-sm sm:text-base leading-relaxed mb-6">
          {reasoning}
        </p>
      ) : null}

      {/* Primary Job Roles */}
      {jobRoles.length > 0 && (
        <div className="pt-6 border-t border-borderMuted/60">
          <span className="block text-xs font-mono text-textSecondary uppercase tracking-wider mb-3">
            Primary Career Outcomes
          </span>
          <div className="flex flex-wrap gap-2">
            {jobRoles.map((role, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-background border border-borderMuted text-xs font-medium text-textPrimary hover:border-accent/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                <span>{role}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
