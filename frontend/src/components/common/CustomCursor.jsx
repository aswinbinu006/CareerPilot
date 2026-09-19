import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/**
 * Desktop-only luxury custom cursor with GSAP quickTo physics.
 * Subtle, fluid, and non-obtrusive: never covers or obstructs text content.
 */
export default function CustomCursor() {
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Strictly desktop only
    const checkTouch = () => {
      return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
      );
    };

    if (checkTouch()) {
      setIsTouchDevice(true);
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const dot = cursorDotRef.current;
    const ring = cursorRingRef.current;
    if (!dot || !ring) return;

    // High performance GSAP quickTo setters
    const setDotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3.out' });
    const setDotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3.out' });
    const setRingX = gsap.quickTo(ring, 'x', { duration: 0.22, ease: 'power2.out' });
    const setRingY = gsap.quickTo(ring, 'y', { duration: 0.22, ease: 'power2.out' });

    let isMouseInView = false;

    const onMouseMove = (e) => {
      if (!isMouseInView) {
        isMouseInView = true;
        setIsVisible(true);
      }
      setDotX(e.clientX);
      setDotY(e.clientY);
      setRingX(e.clientX);
      setRingY(e.clientY);

      // Detect interactive targets (buttons, links, inputs)
      const target = e.target;
      const interactiveEl = target.closest('a, button, [role="button"], input, select, textarea');

      if (interactiveEl) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const onMouseLeave = () => {
      isMouseInView = false;
      setIsVisible(false);
    };

    const onMouseDown = () => {
      gsap.to(ring, { scale: 0.8, duration: 0.15 });
    };

    const onMouseUp = () => {
      gsap.to(ring, { scale: isHovered ? 1.3 : 1, duration: 0.2 });
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isHovered]);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Precision Center Dot */}
      <div
        ref={cursorDotRef}
        aria-hidden="true"
        className={`fixed top-0 left-0 -ml-1 -mt-1 w-2 h-2 rounded-full bg-accent pointer-events-none z-50 transition-opacity duration-200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        } ${isHovered ? 'scale-0' : 'scale-100'}`}
        style={{ willChange: 'transform' }}
      />

      {/* Fluid Subtle Ambient Ring */}
      <div
        ref={cursorRingRef}
        aria-hidden="true"
        className={`fixed top-0 left-0 pointer-events-none z-50 rounded-full flex items-center justify-center transition-all duration-300 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        } ${
          isHovered
            ? '-ml-5 -mt-5 w-10 h-10 bg-accent/15 border border-accent/60 scale-100 shadow-xs backdrop-blur-[1px]'
            : '-ml-3.5 -mt-3.5 w-7 h-7 bg-accent/8 border border-accent/30 scale-100'
        }`}
        style={{ willChange: 'transform' }}
      />
    </>
  );
}
