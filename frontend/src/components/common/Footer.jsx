import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-secondary border-t border-borderMuted py-16 px-6 no-print">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-borderMuted/80">
          {/* Brand & Manifesto */}
          <div className="md:col-span-4 flex flex-col justify-between">
            <div>
              <Link to="/" className="flex items-center gap-3 mb-4 group inline-flex" data-cursor="Home">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white transition-transform group-hover:scale-105">
                  <Compass className="w-4 h-4 stroke-[1.75]" />
                </div>
                <span className="font-serif text-2xl tracking-tight text-textPrimary group-hover:text-accent transition-colors">
                  CareerPilot
                </span>
              </Link>
              <p className="text-textSecondary text-xs sm:text-sm max-w-sm leading-relaxed mb-6">
                A deliberate, human-centric academic advisory architecture designed for Class 12 graduates facing cross-stream transitions across India. Grounded in NIRF data and verified entrance cutoffs.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-mono text-accent bg-accent-light px-3 py-1.5 rounded border border-accent/20 self-start">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>NTA, NIRF & NSP Curricula Aligned</span>
            </div>
          </div>

          {/* Column 1: Academic Streams */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-mono uppercase tracking-widest text-textPrimary mb-4 font-semibold">
              Disciplines
            </h4>
            <ul className="space-y-2.5 text-xs font-mono text-textSecondary">
              <li>
                <Link to="/assessment?stream=pcm" className="hover:text-accent transition-colors">
                  PCM & Computing
                </Link>
              </li>
              <li>
                <Link to="/assessment?stream=pcb" className="hover:text-accent transition-colors">
                  PCB & Life Sciences
                </Link>
              </li>
              <li>
                <Link to="/assessment?stream=commerce" className="hover:text-accent transition-colors">
                  Commerce & Finance
                </Link>
              </li>
              <li>
                <Link to="/assessment?stream=arts" className="hover:text-accent transition-colors">
                  Arts, Law & Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Advisory Operations */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-mono uppercase tracking-widest text-textPrimary mb-4 font-semibold">
              Advisory
            </h4>
            <ul className="space-y-2.5 text-xs font-mono text-textSecondary">
              <li>
                <Link to="/assessment" className="hover:text-accent transition-colors">
                  Start Evaluation
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-accent transition-colors">
                  Student Dossiers
                </Link>
              </li>
              <li>
                <Link to="/notifications" className="hover:text-accent transition-colors">
                  Admissions Dispatches
                </Link>
              </li>
              <li>
                <Link to="/#methodology" className="hover:text-accent transition-colors">
                  Agentic Architecture
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Fiduciary */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-mono uppercase tracking-widest text-textPrimary mb-4 font-semibold">
              Governance
            </h4>
            <ul className="space-y-2.5 text-xs font-mono text-textSecondary">
              <li>
                <Link to="/privacy" className="hover:text-accent transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-accent transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-accent transition-colors">
                  Cookie Preferences
                </Link>
              </li>
              <li>
                <Link to="/#methodology" className="hover:text-accent transition-colors">
                  Open Access Charter
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Help & Liaison */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-mono uppercase tracking-widest text-textPrimary mb-4 font-semibold">
              Assistance
            </h4>
            <ul className="space-y-2.5 text-xs font-mono text-textSecondary">
              <li>
                <Link to="/support" className="hover:text-accent transition-colors">
                  Support Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-accent transition-colors">
                  Contact Secretariat
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-accent transition-colors">
                  Profile & Settings
                </Link>
              </li>
              <li>
                <Link to="/maintenance" className="hover:text-accent transition-colors">
                  System Telemetry
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-textMuted">
          <div>
            &copy; {new Date().getFullYear()} CareerPilot Educational Technologies. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link to="/404" className="hover:text-textSecondary transition-colors">404 Directory</Link>
            <Link to="/403" className="hover:text-textSecondary transition-colors">Security Perimeter</Link>
            <Link to="/offline" className="hover:text-textSecondary transition-colors">Offline Cache</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
