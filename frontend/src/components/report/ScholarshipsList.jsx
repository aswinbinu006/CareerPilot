import React from 'react';
import { IndianRupee, ShieldCheck, Info } from 'lucide-react';

export default function ScholarshipsList({ pathwayData }) {
  const scholarships = Array.isArray(pathwayData?.scholarships_data) ? pathwayData.scholarships_data : [];

  return (
    <div className="w-full mb-10">
      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-textSecondary mb-2">
        <IndianRupee className="w-3.5 h-3.5 text-accent" />
        <span>FINANCIAL AID & SCHOLARSHIPS</span>
      </div>
      <h3 className="font-serif text-2xl sm:text-3xl text-textPrimary mb-6">
        Eligible Scholarships & Fee Waivers
      </h3>

      {scholarships.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scholarships.map((sch, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-surface border border-borderMuted flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono text-accent bg-accent-light px-2.5 py-0.5 rounded border border-accent/20">
                    MERIT & MEANS AID
                  </span>
                  <ShieldCheck className="w-4 h-4 text-accent" />
                </div>
                <h4 className="font-serif text-xl text-textPrimary mb-2">
                  {sch.title || 'Official Scholarship Program'}
                </h4>
                <p className="text-xs text-textSecondary leading-relaxed mb-4">
                  {sch.content || sch.description || 'Verified government or institutional fee waiver program applicable for Class 12 candidates.'}
                </p>
              </div>

              {sch.url && (
                <div className="pt-4 border-t border-borderMuted/60 text-xs font-mono text-accent">
                  <a
                    href={sch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline inline-flex items-center gap-1"
                  >
                    Official Portal Verification &rarr;
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-surface/60 border border-dashed border-borderMuted text-center">
          <div className="w-10 h-10 rounded-full bg-secondary mx-auto flex items-center justify-center text-accent mb-3">
            <Info className="w-5 h-5" />
          </div>
          <p className="font-serif text-lg text-textPrimary mb-1">
            No specific scholarship schemes retrieved for this session.
          </p>
          <p className="text-xs text-textSecondary max-w-md mx-auto">
            Eligible candidates may still qualify for Central Sector Schemes via the National Scholarship Portal (scholarships.gov.in) based on state board percentiles.
          </p>
        </div>
      )}
    </div>
  );
}
