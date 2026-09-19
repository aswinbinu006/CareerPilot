import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { Search, HelpCircle, Mail, Phone, MessageSquare, ChevronDown, BookOpen, Compass, GraduationCap, FileCheck } from 'lucide-react';
import gsap from 'gsap';

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openCard, setOpenCard] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    );
  }, []);

  const categories = [
    {
      id: 'assessment',
      icon: Compass,
      title: 'Assessment & Stream Matching',
      desc: 'How the 4-agent LangGraph pipeline evaluates board marks and calculates aptitude fit.',
      articles: [
        'How does CareerPilot account for Class 12 board marks vs entrance exam marks?',
        'Can I modify my favorite subjects and stream after generating a report?',
        'What should I do if my calculated confidence score is under 65%?',
      ],
    },
    {
      id: 'admissions',
      icon: GraduationCap,
      title: 'University Cutoffs & State Quotas',
      desc: 'NIRF accredited universities, home state quotas, and Central Universities.',
      articles: [
        'Which central universities accept CUET-UG scores?',
        'How does CareerPilot factor in state domicile reservations?',
        'Are private university scholarship criteria updated for 2026?',
      ],
    },
    {
      id: 'dossier',
      icon: FileCheck,
      title: 'Dossier Storage & A4 Export',
      desc: 'Saving reports, printing high-resolution summaries, and sharing with mentors.',
      articles: [
        'How do I export my career guidance dossier as a clean A4 PDF?',
        'Can I access previous assessment runs after signing out?',
        'How can a school counselor request institutional access?',
      ],
    },
  ];

  const popularFaqs = [
    {
      q: 'Is CareerPilot official counseling or an advisory recommendation?',
      a: 'CareerPilot provides evidence-grounded academic advisory. While our algorithms query current NIRF rankings, NTA exam dates, and official cutoffs, final seat allotment is administered by state and central counseling bodies (JoSAA, MCC, CSAS, etc.).',
    },
    {
      q: 'How are family budgets mapped against college tuition fees?',
      a: 'During Step 6 of the assessment, you declare an annual or 4-year tuition cap. Our Pathway Agent filters recommended government (subsidized) vs premier private institutions to prevent suggesting universities beyond your family financial parameters.',
    },
    {
      q: 'Can I test parallel backup degrees in other streams?',
      a: 'Yes. At the conclusion of your dossier, the Guidance Agent automatically synthesizes two resilient backup career pathways (e.g. B.Sc Data Science alongside B.Tech Computer Science) so you are never reliant on a single entrance outcome.',
    },
  ];

  const filteredFaqs = popularFaqs.filter((faq) =>
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-textPrimary">
      <Navbar />

      <main ref={containerRef} className="flex-1 max-w-6xl w-full mx-auto px-6 py-14">
        {/* Header with Help Desk Search */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-borderMuted text-xs font-mono text-accent mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>ADVISORY SUPPORT KNOWLEDGE BASE</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-textPrimary mb-4">
            How can our advisory board assist you?
          </h1>
          <p className="text-sm sm:text-base text-textSecondary leading-relaxed mb-8">
            Explore verified documentation on our 4-stage counseling architecture, entrance exam calendars, and student dossier management.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic: e.g. NIRF cutoffs, CUET, budget limits..."
              className="w-full pl-12 pr-4 py-4 rounded-full bg-surface border border-borderMuted text-sm text-textPrimary placeholder:text-textMuted focus:outline-hidden focus:border-accent focus:ring-1 focus:ring-accent/20 shadow-xs transition-all"
            />
            <Search className="w-5 h-5 text-textMuted absolute left-4.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Contact Support Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-2xl bg-surface border border-borderMuted flex items-start gap-4 hover:border-accent/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-accent-light text-accent flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-textPrimary mb-1">Student Desk</h3>
              <p className="text-xs text-textSecondary mb-2">Live advisory inquiry channel for active Class 12 candidates.</p>
              <span className="text-xs font-mono text-accent font-semibold">desk@careerpilot.advisory</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-borderMuted flex items-start gap-4 hover:border-accent/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-accent-light text-accent flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-textPrimary mb-1">Helpline Support</h3>
              <p className="text-xs text-textSecondary mb-2">Mon–Sat, 9:00 AM – 6:00 PM IST for admission queries.</p>
              <span className="text-xs font-mono text-textPrimary font-medium">+91 1800-266-4122</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-borderMuted flex items-start gap-4 hover:border-accent/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-accent-light text-accent flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-textPrimary mb-1">School Affiliations</h3>
              <p className="text-xs text-textSecondary mb-2">Institutional toolkits and access for high school counselors.</p>
              <span className="text-xs font-mono text-accent font-semibold">schools@careerpilot.advisory</span>
            </div>
          </div>
        </div>

        {/* Knowledge Categories */}
        <div className="mb-16">
          <h2 className="font-serif text-2xl sm:text-3xl text-textPrimary mb-6">
            Help Documentation by Topic
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.id}
                  className="p-6 rounded-2xl bg-surface border border-borderMuted hover:border-accent/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-background border border-borderMuted flex items-center justify-center text-accent mb-4">
                      <Icon className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <h3 className="font-serif text-xl text-textPrimary mb-2">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-textSecondary leading-relaxed mb-4">
                      {cat.desc}
                    </p>
                  </div>
                  <ul className="space-y-2 text-xs font-mono text-accent border-t border-borderMuted/60 pt-4">
                    {cat.articles.map((art, idx) => (
                      <li key={idx} className="hover:underline cursor-pointer flex items-start gap-1.5">
                        <span>&bull;</span>
                        <span className="truncate">{art}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expandable Popular Questions */}
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-textPrimary mb-6">
            Frequently Referenced Solutions
          </h2>
          <div className="divide-y divide-borderMuted border-y border-borderMuted">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openCard === idx;
              return (
                <div key={idx} className="py-5">
                  <button
                    onClick={() => setOpenCard(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left gap-4 cursor-pointer group"
                  >
                    <span className="font-serif text-xl text-textPrimary group-hover:text-accent transition-colors">
                      {faq.q}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full border border-borderMuted flex items-center justify-center text-textSecondary transition-transform duration-200 ${
                        isOpen ? 'rotate-180 bg-surface' : ''
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-sm text-textSecondary leading-relaxed pr-8 animate-fade-in">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
