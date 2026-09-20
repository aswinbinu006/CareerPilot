import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import { Compass, Eye, EyeOff, Lock, Mail, User, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import gsap from 'gsap';
import { api } from '../services/api';
import MagneticButton from '../components/common/MagneticButton';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const formRef = useRef(null);
  const cardRef = useRef(null);

  // If already authenticated, redirect to dashboard or requested page
  useEffect(() => {
    if (api.isAuthenticated()) {
      const target = searchParams.get('redirect') || location.state?.from?.pathname || '/dashboard';
      navigate(target, { replace: true });
    }
  }, [navigate, searchParams, location]);

  // Smooth entrance on load
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 24, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power2.out' }
    );
  }, []);

  // Fast tab transition under 300ms
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !formRef.current) return;

    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' }
    );
  }, [isLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');
    setIsLoading(true);

    try {
      // Purge any stale un-namespaced demo or previous account keys
      try {
        localStorage.removeItem('careerpilot_latest_session_id');
        localStorage.removeItem('careerpilot_completed_sessions');
        localStorage.removeItem('careerpilot_completed_sessions_student.demo@careerpilot.edu');
      } catch {}

      if (isLogin) {
        await api.login({ email, password });
      } else {
        await api.signup({ email, password, name });
      }
      const target = searchParams.get('redirect') || location.state?.from?.pathname || '/dashboard';
      navigate(target, { replace: true });
    } catch (err) {
      if (err.message && (err.message.toLowerCase().includes('locked') || err.message.toLowerCase().includes('suspended'))) {
        navigate('/account-locked', { state: { email } });
        return;
      }
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-textPrimary">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-6">
        <div
          ref={cardRef}
          className="w-full max-w-md bg-surface p-8 sm:p-10 rounded-3xl border border-borderMuted shadow-md hover:border-accent/40 transition-colors duration-300"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white mx-auto mb-4 shadow-xs transition-transform duration-300 hover:scale-105 hover:rotate-6">
              <Compass className="w-5 h-5 stroke-[1.75]" />
            </div>
            <h1 className="font-serif text-3xl text-textPrimary mb-2">
              {isLogin ? 'Access Your Dossier' : 'Create Student Account'}
            </h1>
            <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
              {isLogin
                ? 'Sign in to access your previous career assessments and saved roadmaps.'
                : 'Register your details to save assessments across sessions.'}
            </p>
          </div>

          {/* Assessment Gate Notification */}
          {searchParams.get('redirect')?.includes('assessment') && (
            <div className="mb-6 p-3.5 rounded-xl bg-accent/10 border border-accent/25 text-xs text-textPrimary flex items-center gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
              <span>Please sign in or register to begin your Class 12 career assessment.</span>
            </div>
          )}

          {/* Toggle Tab */}
          <div className="flex rounded-full bg-background p-1 border border-borderMuted mb-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              data-cursor="Select"
              className={`flex-1 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                isLogin
                  ? 'bg-charcoal dark:bg-accent text-white shadow-xs font-semibold'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              data-cursor="Select"
              className={`flex-1 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                !isLogin
                  ? 'bg-charcoal dark:bg-accent text-white shadow-xs font-semibold'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-red-800 dark:text-red-300 text-xs animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-textSecondary mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-borderMuted text-sm text-textPrimary placeholder:text-textMuted focus:outline-hidden focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
                  />
                  <User className="w-4 h-4 text-textMuted absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

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
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-borderMuted text-sm text-textPrimary placeholder:text-textMuted focus:outline-hidden focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
                />
                <Mail className="w-4 h-4 text-textMuted absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-textSecondary mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-borderMuted text-sm text-textPrimary placeholder:text-textMuted focus:outline-hidden focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary transition-colors p-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {isLogin ? (
                <div className="flex justify-end mt-1.5">
                  <Link
                    to="/reset-password"
                    className="text-[11px] font-mono text-accent hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              ) : (
                <p className="text-[11px] font-mono text-textMuted mt-1">
                  Minimum 6 characters with letters and numbers.
                </p>
              )}
            </div>

            <div className="pt-2">
              <MagneticButton className="w-full">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isLoading}
                  className="w-full justify-center group"
                >
                  <span>{isLoading ? 'Authenticating...' : isLogin ? 'Access Dossier' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </MagneticButton>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
