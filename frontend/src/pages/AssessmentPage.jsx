import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import ProgressStepper from '../components/assessment/ProgressStepper';
import Step1Personal from '../components/assessment/Step1Personal';
import Step2Stream from '../components/assessment/Step2Stream';
import Step3Marks from '../components/assessment/Step3Marks';
import Step4Subjects from '../components/assessment/Step4Subjects';
import Step5Interests from '../components/assessment/Step5Interests';
import Step6Budget from '../components/assessment/Step6Budget';
import Step7Location from '../components/assessment/Step7Location';
import Step8Goals from '../components/assessment/Step8Goals';
import gsap from 'gsap';
import { api } from '../services/api';
import {
  CheckCircle2,
  RotateCcw,
  ArrowUpRight,
  Calendar,
  Award,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';

export default function AssessmentPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const stepContainerRef = useRef(null);
  const promptCardRef = useRef(null);
  const prevStepRef = useRef(1);

  const currentUser = api.getCurrentUser();
  const draftKey = currentUser?.email
    ? `careerpilot_assessment_draft_${currentUser.email.toLowerCase().trim()}`
    : 'careerpilot_assessment_draft';

  // Historical assessment state
  const [checkingHistory, setCheckingHistory] = useState(true);
  const [previousSessions, setPreviousSessions] = useState([]);
  const [retakeRequested, setRetakeRequested] = useState(
    searchParams.get('retake') === 'true'
  );

  // Load initial draft from sessionStorage
  const [formData, setFormData] = useState(() => {
    try {
      const saved = sessionStorage.getItem(draftKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.name && currentUser?.name) parsed.name = currentUser.name;
        return parsed;
      }
    } catch {}
    return {
      name: currentUser?.name || '',
      stream: searchParams.get('stream') === 'pcm'
        ? 'PCM (Physics, Chemistry, Maths)'
        : searchParams.get('stream') === 'pcb'
        ? 'PCB (Physics, Chemistry, Biology)'
        : searchParams.get('stream') === 'commerce'
        ? 'Commerce with Maths'
        : searchParams.get('stream') === 'arts'
        ? 'Arts / Humanities'
        : '',
      marks: '',
      favorite_subjects: '',
      interests: '',
      budget: '',
      preferred_location: '',
      career_goals: '',
    };
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if current user has already completed an assessment
  useEffect(() => {
    let isMounted = true;
    const fetchUserHistory = async () => {
      setCheckingHistory(true);
      try {
        const user = api.getCurrentUser();
        const sessions = await api.getUserSessions(user);
        if (isMounted) {
          setPreviousSessions(sessions || []);
        }
      } finally {
        if (isMounted) {
          setCheckingHistory(false);
        }
      }
    };

    fetchUserHistory();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-save progress
  useEffect(() => {
    if (retakeRequested || previousSessions.length === 0) {
      try {
        sessionStorage.setItem(draftKey, JSON.stringify(formData));
      } catch {}
    }
  }, [formData, retakeRequested, previousSessions.length, draftKey]);

  // Entrance animation for the retake prompt card
  useEffect(() => {
    if (!checkingHistory && previousSessions.length > 0 && !retakeRequested && promptCardRef.current) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion) {
        gsap.fromTo(
          promptCardRef.current,
          { opacity: 0, y: 24, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' }
        );
      }
    }
  }, [checkingHistory, previousSessions.length, retakeRequested]);

  // Directional transition on step change
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !stepContainerRef.current) return;

    const direction = currentStep >= prevStepRef.current ? 1 : -1;
    prevStepRef.current = currentStep;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        stepContainerRef.current,
        {
          opacity: 0,
          x: direction * 28,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.45,
          ease: 'power2.out',
          clearProps: 'transform',
        }
      );

      const formItems = stepContainerRef.current.querySelectorAll(
        'input, select, textarea, button, .stagger-el'
      );
      if (formItems.length > 0) {
        gsap.fromTo(
          formItems,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out', delay: 0.1 }
        );
      }
    }, stepContainerRef);

    return () => ctx.revert();
  }, [currentStep]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep((prev) => Math.min(prev + 1, 8));
  };

  const handleBack = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStartRetake = () => {
    try {
      sessionStorage.removeItem(draftKey);
    } catch {}
    setRetakeRequested(true);
    setCurrentStep(1);
    setSearchParams({ retake: 'true' }, { replace: true });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const submissionData = {
      ...formData,
      name: formData.name || currentUser?.name || 'Class 12 Student',
      user_email: currentUser?.email || '',
    };
    // Persist finalized data for processing screen
    sessionStorage.setItem('careerpilot_active_profile', JSON.stringify(submissionData));
    // Clear draft
    try {
      sessionStorage.removeItem(draftKey);
    } catch {}
    // Navigate to processing storytelling view
    navigate('/processing');
  };

  const stepTitles = [
    'Student Information',
    'Class 12 Stream',
    'Board Marks',
    'Favorite Subjects',
    'Intellectual Passions',
    'Tuition Budget',
    'Geographic Preference',
    'Long-Term Aspirations',
  ];

  const latestSession = previousSessions.length > 0 ? previousSessions[0] : null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-textPrimary">
      <Navbar />

      {/* Loading state while querying history */}
      {checkingHistory && (
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <span className="text-xs font-mono uppercase tracking-widest text-textSecondary">
              Checking Assessment Records...
            </span>
          </div>
        </main>
      )}

      {/* 1. Prompt Screen: User has ALREADY completed an assessment and has not requested a retake */}
      {!checkingHistory && previousSessions.length > 0 && !retakeRequested && latestSession && (
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div
            ref={promptCardRef}
            className="w-full max-w-xl bg-surface border border-borderMuted rounded-3xl p-8 sm:p-10 shadow-luxury text-center relative overflow-hidden"
          >
            {/* Completion Status Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/25 text-accent text-xs font-mono font-medium mb-6">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              <span>
                Assessment Completed ({previousSessions.length}{' '}
                {previousSessions.length === 1 ? 'time' : 'times'})
              </span>
            </div>

            {/* Main Notification Headline */}
            <h1 className="font-serif text-3xl sm:text-4xl text-textPrimary tracking-tight mb-3">
              You Have Already Given the Assessment
            </h1>

            <p className="text-textSecondary text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-8">
              You have completed the career guidance assessment{' '}
              {previousSessions.length === 1 ? 'once' : `${previousSessions.length} times`}. Your personalized
              AI guidance dossier is already generated. Would you like to review your existing dossier, or do
              you need to take it one more time to explore a new trajectory?
            </p>

            {/* Existing Assessment Summary Snapshot */}
            <div className="bg-background/80 rounded-2xl p-5 border border-borderMuted mb-8 text-left space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-textSecondary border-b border-borderMuted/60 pb-2">
                <span className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-accent" />
                  <span>Existing Recommended Degree</span>
                </span>
                <span className="font-semibold text-accent">
                  {latestSession.confidence
                    ? `${Math.round(latestSession.confidence * 100)}% Confidence`
                    : 'Deliberated Verdict'}
                </span>
              </div>
              <div>
                <div className="font-serif text-xl font-semibold text-textPrimary">
                  {latestSession.recommended_degree}
                </div>
                {latestSession.stream && (
                  <div className="text-xs text-textSecondary font-sans mt-1">
                    Stream: <span className="font-medium text-textPrimary">{latestSession.stream}</span>
                  </div>
                )}
              </div>
              {latestSession.created_at && (
                <div className="text-[11px] font-mono text-textSecondary pt-1 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 opacity-60" />
                  <span>
                    Completed on:{' '}
                    {new Date(latestSession.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Button 1: View Existing Dossier */}
              <Link
                to={`/report/${latestSession.session_id}`}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-charcoal dark:bg-accent hover:bg-accent dark:hover:bg-accent-hover text-white rounded-full text-sm font-semibold tracking-wide transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer group"
              >
                <span>View Existing Assessment Dossier</span>
                <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>

              {/* Button 2: Take It One More Time (Retake) */}
              <button
                type="button"
                onClick={handleStartRetake}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-surface hover:bg-secondary text-textPrimary border border-borderMuted hover:border-accent/40 rounded-full text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-accent" />
                <span>Take It One More Time (Retake)</span>
              </button>
            </div>

            {/* Return to Dashboard link */}
            <div className="mt-6 pt-4 border-t border-borderMuted/40">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-textSecondary hover:text-textPrimary transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Return to Student Dashboard</span>
              </Link>
            </div>
          </div>
        </main>
      )}

      {/* 2. Assessment Questionnaire (shown when no prior assessment OR retake requested) */}
      {!checkingHistory && (previousSessions.length === 0 || retakeRequested) && (
        <>
          {/* Subtle Retake Notice Banner if user is retaking */}
          {previousSessions.length > 0 && retakeRequested && (
            <div className="bg-accent/10 border-b border-accent/20 px-6 py-2.5 text-xs text-textPrimary">
              <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>
                    <strong>Retake Mode:</strong> You have completed {previousSessions.length === 1 ? '1 assessment' : `${previousSessions.length} assessments`} previously. Submitting this will generate an updated advisory roadmap.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setRetakeRequested(false)}
                  className="text-accent underline font-medium hover:text-accent-dark shrink-0 cursor-pointer"
                >
                  Cancel & View Previous
                </button>
              </div>
            </div>
          )}

          <ProgressStepper
            currentStep={currentStep}
            totalSteps={8}
            onBack={handleBack}
            stepTitle={stepTitles[currentStep - 1]}
          />

          <main className="flex-1 flex items-center justify-center px-6 py-10">
            <div ref={stepContainerRef} className="w-full max-w-2xl">
              {currentStep === 1 && (
                <Step1Personal
                  data={formData}
                  onChange={handleChange}
                  onNext={handleNext}
                />
              )}
              {currentStep === 2 && (
                <Step2Stream
                  data={formData}
                  onChange={handleChange}
                  onNext={handleNext}
                />
              )}
              {currentStep === 3 && (
                <Step3Marks
                  data={formData}
                  onChange={handleChange}
                  onNext={handleNext}
                />
              )}
              {currentStep === 4 && (
                <Step4Subjects
                  data={formData}
                  onChange={handleChange}
                  onNext={handleNext}
                />
              )}
              {currentStep === 5 && (
                <Step5Interests
                  data={formData}
                  onChange={handleChange}
                  onNext={handleNext}
                />
              )}
              {currentStep === 6 && (
                <Step6Budget
                  data={formData}
                  onChange={handleChange}
                  onNext={handleNext}
                />
              )}
              {currentStep === 7 && (
                <Step7Location
                  data={formData}
                  onChange={handleChange}
                  onNext={handleNext}
                />
              )}
              {currentStep === 8 && (
                <Step8Goals
                  data={formData}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>
          </main>
        </>
      )}
    </div>
  );
}

