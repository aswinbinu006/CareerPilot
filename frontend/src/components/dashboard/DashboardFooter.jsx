import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Activity, HelpCircle, Lock } from 'lucide-react';

export default function DashboardFooter() {
  return (
    <footer className="w-full bg-surface border-t border-borderMuted py-6 px-6 no-print mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-textSecondary">
        {/* Left: Portal Identity & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white">
              <Compass className="w-3.5 h-3.5 stroke-[2]" />
            </div>
            <span className="font-semibold text-textPrimary tracking-tight">
              CareerPilot Portal
            </span>
          </div>
          <span className="text-borderMuted">•</span>
          <span className="hidden sm:inline">Academic Year 2025–2026</span>
          <span className="text-borderMuted hidden sm:inline">•</span>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent-light text-accent text-[11px] font-semibold border border-accent/20">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span>4 Agents Active</span>
          </div>
        </div>

        {/* Center: Official Regulatory Grounds */}
        <div className="hidden lg:flex items-center gap-2 text-textMuted">
          <ShieldCheck className="w-3.5 h-3.5 text-accent" />
          <span>Verified NIRF, NTA & National Scholarship Portal Data</span>
        </div>

        {/* Right: Operational Links */}
        <div className="flex items-center gap-4">
          <Link
            to="/support"
            className="hover:text-accent transition-colors flex items-center gap-1"
          >
            <HelpCircle className="w-3 h-3" />
            <span>Support</span>
          </Link>
          <span className="text-borderMuted">•</span>
          <Link
            to="/privacy"
            className="hover:text-accent transition-colors flex items-center gap-1"
          >
            <Lock className="w-3 h-3" />
            <span>Privacy Charter</span>
          </Link>
          <span className="text-borderMuted">•</span>
          <Link
            to="/notifications"
            className="hover:text-accent transition-colors flex items-center gap-1"
          >
            <Activity className="w-3 h-3" />
            <span>Notices</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
