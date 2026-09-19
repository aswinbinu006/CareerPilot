import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * High-end image container with subtle inertia parallax.
 * Keeps movement minimal (-6% to 6%) for a calm, editorial luxury feel.
 */
export default function ParallaxImage({
  src,
  alt,
  className = '',
  imageClassName = '',
  speed = 8, // percentage movement
  overlay = null,
  ...props
}) {
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const img = imageRef.current;
    if (!container || !img) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Scale slightly so parallax doesn't reveal empty container edges
      gsap.set(img, { scale: 1.12, transformOrigin: 'center center' });

      gsap.fromTo(
        img,
        { yPercent: -speed },
        {
          yPercent: speed,
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        }
      );
    }, container);

    return () => ctx.revert();
  }, [speed]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={`w-full h-full object-cover will-change-transform filter contrast-[1.02] transition-transform duration-700 ease-out hover:scale-105 ${imageClassName}`}
        loading="lazy"
      />
      {overlay}
    </div>
  );
}
