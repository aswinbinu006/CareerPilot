import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { TrendingUp, ShieldCheck, Activity } from 'lucide-react';

/**
 * Editorial floating trend callouts with sinusoidal ambient drift.
 * Designed to feel like physical printed cards gently suspended in space.
 */
export default function FloatingTrendCards() {
  const card1Ref = useRef(null);
  const card2Ref = useRef(null);
  const card3Ref = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const cards = [
      { ref: card1Ref, yOffset: 7, rot: 1.2, duration: 4.2, delay: 0 },
      { ref: card2Ref, yOffset: -8, rot: -1.4, duration: 4.8, delay: 0.6 },
      { ref: card3Ref, yOffset: 6, rot: 0.9, duration: 5.2, delay: 1.2 },
    ];

    const tweens = cards.map(({ ref, yOffset, rot, duration, delay }) => {
      if (!ref.current) return null;
      return gsap.to(ref.current, {
        y: yOffset,
        rotateZ: rot,
        duration: duration,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: delay,
      });
    });

    return () => {
      tweens.forEach((t) => t && t.kill());
    };
  }, []);

  return (
    <div className="relative w-full max-w-7xl mx-auto px-6 py-6 no-print">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Trend Card 1 */}
        <div
          ref={card1Ref}
          data-cursor="Trend"
          className="p-4 rounded-2xl bg-surface/90 backdrop-blur-xs border border-borderMuted shadow-xs hover:shadow-md transition-shadow duration-300 flex items-start gap-3.5"
        >
          <div className="w-8 h-8 rounded-xl bg-accent-light border border-accent/20 flex items-center justify-center text-accent flex-shrink-0">
            <TrendingUp className="w-4 h-4 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs font-mono text-textSecondary tracking-wide mb-0.5">
              <span>PCM & Computing</span>
              <span className="text-accent font-semibold">+35% Hiring</span>
            </div>
            <p className="text-sm font-serif text-textPrimary font-normal truncate">
              AI Infrastructure & Computational Systems
            </p>
          </div>
        </div>

        {/* Trend Card 2 */}
        <div
          ref={card2Ref}
          data-cursor="Trend"
          className="p-4 rounded-2xl bg-surface/90 backdrop-blur-xs border border-borderMuted shadow-xs hover:shadow-md transition-shadow duration-300 flex items-start gap-3.5"
        >
          <div className="w-8 h-8 rounded-xl bg-accent-light border border-accent/20 flex items-center justify-center text-accent flex-shrink-0">
            <ShieldCheck className="w-4 h-4 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs font-mono text-textSecondary tracking-wide mb-0.5">
              <span>Commerce & Law</span>
              <span className="text-accent font-semibold">+42% Growth</span>
            </div>
            <p className="text-sm font-serif text-textPrimary font-normal truncate">
              Cyber Law, Fintech & Corporate Compliance
            </p>
          </div>
        </div>

        {/* Trend Card 3 */}
        <div
          ref={card3Ref}
          data-cursor="Trend"
          className="p-4 rounded-2xl bg-surface/90 backdrop-blur-xs border border-borderMuted shadow-xs hover:shadow-md transition-shadow duration-300 flex items-start gap-3.5"
        >
          <div className="w-8 h-8 rounded-xl bg-accent-light border border-accent/20 flex items-center justify-center text-accent flex-shrink-0">
            <Activity className="w-4 h-4 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs font-mono text-textSecondary tracking-wide mb-0.5">
              <span>PCB & Healthcare</span>
              <span className="text-accent font-semibold">+28% Demand</span>
            </div>
            <p className="text-sm font-serif text-textPrimary font-normal truncate">
              Biomedical Genomics & Allied Clinical Care
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
