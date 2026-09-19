import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import MagneticButton from '../components/common/MagneticButton';
import { ShieldAlert, ArrowLeft, Mail } from 'lucide-react';
import gsap from 'gsap';

export default function AccessDeniedPage() {
  const navigate = useNavigate();
  const cardRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      { opacity: 0, scale: 0.96 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
    );
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-textPrimary">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div
          ref={cardRef}
          className="max-w-md w-full bg-surface p-8 sm:p-10 rounded-3xl border border-borderMuted shadow-md text-center"
        >
          {/* Subtle Lock Icon */}
          <div className="w-16 h-16 rounded-full bg-stone-200 text-textSecondary flex items-center justify-center mx-auto mb-6 shadow-xs">
            <ShieldAlert className="w-8 h-8 stroke-[1.5]" />
          </div>

          <span className="text-xs font-mono uppercase tracking-widest text-textSecondary block mb-2">
            HTTP STATUS 403 • ACCESS PRIVILEGE RESTRICTED
          </span>

          <h1 className="font-serif text-3xl text-textPrimary mb-3">
            Permission Required
          </h1>

          <p className="text-xs sm:text-sm text-textSecondary leading-relaxed mb-6">
            The requested curriculum dossier or administrative endpoint requires higher authorization privileges (such as a registered school counselor credential or institutional API key).
          </p>

          <div className="p-4 rounded-xl bg-background border border-borderMuted text-xs font-mono text-left text-textSecondary space-y-1 mb-8">
            <div className="flex justify-between">
              <span>Required Role:</span>
              <span className="text-textPrimary font-semibold">Verified Advisory Council</span>
            </div>
            <div className="flex justify-between">
              <span>Security Perimeter:</span>
              <span className="text-accent font-semibold">Active Isolation</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-full sm:flex-1 py-3 rounded-full bg-background hover:bg-secondary border border-borderMuted text-xs font-mono uppercase tracking-wider text-textPrimary transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Go Back</span>
            </button>

            <MagneticButton className="w-full sm:flex-1">
              <Link to="/contact">
                <Button variant="primary" size="md" icon={Mail} className="w-full justify-center">
                  Contact Admin
                </Button>
              </Link>
            </MagneticButton>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
