import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import gsap from 'gsap';
import { getLenis } from '../../hooks/useLenis';

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 320);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !buttonRef.current) return;

    if (visible) {
      gsap.fromTo(
        buttonRef.current,
        { opacity: 0, scale: 0.8, y: 12 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'back.out(1.7)' }
      );
    }
  }, [visible]);

  const scrollToTop = () => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!visible) return null;

  return (
    <button
      ref={buttonRef}
      onClick={scrollToTop}
      data-cursor="Top"
      aria-label="Scroll to top of document"
      className="fixed bottom-24 right-6 z-40 w-11 h-11 rounded-full bg-surface border border-borderMuted text-textPrimary shadow-luxury hover:shadow-lg flex items-center justify-center hover:-translate-y-1 hover:border-accent/50 hover:text-accent transition-all duration-200 active:scale-95 cursor-pointer no-print"
    >
      <ArrowUp className="w-4 h-4 stroke-[2]" />
    </button>
  );
}
