import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * 3-4px high-end scroll progress indicator anchored at the top of the viewport.
 * Dynamically tracks document progress and hides automatically on processing screens.
 */
export default function ScrollProgressBar() {
  const barRef = useRef(null);
  const location = useLocation();

  // Hide on processing screen as requested
  const isHidden = location.pathname.startsWith('/processing');

  useEffect(() => {
    if (isHidden || !barRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const bar = barRef.current;
    
    // Reset initial scale
    gsap.set(bar, { scaleX: 0, transformOrigin: 'left center' });

    const trigger = ScrollTrigger.create({
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        gsap.to(bar, {
          scaleX: self.progress,
          duration: 0.1,
          ease: 'power1.out',
          overwrite: 'auto',
        });
      },
    });

    return () => {
      trigger.kill();
    };
  }, [location.pathname, isHidden]);

  if (isHidden) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[3.5px] z-50 pointer-events-none bg-transparent"
    >
      <div
        ref={barRef}
        className="w-full h-full bg-accent shadow-[0_1px_8px_rgba(74,92,70,0.35)]"
        style={{ transform: 'scaleX(0)', transformOrigin: 'left center' }}
      />
    </div>
  );
}
