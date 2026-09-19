import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useLenis } from './hooks/useLenis';
import { useUTM } from './hooks/useUTM';
import { useSessionGuard } from './hooks/useSessionGuard';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

// Core Application Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import AssessmentPage from './pages/AssessmentPage';
import ProcessingPage from './pages/ProcessingPage';
import ReportPage from './pages/ReportPage';

// Production Legal, Support & Operational Pages
import NotFoundPage from './pages/NotFoundPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsConditionsPage from './pages/TermsConditionsPage';
import CookiePreferencesPage from './pages/CookiePreferencesPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import AccessDeniedPage from './pages/AccessDeniedPage';
import MaintenancePage from './pages/MaintenancePage';
import SupportPage from './pages/SupportPage';
import SessionExpiredPage from './pages/SessionExpiredPage';
import AccountLockedPage from './pages/AccountLockedPage';
import OfflinePage from './pages/OfflinePage';
import NotificationsPage from './pages/NotificationsPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import ContactPage from './pages/ContactPage';
import ProtectedRoute from './components/common/ProtectedRoute';

// UX & Motion Infrastructure Components
import ScrollProgressBar from './components/common/ScrollProgressBar';
import CustomCursor from './components/common/CustomCursor';
import FloatingContactButton from './components/common/FloatingContactButton';
import AnimatedBackground from './components/common/AnimatedBackground';
import PageTransition from './components/common/PageTransition';
import BackToTopButton from './components/common/BackToTopButton';
import PrivacyNotice from './components/common/PrivacyNotice';
import NetworkStatusBar from './components/common/NetworkStatusBar';

function AppContent() {
  // Initialize Lenis smooth scroll and connect with GSAP ScrollTrigger
  useLenis();
  
  // Capture marketing campaign telemetry
  useUTM();

  // Session security: auto-logout on tab close, 1hr inactivity, DB validation
  useSessionGuard();

  const location = useLocation();

  return (
    <>
      {/* 12. Skip to Content Accessibility Anchor */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-charcoal text-white rounded-full font-mono text-xs shadow-lg transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>

      {/* Network Connectivity Status */}
      <NetworkStatusBar />

      {/* 8. Scroll Progress Bar */}
      <ScrollProgressBar />

      {/* Desktop Luxury Custom Cursor */}
      <CustomCursor />

      {/* Subtle Ambient Light Drifting Background */}
      <AnimatedBackground />

      {/* Page Transition Container */}
      <div id="main-content" className="min-h-screen flex flex-col">
        <PageTransition key={location.pathname}>
          <Routes location={location}>
            {/* Main Discovery & Advisory Flow */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/assessment" element={<ProtectedRoute><AssessmentPage /></ProtectedRoute>} />
            <Route path="/processing" element={<ProtectedRoute><ProcessingPage /></ProtectedRoute>} />
            <Route path="/report/:sessionId" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />

            {/* User Account & Notifications */}
            <Route path="/profile" element={<ProtectedRoute><ProfileSettingsPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><ProfileSettingsPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* Support & Contact */}
            <Route path="/support" element={<SupportPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Legal & Compliance */}
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsConditionsPage />} />
            <Route path="/cookies" element={<CookiePreferencesPage />} />

            {/* Identity & Verification States */}
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* System & Error Edge-Cases */}
            <Route path="/403" element={<AccessDeniedPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/session-expired" element={<SessionExpiredPage />} />
            <Route path="/account-locked" element={<AccountLockedPage />} />
            <Route path="/offline" element={<OfflinePage />} />
            <Route path="/404" element={<NotFoundPage />} />

            {/* Wildcard Fallback -> Custom 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </PageTransition>
      </div>

      {/* 4. Scroll Back-to-Top Button */}
      <BackToTopButton />

      {/* 20. Multi-Channel Floating Contact Concierge */}
      <FloatingContactButton />

      {/* Minimal Luxury Privacy & Data Notice */}
      <PrivacyNotice />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
