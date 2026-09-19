import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { Bell, CheckCheck, Calendar, Award, GraduationCap, Compass, ArrowUpRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { api } from '../services/api';

export default function NotificationsPage() {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    const loadDynamicNotifications = async () => {
      setLoading(true);
      const user = api.getCurrentUser();
      let realSessions = [];

      try {
        const response = await api.getRecentSessions();
        if (response && Array.isArray(response.recent_sessions)) {
          realSessions = response.recent_sessions;
        }
      } catch {}

      const userNotifications = [];

      // 1. Dynamic User Assessment Status
      if (realSessions.length > 0) {
        realSessions.forEach((s, idx) => {
          userNotifications.push({
            id: `session-${s.session_id || idx}`,
            category: 'career',
            title: `Assessment Dossier Finalized: ${s.recommended_degree}`,
            desc: `Deliberation complete for ${s.student_name || user?.name || 'Class 12 Candidate'}. Four-year academic roadmap generated.`,
            time: s.created_at ? new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recent',
            read: false,
            icon: Compass,
            link: `/report/${s.session_id}`,
            isExternal: false,
          });
        });
      } else {
        userNotifications.push({
          id: 'welcome-01',
          category: 'career',
          title: 'Welcome to CareerPilot Advisory',
          desc: 'Complete your 8-step Class 12 evaluation to generate your verified degree recommendations and NIRF roadmap.',
          time: 'Getting Started',
          read: false,
          icon: Sparkles,
          link: '/assessment',
          isExternal: false,
        });
      }

      // 2. Verified Official National Advisories (Real Public Sources: NTA & NSP)
      const officialBulletins = [
        {
          id: 'official-cuet',
          category: 'exams',
          title: 'CUET-UG 2026 Examination Portal Notice',
          desc: 'National Testing Agency (NTA) official notification gateway for central and state university admissions.',
          time: 'NTA Official',
          read: true,
          icon: Calendar,
          link: 'https://cuetug.ntaonline.in',
          isExternal: true,
        },
        {
          id: 'official-nsp',
          category: 'career',
          title: 'National Scholarship Portal (NSP) Central Sector Scheme',
          desc: 'Ministry of Education annual scholarship window for Class 12 candidates scoring in the top 20th percentile.',
          time: 'NSP Portal',
          read: true,
          icon: Award,
          link: 'https://scholarships.gov.in',
          isExternal: true,
        },
        {
          id: 'official-nta',
          category: 'exams',
          title: 'NTA National Admissions & Examination Portal',
          desc: 'Centralized public gateway for national eligibility evaluations and official exam schedules.',
          time: 'NTA Calendar',
          read: true,
          icon: GraduationCap,
          link: 'https://nta.ac.in',
          isExternal: true,
        },
      ];

      setNotifications([...userNotifications, ...officialBulletins]);
      setLoading(false);
    };

    loadDynamicNotifications();
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    );
  }, [filter, loading]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filteredNotifications = notifications.filter((item) => {
    if (filter === 'unread') return !item.read;
    if (filter === 'career') return item.category === 'career';
    if (filter === 'exams') return item.category === 'exams';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col bg-background text-textPrimary">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-14">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-8 border-b border-borderMuted">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-borderMuted text-xs font-mono text-accent mb-3">
              <Bell className="w-3.5 h-3.5" />
              <span>STUDENT INTELLIGENCE DISPATCHES</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-textPrimary">
              Advisory Dispatches & Deadlines
            </h1>
            <p className="text-xs sm:text-sm text-textSecondary mt-1">
              Live updates regarding your assessment dossiers, university admissions, and national scholarship windows.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-borderMuted text-xs font-mono text-textSecondary hover:text-textPrimary hover:border-accent/40 transition-all cursor-pointer self-start sm:self-auto"
            >
              <CheckCheck className="w-4 h-4 text-accent" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {['all', 'unread', 'career', 'exams'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                filter === f
                  ? 'bg-charcoal text-white font-semibold shadow-xs'
                  : 'bg-surface hover:bg-surfaceLight text-textSecondary border border-borderMuted hover:border-accent/40'
              }`}
            >
              {f === 'all'
                ? `All (${notifications.length})`
                : f === 'unread'
                ? `Unread (${unreadCount})`
                : f === 'career'
                ? 'Assessments & Aid'
                : 'National Portals'}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div ref={containerRef} className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-surface/50 border border-dashed border-borderMuted">
              <Bell className="w-8 h-8 text-textMuted mx-auto mb-3 opacity-60" />
              <h3 className="font-serif text-xl text-textPrimary mb-1">
                You're completely caught up.
              </h3>
              <p className="text-xs text-textSecondary">
                No active notifications found in this view.
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`p-6 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                    !item.read
                      ? 'bg-surface border-accent/30 shadow-xs'
                      : 'bg-surface/60 border-borderMuted hover:border-accent/40'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      !item.read
                        ? 'bg-accent text-white shadow-xs'
                        : 'bg-background text-textSecondary border border-borderMuted'
                    }`}
                  >
                    <Icon className="w-5 h-5 stroke-[1.75]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <h4
                        className={`font-serif text-lg leading-snug ${
                          !item.read
                            ? 'text-textPrimary font-semibold'
                            : 'text-textPrimary font-normal'
                        }`}
                      >
                        {item.title}
                      </h4>
                      <span className="text-[11px] font-mono text-textMuted flex-shrink-0">
                        {item.time}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-textSecondary leading-relaxed mb-3">
                      {item.desc}
                    </p>

                    {item.isExternal ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-accent hover:underline"
                      >
                        <span>Official Portal</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <Link
                        to={item.link}
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-accent hover:underline"
                      >
                        <span>Open Details</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
