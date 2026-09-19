import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import DashboardFooter from '../components/dashboard/DashboardFooter';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorState from '../components/common/ErrorState';
import {
  Compass,
  ArrowUpRight,
  Calendar,
  User,
  BookOpen,
  Award,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  GraduationCap,
  Clock,
  Layers,
  ArrowRight,
  Filter,
  Check,
  ChevronRight,
  Bell,
  Building2,
  Scale
} from 'lucide-react';
import gsap from 'gsap';
import { api } from '../services/api';
import MagneticButton from '../components/common/MagneticButton';

// Verified 2025/2026 National Entrance Exam Data
const VERIFIED_EXAMS = [
  {
    id: 'jee-main',
    name: 'JEE (Main) 2025 / 2026',
    stream: 'PCM',
    agency: 'National Testing Agency (NTA)',
    degrees: 'B.Tech, B.E., Integrated M.Tech',
    timeline: 'Session 1: Jan • Session 2: Apr',
    portal: 'https://jeemain.nta.nic.in',
    status: 'Verified NTA Portal',
    eligibility: 'Class 12 with Physics, Chemistry & Mathematics (75% for NITs/IITs)',
    tagColor: 'blue',
  },
  {
    id: 'neet-ug',
    name: 'NEET (UG) 2025 / 2026',
    stream: 'PCB',
    agency: 'National Testing Agency (NTA)',
    degrees: 'MBBS, BDS, BAMS, BHMS, B.Sc Nursing',
    timeline: 'Single Window: May 2025 / 2026',
    portal: 'https://exams.nta.ac.in/NEET',
    status: 'Verified NTA Portal',
    eligibility: 'Class 12 with Physics, Chemistry, Biology & English (Min 50% aggregate)',
    tagColor: 'emerald',
  },
  {
    id: 'cuet-ug',
    name: 'CUET (UG) 2025 / 2026',
    stream: 'All',
    agency: 'National Testing Agency (NTA)',
    degrees: 'B.Com (Hons), B.A., B.Sc, BBA, BMS (DU, BHU, JNU)',
    timeline: 'Registration: Feb-Mar • Exam: May',
    portal: 'https://cuetug.nta.nic.in',
    status: 'Central University Window',
    eligibility: 'Class 12 Pass (Domain subjects chosen according to university criteria)',
    tagColor: 'purple',
  },
  {
    id: 'clat',
    name: 'CLAT 2025 / 2026',
    stream: 'Arts',
    agency: 'Consortium of National Law Universities',
    degrees: '5-Year Integrated B.A. LL.B (Hons), B.B.A. LL.B',
    timeline: 'Annual Examination: December',
    portal: 'https://consortiumofnlus.ac.in',
    status: 'National Law Universities',
    eligibility: 'Class 12 in any stream with minimum 45% aggregate marks',
    tagColor: 'amber',
  },
  {
    id: 'ca-foundation',
    name: 'ICAI CA Foundation',
    stream: 'Commerce',
    agency: 'Institute of Chartered Accountants of India',
    degrees: 'Chartered Accountancy (CA) Professional Track',
    timeline: 'Biannual: May/June & Nov/Dec',
    portal: 'https://www.icai.org',
    status: 'Statutory Body',
    eligibility: 'Registration after Class 10; eligible to appear upon Class 12 completion',
    tagColor: 'emerald',
  },
  {
    id: 'nata',
    name: 'NATA 2025 / 2026',
    stream: 'PCM',
    agency: 'Council of Architecture (CoA)',
    degrees: 'Bachelor of Architecture (B.Arch - 5 Years)',
    timeline: 'Multiple Sessions: April to July',
    portal: 'https://www.nata.in',
    status: 'Official CoA Portal',
    eligibility: 'Class 12 with Physics, Chemistry & Mathematics (Min 50% marks)',
    tagColor: 'blue',
  },
];

