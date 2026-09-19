import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import MagneticButton from '../components/common/MagneticButton';
import { Mail, Phone, MapPin, Send, Clock, CheckCircle2, Globe } from 'lucide-react';
import gsap from 'gsap';

export default function ContactPage() {
  const [formData, setFormData] = useState(() => {
    const user = api.getCurrentUser();
    return {
      name: user?.name || '',
      email: user?.email || '',
      stream: 'PCM',
      subject: '',
      message: '',
    };
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const user = api.getCurrentUser();
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      setFormError('Please include a detailed message (at least 10 characters).');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', stream: 'PCM', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }, 700);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-textPrimary">
      <Navbar />

      <main ref={containerRef} className="flex-1 max-w-7xl w-full mx-auto px-6 py-14">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-borderMuted text-xs font-mono text-accent mb-3">
            <Mail className="w-3.5 h-3.5" />
            <span>ACADEMIC COUNSELING LIAISON</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-textPrimary leading-tight mb-3">
            Reach the Advisory Secretariat
          </h1>
          <p className="text-sm sm:text-base text-textSecondary leading-relaxed">
            Whether you are a Class 12 student navigating cutoff criteria, a parent evaluating financial aid, or a secondary school principal seeking institutional access, our counseling board is here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-7 p-8 sm:p-10 rounded-3xl bg-surface border border-borderMuted shadow-sm">
            <h2 className="font-serif text-2xl sm:text-3xl text-textPrimary mb-2">
              Transmit an Advisory Inquiry
            </h2>
            <p className="text-xs sm:text-sm text-textSecondary mb-8 leading-relaxed">
              Inquiries are systematically triaged by academic stream specialists. Average response duration: within 24 business hours.
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-mono">
                {formError}
              </div>
            )}

            {submitted ? (
              <div className="p-8 text-center rounded-2xl bg-accent-light border border-accent/30 text-accent animate-fade-in">
                <CheckCircle2 className="w-12 h-12 stroke-[2] mx-auto mb-3" />
                <h3 className="font-serif text-2xl text-textPrimary mb-1">Inquiry Registered</h3>
                <p className="text-xs text-textSecondary max-w-sm mx-auto leading-relaxed">
                  Your academic inquiry has been logged in our counseling ledger. An advisory liaison will reply to your student email shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-textSecondary mb-1.5">
                      Student / Guardian Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 rounded-xl bg-background border border-borderMuted text-sm text-textPrimary focus:border-accent focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-textSecondary mb-1.5">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email address"
                      className="w-full px-4 py-3 rounded-xl bg-background border border-borderMuted text-sm text-textPrimary focus:border-accent focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-textSecondary mb-1.5">
                      Relevant Stream
                    </label>
                    <select
                      value={formData.stream}
                      onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-borderMuted text-sm text-textPrimary focus:border-accent focus:outline-hidden"
                    >
                      <option value="PCM">PCM (Engineering & Computing)</option>
                      <option value="PCB">PCB (Medicine & Health)</option>
                      <option value="Commerce">Commerce & Economics</option>
                      <option value="Arts">Arts, Law & Humanities</option>
                      <option value="General">Institutional / General Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-textSecondary mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. JoSAA Round 1 Domicile Inquiry"
                      className="w-full px-4 py-3 rounded-xl bg-background border border-borderMuted text-sm text-textPrimary focus:border-accent focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-textSecondary mb-1.5">
                    Detailed Message & Academic Context
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide relevant board marks, target examinations, and specific questions..."
                    className="w-full p-4 rounded-xl bg-background border border-borderMuted text-sm text-textPrimary focus:border-accent focus:outline-hidden resize-none"
                  />
                </div>

                <div className="pt-2">
                  <MagneticButton className="w-full">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      disabled={isSubmitting}
                      icon={Send}
                      className="w-full justify-center"
                    >
                      {isSubmitting ? 'Transmitting...' : 'Transmit Inquiry'}
                    </Button>
                  </MagneticButton>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Office & Liaison Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-3xl bg-surface border border-borderMuted space-y-6">
              <h3 className="font-serif text-2xl text-textPrimary">
                Advisory Secretariat
              </h3>

              <div className="space-y-4 text-xs font-mono text-textSecondary">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="block text-textPrimary font-sans font-semibold text-sm mb-0.5">National Knowledge Complex</span>
                    <span>Technology Advisory Wing, Sector 62, Institutional Area, Noida, NCR 201309, India</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="block text-textPrimary font-sans font-semibold text-sm mb-0.5">Counseling Hours</span>
                    <span>Monday to Saturday: 09:00 — 18:00 IST • Closed on National Holidays</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="block text-textPrimary font-sans font-semibold text-sm mb-0.5">Direct Correspondence</span>
                    <span>contact@careerpilot.advisory</span>
                  </div>
                </div>
              </div>

              {/* Stylized Architectural Campus Map Placeholder */}
              <div className="relative rounded-2xl overflow-hidden border border-borderMuted bg-stone-200 h-44 flex items-center justify-center text-center p-4">
                <div className="absolute inset-0 bg-stone-300 opacity-60 bg-[radial-gradient(#4A5C46_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="relative z-10 p-4 rounded-xl bg-background/95 backdrop-blur border border-borderMuted shadow-xs">
                  <div className="flex items-center justify-center gap-1.5 text-accent font-mono text-xs mb-0.5">
                    <Globe className="w-3.5 h-3.5" />
                    <span>INSTITUTIONAL PRECINCT</span>
                  </div>
                  <span className="font-serif text-sm text-textPrimary">NCR Academic Corridor • Sector 62</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
