import React from 'react';
import Button from '../common/Button';
import { ArrowRight, Check } from 'lucide-react';

export default function Step2Stream({ data, onChange, onNext }) {
  const streams = [
    {
      id: 'PCM (Physics, Chemistry, Maths)',
      title: 'PCM',
      subtitle: 'Physics, Chemistry, Mathematics',
      desc: 'Focused on Engineering, Computing, Physical Sciences & Architecture.',
    },
    {
      id: 'PCB (Physics, Chemistry, Biology)',
      title: 'PCB',
      subtitle: 'Physics, Chemistry, Biology',
      desc: 'Focused on Clinical Medicine, Biotechnology, Pharmacy & Healthcare.',
    },
    {
      id: 'Commerce with Maths',
      title: 'Commerce with Maths',
      subtitle: 'Accountancy, Economics, Applied Maths',
      desc: 'Focused on Finance, Actuarial Science, CA, Economics & Management.',
    },
    {
      id: 'Commerce without Maths',
      title: 'Commerce',
      subtitle: 'Accountancy, Business Studies, Economics',
      desc: 'Focused on Business Management, Corporate Law, Accounting & Banking.',
    },
    {
      id: 'Arts / Humanities',
      title: 'Arts & Humanities',
      subtitle: 'Psychology, Literature, Sociology, History',
      desc: 'Focused on Law, Design, Journalism, Public Policy & Creative Industries.',
    },
  ];

  const selected = data.stream || '';

  const handleSelect = (id) => {
    onChange('stream', id);
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      <div className="mb-8 text-center">
        <span className="text-[11px] font-mono tracking-widest uppercase text-accent mb-2 block">
          CURRICULUM
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-textPrimary mb-3">
          Which Class 12 stream did you pursue?
        </h2>
        <p className="text-textSecondary text-sm sm:text-base leading-relaxed">
          This calibrates our aptitude and pathway agents to relevant entrance exams and university regulations.
        </p>
      </div>

      <div className="space-y-3 mb-8">
        {streams.map((item) => {
          const isCurrent = selected === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              className={`w-full p-5 rounded-2xl text-left border-2 transition-all duration-200 flex items-center justify-between group ${
                isCurrent
                  ? 'bg-accent/15 border-accent shadow-[0_0_8px_rgba(74,92,70,0.3)] ring-4 ring-accent/15'
                  : 'bg-background hover:bg-surface border-borderMuted hover:border-accent/40'
              }`}
            >
              <div className="pr-4">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-serif text-xl text-textPrimary group-hover:text-accent transition-colors">
                    {item.title}
                  </span>
                  <span className="text-xs font-mono text-textSecondary">
                    ({item.subtitle})
                  </span>
                </div>
                <p className="text-xs text-textSecondary leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div
                className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                  isCurrent
                    ? 'bg-accent border-accent text-white'
                    : 'border-borderMuted text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!selected}
          size="lg"
          icon={ArrowRight}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
