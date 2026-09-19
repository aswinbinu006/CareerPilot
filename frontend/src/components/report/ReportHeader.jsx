import React from 'react';
import { Printer, Calendar, Hash, Award } from 'lucide-react';
import Button from '../common/Button';

export default function ReportHeader({ sessionData }) {
  const handlePrint = () => {
    window.print();
  };

  const name = sessionData?.student_name || 'Class 12 Graduate';
  const stream = sessionData?.stream || 'Academic Stream';
  const sessionId = sessionData?.session_id || 'CP-SESSION';
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="w-full pb-8 mb-10 border-b border-borderMuted">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-textSecondary uppercase tracking-widest mb-3">
            <span className="w-2 h-2 rounded-full bg-accent inline-block" />
            <span>Official Academic & Career Dossier</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-textPrimary tracking-tight mb-3">
            {name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-textSecondary">
            <span className="px-3 py-1 rounded bg-surface border border-borderMuted text-textPrimary">
              {stream}
            </span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{dateStr}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" />
              <span>{sessionId}</span>
            </div>
          </div>
        </div>

        {/* Action: Print */}
        <div className="no-print">
          <Button
            variant="secondary"
            size="md"
            onClick={handlePrint}
            icon={Printer}
          >
            Print Official PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
