import React from 'react';
import Button from '../common/Button';
import { ArrowRight, Sparkles, Check } from 'lucide-react';

export default function Step5Interests({ data, onChange, onNext }) {
  const quickInterests = [
    'Software engineering & programming',
    'Artificial intelligence & robotics',
    'Biomedical research & laboratory experiments',
    'Financial markets, investing & stocks',
    'UI/UX product design & creative arts',
    'Corporate law & dispute advocacy',
    'Environmental science & renewable energy',
    'Data analytics & mathematical modeling',
    'Public policy & governance',
    'Writing, digital journalism & storytelling',
  ];

  const currentList = data.interests
    ? data.interests.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const toggleInterest = (interest) => {
    let updated;
    if (currentList.includes(interest)) {
      updated = currentList.filter((s) => s !== interest);
    } else {
      updated = [...currentList, interest];
    }
    onChange('interests', updated.join(', '));
  };

  const isValid = (data.interests && data.interests.trim().length > 3) || currentList.length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      <div className="mb-8 text-center">
        <span className="text-[11px] font-mono tracking-widest uppercase text-accent mb-2 block">
          PASSION & TALENT
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-textPrimary mb-3">
          What activities capture your attention?
        </h2>
        <p className="text-textSecondary text-sm sm:text-base leading-relaxed">
          Select or describe the domains where you lose track of time.
        </p>
      </div>

      <div className="space-y-6">
        {/* Quick select pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {quickInterests.map((interest) => {
            const isSelected = currentList.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`p-3.5 rounded-xl text-left text-xs font-medium border-2 transition-all duration-200 flex items-start gap-2.5 ${
                  isSelected
                    ? 'bg-accent/15 border-accent text-textPrimary shadow-[0_0_8px_rgba(74,92,70,0.3)] ring-4 ring-accent/15'
                    : 'bg-background hover:bg-surface border-borderMuted text-textSecondary hover:border-accent/40'
                }`}
              >
                {isSelected ? (
                  <span className="w-5 h-5 flex-shrink-0 mt-0.5 rounded-full bg-accent flex items-center justify-center">
                    <Check className="w-3 h-3 text-white stroke-[2.5]" />
                  </span>
                ) : (
                  <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-textMuted" />
                )}
                <span className={isSelected ? 'font-semibold' : ''}>{interest}</span>
              </button>
            );
          })}
        </div>

        {/* Selected count badge */}
        {currentList.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-mono text-accent">
            <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold">
              {currentList.length}
            </span>
            <span className="uppercase tracking-wider">
              {currentList.length === 1 ? 'interest' : 'interests'} selected
            </span>
          </div>
        )}

        {/* Freeform input */}
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-textSecondary mb-2 font-mono">
            Specific Hobbies or Technical Skills
          </label>
          <textarea
            rows={3}
            value={data.interests || ''}
            onChange={(e) => onChange('interests', e.target.value)}
            placeholder="e.g. Building small web projects in Python, editing video documentaries, reading clinical case studies..."
            className="w-full px-4 py-3 rounded-xl bg-surface border border-borderMuted text-sm text-textPrimary placeholder:text-textMuted focus:outline-hidden focus:border-accent resize-none"
          />
        </div>

        <div className="pt-4 flex justify-end">
          <Button
            onClick={onNext}
            disabled={!isValid}
            size="lg"
            icon={ArrowRight}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
