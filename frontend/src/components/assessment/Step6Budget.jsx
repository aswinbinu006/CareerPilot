import React from 'react';
import Button from '../common/Button';
import { ArrowRight, IndianRupee, Check } from 'lucide-react';

export default function Step6Budget({ data, onChange, onNext }) {
  const tiers = [
    {
      id: 'Under INR 1 Lakh per year',
      title: 'Under ₹1 Lakh / year',
      subtitle: 'Government Colleges & Subsidized Universities',
      desc: 'Targeting Central/State Government institutions with low fee caps and full tuition merit assistance.',
    },
    {
      id: 'INR 1 to 3 Lakhs per year',
      title: '₹1 – 3 Lakhs / year',
      subtitle: 'NITs, Top State Aided & Mid-Tier Universities',
      desc: 'Standard tuition range for premier state technical institutions and affordable private colleges.',
    },
    {
      id: 'INR 3 to 6 Lakhs per year',
      title: '₹3 – 6 Lakhs / year',
      subtitle: 'Premier Private Universities & IIITs',
      desc: 'Encompassing BITS Pilani, VIT, Manipal, Thapar, and high-tier accredited private institutions.',
    },
    {
      id: 'Above INR 6 Lakhs per year',
      title: '₹6+ Lakhs / year or Flexible',
      subtitle: 'Global & Liberal Arts Campuses',
      desc: 'Private global universities (Ashoka, Krea, Flame) and specialized overseas pathways.',
    },
  ];

  const selected = data.budget || '';

  const handleSelect = (id) => {
    onChange('budget', id);
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      <div className="mb-8 text-center">
        <span className="text-[11px] font-mono tracking-widest uppercase text-accent mb-2 block">
          FINANCIAL PRUDENCE
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-textPrimary mb-3">
          What is your anticipated annual tuition budget?
        </h2>
        <p className="text-textSecondary text-sm sm:text-base leading-relaxed">
          CareerPilot uses this to avoid recommending unattainable fee tiers and to highlight eligible scholarship programs.
        </p>
      </div>

      <div className="space-y-3 mb-8">
        {tiers.map((item) => {
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
                <div className="flex items-center gap-2.5 mb-1">
                  <IndianRupee className="w-4 h-4 text-accent" />
                  <span className="font-serif text-xl text-textPrimary group-hover:text-accent transition-colors">
                    {item.title}
                  </span>
                </div>
                <p className="text-xs font-mono text-textSecondary mb-1">
                  {item.subtitle}
                </p>
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
