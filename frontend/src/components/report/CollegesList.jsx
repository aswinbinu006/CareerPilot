import React, { useState, useMemo } from 'react';
import {
  Building2,
  Award,
  MapPin,
  IndianRupee,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { parseColleges } from '../../utils/pathwayParser';

export default function CollegesList({ pathwayData, markdownContent = '' }) {
  const [activeTab, setActiveTab] = useState('all');

  const { colleges, feeTiers, rawSources } = useMemo(() => {
    return parseColleges(pathwayData?.colleges_data, markdownContent);
  }, [pathwayData, markdownContent]);

  // Tab filtering
  const filteredColleges = useMemo(() => {
    if (activeTab === 'govt') {
      return colleges.filter(
        (c) =>
          c.type.toLowerCase().includes('govt') ||
          c.type.toLowerCase().includes('government') ||
          c.type.toLowerCase().includes('public')
      );
    }
    if (activeTab === 'private') {
      return colleges.filter(
        (c) =>
          c.type.toLowerCase().includes('private') ||
          c.type.toLowerCase().includes('deemed')
      );
    }
    return colleges;
  }, [colleges, activeTab]);

  const govtCount = colleges.filter(
    (c) =>
      c.type.toLowerCase().includes('govt') ||
      c.type.toLowerCase().includes('government') ||
      c.type.toLowerCase().includes('public')
  ).length;

  const privateCount = colleges.filter(
    (c) =>
      c.type.toLowerCase().includes('private') ||
      c.type.toLowerCase().includes('deemed')
  ).length;

  return (
    <div className="w-full mb-12">
      {/* Section Header */}
      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent mb-2">
        <Building2 className="w-3.5 h-3.5" />
        <span>INSTITUTIONAL MAPPING & ACCREDITATION</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h3 className="font-serif text-2xl sm:text-3xl text-textPrimary">
            Recommended Universities & Institutions
          </h3>
          <p className="text-xs sm:text-sm text-textSecondary mt-1">
            NIRF-ranked premier universities, autonomous institutes, and verified fee tiers.
          </p>
        </div>

        {/* Filter Tabs */}
        {colleges.length > 2 && (
          <div className="inline-flex p-1 bg-surface border border-borderMuted rounded-xl text-xs font-mono">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'all'
                  ? 'bg-accent text-white shadow-xs'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              All ({colleges.length})
            </button>
            {govtCount > 0 && (
              <button
                onClick={() => setActiveTab('govt')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'govt'
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                Government ({govtCount})
              </button>
            )}
            {privateCount > 0 && (
              <button
                onClick={() => setActiveTab('private')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'private'
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                Private / Deemed ({privateCount})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Fee Tiers Highlights Banner */}
      {feeTiers.length > 0 && (
        <div className="p-5 mb-8 rounded-2xl bg-surface border border-borderMuted shadow-xs">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-textPrimary mb-3">
            <IndianRupee className="w-4 h-4 text-accent" />
            <span className="font-semibold">Tuition Fee Tiers & Budget Distribution</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {feeTiers.map((tier, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-background border border-borderMuted/80 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-accent px-2 py-0.5 rounded bg-accent/10">
                    {tier.range}
                  </span>
                  <span className="text-[10px] font-mono text-textMuted uppercase">Fee Bracket</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {tier.colleges.slice(0, 4).map((colName, cIdx) => (
                    <span
                      key={cIdx}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-surface text-textSecondary border border-borderMuted/60"
                    >
                      {colName}
                    </span>
                  ))}
                  {tier.colleges.length > 4 && (
                    <span className="text-[10px] text-textMuted self-center px-1 font-mono">
                      +{tier.colleges.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Structured College Cards Grid */}
      {filteredColleges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredColleges.map((college, idx) => {
            const isGovt =
              college.type.toLowerCase().includes('govt') ||
              college.type.toLowerCase().includes('government') ||
              college.type.toLowerCase().includes('public');
            const isDeemed = college.type.toLowerCase().includes('deemed');

            return (
              <div
                key={idx}
                data-cursor="College"
                className="p-6 rounded-2xl bg-surface border border-borderMuted flex flex-col justify-between transition-all duration-300 hover:border-accent/60 hover:shadow-lg hover:-translate-y-1 group"
              >
                <div>
                  {/* Card Header: Type Badge & Rank */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full border ${
                        isGovt
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                          : isDeemed
                          ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20'
                          : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
                      }`}
                    >
                      {college.type}
                    </span>

                    {college.rank && (
                      <span className="text-[11px] font-mono text-accent bg-accent/10 px-2.5 py-0.5 rounded-full border border-accent/20 flex items-center gap-1 font-semibold">
                        <Award className="w-3 h-3 text-accent" />
                        {college.rank}
                      </span>
                    )}
                  </div>

                  {/* College Name */}
                  <h4 className="font-serif text-xl sm:text-2xl text-textPrimary group-hover:text-accent transition-colors duration-200 mb-4 leading-snug">
                    {college.name}
                  </h4>

                  {/* Key Metadata Chips Grid */}
                  <div className="grid grid-cols-2 gap-2.5 mb-4 text-xs font-sans">
                    <div className="p-2.5 rounded-xl bg-background border border-borderMuted/70 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                      <div className="overflow-hidden">
                        <span className="block text-[10px] font-mono text-textMuted uppercase">Location</span>
                        <span className="font-medium text-textPrimary truncate block">{college.location}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-background border border-borderMuted/70 flex items-center gap-2">
                      <IndianRupee className="w-3.5 h-3.5 text-accent shrink-0" />
                      <div className="overflow-hidden">
                        <span className="block text-[10px] font-mono text-textMuted uppercase">Est. Tuition</span>
                        <span className="font-medium text-textPrimary truncate block">{college.fee}</span>
                      </div>
                    </div>
                  </div>

                  {college.summary && (
                    <p className="text-xs text-textSecondary leading-relaxed mb-4 line-clamp-3">
                      {college.summary}
                    </p>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-4 mt-2 border-t border-borderMuted/60 flex items-center justify-between text-xs font-mono">
                  <span className="text-textMuted text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Verified Institution
                  </span>

                  {college.url && (
                    <a
                      href={college.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Institutional Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-surface/60 border border-dashed border-borderMuted text-center">
          <div className="w-10 h-10 rounded-full bg-secondary mx-auto flex items-center justify-center text-accent mb-3">
            <Info className="w-5 h-5" />
          </div>
          <p className="font-serif text-lg text-textPrimary mb-1">
            No specific institutions matched the selected filter.
          </p>
          <p className="text-xs text-textSecondary max-w-md mx-auto">
            Please switch back to &ldquo;All&rdquo; or review the NIRF accreditation details in the consultation dossier.
          </p>
        </div>
      )}

      {/* Research Citations Footer */}
      {rawSources.length > 0 && (
        <div className="mt-8 p-4 rounded-xl bg-background border border-borderMuted text-xs text-textMuted flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span>Grounded via Official Apex Admissions & NIRF Portals</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {rawSources.map((s, idx) => (
              <a
                key={idx}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline flex items-center gap-1"
              >
                <span>{s.title || `Resource 0${idx + 1}`}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
