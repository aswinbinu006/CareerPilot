import React, { useMemo } from 'react';
import { GraduationCap, FileCheck, ExternalLink, ShieldCheck, Calendar, Info } from 'lucide-react';
import { parseEntranceExams } from '../../utils/pathwayParser';

export default function EntranceExams({ pathwayData, markdownContent = '', recommendation }) {
  const degree = recommendation?.recommended_degree || '';
  const exams = useMemo(() => {
    return parseEntranceExams(pathwayData?.entrance_exams_data, markdownContent, degree);
  }, [pathwayData, markdownContent, degree]);

  return (
    <div className="w-full mb-12">
      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent mb-2">
        <GraduationCap className="w-3.5 h-3.5" />
        <span>ADMISSIONS GATEWAY & ENTRANCE CRITERIA</span>
      </div>
      <div className="mb-6">
        <h3 className="font-serif text-2xl sm:text-3xl text-textPrimary">
          Target Entrance Examinations
        </h3>
        <p className="text-xs sm:text-sm text-textSecondary mt-1">
          Official gateway assessments, eligibility criteria, and conducting apex bodies.
        </p>
      </div>

      {exams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.map((exam, idx) => (
            <div
              key={idx}
              data-cursor="Exam"
              className="p-6 rounded-2xl bg-surface border border-borderMuted flex flex-col justify-between transition-all duration-300 hover:border-accent/60 hover:shadow-lg hover:-translate-y-1 group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-mono text-accent bg-accent/10 px-2.5 py-0.5 rounded-full border border-accent/20 font-semibold">
                    {exam.conductingBody || 'Apex Conducting Body'}
                  </span>
                  {exam.level && (
                    <span className="text-[11px] font-mono text-textMuted bg-background px-2 py-0.5 rounded border border-borderMuted">
                      {exam.level}
                    </span>
                  )}
                </div>

                <h4 className="font-serif text-xl sm:text-2xl text-textPrimary group-hover:text-accent transition-colors duration-200 mb-2 leading-snug">
                  {exam.name}
                </h4>

                {exam.scope && (
                  <div className="text-xs font-mono text-textMuted mb-3 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                    <span>{exam.scope}</span>
                  </div>
                )}

                {exam.details && (
                  <p className="text-xs text-textSecondary leading-relaxed mb-4">
                    {exam.details}
                  </p>
                )}
              </div>

              {exam.url && (
                <div className="pt-4 border-t border-borderMuted/60 flex items-center justify-between text-xs font-mono text-accent">
                  <span className="text-textMuted text-[11px]">Official Portal</span>
                  <a
                    href={exam.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Examination Portal</span>
                    <ExternalLink className="w-3 h-3" />
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
            No entrance exams cataloged for this specific recommendation yet.
          </p>
          <p className="text-xs text-textSecondary max-w-md mx-auto">
            Admissions for this program may be determined directly through Class 12 board merit or specialized institutional evaluations.
          </p>
        </div>
      )}
    </div>
  );
}
