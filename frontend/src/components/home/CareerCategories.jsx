import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SectionHeader from '../common/SectionHeader';
import { ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import ParallaxImage from '../common/ParallaxImage';

export default function CareerCategories() {
  const [selectedTab, setSelectedTab] = useState('all');
  const cardsContainerRef = useRef(null);

  const streams = [
    {
      id: 'pcm',
      title: 'PCM (Physical Sciences & Computing)',
      category: 'pcm',
      degrees: 'B.Tech, B.Sc Computing, B.Arch, Integrated M.Sc',
      description:
        'For analytical thinkers drawn to computational algorithms, electronics, mechanical systems, physics research, and digital infrastructure.',
      image:
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop',
      keyExams: 'JEE Main, BITSAT, State CETs, UGEE',
    },
    {
      id: 'pcb',
      title: 'PCB (Biological Sciences & Healthcare)',
      category: 'pcb',
      degrees: 'MBBS, BDS, B.Sc Biotech, B.Pharm, Allied Health',
      description:
        'For investigative minds dedicated to clinical medicine, pharmaceutical sciences, genetics, agricultural technology, and biomedical research.',
      image:
        'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=800&auto=format&fit=crop',
      keyExams: 'NEET-UG, CUET-UG (Biology), ICAR AIEEA',
    },
    {
      id: 'commerce',
      title: 'Commerce (Finance & Management)',
      category: 'commerce',
      degrees: 'B.Com (Hons), BBA, CA Foundation, Actuarial Science',
      description:
        'For strategic thinkers interested in investment banking, corporate law, auditing, macroeconomic policy, and startup ventures.',
      image:
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop',
      keyExams: 'CUET-UG (DU/SRCC), IPMAT (IIMs), NPAT, CA Foundation',
    },
    {
      id: 'arts',
      title: 'Arts & Humanities (Design, Law & Policy)',
      category: 'arts',
      degrees: 'B.A. Journalism, B.Des, 5-Year Integrated B.A. LL.B.',
      description:
        'For creative communicators, legal minds, and societal observers passionate about UI/UX design, corporate law, psychology, and public administration.',
      image:
        'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop',
      keyExams: 'CLAT (NLUs), NID DAT, NIFT, CUET-UG (St. Stephens/Ashoka)',
    },
  ];

  const filteredStreams =
    selectedTab === 'all'
      ? streams
      : streams.filter((s) => s.category === selectedTab);

  // Tabs reveal animation: under 350ms, incoming slides upward with stagger
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !cardsContainerRef.current) return;

    const ctx = gsap.context(() => {
      const cards = cardsContainerRef.current.children;
      gsap.fromTo(
        cards,
        { opacity: 0, y: 18, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.32,
          stagger: 0.05,
          ease: 'power2.out',
        }
      );
    }, cardsContainerRef);

    return () => ctx.revert();
  }, [selectedTab]);

  const tabs = [
    { id: 'all', label: 'All Streams' },
    { id: 'pcm', label: 'PCM' },
    { id: 'pcb', label: 'PCB' },
    { id: 'commerce', label: 'Commerce' },
    { id: 'arts', label: 'Arts & Law' },
  ];

  return (
    <section id="streams" className="w-full py-24 bg-secondary/40 border-t border-borderMuted">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <SectionHeader
            tag="STREAM NAVIGATION"
            title="Explore academic disciplines with depth."
            description="A curriculum-aligned overview of Class 12 pathways across India. Select any stream to initiate an assessment specifically calibrated to its entrance exams and university options."
            align="left"
          />

          {/* Interactive Editorial Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-full bg-surface border border-borderMuted self-start md:self-auto">
            {tabs.map((tab) => {
              const isActive = selectedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  data-cursor="Select"
                  className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'bg-charcoal dark:bg-accent text-white shadow-xs font-semibold'
                      : 'text-textSecondary hover:text-textPrimary hover:bg-background/60'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cards Grid with high-end hover lift & subtle tilt */}
        <div
          ref={cardsContainerRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {filteredStreams.map((stream) => (
            <Link
              key={stream.id}
              to={`/assessment?stream=${stream.id}`}
              data-cursor="Explore"
              className="group rounded-2xl overflow-hidden bg-surface border border-borderMuted hover:border-accent/50 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col will-change-transform"
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Card Image Banner with Parallax */}
              <div className="relative h-48 w-full overflow-hidden bg-stone-200 dark:bg-[#1A1C18]">
                <ParallaxImage
                  src={stream.image}
                  alt={stream.title}
                  className="w-full h-full"
                  speed={5}
                  cursorText="Stream"
                  overlay={
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 dark:from-black/85 via-black/25 to-transparent pointer-events-none" />
                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs font-mono pointer-events-none">
                        <span>CURRICULUM PROFILE</span>
                        <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur flex items-center justify-center group-hover:bg-white group-hover:text-[#1C1C1C] group-hover:rotate-45 transition-all duration-300">
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      </div>
                    </>
                  }
                />
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-2xl text-textPrimary group-hover:text-accent transition-colors duration-200 mb-2">
                    {stream.title}
                  </h3>
                  <p className="text-textSecondary text-xs font-mono uppercase tracking-wide mb-3">
                    {stream.degrees}
                  </p>
                  <p className="text-textSecondary text-sm leading-relaxed mb-4">
                    {stream.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-borderMuted/60 flex items-center justify-between text-xs font-mono text-textMuted">
                  <span>EXAMS: {stream.keyExams}</span>
                  <span className="text-accent font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Start Assessment &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
