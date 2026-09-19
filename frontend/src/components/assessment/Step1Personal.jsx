import React from 'react';
import Button from '../common/Button';
import { ArrowRight, User } from 'lucide-react';

export default function Step1Personal({ data, onChange, onNext }) {
  const isValid = data.name && data.name.trim().length >= 2;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid) onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto py-8">
      <div className="mb-8 text-center">
        <span className="text-[11px] font-mono tracking-widest uppercase text-accent mb-2 block">
          WELCOME
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-textPrimary mb-3">
          Let’s begin with your name.
        </h2>
        <p className="text-textSecondary text-sm sm:text-base leading-relaxed">
          Your career guidance dossier will be personalized to your academic trajectory and ambitions.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-textSecondary mb-2 font-mono">
            Full Name <span className="text-accent">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              autoFocus
              value={data.name || ''}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-5 py-4 rounded-xl bg-surface border border-borderMuted text-textPrimary text-lg placeholder:text-textMuted focus:outline-hidden focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button
            type="submit"
            disabled={!isValid}
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
