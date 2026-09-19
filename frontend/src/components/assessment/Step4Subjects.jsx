import React, { useState } from 'react';
import Button from '../common/Button';
import { ArrowRight, Plus, X, Check } from 'lucide-react';

export default function Step4Subjects({ data, onChange, onNext }) {
  const commonSubjects = [
    'Mathematics',
    'Physics',
    'Computer Science',
    'Chemistry',
    'Biology',
    'Accountancy',
    'Economics',
    'Business Studies',
    'English Literature',
    'Psychology',
    'Sociology',
    'Applied Mathematics',
    'Political Science',
  ];

  // Parse existing into array or empty
  const currentList = data.favorite_subjects
    ? data.favorite_subjects.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const [customInput, setCustomInput] = useState('');

  const toggleSubject = (subject) => {
    let updated;
    if (currentList.includes(subject)) {
      updated = currentList.filter((s) => s !== subject);
    } else {
      updated = [...currentList, subject];
    }
    onChange('favorite_subjects', updated.join(', '));
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (customInput.trim() && !currentList.includes(customInput.trim())) {
      const updated = [...currentList, customInput.trim()];
      onChange('favorite_subjects', updated.join(', '));
      setCustomInput('');
    }
  };

  const isValid = currentList.length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      <div className="mb-8 text-center">
        <span className="text-[11px] font-mono tracking-widest uppercase text-accent mb-2 block">
          INTELLECTUAL HARMONY
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-textPrimary mb-3">
          Which subjects did you enjoy most?
        </h2>
        <p className="text-textSecondary text-sm sm:text-base leading-relaxed">
          Select at least one subject where you felt genuinely engaged and curious.
        </p>
      </div>

      <div className="space-y-6">
        {/* Subject Chips Grid */}
        <div className="flex flex-wrap gap-2.5">
          {commonSubjects.map((sub) => {
            const isSelected = currentList.includes(sub);
            return (
              <button
                key={sub}
                type="button"
                onClick={() => toggleSubject(sub)}
                className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium border-2 transition-all duration-200 inline-flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-accent text-white border-accent shadow-[0_0_8px_rgba(74,92,70,0.35)]'
                    : 'bg-surface hover:bg-surfaceLight text-textPrimary border-borderMuted hover:border-accent/40'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                {sub}
              </button>
            );
          })}
        </div>

        {/* Custom Subject Addition */}
        <div className="pt-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustom(e)}
              placeholder="Add another subject (e.g. Informatics Practices)"
              className="flex-1 px-4 py-3 rounded-xl bg-surface border border-borderMuted text-sm text-textPrimary placeholder:text-textMuted focus:outline-hidden focus:border-accent"
            />
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleAddCustom}
              disabled={!customInput.trim()}
              icon={Plus}
            >
              Add
            </Button>
          </div>
        </div>

        {/* Selected Summary */}
        {currentList.length > 0 && (
          <div className="p-4 rounded-xl bg-surface border border-borderMuted">
            <span className="text-[11px] font-mono text-textSecondary uppercase tracking-wider block mb-2">
              Selected ({currentList.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentList.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-background border border-borderMuted text-xs font-medium text-textPrimary"
                >
                  {item}
                  <button
                    onClick={() => toggleSubject(item)}
                    className="text-textMuted hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

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
