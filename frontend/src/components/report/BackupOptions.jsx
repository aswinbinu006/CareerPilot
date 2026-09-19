import React from 'react';
import { Shield } from 'lucide-react';

export default function BackupOptions({ recommendation, stream = '' }) {
  const backups = Array.isArray(recommendation?.backup_degrees) ? recommendation.backup_degrees : [];

  if (backups.length === 0) {
    return null; // Do not render synthetic contingency degrees if not calculated by the agent
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
                {deg}
              </h4>
              <p className="text-xs text-textSecondary leading-relaxed">
                Provides parallel lateral eligibility into industry specializations and postgraduate admissions.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
