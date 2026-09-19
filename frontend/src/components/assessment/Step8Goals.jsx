import React from 'react';
import Button from '../common/Button';
import { Compass, Target, ArrowRight, Check } from 'lucide-react';

export default function Step8Goals({ data, onChange, onSubmit, isSubmitting }) {
  const commonGoals = [
    'Work at a premier technology company or build an AI startup',
    'Pursue clinical medical practice or specialized biomedical research',
    'Join an investment bank, consulting firm or become a Chartered Accountant',
    'Lead digital product design, creative direction or launch an agency',
    'Clear the UPSC Civil Services / State Administrative Examination',
    'Conduct scientific research, academia or pursue global Masters/Ph.D.',
  ];

  const handleQuickSelect = (goal) => {
    onChange('career_goals', goal);
  };

  const isValid = data.career_goals && data.career_goals.trim().length >= 5;

  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      <div className="mb-8 text-center">
        <span className="text-[11px] font-mono tracking-widest uppercase text-accent mb-2 block">
          LONG-TERM HORIZON
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-textPrimary mb-3">
          What is your ultimate career ambition?
        </h2>
        <p className="text-textSecondary text-sm sm:text-base leading-relaxed">
          Describe where you see yourself 5 to 10 years after completing your undergraduate degree.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-textSecondary mb-2 font-mono">
            Your Long-Term Ambitions & Goals <span className="text-accent">*</span>
          </label>
          <textarea
            rows={4}
            value={data.career_goals || ''}
            onChange={(e) => onChange('career_goals', e.target.value)}
            placeholder="e.g. I want to build software products in artificial intelligence, contribute to open source, and eventually found a technology company..."
            className="w-full px-4 py-3 rounded-xl bg-surface border border-borderMuted text-base text-textPrimary placeholder:text-textMuted focus:outline-hidden focus:border-accent resize-none"
          />
        </div>

        {/* Quick Inspiration Options */}
        <div>
          <span className="block text-xs font-mono text-textSecondary uppercase tracking-wider mb-2">
            Common Aspirations
          </span>
          <div className="space-y-2">
            {commonGoals.map((goal) => {
              const isSelected = data.career_goals === goal;
              return (
                <button
                  key={goal}
                  type="button"
                  onClick={() => handleQuickSelect(goal)}
                  className={`w-full text-left p-3 rounded-xl text-xs font-medium border-2 transition-all duration-200 flex items-center gap-2.5 ${
                    isSelected
                      ? 'bg-accent/15 border-accent text-textPrimary shadow-[0_0_8px_rgba(74,92,70,0.3)] ring-4 ring-accent/15'
                      : 'bg-background hover:bg-surface border-borderMuted text-textSecondary hover:border-accent/40'
                  }`}
                >
                  {isSelected ? (
                    <span className="w-5 h-5 flex-shrink-0 rounded-full bg-accent flex items-center justify-center">
                      <Check className="w-3 h-3 text-white stroke-[2.5]" />
                    </span>
                  ) : (
                    <Target className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  )}
                  <span className={isSelected ? 'font-semibold' : ''}>{goal}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-6 border-t border-borderMuted flex items-center justify-between">
          <div className="text-xs text-textSecondary font-mono">
            Ready to initiate 4-stage advisory workflow
          </div>
          <Button
            onClick={onSubmit}
            disabled={!isValid || isSubmitting}
            size="lg"
            variant="primary"
            icon={Compass}
          >
            {isSubmitting ? 'Initializing Advisory Pipeline...' : 'Generate Career Dossier'}
          </Button>
        </div>
      </div>
    </div>
  );
}
