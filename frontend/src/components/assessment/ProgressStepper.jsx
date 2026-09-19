import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function ProgressStepper({
  currentStep,
  totalSteps = 8,
  onBack,
  stepTitle,
}) {
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="w-full bg-background/90 backdrop-blur-md border-b border-borderMuted sticky top-20 z-20 px-6 py-4 transition-all">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        {/* Back Button */}
        <div className="w-24">
          {currentStep > 1 && (
            <button
              onClick={onBack}
              data-cursor="Previous"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-textSecondary hover:text-textPrimary transition-all hover:-translate-x-0.5 active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}
        </div>

        {/* Step Title & Count */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-textSecondary">
              STEP {currentStep} OF {totalSteps}
            </span>
          </div>
          <span className="font-serif text-lg sm:text-xl text-textPrimary leading-snug">
            {stepTitle}
          </span>
        </div>

        {/* Progress Percentage */}
        <div className="w-24 text-right">
          <span className="font-mono text-xs font-semibold text-accent bg-accent-light px-2.5 py-0.5 rounded border border-accent/20">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Fluid Progress Track Line */}
      <div className="max-w-4xl mx-auto mt-3 h-1.5 w-full bg-surface rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_0_8px_rgba(74,92,70,0.3)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
