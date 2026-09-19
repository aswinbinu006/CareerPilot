import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

/**
 * High-end magnetic wrapper using GSAP physics.
 * Button subtly tracks cursor pull while shifting inner text for tactile depth.
 */
export default function MagneticButton({
  children,
  strength = 0.28,
  textStrength = 0.38,
  className = '',
  ...props
}) {
  const containerRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    const textEl = textRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || 'ontouchstart' in window) return;

    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);

      gsap.to(el, {
        x: relX * strength,
        y: relY * strength,
        scale: 1.02,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto',
      });

      if (textEl) {
        gsap.to(textEl, {
          x: relX * textStrength,
          y: relY * textStrength,
          duration: 0.35,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.7,
        ease: 'elastic.out(1, 0.4)',
        overwrite: 'auto',
      });

      if (textEl) {
        gsap.to(textEl, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: 'elastic.out(1, 0.4)',
          overwrite: 'auto',
        });
      }
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength, textStrength]);

  return (
    <div
      ref={containerRef}
      className={`inline-block cursor-pointer will-change-transform ${className}`}
      {...props}
    >
      <div ref={textRef} className="w-full h-full will-change-transform">
        {children}
      </div>
    </div>
  );
}
