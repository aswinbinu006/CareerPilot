import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Hook to apply gentle editorial fade-up animations on elements.
 */
export function useGSAPReveal(deps = []) {
  const elementRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !elementRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elementRef.current,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          stagger: 0.08,
        }
      );
    }, elementRef);

    return () => ctx.revert();
  }, deps);

  return elementRef;
}
