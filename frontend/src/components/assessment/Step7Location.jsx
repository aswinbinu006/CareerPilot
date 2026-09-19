import React from 'react';
import Button from '../common/Button';
import { ArrowRight, MapPin, Check } from 'lucide-react';

export default function Step7Location({ data, onChange, onNext }) {
  const commonLocations = [
    'Open to Relocate Anywhere in India',
    'Bengaluru / Karnataka',
    'Delhi NCR (New Delhi, Noida, Gurugram)',
    'Mumbai / Pune / Maharashtra',
    'Chennai / Tamil Nadu',
    'Hyderabad / Telangana',
    'Kolkata / Eastern India',
    'Close to Home / Local State Only',
  ];

  const handleSelect = (loc) => {
    onChange('preferred_location', loc);
  };

  const selected = data.preferred_location || '';

  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      <div className="mb-8 text-center">
        <span className="text-[11px] font-mono tracking-widest uppercase text-accent mb-2 block">
          GEOGRAPHIC PREFERENCE
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-textPrimary mb-3">
          Where would you prefer to study?
        </h2>
        <p className="text-textSecondary text-sm sm:text-base leading-relaxed">
          Certain states have higher concentrations of specific industries and state domicile seat allocations.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {commonLocations.map((loc) => {
            const isSelected = selected === loc;
            return (
              <button
                key={loc}
                type="button"
                onClick={() => handleSelect(loc)}
                className={`p-4 rounded-xl text-left border-2 transition-all duration-200 flex items-center gap-3 ${
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
                  <MapPin className="w-4 h-4 flex-shrink-0 text-textMuted" />
                )}
                <span className={`text-xs sm:text-sm font-medium ${isSelected ? 'font-semibold' : ''}`}>{loc}</span>
              </button>
            );
          })}
        </div>

        {/* Optional custom location */}
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-textSecondary mb-2 font-mono">
            Or specify a particular city/state
          </label>
          <input
            type="text"
            value={data.preferred_location || ''}
            onChange={(e) => onChange('preferred_location', e.target.value)}
            placeholder="e.g. Chandigarh, Ahmedabad, or Jaipur"
            className="w-full px-4 py-3 rounded-xl bg-surface border border-borderMuted text-sm text-textPrimary placeholder:text-textMuted focus:outline-hidden focus:border-accent"
          />
        </div>

        <div className="pt-4 flex justify-end">
          <Button
            onClick={onNext}
            disabled={!selected.trim()}
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
