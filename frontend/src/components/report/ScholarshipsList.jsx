import React, { useMemo } from 'react';
import { IndianRupee, ShieldCheck, ExternalLink, Award, Info, CheckCircle2, FileText, Send } from 'lucide-react';
import { parseScholarships } from '../../utils/pathwayParser';

export default function ScholarshipsList({
  pathwayData,
  markdownContent = '',
  recommendation = null,
  stream = '',
}) {
  const scholarships = useMemo(() => {
    return parseScholarships(
      pathwayData?.scholarships_data,
      markdownContent,
      recommendation?.recommended_degree || ''
    );
  }, [pathwayData, markdownContent, recommendation]);

  return (
    <div className="w-full mb-12">
      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent mb-2">
        <IndianRupee className="w-3.5 h-3.5" />
        <span>FINANCIAL AID & MERIT SCHOLARSHIPS</span>
      </div>
      <div className="mb-6">
        <h3 className="font-serif text-2xl sm:text-3xl text-textPrimary">
          Eligible Scholarships & Fee Waivers
        </h3>
        <p className="text-xs sm:text-sm text-textSecondary mt-1">
          Government schemes, corporate trusts, and merit-cum-means financial assistance.
        </p>
      </div>

      {scholarships.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scholarships.map((sch, idx) => (
            <div
              key={idx}
              data-cursor="Scholarship"
              className="p-6 rounded-2xl bg-surface border border-borderMuted flex flex-col justify-between transition-all duration-300 hover:border-accent/60 hover:shadow-lg hover:-translate-y-1 group"
            >
              <div>
                {/* Header: Amount and Provider */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-semibold">
                    {sch.amount || 'Tuition Fee Grant'}
                  </span>
                  <span className="text-[11px] font-mono text-textMuted bg-background px-2 py-0.5 rounded border border-borderMuted">
                    {sch.provider}
                  </span>
                </div>

                {/* Scholarship Title */}
                <h4 className="font-serif text-xl sm:text-2xl text-textPrimary group-hover:text-accent transition-colors duration-200 mb-3 leading-snug">
                  {sch.title}
                </h4>

                {/* Structured Eligibility & Benefits Points */}
                {sch.points && sch.points.length > 0 ? (
                  <div className="mb-4">
                    <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block font-semibold mb-2">
                      Eligibility & Financial Support Points
                    </span>
                    <ul className="space-y-2 text-xs text-textSecondary">
                      {sch.points.map((point, pIdx) => {
                        const parts = point.split(':');
                        const title = parts.length > 1 ? parts[0].trim() : '';
                        const text = parts.length > 1 ? parts.slice(1).join(':').trim() : point;

                        return (
                          <li
                            key={pIdx}
                            className="flex items-start gap-2.5 leading-relaxed bg-background/60 p-2.5 rounded-xl border border-borderMuted/60"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                            <div>
                              {title && (
                                <span className="font-semibold text-textPrimary font-sans mr-1">
                                  {title}:
                                </span>
                              )}
                              <span>{text}</span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  sch.details && (
                    <p className="text-xs text-textSecondary leading-relaxed mb-4">
                      {sch.details}
                    </p>
                  )
                )}

                {/* Proper Explanation Box */}
                {sch.explanation && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-textSecondary mb-4 leading-relaxed">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400 block mb-1 font-mono text-[10px] uppercase tracking-wider">
                      Scheme Scope & Benefit Overview:
                    </span>
                    {sch.explanation}
                  </div>
                )}

                {/* Application Method & Guidelines */}
                {sch.howToApply && (
                  <div className="p-2.5 rounded-xl bg-background border border-borderMuted/80 text-[11px] font-mono text-textSecondary mb-4 flex items-center gap-2">
                    <Send className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>{sch.howToApply}</span>
                  </div>
                )}
              </div>

              {/* Action Link to Official Application Portal */}
              <div className="pt-4 mt-2 border-t border-borderMuted/60 flex items-center justify-between text-xs font-mono">
                <span className="text-textMuted text-[11px]">Direct Benefit Transfer (DBT)</span>
                {sch.url && (
                  <a
                    href={sch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform font-semibold"
                  >
                    <span>Apply via Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
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
            Review the National Scholarship Portal (NSP) or corporate grants detailed in the consultation report.
          </p>
        </div>
      )}
    </div>
  );
}
