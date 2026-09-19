import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, ShieldCheck, Award } from 'lucide-react';
import gsap from 'gsap';
import { getLenis } from '../../hooks/useLenis';
import MagneticButton from '../common/MagneticButton';
import ParallaxImage from '../common/ParallaxImage';

export default function Hero() {
  const containerRef = useRef(null);
  const headlineRef = useRef(null);
  const subtextRef = useRef(null);
  const ctaContainerRef = useRef(null);
  const pillRef = useRef(null);
  const indicatorsRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !headlineRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // 1. Editorial Pill gentle pop
      if (pillRef.current) {
        tl.fromTo(
          pillRef.current,
          { opacity: 0, y: -12, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6 }
        );
      }

      // 2. Headline entrance
      if (headlineRef.current) {
        tl.fromTo(
          headlineRef.current,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.85 },
          '-=0.3'
        );
      }

      // 3. Subheadline reveal
      if (subtextRef.current) {
        tl.fromTo(
          subtextRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.75 },
          '-=0.5'
        );
      }

      // 4. CTAs entrance
      if (ctaContainerRef.current) {
        tl.fromTo(
          ctaContainerRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.4'
        );
      }

      // 5. Indicators entrance
      if (indicatorsRef.current) {
        tl.fromTo(
          indicatorsRef.current.children,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
          '-=0.3'
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative w-full pt-8 pb-16 md:pt-14 md:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Editorial Pill */}
        <div
          ref={pillRef}
          className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-surface border border-borderMuted text-xs font-mono text-textSecondary mb-8 shadow-xs"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span>Class 12 Academic & Career Advisory</span>
        </div>

        {/* Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <h1
              ref={headlineRef}
              className="font-serif text-5xl sm:text-6xl lg:text-7xl text-textPrimary leading-[1.06] tracking-tight mb-8"
            >
              Your future is too <br />
              <span className="italic font-normal">valuable</span> to leave to <br />
              guesswork.
            </h1>

            <div className="max-w-xl">
              <p
                ref={subtextRef}
                className="text-lg sm:text-xl text-textSecondary font-normal leading-relaxed mb-10"
              >
                A calm, rigorous guidance architecture for Class 12 graduates across PCM, PCB, Commerce, and Arts. Grounded in your aptitude, real entrance cutoffs, family budgets, and verifiable university paths.
              </p>

              {/* Action Buttons */}
              <div
                ref={ctaContainerRef}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-12"
              >
                <Link
                  to="/assessment"
                  data-cursor="Begin"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-charcoal hover:bg-accent text-white rounded-full text-sm font-medium tracking-wide transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] group"
                >
                  <span>Start Free Assessment</span>
                  <ArrowRight className="w-4 h-4 stroke-[1.75] transition-transform duration-200 group-hover:translate-x-1" />
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('how-it-works') || document.getElementById('methodology');
                    if (el) {
                      const lenis = getLenis();
                      if (lenis) {
                        lenis.scrollTo(el, { offset: -80, duration: 1.2 });
                      } else {
                        const y = el.getBoundingClientRect().top + window.scrollY - 80;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                      }
                    }
                  }}
                  data-cursor="Scroll"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-surface hover:bg-surfaceLight text-textPrimary border border-borderMuted hover:border-accent/40 rounded-full text-sm font-medium transition-all duration-200 hover:shadow-xs active:scale-[0.98] cursor-pointer"
                >
                  <span>See How It Works</span>
                </button>
              </div>

              {/* Quality Indicators */}
              <div
                ref={indicatorsRef}
                className="pt-8 border-t border-borderMuted grid grid-cols-3 gap-6 text-xs text-textSecondary font-mono"
              >
                <div className="hover:translate-y-[-2px] transition-transform duration-200">
                  <span className="block text-textPrimary font-semibold font-sans text-sm mb-0.5">4 Streams</span>
                  <span>PCM, PCB, Commerce, Arts</span>
                </div>
                <div className="hover:translate-y-[-2px] transition-transform duration-200">
                  <span className="block text-textPrimary font-semibold font-sans text-sm mb-0.5">4 Specialists</span>
                  <span>Sequential deliberative agents</span>
                </div>
                <div className="hover:translate-y-[-2px] transition-transform duration-200">
                  <span className="block text-textPrimary font-semibold font-sans text-sm mb-0.5">Zero Bias</span>
                  <span>Budget & merit aligned</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Parallax Academic Image with Caption */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-borderMuted bg-surface">
              <ParallaxImage
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop"
                alt="Students collaborating and studying with textbooks in a modern library"
                className="w-full h-[460px]"
                speed={7}
                overlay={
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/45 via-transparent to-transparent pointer-events-none" />
                    {/* Editorial Caption Card */}
                    <div className="absolute bottom-5 left-5 right-5 z-10 p-5 sm:p-6 rounded-2xl bg-white/95 dark:bg-[#1A1C18]/95 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-2xl transition-transform duration-300 hover:translate-y-[-2px]">
                      <div className="flex items-center justify-between font-mono text-[11px] mb-2.5">
                        <span className="text-stone-600 dark:text-stone-300 uppercase tracking-wider font-bold">COUNSELING DOSSIER</span>
                        <span className="text-accent dark:text-emerald-400 font-bold tracking-wider">VERIFIED NIRF DATA</span>
                      </div>
                      <p className="text-stone-900 dark:text-white font-semibold text-xs sm:text-[13px] leading-relaxed">
                        Moving 12th pass students from uncertainty to a four-year structured roadmap with measurable milestones.
                      </p>
                    </div>
                  </>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
