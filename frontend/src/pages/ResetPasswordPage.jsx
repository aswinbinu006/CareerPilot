import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import MagneticButton from '../components/common/MagneticButton';
import { KeyRound, Mail, Lock, CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import gsap from 'gsap';

export default function ResetPasswordPage() {
  const [step, setStep] = useState(1); // 1 = Request, 2 = Set New, 3 = Complete
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [step]);

  // Compute password strength (0 to 4)
  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (!pwd) return 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(password);
  const strengthLabels = ['Too Weak', 'Moderate', 'Good', 'Strong', 'Robust & Secure'];
  const strengthColors = ['bg-red-400', 'bg-amber-400', 'bg-yellow-500', 'bg-emerald-500', 'bg-accent'];

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2); // In production, token would be in URL; here we progress seamlessly
    }, 800);
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-textPrimary">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div
          ref={containerRef}
          className="max-w-md w-full bg-surface p-8 sm:p-10 rounded-3xl border border-borderMuted shadow-md"
        >
          {/* Step 1: Request Reset */}
          {step === 1 && (
            <div>
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white mx-auto mb-4 shadow-xs">
                <KeyRound className="w-6 h-6 stroke-[1.75]" />
              </div>
              <div className="text-center mb-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-accent block mb-1">
                  CREDENTIAL RECOVERY
                </span>
                <h1 className="font-serif text-3xl text-textPrimary mb-2">
                  Reset Account Password
                </h1>
                <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
                  Enter your registered student email address. We will transmit an authenticated recovery link.
                </p>
              </div>

              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-textSecondary mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      className="w-full px-4 py-3 rounded-xl bg-background border border-borderMuted text-sm text-textPrimary placeholder:text-textMuted focus:outline-hidden focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
                    />
                    <Mail className="w-4 h-4 text-textMuted absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <MagneticButton className="w-full pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={isLoading}
                    className="w-full justify-center group"
                  >
                    <span>{isLoading ? 'Transmitting Link...' : 'Send Recovery Link'}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </MagneticButton>

                <div className="text-center pt-2">
                  <Link
                    to="/auth"
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-textSecondary hover:text-textPrimary"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Return to Sign In</span>
                  </Link>
                </div>
              </form>
            </div>
          )}

          {/* Step 2: Create New Password */}
          {step === 2 && (
            <div>
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white mx-auto mb-4 shadow-xs">
                <Lock className="w-6 h-6 stroke-[1.75]" />
              </div>
              <div className="text-center mb-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-accent block mb-1">
                  IDENTITY CONFIRMED
                </span>
                <h1 className="font-serif text-3xl text-textPrimary mb-2">
                  Create New Password
                </h1>
                <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
                  Establish a robust password to safeguard your academic assessments.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300 text-xs font-mono">
                  {error}
                </div>
              )}

              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-textSecondary mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-borderMuted text-sm text-textPrimary placeholder:text-textMuted focus:outline-hidden focus:border-accent"
                  />

                  {/* Password Strength Meter */}
                  {password && (
                    <div className="mt-2.5">
                      <div className="flex items-center justify-between text-[10px] font-mono mb-1 text-textSecondary">
                        <span>Strength:</span>
                        <span className="font-semibold text-textPrimary">
                          {strengthLabels[strength]}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full bg-borderMuted rounded-full overflow-hidden">
                        {[1, 2, 3, 4].map((stepIdx) => (
                          <div
                            key={stepIdx}
                            className={`h-full transition-all duration-300 ${
                              strength >= stepIdx ? strengthColors[strength] : 'bg-transparent'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-textSecondary mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-borderMuted text-sm text-textPrimary placeholder:text-textMuted focus:outline-hidden focus:border-accent"
                  />
                </div>

                <MagneticButton className="w-full pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={isLoading}
                    className="w-full justify-center"
                  >
                    <span>{isLoading ? 'Updating Cipher...' : 'Update Password'}</span>
                  </Button>
                </MagneticButton>
              </form>
            </div>
          )}

          {/* Step 3: Success Confirmation */}
          {step === 3 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center mx-auto mb-6 shadow-sm">
                <CheckCircle2 className="w-8 h-8 stroke-[2]" />
              </div>
              <h2 className="font-serif text-3xl text-textPrimary mb-2">
                Credentials Updated
              </h2>
              <p className="text-xs sm:text-sm text-textSecondary leading-relaxed mb-8">
                Your password has been successfully renewed. You may now access your career advisory dashboard.
              </p>
              <MagneticButton className="w-full">
                <Link to="/auth">
                  <Button variant="primary" size="md" className="w-full justify-center">
                    Proceed to Sign In
                  </Button>
                </Link>
              </MagneticButton>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
