import React from 'react';
import { Sparkles, Layers, Terminal, BookMarked, Activity, Scale, Briefcase } from 'lucide-react';

export default function SkillsRoadmap({ recommendation, stream = '' }) {
  const degree = (recommendation?.recommended_degree || '').toLowerCase();
  const streamLower = (stream || recommendation?.career_stream || '').toLowerCase();

  const getStreamSkills = () => {
    // 1. PCB / Medicine, Life Sciences & Healthcare
    if (streamLower.includes('pcb') || degree.includes('mbbs') || degree.includes('bds') || degree.includes('b.pharm') || degree.includes('biology') || degree.includes('biotech') || degree.includes('medicine')) {
      return [
        {
          icon: Activity,
          category: 'Clinical Diagnostic Competencies',
          skills: ['Cadaveric Anatomy', 'Systemic Histopathology', 'Microbial Staining', 'Pharmacokinetics'],
          desc: 'Core physiological and pathological laboratory foundations required for patient diagnosis.',
        },
        {
          icon: Layers,
          category: 'Clinical Procedures & Emergency Care',
          skills: ['Physical Examination', 'Venipuncture & Asepsis', 'BLS / ACLS Protocol', 'ECG Interpretation'],
          desc: 'Essential hands-on hospital procedures and acute patient stabilization methodologies.',
        },
        {
          icon: BookMarked,
          category: 'Medical Ethics & Patient Communication',
          skills: ['Informed Consent', 'Biomedical Ethics', 'Patient History Taking', 'Epidemiological Analysis'],
          desc: 'Vital for compassionate healthcare delivery, clinical trials, and medical council compliance.',
        },
      ];
    }

    // 2. Commerce, Finance, Corporate Law & Management
    if (streamLower.includes('commerce') || degree.includes('b.com') || degree.includes('bba') || degree.includes('finance') || degree.includes('economics') || degree.includes('ca') || degree.includes('accounting')) {
      return [
        {
          icon: Briefcase,
          category: 'Quantitative & Financial Modeling',
          skills: ['Discounted Cash Flow (DCF)', 'Financial Statement Modeling', 'Advanced Excel / PowerBI', 'Ratio Analysis'],
          desc: 'Rigorous quantitative frameworks for corporate valuation, equity research, and investment banking.',
        },
        {
          icon: Layers,
          category: 'Accounting Standards & Regulatory Tax',
          skills: ['Ind AS / IFRS Standards', 'Direct & Indirect GST Tax', 'Statutory Auditing', 'ERP (SAP/Tally)'],
          desc: 'Core regulatory and corporate financial governance skills demanded by Big 4 and multinational firms.',
        },
        {
          icon: BookMarked,
          category: 'Strategic Negotiation & Executive Advisory',
          skills: ['M&A Deal Diligence', 'Corporate Presentation', 'Risk Management', 'Capital Budgeting'],
          desc: 'Leadership competencies essential for senior financial analyst and consulting tracks.',
        },
      ];
    }

    // 3. Arts, Humanities, Law & Media
    if (streamLower.includes('arts') || streamLower.includes('humanities') || degree.includes('law') || degree.includes('b.a') || degree.includes('ll.b') || degree.includes('design') || degree.includes('psychology') || degree.includes('journalism')) {
      return [
        {
          icon: Scale,
          category: 'Legal Analysis & Constitutional Research',
          skills: ['Statutory Interpretation', 'Case Law Precedent Analysis', 'SCC Online / Manupatra', 'Legal Drafting'],
          desc: 'Foundational analytical methods for litigation drafting, appellate briefs, and judicial research.',
        },
        {
          icon: Layers,
          category: 'Public Policy & Qualitative Investigation',
          skills: ['Policy Impact Assessment', 'Ethnographic Fieldwork', 'Data Synthesis', 'Legislative Drafting'],
          desc: 'Methodologies utilized by premier think tanks, governmental bodies, and international NGOs.',
        },
        {
          icon: BookMarked,
          category: 'Advocacy & Strategic Persuasion',
          skills: ['Appellate Oral Advocacy', 'Public Discourse', 'Conflict Mediation', 'Ethical Governance'],
          desc: 'High-impact communication required for courtroom litigation, public defense, and media leadership.',
        },
      ];
    }

    // 4. Engineering, Computer Science & Physical Sciences (PCM)
    return [
      {
        icon: Terminal,
        category: 'Systems & Algorithmic Engineering',
        skills: ['Data Structures & Algorithms', 'System Architecture', 'Version Control (Git)', 'Linux Toolchains'],
        desc: 'Fundamental problem-solving and software architecture required across modern engineering industries.',
      },
      {
        icon: Layers,
        category: 'Domain & Hardware Simulation Toolchains',
        skills: ['CAD/CAE Modeling', 'Embedded Interfaces', 'Distributed Cloud Systems', 'Test Automation'],
        desc: 'Applied industrial workflows that bridge academic theory with scalable production deployments.',
      },
      {
        icon: BookMarked,
        category: 'Engineering Management & Technical Defense',
        skills: ['Design Documentation', 'Peer Code/CAD Review', 'Agile Methodologies', 'Technical Presentation'],
        desc: 'Essential for collaborating within cross-functional research laboratories and global engineering teams.',
      },
    ];
  };

  const skillCategories = getStreamSkills();

  return (
    <div className="w-full mb-10">
      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-textSecondary mb-2">
        <Sparkles className="w-3.5 h-3.5 text-accent" />
        <span>COMPETENCY BLUEPRINT</span>
      </div>
      <h3 className="font-serif text-2xl sm:text-3xl text-textPrimary mb-6">
        Emerging High-Value Skills
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {skillCategories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-surface border border-borderMuted flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-background border border-borderMuted flex items-center justify-center text-accent mb-4">
                  <Icon className="w-4 h-4 stroke-[1.75]" />
                </div>
                <h4 className="font-serif text-xl text-textPrimary mb-2">
                  {cat.category}
                </h4>
                <p className="text-xs text-textSecondary leading-relaxed mb-4">
                  {cat.desc}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {cat.skills.map((s, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-mono px-2.5 py-1 rounded bg-background border border-borderMuted text-textPrimary"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
