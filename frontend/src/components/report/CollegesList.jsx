import React from 'react';
import { Building2, Award, Info } from 'lucide-react';

export default function CollegesList({ pathwayData }) {
  const colleges = Array.isArray(pathwayData?.colleges_data) ? pathwayData.colleges_data : [];

  return (
    <div className="w-full mb-10">
      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-textSecondary mb-2">
        <Building2 className="w-3.5 h-3.5 text-accent" />
        <span>INSTITUTIONAL MAPPING</span>
      </div>
      <h3 className="font-serif text-2xl sm:text-3xl text-textPrimary mb-6">
        Recommended Universities & Institutions
      </h3>

      {colleges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {colleges.map((col, idx) => (
            <div
              key={idx}
              data-cursor="College"
              className="p-6 rounded-2xl bg-surface border border-borderMuted flex flex-col justify-between transition-all duration-300 hover:border-accent/50 hover:shadow-xl hover:-translate-y-1.5 group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono text-textSecondary uppercase tracking-wide">
                    INSTITUTION 0{idx + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-background border border-borderMuted flex items-center justify-center text-accent group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <h4 className="font-serif text-xl text-textPrimary group-hover:text-accent transition-colors duration-200 mb-2">
                  {col.title || 'Accredited University'}
                </h4>
                <p className="text-xs text-textSecondary leading-relaxed mb-4">
                  {col.content || col.description || 'Verified university offering programs aligned with your aptitude, budget, and location preferences.'}
                </p>
              </div>

              {col.url && (
                <div className="pt-4 border-t border-borderMuted/60 text-xs font-mono text-accent">
                  <a
                    href={col.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    Institutional Profile &rarr;
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
            No specific institutions mapped for these search parameters.
          </p>
          <p className="text-xs text-textSecondary max-w-md mx-auto">
            Please review the synthesized NIRF accreditation advice in the full report below.
          </p>
        </div>
      )}
    </div>
  );
}
