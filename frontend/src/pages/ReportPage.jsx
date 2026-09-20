import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import ReportHeader from '../components/report/ReportHeader';
import BestCareerMatch from '../components/report/BestCareerMatch';
import WhyThisFits from '../components/report/WhyThisFits';
import EntranceExams from '../components/report/EntranceExams';
import CollegesList from '../components/report/CollegesList';
import ScholarshipsList from '../components/report/ScholarshipsList';
import RoadmapTimeline from '../components/report/RoadmapTimeline';
import SkillsRoadmap from '../components/report/SkillsRoadmap';
import BackupOptions from '../components/report/BackupOptions';
import Breadcrumbs from '../components/common/Breadcrumbs';
import CopyButton from '../components/common/CopyButton';
import { ArrowLeft, Compass, Printer, Share2, Check } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { api } from '../services/api';
import MagneticButton from '../components/common/MagneticButton';

export default function ReportPage() {
  const { sessionId } = useParams();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const articleRef = useRef(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);

    // Check session cache first for instant load
    try {
      const cached = sessionStorage.getItem(`report_${sessionId}`);
      if (cached) {
        setReportData(JSON.parse(cached));
        setLoading(false);
        return;
      }
    } catch {}

    try {
      const result = await api.getReport(sessionId);
      if (result) {
        setReportData(result);
      } else {
        throw new Error('Report data not found for this session identifier.');
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve your career report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchReport();
    }
  }, [sessionId]);

  // Staggered scroll reveals across dossier sections
  useEffect(() => {
    if (loading || !reportData || !articleRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const sections = articleRef.current.children;
      Array.from(sections).forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
            },
          }
        );
      });
    }, articleRef);

    return () => ctx.revert();
  }, [loading, reportData]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-textPrimary">
      <Navbar />

      <Breadcrumbs
        customCrumbs={[
          { label: 'Student Dossiers', path: '/dashboard' },
          { label: `Session ${sessionId}`, path: `/report/${sessionId}` },
        ]}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        {/* Navigation Breadcrumb & Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 no-print">
          <Link
            to="/dashboard"
            data-cursor="Dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-textSecondary hover:text-textPrimary transition-all hover:-translate-x-0.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Link>

          {reportData && (
            <div className="flex items-center gap-3">
              <CopyButton
                text={window.location.href}
                label="Share Report"
                successLabel="Report Link Copied"
              />

              <MagneticButton>
                <button
                  onClick={() => window.print()}
                  data-cursor="Print"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal dark:bg-accent hover:bg-accent dark:hover:bg-accent-hover text-white rounded-full text-xs font-mono tracking-wide transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Publication Dossier</span>
                </button>
              </MagneticButton>
            </div>
          )}
        </div>

        {/* Dynamic States */}
        {loading ? (
          <div className="p-8 rounded-2xl bg-surface border border-borderMuted">
            <LoadingSkeleton lines={6} />
          </div>
        ) : error ? (
          <ErrorState
            title="Dossier Retrieval Failed"
            message={error}
            onRetry={fetchReport}
          />
        ) : !reportData ? (
          <EmptyState
            variant="assessments"
            title="Career report not found"
            description="No record matching this session ID exists in the CareerPilot archive."
            actionText="Start New Assessment"
            actionLink="/assessment"
          />
        ) : (
          <article ref={articleRef} className="w-full bg-background print:p-0 space-y-2">
            {/* 1. Header */}
            <ReportHeader sessionData={reportData} />

            {/* 2. Best Career Match */}
            <BestCareerMatch
              recommendation={reportData.recommendation}
              confidence={reportData.confidence}
            />

            {/* 3. Why This Fits */}
            <WhyThisFits
              recommendation={reportData.recommendation}
              markdownContent={reportData.report_markdown}
              stream={reportData.stream}
            />

            {/* 4. Entrance Exams */}
            <EntranceExams
              pathwayData={reportData.pathway_research}
              markdownContent={reportData.report_markdown}
              recommendation={reportData.recommendation}
              stream={reportData.stream}
            />

            {/* 5. Recommended Colleges */}
            <CollegesList
              pathwayData={reportData.pathway_research}
              markdownContent={reportData.report_markdown}
              recommendation={reportData.recommendation}
              stream={reportData.stream}
            />

            {/* 6. Scholarships & Aid */}
            <ScholarshipsList
              pathwayData={reportData.pathway_research}
              markdownContent={reportData.report_markdown}
              recommendation={reportData.recommendation}
              stream={reportData.stream}
            />

            {/* 7. Four-Year Roadmap */}
            <RoadmapTimeline
              recommendation={reportData.recommendation}
              markdownContent={reportData.report_markdown}
              stream={reportData.stream}
            />

            {/* 8. Emerging Skills */}
            <SkillsRoadmap
              recommendation={reportData.recommendation}
              markdownContent={reportData.report_markdown}
              stream={reportData.stream}
            />

            {/* 9. Backup Options */}
            <BackupOptions
              recommendation={reportData.recommendation}
              markdownContent={reportData.report_markdown}
              stream={reportData.stream}
            />

            {/* Official Footer Verification */}
            <div className="pt-8 mt-12 border-t border-borderMuted text-xs font-mono text-textMuted flex flex-col sm:flex-row items-center justify-between gap-4">
              <span>CareerPilot Educational Advisory • Grounded in NTA & NIRF Criteria</span>
              <div className="flex items-center gap-2">
                <span>Session ID:</span>
                <CopyButton text={reportData.session_id} label={reportData.session_id} />
              </div>
            </div>
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
}
