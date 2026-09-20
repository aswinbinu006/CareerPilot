import React, { useMemo } from 'react';
import { Shield } from 'lucide-react';
import { extractBackupFromMarkdown } from '../../utils/pathwayParser';

export default function BackupOptions({ recommendation, markdownContent = '', stream = '' }) {
  const mdBackups = useMemo(() => {
    return extractBackupFromMarkdown(markdownContent);
  }, [markdownContent]);

  const rawBackups = Array.isArray(recommendation?.backup_degrees) ? recommendation.backup_degrees : [];

  // Merge dynamic AI markdown backups with recommendation backup degrees
  const backups = useMemo(() => {
    if (mdBackups.length > 0) {
      return mdBackups;
    }
    return rawBackups.map((deg) => ({
      title: deg,
      desc: 'Provides parallel lateral eligibility into industry specializations and postgraduate admissions.',
    }));
  }, [mdBackups, rawBackups]);

  if (backups.length === 0) {
    return null;
  }

  return (
    <div className="w-full p-8 rounded-2xl bg-secondary/60 border border-borderMuted mb-10">
      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-textSecondary mb-2">
        <Shield className="w-3.5 h-3.5 text-accent" />
        <span>RISK MITIGATION & CONTINGENCIES</span>
      </div>
      <h3 className="font-serif text-2xl sm:text-3xl text-textPrimary mb-3">
        Parallel Backup Trajectories
      </h3>
      <p className="text-textSecondary text-sm leading-relaxed mb-6 max-w-2xl">
        Academic excellence requires both ambitious primary goals and practical contingencies. If entrance cutoffs or personal preferences shift, these parallel paths preserve momentum without sacrificing career earnings.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {backups.map((deg, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl bg-background border border-borderMuted flex items-start gap-3"
          >
            <div className="w-6 h-6 rounded-full bg-surface border border-borderMuted flex items-center justify-center text-accent text-xs font-mono flex-shrink-0 mt-0.5">
              0{idx + 1}
            </div>
            <div>
              <h4 className="font-serif text-lg text-textPrimary mb-1">
                {deg.title}
              </h4>
              <p className="text-xs text-textSecondary leading-relaxed">
                {deg.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
