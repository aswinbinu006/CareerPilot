import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Milestone } from 'lucide-react';
import gsap from 'gsap';
import { extractRoadmapFromMarkdown } from '../../utils/pathwayParser';

export default function RoadmapTimeline({ recommendation, markdownContent = '', stream = '' }) {
  const [activeYear, setActiveYear] = useState(1);
  const contentRef = useRef(null);

  const degree = (recommendation?.recommended_degree || '').toLowerCase();
  const streamLower = (stream || recommendation?.career_stream || '').toLowerCase();

  // Dynamically extract AI-generated roadmap from markdown if present
  const dynamicRoadmap = useMemo(() => {
    return extractRoadmapFromMarkdown(markdownContent);
  }, [markdownContent]);

  // Dynamically tailor milestones based on actual recommendation & stream
  const getStreamMilestones = () => {
    // 1. Medicine, Pharmacy, Life Sciences & Healthcare (PCB)
    if (streamLower.includes('pcb') || degree.includes('mbbs') || degree.includes('bds') || degree.includes('b.pharm') || degree.includes('biology') || degree.includes('biotech') || degree.includes('medicine')) {
      return [
        {
          year: 1,
          title: 'Year 1: Pre-Clinical Rigor & Foundational Sciences',
          milestones: [
            'Master Human Anatomy, General Physiology, and Medical Biochemistry foundations.',
            'Develop disciplined laboratory techniques, histological slide analysis, and scientific ethics.',
            'Engage with hospital orientation programs and medical student academic societies.',
          ],
          skills: 'Cadaveric Anatomy, Physiological Diagnostics, Biochemistry Titrations, Clinical Observation',
        },
        {
          year: 2,
          title: 'Year 2: Paraclinical Sciences & Diagnostic Pathology',
          milestones: [
            'Complete core Pathology, Medical Microbiology, and Pharmacology coursework.',
            'Begin structured outpatient department (OPD) observation and patient history taking.',
            'Participate in public health epidemiological surveys and rural clinical postings.',
          ],
          skills: 'Pathological Staining, Antimicrobial Profiling, Clinical Pharmacology, Diagnostic Reasoning',
        },
        {
          year: 3,
          title: 'Year 3: Clinical Disciplines & Ward Postings',
          milestones: [
            'Execute intensive ward rounds across General Medicine, Surgery, and Community Medicine.',
            'Present complex clinical patient cases and bedside diagnostic findings during morning rounds.',
            'Initiate research projects or ICMR-STS (Short Term Studentship) grants with clinical faculty.',
          ],
          skills: 'Bedside Physical Examination, Surgical Asepsis, Patient Communication, Differential Diagnosis',
        },
        {
          year: 4,
          title: 'Year 4: Comprehensive Clinical Practice & Fellowship Strategy',
          milestones: [
            'Complete advanced specialty postings (Pediatrics, Obstetrics & Gynecology, Orthopedics).',
            'Prepare systematically for national licensing and postgraduate entrance examinations (NEET-PG / NExT / USMLE).',
            'Commence compulsory rotating clinical internship across emergency medicine and rural health centers.',
          ],
          skills: 'Emergency Trauma Protocols, Neonatal Resuscitation, Pharmacotherapeutics, Licensing Exam Rigor',
        },
      ];
    }

    // 2. Commerce, Finance, Management & Economics
    if (streamLower.includes('commerce') || degree.includes('b.com') || degree.includes('bba') || degree.includes('finance') || degree.includes('economics') || degree.includes('ca') || degree.includes('accounting')) {
      return [
        {
          year: 1,
          title: 'Year 1: Financial Accounting & Microeconomic Foundations',
          milestones: [
            'Build mastery in Financial Accounting standards (Ind AS/IFRS), Business Law, and Managerial Economics.',
            'Achieve strong first-year CGPA to secure high-demand corporate finance or business analytics electives.',
            'Register for professional certifications if targeting professional tracks (CA Foundation / CMA / CFA Level 1).',
          ],
          skills: 'Spreadsheet Modeling, Double-Entry Accounting, Business Economics, Mercantile Law',
        },
        {
          year: 2,
          title: 'Year 2: Corporate Finance, Costing & Applied Analytics',
          milestones: [
            'Complete intermediate corporate finance, cost management, direct taxation, and commercial auditing.',
            'Develop real-world equity valuation models and financial statement analysis for public companies.',
            'Compete in national collegiate case study competitions and fintech hackathons.',
          ],
          skills: 'DCF Valuation, Working Capital Optimization, GST & Corporate Tax, Financial Econometrics',
        },
        {
          year: 3,
          title: 'Year 3: Strategic Internship & Industry Certifications',
          milestones: [
            'Secure and execute an 8-week corporate finance, investment banking, or management consulting internship.',
            'Acquire industry-standard credentials (e.g. Financial Modeling & Valuation Analyst, Bloomberg Market Concepts).',
            'Begin pre-placement preparation: quantitative aptitude, case interviews, and group discussions.',
          ],
          skills: 'M&A Deal Analysis, Risk Management, Corporate Due Diligence, Executive Presentation',
        },
        {
          year: 4,
          title: 'Year 4: Placement Execution & Postgraduate Planning',
          milestones: [
            'Participate actively in on-campus placement drives for premier banking, advisory, and corporate analyst positions.',
            'Complete undergraduate capstone project or comprehensive equity research report.',
            'Finalize CAT, XAT, or GMAT preparation if pursuing elite MBA programs or overseas master’s degrees.',
          ],
          skills: 'Portfolio Advisory, Corporate Strategy, Capital Budgeting, Leadership & Negotiation',
        },
      ];
    }

    // 3. Arts, Humanities, Law & Social Sciences
    if (streamLower.includes('arts') || streamLower.includes('humanities') || degree.includes('law') || degree.includes('b.a') || degree.includes('ll.b') || degree.includes('design') || degree.includes('psychology') || degree.includes('journalism')) {
      return [
        {
          year: 1,
          title: 'Year 1: Critical Discourse, Jurisprudence & Core Principles',
          milestones: [
            'Establish deep grounding in Constitutional Principles, Political Thought, Sociology, and Legal Methods.',
            'Participate in collegiate debating societies, philosophical roundtables, and freshman moot courts.',
            'Hone academic research synthesis and formal analytical citation methodologies (Bluebook/APA).',
          ],
          skills: 'Constitutional Reasoning, Critical Discourse, Legal Research, Academic Composition',
        },
        {
          year: 2,
          title: 'Year 2: Substantive Domain Exploration & Moot Court Rigor',
          milestones: [
            'Complete core coursework in Contract Law, Human Rights, Cognitive Psychology, or Media Systems.',
            'Draft research papers for peer-reviewed undergraduate journals and national symposiums.',
            'Secure a winter judicial clerkship or research assistantship with policy think tanks / NGOs.',
          ],
          skills: 'Statutory Interpretation, Case Law Synthesis, Qualitative Fieldwork, Policy Drafting',
        },
        {
          year: 3,
          title: 'Year 3: Applied Legal Practice & Policy Fellowships',
          milestones: [
            'Undertake an intensive summer internship with senior advocates, corporate legal teams, or public interest institutions.',
            'Represent the institution at national moot court competitions or international policy simulations.',
            'Select specialized final-year electives (Intellectual Property, Corporate Governance, Clinical Psychology).',
          ],
          skills: 'Litigation Drafting, Client Counseling, Legislative Advocacy, Cross-Disciplinary Synthesis',
        },
        {
          year: 4,
          title: 'Year 4: Capstone Dissertation & Bar / Fellowship Launch',
          milestones: [
            'Author and defend senior thesis or public interest research capstone before a faculty jury.',
            'Participate in campus placement recruitment with top law firms, research foundations, and media organizations.',
            'Prepare for Bar Council examinations, judicial service exams, or Civil Services (UPSC CSE) foundations.',
          ],
          skills: 'Appellate Advocacy, Strategic Communication, Regulatory Compliance, Public Policy Analysis',
        },
      ];
    }

    // 4. Engineering, Technology & Physical Sciences (PCM)
    return [
      {
        year: 1,
        title: 'Year 1: Engineering Foundations & Algorithmic Principles',
        milestones: [
          'Master Multivariable Calculus, Engineering Physics, and Foundations of Computing.',
          'Establish a strong first-year GPA (8.0+ CGPA) to qualify for competitive department electives and honors tracks.',
          'Join institutional robotics, coding, or core engineering design laboratories.',
        ],
        skills: 'Algorithmic Problem Solving, Linear Algebra, Version Control (Git), Laboratory Measurement',
      },
      {
        year: 2,
        title: 'Year 2: Core Engineering Systems & Practical Prototyping',
        milestones: [
          'Complete intermediate discipline coursework (Data Structures, Circuit Theory, Thermodynamics, or Fluid Mechanics).',
          'Design and build two functional engineering projects with verifiable code/CAD repositories.',
          'Engage with department professors for exploratory undergraduate research projects.',
        ],
        skills: 'Data Structures & Algorithms, Systems Modeling, CAD/Simulation Toolchains, Modular Architecture',
      },
      {
        year: 3,
        title: 'Year 3: Industrial Internship & Advanced Specialization',
        milestones: [
          'Secure and execute an 8-to-12-week summer technical internship in industry or national research labs (ISRO, DRDO, CSIR).',
          'Acquire professional cloud or systems credentials (e.g. AWS Certified, Embedded RTOS, SolidWorks Professional).',
          'Begin pre-placement technical preparation: system design, algorithmic interviews, and core engineering assessments.',
        ],
        skills: 'Distributed Systems, Production Debugging, Embedded Interfaces, Performance Benchmarking',
      },
      {
        year: 4,
        title: 'Year 4: Capstone Engineering Deployment & Career Launch',
        milestones: [
          'Complete and defend a published or production-deployed undergraduate Capstone Engineering Project.',
          'Participate actively in campus recruitment drives and off-campus engineering fellowship interviews.',
          'Finalize GATE, GRE, or CAT preparation for advanced engineering research or top-tier master’s admissions.',
        ],
        skills: 'Production Deployment, CI/CD Pipelines, Project Management, Technical Defense & Presentation',
      },
    ];
  };

  const years = dynamicRoadmap.length >= 2 ? dynamicRoadmap : getStreamMilestones();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !contentRef.current) return;

    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.32, ease: 'power2.out' }
    );

    const items = contentRef.current.querySelectorAll('.milestone-item');
    if (items.length > 0) {
      gsap.fromTo(
        items,
        { opacity: 0, x: 12 },
        { opacity: 1, x: 0, duration: 0.28, stagger: 0.05, ease: 'power2.out', delay: 0.05 }
      );
    }
  }, [activeYear]);

  return (
    <div className="w-full mb-10">
      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-textSecondary mb-2">
        <Milestone className="w-3.5 h-3.5 text-accent" />
        <span>ACTIONABLE TRAJECTORY</span>
      </div>
      <h3 className="font-serif text-2xl sm:text-3xl text-textPrimary mb-6">
        Four-Year Undergraduate Milestones
      </h3>

      {/* Year Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-borderMuted pb-3 overflow-x-auto">
        {years.map((y) => (
          <button
            key={y.year}
            onClick={() => setActiveYear(y.year)}
            data-cursor="Select"
            className={`px-4 py-2 rounded-full text-xs font-mono tracking-wide transition-all duration-200 cursor-pointer ${
              activeYear === y.year
                ? 'bg-charcoal dark:bg-accent text-white shadow-xs font-semibold scale-102'
                : 'bg-surface hover:bg-surfaceLight text-textSecondary border border-borderMuted hover:border-accent/40'
            }`}
          >
            Year 0{y.year}
          </button>
        ))}
      </div>

      {/* Active Year Content */}
      <div
        ref={contentRef}
        className="p-8 rounded-2xl bg-surface border border-borderMuted shadow-xs"
      >
        <h4 className="font-serif text-xl sm:text-2xl text-textPrimary mb-4">
          {years[activeYear - 1]?.title}
        </h4>

        <div className="space-y-3 mb-6">
          {years[activeYear - 1]?.milestones.map((m, idx) => (
            <div
              key={idx}
              className="milestone-item flex items-start gap-3 text-sm text-textSecondary"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
              <p className="leading-relaxed">{m}</p>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-borderMuted/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
          <span className="text-textSecondary uppercase tracking-wider">
            Target Competencies:
          </span>
          <span className="text-accent font-medium">
            {years[activeYear - 1]?.skills}
          </span>
        </div>
      </div>
    </div>
  );
}
