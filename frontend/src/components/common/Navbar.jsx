import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  User,
  LogOut,
  ArrowUpRight,
  Menu,
  X,
  Sun,
  Moon,
  LayoutDashboard,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import gsap from 'gsap';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import ConfirmationModal from './ConfirmationModal';
import { getLenis } from '../../hooks/useLenis';

export default function Navbar() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const { isDark, toggleTheme } = useTheme();
  const headerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const lastScrollY = useRef(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to safely extract user initials
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'CP';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Slide down on first mount
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion && headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { y: -60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.75, ease: 'power3.out' }
      );
    }
  }, []);

  // Sync user state on route changes and listen to auth events
  useEffect(() => {
    const syncUser = () => setCurrentUser(api.getCurrentUser());
    syncUser();

    window.addEventListener('careerpilot_auth_changed', syncUser);
    window.addEventListener('storage', syncUser);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);

      // Hide/show based on scroll direction
      if (currentScrollY > 120) {
        if (currentScrollY > lastScrollY.current + 8) {
          setIsVisible(false); // Scrolling down -> hide
        } else if (currentScrollY < lastScrollY.current - 6) {
          setIsVisible(true); // Scrolling up -> show
        }
      } else {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('careerpilot_auth_changed', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, [location.pathname]);

  // Handle active navigation hash for public landing page
  useEffect(() => {
    setActiveTab(location.hash || '');
  }, [location.hash, location.pathname]);

  // Animate mobile menu entrance with staggered GSAP
  useEffect(() => {
    if (!mobileMenuRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      if (!prefersReducedMotion) {
        const links = mobileMenuRef.current.querySelectorAll('.mobile-nav-item');
        gsap.fromTo(
          links,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
        );
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const confirmLogout = () => {
    api.logout();
    setCurrentUser(null);
    setLogoutModalOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  // Public marketing links (shown only when NOT logged in)
  const publicNavLinks = [
    { label: 'How It Works', href: '/#how-it-works', hash: '#how-it-works' },
    { label: 'Streams & Careers', href: '/#streams', hash: '#streams' },
    { label: 'FAQs', href: '/#faq', hash: '#faq' },
    { label: 'Support', href: '/support', hash: '' },
  ];

  // Authenticated student portal links (shown when logged in)
  const authenticatedNavLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Assessment', href: '/assessment', icon: Compass },
    { label: 'Support', href: '/support', icon: HelpCircle },
  ];

  const scrollToTarget = (targetHash) => {
    const hash = targetHash.startsWith('#') ? targetHash : `#${targetHash}`;
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
      window.history.pushState(null, '', hash);
      setActiveTab(hash);
    }
  };

  const handlePublicNavClick = (e, link) => {
    if (link.hash) {
      if (location.pathname === '/') {
        e.preventDefault();
        scrollToTarget(link.hash);
      }
    }
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  const handleLogoClick = (e) => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
    if (!currentUser && location.pathname === '/') {
      e.preventDefault();
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(0, { duration: 1 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      window.history.pushState(null, '', '/');
      setActiveTab('');
    }
  };

  const firstName = currentUser?.name?.trim().split(/\s+/)[0] || 'Student';

  return (
    <>
      <header
        ref={headerRef}
        className={`sticky top-0 z-40 w-full transition-all duration-300 transform no-print ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        } ${
          isScrolled
            ? 'bg-background/90 backdrop-blur-md border-b border-borderMuted shadow-xs'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Brand Logo: Routes to /dashboard for authenticated students, / for public visitors */}
          <Link
            to={currentUser ? '/dashboard' : '/'}
            onClick={handleLogoClick}
            className="flex items-center gap-3 group"
            data-cursor={currentUser ? 'Dashboard' : 'Home'}
          >
            <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white transition-all duration-300 group-hover:scale-105 group-hover:rotate-6 shadow-xs">
              <Compass className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl tracking-tight text-textPrimary leading-none transition-colors group-hover:text-accent">
                CareerPilot
              </span>
              {currentUser ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-textSecondary font-semibold">
                    Student Portal
                  </span>
                </div>
              ) : (
                <span className="text-[10px] uppercase tracking-widest text-textSecondary font-medium mt-1">
                  Class 12 Advisory
                </span>
              )}
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-textSecondary">
            {currentUser ? (
              // Authenticated student links
              authenticatedNavLinks.map((link) => {
                const isActive =
                  location.pathname === link.href ||
                  (link.href !== '/dashboard' && location.pathname.startsWith(link.href));
                const IconComponent = link.icon;
                return (
                  <Link
                    key={link.label}
                    to={link.href}
                    className={`relative py-1 flex items-center gap-2 transition-colors cursor-pointer ${
                      isActive
                        ? 'text-textPrimary font-semibold'
                        : 'text-textSecondary hover:text-textPrimary'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${isActive ? 'text-accent' : 'opacity-70'}`} />
                    <span>{link.label}</span>
                    <span
                      className={`absolute bottom-0 left-0 h-[2px] bg-accent transition-all duration-300 rounded-full ${
                        isActive ? 'w-full opacity-100' : 'w-0 opacity-0'
                      }`}
                    />
                  </Link>
                );
              })
            ) : (
              // Public visitor links
              publicNavLinks.map((link) => {
                const isActive = activeTab === link.hash && link.hash !== '';
                return (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={(e) => handlePublicNavClick(e, link)}
                    className="relative py-1 group transition-colors hover:text-textPrimary cursor-pointer"
                  >
                    <span>{link.label}</span>
                    <span
                      className={`absolute bottom-0 left-0 h-[2px] bg-accent transition-all duration-300 rounded-full ${
                        isActive
                          ? 'w-full opacity-100'
                          : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-60'
                      }`}
                    />
                  </Link>
                );
              })
            )}
          </nav>

          {/* Action Controls & Utilities */}
          <div className="hidden md:flex items-center gap-3">
            {/* Dark Mode Animated Toggle */}
            <button
              onClick={toggleTheme}
              data-cursor="Theme"
              aria-label={isDark ? 'Switch to daylight mode' : 'Switch to evening mode'}
              className="p-2 rounded-full bg-surface border border-borderMuted text-textSecondary hover:text-textPrimary hover:border-accent/40 transition-all cursor-pointer"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 rotate-0 transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-accent transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>

            {currentUser ? (
              // Logged-in controls: Profile Pill + Contextual Action + Sign Out
              <div className="flex items-center gap-3">
                {/* Student Profile Pill */}
                <Link
                  to="/profile"
                  data-cursor="Profile"
                  title="View Student Profile"
                  className={`flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border transition-all hover:shadow-xs cursor-pointer ${
                    location.pathname === '/profile'
                      ? 'bg-accent/10 border-accent text-accent'
                      : 'bg-surface border-borderMuted text-textPrimary hover:border-accent/40 hover:bg-surfaceLight'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-accent/15 border border-accent/30 text-accent flex items-center justify-center font-mono font-bold text-[11px]">
                    {getInitials(currentUser.name)}
                  </div>
                  <span className="text-xs font-semibold tracking-wide text-textPrimary">
                    {firstName}
                  </span>
                </Link>

                {/* Primary Contextual Action Button */}
                {location.pathname !== '/assessment' ? (
                  <Link
                    to="/assessment"
                    data-cursor="Assessment"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-charcoal hover:bg-accent text-white rounded-full text-xs font-medium tracking-wide transition-all duration-200 shadow-xs hover:shadow-sm active:scale-[0.98] cursor-pointer group"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 transition-transform duration-200 group-hover:scale-110" />
                    <span>Take Assessment</span>
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    data-cursor="Dashboard"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-surface hover:bg-secondary text-textPrimary border border-borderMuted rounded-full text-xs font-medium tracking-wide transition-all duration-200 shadow-xs hover:shadow-sm active:scale-[0.98] cursor-pointer"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-accent" />
                    <span>Dashboard</span>
                  </Link>
                )}

                {/* Sign Out Action Button */}
                <button
                  onClick={() => setLogoutModalOpen(true)}
                  title="Sign out of session"
                  data-cursor="Sign Out"
                  className="p-2 text-textSecondary hover:text-red-500 hover:bg-red-500/10 transition-all rounded-full border border-transparent hover:border-red-500/20 active:scale-95 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              // Public controls: Sign In + Start Free Assessment
              <div className="flex items-center gap-3">
                <Link
                  to="/auth"
                  className="text-xs uppercase tracking-wider font-semibold text-textSecondary hover:text-textPrimary transition-colors px-3 py-2 cursor-pointer"
                >
                  Sign In
                </Link>
                <Link
                  to="/assessment"
                  data-cursor="Begin"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-charcoal hover:bg-accent text-white rounded-full text-xs font-medium tracking-wide transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer group"
                >
                  <span>Start Free Assessment</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu & Utility Buttons */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-full bg-surface border border-borderMuted text-textPrimary cursor-pointer"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-accent" />
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
              className="p-2.5 rounded-full bg-surface border border-borderMuted text-textPrimary active:scale-90 transition-transform cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          ref={mobileMenuRef}
          className="fixed inset-0 z-30 pt-24 px-6 bg-background/98 backdrop-blur-2xl md:hidden flex flex-col justify-between pb-10 animate-fade-in text-textPrimary overflow-y-auto"
        >
          {currentUser ? (
            // Authenticated Student Mobile Drawer
            <div className="space-y-6 pt-2">
              {/* Student Identity Card */}
              <div className="mobile-nav-item p-4 rounded-2xl bg-surface border border-borderMuted flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center font-mono font-bold text-base">
                  {getInitials(currentUser.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-serif text-lg font-semibold text-textPrimary truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-xs font-mono text-textSecondary truncate">
                    {currentUser.email || 'Authenticated Student'}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-600 dark:text-emerald-400 font-medium">
                      Active Student Session
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] uppercase font-mono tracking-widest text-textSecondary">
                Portal Menu
              </div>

              {/* Authenticated Links with Icons */}
              <div className="space-y-2">
                {authenticatedNavLinks.map((link) => {
                  const IconComp = link.icon;
                  const isActive =
                    location.pathname === link.href ||
                    (link.href !== '/dashboard' && location.pathname.startsWith(link.href));
                  return (
                    <div key={link.label} className="mobile-nav-item">
                      <Link
                        to={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                          isActive
                            ? 'bg-accent/10 text-accent font-semibold'
                            : 'text-textPrimary hover:bg-surface'
                        }`}
                      >
                        <IconComp className="w-5 h-5 text-accent" />
                        <span className="text-lg">{link.label}</span>
                      </Link>
                    </div>
                  );
                })}

                <div className="mobile-nav-item">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                      location.pathname === '/profile'
                        ? 'bg-accent/10 text-accent font-semibold'
                        : 'text-textPrimary hover:bg-surface'
                    }`}
                  >
                    <User className="w-5 h-5 text-accent" />
                    <span className="text-lg">Profile & Settings</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            // Public Visitor Mobile Drawer
            <div className="space-y-6 pt-4">
              <div className="text-[10px] uppercase font-mono tracking-widest text-textSecondary mb-2">
                Navigation
              </div>
              {publicNavLinks.map((link) => (
                <div key={link.label} className="mobile-nav-item">
                  <Link
                    to={link.href}
                    onClick={(e) => handlePublicNavClick(e, link)}
                    className="font-serif text-3xl text-textPrimary hover:text-accent transition-colors block py-1 cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Drawer Bottom Actions */}
          <div className="mobile-nav-item pt-6 border-t border-borderMuted space-y-3 mt-6">
            {currentUser ? (
              <div className="space-y-3">
                {location.pathname !== '/assessment' ? (
                  <Link
                    to="/assessment"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-charcoal text-white rounded-full text-xs uppercase tracking-wider font-semibold shadow-sm cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Take Assessment</span>
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-accent text-white rounded-full text-xs uppercase tracking-wider font-semibold shadow-sm cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Back to Dashboard</span>
                  </Link>
                )}

                <button
                  onClick={() => setLogoutModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 text-xs uppercase font-mono text-red-500 hover:text-red-600 bg-red-500/10 rounded-full cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Session</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full block text-center py-3 text-xs uppercase font-mono tracking-wider text-textSecondary hover:text-textPrimary border border-borderMuted rounded-full cursor-pointer"
                >
                  Sign In
                </Link>
                <Link
                  to="/assessment"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-charcoal text-white rounded-full text-xs uppercase tracking-wider font-semibold shadow-sm cursor-pointer"
                >
                  <span>Start Free Assessment</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      <ConfirmationModal
        isOpen={logoutModalOpen}
        title="Sign Out of Session"
        message="Are you sure you want to end this counseling session? Your saved assessments and verified dossiers will remain accessible upon your next sign in."
        confirmLabel="Sign Out"
        onConfirm={confirmLogout}
        onCancel={() => setLogoutModalOpen(false)}
      />
    </>
  );
}