// Verified National Scholarships for 12th Pass Students
const VERIFIED_SCHOLARSHIPS = [
  {
    title: 'Central Sector Scheme of Scholarships for College and University Students',
    provider: 'Department of Higher Education (MoE)',
    amount: '₹12,000 to ₹20,000 per annum',
    eligibility: 'Top 20th percentile in Class 12 Board; parental income < ₹4.5 Lakhs/yr',
    portal: 'https://scholarships.gov.in',
    code: 'NSP-CSSS',
  },
  {
    title: 'INSPIRE Scholarship for Higher Education (SHE)',
    provider: 'Department of Science & Technology (DST)',
    amount: '₹80,000 per annum (₹60,000 grant + ₹20,000 mentorship)',
    eligibility: 'Top 1% in Class 12 Board exams pursuing B.Sc / BS-MS in Natural/Basic Sciences',
    portal: 'https://online-inspire.gov.in',
    code: 'DST-INSPIRE',
  },
  {
    title: 'PMSSS (Prime Minister’s Special Scholarship Scheme)',
    provider: 'AICTE & Ministry of Education',
    amount: 'Full academic fee waiver + up to ₹1,00,000 maintenance allowance',
    eligibility: 'Class 12 pass from J&K and Ladakh State Boards / CBSE in J&K',
    portal: 'https://aicte-jk-scholarship-gov.in',
    code: 'AICTE-PMSSS',
  },
];

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'exams' | 'scholarships' | 'streams'
  const [examStreamFilter, setExamStreamFilter] = useState('All');

  const containerRef = useRef(null);
  const statsRef = useRef(null);
  const cardsContainerRef = useRef(null);
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = api.getCurrentUser();
      setCurrentUser(user);

      const response = await api.getRecentSessions();
      if (response && response.recent_sessions) {
        setRecentSessions(response.recent_sessions);
      } else {
        setRecentSessions([]);
      }
    } catch (err) {
      setError(err.message || 'Unable to load dashboard records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // GSAP Entrance and Count-up Animations
  useEffect(() => {
    if (loading || !containerRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // 1. Stats Counter Animation
      const counterEls = containerRef.current.querySelectorAll('.counter-val');
      counterEls.forEach((el) => {
        const rawVal = el.getAttribute('data-val');
        if (rawVal === null || rawVal === 'null' || rawVal === '') {
          el.textContent = '—';
          return;
        }
        const targetVal = parseFloat(rawVal || '0');
        const isPercent = el.getAttribute('data-is-percent') === 'true';
        const obj = { val: 0 };
        gsap.to(obj, {
          val: targetVal,
          duration: 1.2,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = isPercent ? `${Math.round(obj.val)}%` : Math.round(obj.val);
          },
        });
      });

      // 2. SVG Progress Rings Animation
      const rings = containerRef.current.querySelectorAll('.progress-ring-circle');
      rings.forEach((ring) => {
        const rawPercent = ring.getAttribute('data-percent');
        const percent = rawPercent && rawPercent !== 'null' ? parseFloat(rawPercent) : 0;
        const circumference = 2 * Math.PI * 24; // r=24
        const offset = circumference - (percent / 100) * circumference;
        gsap.fromTo(
          ring,
          { strokeDashoffset: circumference },
          { strokeDashoffset: offset, duration: 1.4, ease: 'power2.out', delay: 0.2 }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, [loading, recentSessions, activeTab]);

  const totalSessions = recentSessions.length;
  const avgConfidence = totalSessions > 0
    ? Math.round(
        (recentSessions.reduce((acc, s) => acc + (s.confidence || 0), 0) / totalSessions) * 100
      )
    : null;

  // Compute initials for the avatar
  const studentName = currentUser?.name || 'Class 12 Scholar';
  const nameParts = studentName.trim().split(' ');
  const initials = nameParts.length > 1
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
    : studentName.slice(0, 2).toUpperCase();

  const filteredExams = examStreamFilter === 'All'
    ? VERIFIED_EXAMS
    : VERIFIED_EXAMS.filter((ex) => ex.stream === examStreamFilter || ex.stream === 'All');

  return (
    <div className="min-h-screen flex flex-col bg-background text-textPrimary">
      <Navbar />

      <main ref={containerRef} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {/* ========================================================================= */}
        {/* 1. STUDENT COMMAND CENTER HERO HEADER */}
        {/* ========================================================================= */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-borderMuted shadow-sm mb-8 relative overflow-hidden">
          {/* Subtle Ambient Accent Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            {/* Student Info & Welcome */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-charcoal text-white flex items-center justify-center font-serif text-xl sm:text-2xl font-semibold shadow-md flex-shrink-0 border border-white/10">
                {initials}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-semibold px-2.5 py-0.5 rounded bg-accent-light border border-accent/20">
                    Class 12 Advisory Portal
                  </span>
                  <span className="text-[11px] font-mono text-textMuted hidden sm:inline">•</span>
                  <span className="text-[11px] font-mono text-textSecondary hidden sm:inline">
                    Academic Session 2025–2026
                  </span>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-textPrimary tracking-tight">
                  Welcome back, <span className="italic font-normal">{studentName}</span>
                </h1>

                <p className="text-xs sm:text-sm text-textSecondary mt-1 max-w-2xl leading-relaxed">
                  Your central command station for multi-agent career evaluations, verified entrance examination cutoffs, NIRF accredited university options, and national scholarships.
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-3 self-start lg:self-center flex-shrink-0">
              <Link to="/notifications" title="System Notices">
                <button className="p-3 rounded-full bg-background hover:bg-secondary text-textSecondary hover:text-textPrimary border border-borderMuted hover:border-accent/40 transition-all cursor-pointer shadow-xs">
                  <Bell className="w-4 h-4" />
                </button>
              </Link>

              <MagneticButton>
                <Link to="/assessment" data-cursor="Assess">
                  <Button variant="primary" size="md" icon={Compass}>
                    {totalSessions > 0 ? 'New Evaluation' : 'Launch Assessment'}
                  </Button>
                </Link>
              </MagneticButton>
            </div>
          </div>

          {/* Quick Navigation Tabs Bar - Only unlocked after completing assessment */}
          {totalSessions > 0 && (
            <div className="flex items-center gap-2 mt-8 pt-6 border-t border-borderMuted/80 overflow-x-auto no-scrollbar text-xs font-mono">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 flex-shrink-0 ${
                  activeTab === 'overview'
                    ? 'bg-charcoal text-white shadow-xs font-semibold'
                    : 'bg-background hover:bg-secondary text-textSecondary hover:text-textPrimary border border-borderMuted'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Dossiers & Roadmap</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-bold">
                  {totalSessions}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('exams')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 flex-shrink-0 ${
                  activeTab === 'exams'
                    ? 'bg-charcoal text-white shadow-xs font-semibold'
                    : 'bg-background hover:bg-secondary text-textSecondary hover:text-textPrimary border border-borderMuted'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Exam Radar 2025–26</span>
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              </button>

              <button
                onClick={() => setActiveTab('scholarships')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 flex-shrink-0 ${
                  activeTab === 'scholarships'
                    ? 'bg-charcoal text-white shadow-xs font-semibold'
                    : 'bg-background hover:bg-secondary text-textSecondary hover:text-textPrimary border border-borderMuted'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>National Scholarships (NSP)</span>
              </button>

              <button
                onClick={() => setActiveTab('streams')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 flex-shrink-0 ${
                  activeTab === 'streams'
                    ? 'bg-charcoal text-white shadow-xs font-semibold'
                    : 'bg-background hover:bg-secondary text-textSecondary hover:text-textPrimary border border-borderMuted'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Stream Pathfinder</span>
              </button>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 2. STATS KPI METRICS ROW */}
        {/* ========================================================================= */}
        {!loading && !error && (
          <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {/* Metric 1: Completed Sessions */}
            <div className="p-5 rounded-2xl bg-surface border border-borderMuted hover:border-accent/40 transition-all duration-300 hover:shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-light border border-accent/20 flex items-center justify-center text-accent flex-shrink-0">
                <BookOpen className="w-6 h-6 stroke-[1.75]" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-textSecondary block">
                  Completed Evaluations
                </span>
                <span
                  data-val={totalSessions}
                  data-is-percent="false"
                  className="counter-val font-serif text-2xl sm:text-3xl text-textPrimary font-normal"
                >
                  {totalSessions}
                </span>
                <span className="text-[10px] font-mono text-textMuted block">
                  {totalSessions > 0 ? 'Persisted in SQLite' : 'No evaluations yet'}
                </span>
              </div>
            </div>

            {/* Metric 2: Average Confidence Fit */}
            <div className="p-5 rounded-2xl bg-surface border border-borderMuted hover:border-accent/40 transition-all duration-300 hover:shadow-xs flex items-center gap-4">
              <div className="relative w-12 h-12 flex-shrink-0">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 56 56">
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    stroke="currentColor"
                    className="text-borderMuted/40"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    stroke="#4A5C46"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 24}
                    strokeDashoffset={2 * Math.PI * 24}
                    data-percent={avgConfidence || 0}
                    className="progress-ring-circle"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-accent font-semibold">
                  {totalSessions > 0 ? 'Fit' : '—'}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-textSecondary block">
                  Advisory Match Fit
                </span>
                {totalSessions > 0 ? (
                  <span
                    data-val={avgConfidence}
                    data-is-percent="true"
                    className="counter-val font-serif text-2xl sm:text-3xl text-textPrimary font-normal"
                  >
                    {avgConfidence}%
                  </span>
                ) : (
                  <span className="font-serif text-2xl sm:text-3xl text-textMuted font-normal">
                    Pending
                  </span>
                )}
                <span className="text-[10px] font-mono text-textMuted block">
                  {totalSessions > 0 ? 'Aptitude Agent Score' : 'Awaiting 8-step intake'}
                </span>
              </div>
            </div>

            {/* Metric 3: Verified Grounding */}
            <div className="p-5 rounded-2xl bg-surface border border-borderMuted hover:border-accent/40 transition-all duration-300 hover:shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-light border border-accent/20 flex items-center justify-center text-accent flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 stroke-[1.75]" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-textSecondary block">
                  Data Accuracy
                </span>
                <span className="font-serif text-xl sm:text-2xl text-textPrimary">
                  NTA & NIRF
                </span>
                <span className="text-[10px] font-mono text-textMuted block">
                  Official 2025/2026 Cutoffs
                </span>
              </div>
            </div>

            {/* Metric 4: Multi-Agent Board */}
            <div className="p-5 rounded-2xl bg-surface border border-borderMuted hover:border-accent/40 transition-all duration-300 hover:shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-light border border-accent/20 flex items-center justify-center text-accent flex-shrink-0">
                <ShieldCheck className="w-6 h-6 stroke-[1.75]" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-textSecondary block">
                  Advisory Board
                </span>
                <span className="font-serif text-xl sm:text-2xl text-textPrimary">
                  4 AI Specialists
                </span>
                <span className="text-[10px] font-mono text-textMuted block">
                  Planner • Aptitude • Pathway • Guidance
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB CONTENT SECTIONS */}
        {/* ========================================================================= */}

        {/* LOADING & ERROR STATES */}
        {loading && (
          <div className="p-8 rounded-3xl bg-surface border border-borderMuted">
            <LoadingSkeleton lines={6} />
          </div>
        )}

        {error && <ErrorState message={error} onRetry={loadData} />}

        {!loading && !error && activeTab === 'overview' && (
          <div className="space-y-10">
            {/* ------------------------------------------------------------------- */}
            {/* GUIDANCE JOURNEY PROGRESS STEPPER */}
            {/* ------------------------------------------------------------------- */}
            <div className="p-6 sm:p-7 rounded-3xl bg-surface border border-borderMuted">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-serif text-xl text-textPrimary">
                    Your 4-Stage Guidance Blueprint
                  </h3>
                  <p className="text-xs text-textSecondary mt-0.5">
                    Structured roadmap to guarantee an authentic, budget-aligned career path.
                  </p>
                </div>
                <div className="text-xs font-mono text-accent bg-accent-light px-3 py-1 rounded-full border border-accent/20 hidden sm:inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  <span>
                    {totalSessions > 0 ? 'Dossier Finalized' : 'Step 2 Action Required'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-background border border-accent/30 relative">
                  <div className="flex items-center justify-between text-xs font-mono text-accent mb-2">
                    <span>STAGE 01</span>
                    <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px]">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </span>
                  </div>
                  <h4 className="font-serif text-base text-textPrimary mb-1">
                    Student Onboarding
                  </h4>
                  <p className="text-xs text-textSecondary leading-relaxed">
                    Account authenticated & secure SQLite storage connected.
                  </p>
                </div>

                {/* Step 2 */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    totalSessions > 0
                      ? 'bg-background border-accent/30'
                      : 'bg-surfaceLight border-accent shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className={totalSessions > 0 ? 'text-accent' : 'text-accent font-bold'}>
                      STAGE 02
                    </span>
                    {totalSessions > 0 ? (
                      <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px]">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-accent text-white font-bold">
                        ACTION
                      </span>
                    )}
                  </div>
                  <h4 className="font-serif text-base text-textPrimary mb-1">
                    8-Step Academic Intake
                  </h4>
                  <p className="text-xs text-textSecondary leading-relaxed mb-3">
                    Marks, stream interests, financial limits, and target state quotas.
                  </p>
                  {totalSessions === 0 && (
                    <Link
                      to="/assessment"
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-accent font-semibold hover:underline"
                    >
                      <span>Launch Intake (~6m)</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                {/* Step 3 */}
                <div
                  className={`p-4 rounded-2xl border ${
                    totalSessions > 0
                      ? 'bg-background border-accent/30'
                      : 'bg-background/60 border-borderMuted opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono text-textMuted mb-2">
                    <span>STAGE 03</span>
                    {totalSessions > 0 ? (
                      <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px]">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono">QUEUED</span>
                    )}
                  </div>
                  <h4 className="font-serif text-base text-textPrimary mb-1">
                    Multi-Agent Synthesis
                  </h4>
                  <p className="text-xs text-textSecondary leading-relaxed">
                    Planner, Aptitude, Pathway, and Guidance agents cross-deliberate.
                  </p>
                </div>

                {/* Step 4 */}
                <div
                  className={`p-4 rounded-2xl border ${
                    totalSessions > 0
                      ? 'bg-background border-accent/30'
                      : 'bg-background/60 border-borderMuted opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono text-textMuted mb-2">
                    <span>STAGE 04</span>
                    {totalSessions > 0 ? (
                      <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px]">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono">LOCKED</span>
                    )}
                  </div>
                  <h4 className="font-serif text-base text-textPrimary mb-1">
                    4-Year Career Dossier
                  </h4>
                  <p className="text-xs text-textSecondary leading-relaxed">
                    Semester milestones, exam cutoffs, scholarships, and backup options.
                  </p>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------------- */}
            {/* SAVED CAREER ASSESSMENTS (DYNAMIC SQLITE DOSSIERS) */}
            {/* ------------------------------------------------------------------- */}
            <div>
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-textPrimary">
                    {totalSessions > 0 ? 'Saved Career Dossiers' : 'Your Career Dossier Workspace'}
                  </h2>
                  <p className="text-xs sm:text-sm text-textSecondary mt-0.5">
                    {totalSessions > 0
                      ? 'Every evaluation is permanently recorded and reproducible from local SQLite.'
                      : 'No synthetic mocks are used. Complete an evaluation to generate your verified dossier.'}
                  </p>
                </div>

                {totalSessions > 0 && (
                  <Link
                    to="/assessment"
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-accent hover:underline font-semibold"
                  >
                    <span>Run Re-evaluation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {totalSessions === 0 ? (
                /* PROPER HIGH-AESTHETIC ONBOARDING HERO WHEN ZERO ASSESSMENTS */
                <div className="p-8 sm:p-10 rounded-3xl bg-surface border border-borderMuted hover:border-accent/40 transition-all duration-300 shadow-sm relative overflow-hidden">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-light text-accent text-xs font-mono font-semibold mb-4 border border-accent/20">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ready to Discover Your Ideal Degree?</span>
                    </div>

                    <h3 className="font-serif text-3xl sm:text-4xl text-textPrimary mb-3 leading-tight">
                      Take the first step toward your academic future.
                    </h3>

                    <p className="text-sm sm:text-base text-textSecondary leading-relaxed mb-6">
                      Class 12 is the most critical juncture in your educational trajectory. Rather than guessing, our four specialist AI agents evaluate your strengths, family budget constraints, and real-time NTA cutoff thresholds to recommend your optimal path.
                    </p>

                    {/* What You Unlock Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-background border border-borderMuted">
                        <div className="w-7 h-7 rounded-lg bg-accent-light text-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-xs text-textPrimary block">
                            Specific Degree Recommendation
                          </span>
                          <span className="text-[11px] text-textSecondary">
                            Tailored to PCM, PCB, Commerce, or Arts.
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-xl bg-background border border-borderMuted">
                        <div className="w-7 h-7 rounded-lg bg-accent-light text-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-xs text-textPrimary block">
                            Entrance Exam Radar
                          </span>
                          <span className="text-[11px] text-textSecondary">
                            Verified NTA, CUET, NEET, and JEE cutoffs.
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-xl bg-background border border-borderMuted">
                        <div className="w-7 h-7 rounded-lg bg-accent-light text-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-xs text-textPrimary block">
                            NIRF Tier 1 & Tier 2 Colleges
                          </span>
                          <span className="text-[11px] text-textSecondary">
                            Institution options aligned to your budget bracket.
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-xl bg-background border border-borderMuted">
                        <div className="w-7 h-7 rounded-lg bg-accent-light text-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-xs text-textPrimary block">
                            Government Scholarships
                          </span>
                          <span className="text-[11px] text-textSecondary">
                            National Scholarship Portal (NSP) schemes.
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Prominent CTA */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                      <Link to="/assessment" data-cursor="Begin">
                        <button className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-charcoal hover:bg-accent text-white rounded-full text-sm font-semibold tracking-wide transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] group cursor-pointer">
                          <span>Begin 8-Step Assessment</span>
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>
                      </Link>

                      <span className="text-xs font-mono text-textSecondary flex items-center gap-2 justify-center">
                        <Clock className="w-3.5 h-3.5 text-accent" />
                        <span>Takes ~6 minutes • Free & Verified</span>
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* CARDS GRID FOR SAVED SESSIONS */
                <div
                  ref={cardsContainerRef}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {recentSessions.map((session) => {
                    const hasConfidence = typeof session.confidence === 'number' && session.confidence > 0;
                    const confidencePercent = hasConfidence ? Math.round(session.confidence * 100) : null;
                    const formattedDate = session.created_at
                      ? new Date(session.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '';

                    return (
                      <div
                        key={session.session_id}
                        data-cursor="Dossier"
                        className="p-6 rounded-3xl bg-surface border border-borderMuted hover:border-accent/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs font-mono text-textSecondary mb-3">
                            <span className="bg-background px-2.5 py-1 rounded-lg border border-borderMuted font-medium">
                              {session.session_id}
                            </span>
                            {formattedDate && <span>{formattedDate}</span>}
                          </div>

                          <h3 className="font-serif text-2xl text-textPrimary group-hover:text-accent transition-colors mb-1">
                            {session.student_name || studentName}
                          </h3>

                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-xs font-mono text-accent uppercase tracking-wider font-semibold">
                              {session.stream} Stream
                            </span>
                            <span className="text-borderMuted">•</span>
                            <span className="text-xs font-mono text-textSecondary">
                              4-Year Roadmap Active
                            </span>
                          </div>

                          <div className="p-4 rounded-2xl bg-background border border-borderMuted mb-4 transition-colors group-hover:border-accent/30">
                            <span className="text-[10px] font-mono text-textSecondary uppercase tracking-wider block mb-1">
                              RECOMMENDED DEGREE
                            </span>
                            <span className="text-sm font-semibold text-textPrimary leading-snug block">
                              {session.recommended_degree}
                            </span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-borderMuted/80 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                            <span className="text-xs font-mono text-textSecondary">
                              {confidencePercent !== null
                                ? `Match Confidence: ${confidencePercent}%`
                                : 'Assessment Completed'}
                            </span>
                          </div>

                          <Link
                            to={`/report/${session.session_id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-accent hover:underline group-hover:translate-x-0.5 transition-transform"
                          >
                            <span>Open Full Dossier</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ------------------------------------------------------------------- */}
            {/* QUICK PREVIEW OF ENTRANCE RADAR IN OVERVIEW (UNLOCKED AFTER ASSESSMENT) */}
            {/* ------------------------------------------------------------------- */}
            {totalSessions > 0 && (
              <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-borderMuted">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl text-textPrimary">
                      Verified National Entrance Radar
                    </h3>
                    <p className="text-xs text-textSecondary mt-0.5">
                      Real examination timelines directly from official testing agencies (NTA, Consortium of NLUs, ICAI).
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('exams')}
                    className="text-xs font-mono text-accent hover:underline font-semibold flex items-center gap-1 self-start sm:self-center"
                  >
                    <span>View All Exams</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {VERIFIED_EXAMS.slice(0, 3).map((exam) => (
                    <div
                      key={exam.id}
                      className="p-4 rounded-2xl bg-background border border-borderMuted hover:border-accent/40 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs font-mono mb-2">
                          <span className="text-accent font-semibold">{exam.stream}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-surface border border-borderMuted text-textSecondary">
                            {exam.status}
                          </span>
                        </div>
                        <h4 className="font-serif text-base text-textPrimary mb-1">
                          {exam.name}
                        </h4>
                        <p className="text-xs text-textSecondary mb-3">
                          {exam.timeline}
                        </p>
                      </div>

                      <a
                        href={exam.portal}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-between text-xs font-mono text-textPrimary hover:text-accent pt-3 border-t border-borderMuted/60 transition-colors"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: EXAMS RADAR TAB */}
        {/* ========================================================================= */}
        {!loading && !error && activeTab === 'exams' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-borderMuted">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl text-textPrimary">
                  Official Class 12 Entrance Examination Calendar
                </h2>
                <p className="text-xs sm:text-sm text-textSecondary mt-1">
                  Verified schedules, official registration portals, and eligibility criteria for 2025/2026 admissions.
                </p>
              </div>

              {/* Stream Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {['All', 'PCM', 'PCB', 'Commerce', 'Arts'].map((stream) => (
                  <button
                    key={stream}
                    onClick={() => setExamStreamFilter(stream)}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                      examStreamFilter === stream
                        ? 'bg-charcoal text-white font-semibold shadow-xs'
                        : 'bg-surface hover:bg-surfaceLight text-textSecondary border border-borderMuted'
                    }`}
                  >
                    {stream === 'All' ? 'All Streams' : stream}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredExams.map((exam) => (
                <div
                  key={exam.id}
                  className="p-6 rounded-3xl bg-surface border border-borderMuted hover:border-accent/40 transition-all duration-300 hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-accent-light text-accent border border-accent/20">
                        {exam.stream} Stream
                      </span>
                      <span className="text-xs font-mono text-textMuted">
                        {exam.agency}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl sm:text-2xl text-textPrimary mb-2">
                      {exam.name}
                    </h3>

                    <div className="space-y-2 mb-5 text-xs text-textSecondary">
                      <div className="flex items-start gap-2">
                        <span className="font-mono text-textPrimary font-semibold w-24 flex-shrink-0">
                          Degrees:
                        </span>
                        <span>{exam.degrees}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-mono text-textPrimary font-semibold w-24 flex-shrink-0">
                          Schedule:
                        </span>
                        <span className="text-accent font-semibold">{exam.timeline}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-mono text-textPrimary font-semibold w-24 flex-shrink-0">
                          Eligibility:
                        </span>
                        <span>{exam.eligibility}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-borderMuted flex items-center justify-between">
                    <span className="text-[11px] font-mono text-textMuted flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                      <span>{exam.status}</span>
                    </span>

                    <a
                      href={exam.portal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary hover:bg-accent hover:text-white text-xs font-mono font-semibold text-textPrimary transition-all cursor-pointer"
                    >
                      <span>Go to Official Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: NATIONAL SCHOLARSHIPS (NSP) TAB */}
        {/* ========================================================================= */}
        {!loading && !error && activeTab === 'scholarships' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-borderMuted">
              <h2 className="font-serif text-2xl sm:text-3xl text-textPrimary">
                Government & National Merit Scholarships
              </h2>
              <p className="text-xs sm:text-sm text-textSecondary mt-1">
                Centrally funded tuition assistance, science fellowships, and state quota financial aid for Class 12 graduates.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {VERIFIED_SCHOLARSHIPS.map((sch) => (
                <div
                  key={sch.code}
                  className="p-6 sm:p-7 rounded-3xl bg-surface border border-borderMuted hover:border-accent/40 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-accent-light text-accent font-semibold border border-accent/20">
                        {sch.code}
                      </span>
                      <span className="text-xs font-mono text-textMuted">
                        {sch.provider}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl sm:text-2xl text-textPrimary mb-2">
                      {sch.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-textSecondary mb-3">
                      <span className="font-mono text-accent font-bold text-sm">
                        {sch.amount}
                      </span>
                    </div>

                    <p className="text-xs text-textSecondary leading-relaxed">
                      <strong className="text-textPrimary font-mono">Criteria: </strong>
                      {sch.eligibility}
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    <a
                      href={sch.portal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-charcoal hover:bg-accent text-white text-xs font-mono font-semibold transition-all shadow-sm"
                    >
                      <span>Open NSP Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: STREAM PATHFINDER TAB */}
        {/* ========================================================================= */}
        {!loading && !error && activeTab === 'streams' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-borderMuted">
              <h2 className="font-serif text-2xl sm:text-3xl text-textPrimary">
                Class 12 Discipline Matrix & Emerging 2025–2030 Horizons
              </h2>
              <p className="text-xs sm:text-sm text-textSecondary mt-1">
                Compare primary disciplines, emerging sub-fields, and entrance requirements across Indian universities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PCM */}
              <div className="p-6 rounded-3xl bg-surface border border-borderMuted flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono text-accent font-semibold block mb-1">
                    ENGINEERING & PHYSICAL SCIENCES
                  </span>
                  <h3 className="font-serif text-2xl text-textPrimary mb-3">
                    PCM & Computing
                  </h3>
                  <p className="text-xs text-textSecondary leading-relaxed mb-4">
                    Core trajectories include Computer Science, Electrical Engineering, Aerospace, Data Science, and Architecture.
                  </p>
                  <div className="space-y-1.5 text-xs font-mono text-textSecondary mb-4">
                    <div>• Key Exams: JEE Main, JEE Advanced, BITSAT, State CETs</div>
                    <div>• Top Degrees: B.Tech, B.E., B.Arch, Integrated BS-MS</div>
                  </div>
                </div>
                <Link
                  to="/assessment"
                  className="inline-flex items-center gap-1 text-xs font-mono text-accent font-semibold hover:underline"
                >
                  <span>Evaluate PCM Fit</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* PCB */}
              <div className="p-6 rounded-3xl bg-surface border border-borderMuted flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono text-accent font-semibold block mb-1">
                    MEDICAL & BIOLOGICAL SCIENCES
                  </span>
                  <h3 className="font-serif text-2xl text-textPrimary mb-3">
                    PCB & Life Sciences
                  </h3>
                  <p className="text-xs text-textSecondary leading-relaxed mb-4">
                    Clinical and allied domains including Medicine (MBBS), Dentistry, Biotechnology, Pharmacy, and Veterinary Medicine.
                  </p>
                  <div className="space-y-1.5 text-xs font-mono text-textSecondary mb-4">
                    <div>• Key Exams: NEET UG, ICAR AIEEA, AIIMS Nursing</div>
                    <div>• Top Degrees: MBBS, BDS, B.Pharm, B.Sc Biotech</div>
                  </div>
                </div>
                <Link
                  to="/assessment"
                  className="inline-flex items-center gap-1 text-xs font-mono text-accent font-semibold hover:underline"
                >
                  <span>Evaluate PCB Fit</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Commerce */}
              <div className="p-6 rounded-3xl bg-surface border border-borderMuted flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono text-accent font-semibold block mb-1">
                    FINANCE, MARKETS & MANAGEMENT
                  </span>
                  <h3 className="font-serif text-2xl text-textPrimary mb-3">
                    Commerce & Economics
                  </h3>
                  <p className="text-xs text-textSecondary leading-relaxed mb-4">
                    Corporate accounting, investment banking, corporate law, business analytics, and Chartered Accountancy.
                  </p>
                  <div className="space-y-1.5 text-xs font-mono text-textSecondary mb-4">
                    <div>• Key Exams: CUET UG, CA Foundation, IPMAT (IIMs)</div>
                    <div>• Top Degrees: B.Com (Hons), BBA, CA, BMS, Eco (Hons)</div>
                  </div>
                </div>
                <Link
                  to="/assessment"
                  className="inline-flex items-center gap-1 text-xs font-mono text-accent font-semibold hover:underline"
                >
                  <span>Evaluate Commerce Fit</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Arts */}
              <div className="p-6 rounded-3xl bg-surface border border-borderMuted flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono text-accent font-semibold block mb-1">
                    LAW, POLICY & HUMANITIES
                  </span>
                  <h3 className="font-serif text-2xl text-textPrimary mb-3">
                    Arts, Humanities & Law
                  </h3>
                  <p className="text-xs text-textSecondary leading-relaxed mb-4">
                    Public administration, corporate law, journalism, diplomacy, design, and behavioral psychology.
                  </p>
                  <div className="space-y-1.5 text-xs font-mono text-textSecondary mb-4">
                    <div>• Key Exams: CLAT, AILET, CUET UG, NIFT, NID</div>
                    <div>• Top Degrees: B.A. LL.B (Hons), B.A. Psychology, B.Des</div>
                  </div>
                </div>
                <Link
                  to="/assessment"
                  className="inline-flex items-center gap-1 text-xs font-mono text-accent font-semibold hover:underline"
                >
                  <span>Evaluate Arts Fit</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* DEDICATED STUDENT PORTAL WORKSPACE FOOTER */}
      <DashboardFooter />
    </div>
  );
}
