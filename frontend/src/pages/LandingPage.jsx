import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Hero from '../components/home/Hero';
import FloatingTrendCards from '../components/home/FloatingTrendCards';
import WhyCareerPilot from '../components/home/WhyCareerPilot';
import HowItWorks from '../components/home/HowItWorks';
import CareerCategories from '../components/home/CareerCategories';
import FAQ from '../components/home/FAQ';
import { getLenis } from '../hooks/useLenis';

export default function LandingPage() {
  const location = useLocation();

  // Smooth scroll to anchor sections on page mount or hash change
  useEffect(() => {
    if (location.hash) {
      const timer = setTimeout(() => {
        const hash = location.hash;
        const el =
          document.querySelector(hash) ||
          (hash === '#how-it-works' ? document.querySelector('#methodology') : null);
        if (el) {
          const lenis = getLenis();
          if (lenis) {
            lenis.scrollTo(el, { offset: -80, duration: 1.2 });
          } else {
            const y = el.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-textPrimary">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <FloatingTrendCards />
        <WhyCareerPilot />
        <HowItWorks />
        <CareerCategories />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
