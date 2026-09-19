import React from 'react';
import Button from '../common/Button';
import { ArrowRight, Percent } from 'lucide-react';

export default function Step3Marks({ data, onChange, onNext }) {
  const quickMarks = ['90% and above', '80% – 89%', '70% – 79%', '60% – 69%', 'Awaiting Results'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (data.marks && data.marks.trim()) onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto py-8">
      <div className="mb-8 text-center">
        <span className="text-[11px] font-mono tracking-widest uppercase text-accent mb-2 block">
          ACADEMIC PERFORMANCE
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-textPrimary mb-3">
          What are your Class 12 marks or percentage?
        </h2>
        <p className="text-textSecondary text-sm sm:text-base leading-relaxed">
          Used to calculate entrance eligibility brackets, cutoff probability, and merit scholarship tiers.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-textSecondary mb-2 font-mono">
            Percentage or Estimated Score <span className="text-accent">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              autoFocus
              value={data.marks || ''}
              onChange={(e) => onChange('marks', e.target.value)}
              placeholder="e.g. 88% or 450/500"
              className="w-full px-5 py-4 rounded-xl bg-surface border border-borderMuted text-textPrimary text-lg placeholder:text-textMuted focus:outline-hidden focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted">
              <Percent className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Quick select chips */}
        <div>
          <span className="block text-xs font-mono text-textSecondary uppercase tracking-wider mb-2">
            Quick Select
          </span>
          <div className="flex flex-wrap gap-2">
            {quickMarks.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onChange('marks', val)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono border transition-all ${
                  data.marks === val
                    ? 'bg-accent text-white border-accent'
                    : 'bg-background hover:bg-surface border-borderMuted text-textSecondary'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button
            type="submit"
            disabled={!data.marks || !data.marks.trim()}
            size="lg"
            icon={ArrowRight}
          >
            Continue
          </Button>
        </div>
      </div>
    </form>
  );
}
