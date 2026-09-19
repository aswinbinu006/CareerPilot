import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import MagneticButton from '../components/common/MagneticButton';
import { Compass, ArrowLeft, Home, MapPinOff } from 'lucide-react';
import gsap from 'gsap';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const compassRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out' }
      );

      if (compassRef.current) {
        gsap.to(compassRef.current, {
          y: -10,
          rotateZ: 6,
          duration: 3.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-textPrimary">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div
          ref={containerRef}
          className="max-w-xl w-full text-center flex flex-col items-center"
        >
          {/* Floating Subtle Editorial Compass Illustration */}
          <div
            ref={compassRef}
            className="w-20 h-20 rounded-full bg-surface border border-borderMuted flex items-center justify-center text-accent mb-8 shadow-sm"
          >
            <Compass className="w-10 h-10 stroke-[1.5]" />
          </div>

          <span className="text-xs font-mono uppercase tracking-widest text-accent mb-2">
            ERROR CODE 404 • ROUTE UNCHARTED
          </span>

          <h1 className="font-serif text-7xl sm:text-8xl text-textPrimary leading-none mb-6">
            404
          </h1>

          <h2 className="font-serif text-2xl sm:text-3xl text-textPrimary mb-4">
            Looks like this page took a different career path.
          </h2>

          <p className="text-sm sm:text-base text-textSecondary max-w-md mx-auto leading-relaxed mb-10">
            The university admissions route or advisory page you are seeking does not exist or has been relocated within our curriculum database.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <MagneticButton>
              <Link to="/">
                <Button variant="primary" icon={Home} size="md">
                  Return to Home
                </Button>
              </Link>
            </MagneticButton>

            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface hover:bg-surfaceLight border border-borderMuted text-xs font-mono uppercase tracking-wider text-textPrimary hover:border-accent/40 transition-all cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Page</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
