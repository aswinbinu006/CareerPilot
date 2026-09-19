import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Editorial ambient background with slow drifting light gradients.
 * Barely perceptible (3-5% opacity), adding warmth and tactile breathability.
 */
export default function AnimatedBackground() {
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const orb3Ref = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Slow ambient drifting light gradients (20-30s periods)
    const t1 = gsap.to(orb1Ref.current, {
      x: 60,
      y: 80,
      scale: 1.15,
      duration: 22,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    const t2 = gsap.to(orb2Ref.current, {
      x: -70,
      y: -50,
      scale: 1.2,
      duration: 26,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 2,
    });

    const t3 = gsap.to(orb3Ref.current, {
      x: 40,
      y: -60,
      scale: 0.9,
      duration: 30,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 5,
    });

    return () => {
      t1.kill();
      t2.kill();
      t3.kill();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
    >
      {/* Drifting Soft Sage Light */}
      <div
        ref={orb1Ref}
        className="absolute -top-[15%] -left-[10%] w-[650px] h-[650px] rounded-full bg-accent/4 blur-[130px] will-change-transform"
      />

      {/* Drifting Warm Sand Glow */}
      <div
        ref={orb2Ref}
        className="absolute top-[40%] -right-[15%] w-[700px] h-[700px] rounded-full bg-[#E5DFD3]/25 dark:bg-accent/8 blur-[150px] will-change-transform"
      />

      {/* Gentle Bottom Amber/Stone Glow */}
      <div
        ref={orb3Ref}
        className="absolute -bottom-[20%] left-[20%] w-[600px] h-[600px] rounded-full bg-accent/3 blur-[140px] will-change-transform"
      />
    </div>
  );
}
