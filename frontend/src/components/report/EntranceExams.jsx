import React from 'react';
import { GraduationCap, FileCheck, Info } from 'lucide-react';

export default function EntranceExams({ pathwayData }) {
  const exams = Array.isArray(pathwayData?.entrance_exams_data) ? pathwayData.entrance_exams_data : [];

  return (
    <div className="w-full mb-10">
      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-textSecondary mb-2">
        <GraduationCap className="w-3.5 h-3.5 text-accent" />
        <span>ADMISSIONS GATEWAY</span>
      </div>
      <h3 className="font-serif text-2xl sm:text-3xl text-textPrimary mb-6">
        Target Entrance Examinations
      </h3>

      {exams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.map((exam, idx) => (
            <div
              key={idx}
              data-cursor="Exam"
              className="p-6 rounded-2xl bg-surface border border-borderMuted flex flex-col justify-between transition-all duration-300 hover:border-accent/50 hover:shadow-xl hover:-translate-y-1.5 group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono text-accent bg-accent-light px-2.5 py-0.5 rounded border border-accent/20">
                    ADMISSIONS GATEWAY
                  </span>
                  <div className="w-8 h-8 rounded-full bg-background border border-borderMuted flex items-center justify-center text-textMuted group-hover:text-accent group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <FileCheck className="w-4 h-4" />
                  </div>
                </div>
                <h4 className="font-serif text-xl text-textPrimary group-hover:text-accent transition-colors duration-200 mb-2">
                  {exam.title || 'Official Entrance Examination'}
                </h4>
                <p className="text-xs text-textSecondary leading-relaxed mb-4">
                  {exam.content || exam.description || 'Verified examination syllabus and cutoff criteria derived from official conducting bodies.'}
                </p>
              </div>

              {exam.url && (
                <div className="pt-4 border-t border-borderMuted/60 text-xs font-mono text-accent">
                  <a
                    href={exam.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    Official Examination Portal &rarr;
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
