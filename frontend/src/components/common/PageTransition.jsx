import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { getLenis } from '../../hooks/useLenis';

/**
 * Editorial page transition wrapper with GSAP.
 * Seamless subtle fade & upward translation without harsh wipes.
 */
export default function PageTransition({ children }) {
  const containerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    // Scroll window / Lenis to top on route change
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 14 },
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: 'power2.out',
        clearProps: 'transform',
      }
    );
  }, [location.pathname]);

  return (
    <div ref={containerRef} className="w-full flex-1 flex flex-col will-change-transform">
      {children}
    </div>
  );
}
