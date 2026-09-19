import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Keep a singleton reference so components can scroll smoothly when needed
let lenisInstance = null;

export function getLenis() {
  return lenisInstance;
}

/**
 * Initializes Lenis smooth scrolling and synchronizes it with GSAP ScrollTrigger.
 * Produces the Apple/Linear inertial scrolling feel with 60fps performance.
 */
export function useLenis() {
  const lenisRef = useRef(null);

  useEffect(() => {
    // Respect user preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    try {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.95,
        touchMultiplier: 1.5,
        infinite: false,
      });

      lenisRef.current = lenis;
      lenisInstance = lenis;

      // Connect Lenis scroll event to GSAP ScrollTrigger
      lenis.on('scroll', ScrollTrigger.update);

      // Synchronize Lenis animation frames through GSAP's high-precision ticker
      const tickerCallback = (time) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);

      return () => {
        gsap.ticker.remove(tickerCallback);
        lenis.destroy();
        lenisInstance = null;
      };
    } catch (err) {
      console.warn('Lenis smooth scroll initialization safely bypassed:', err);
    }
  }, []);

  return lenisRef;
}
