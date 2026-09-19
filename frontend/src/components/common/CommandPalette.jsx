import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Compass, GraduationCap, Calendar, HelpCircle, ArrowRight, X, Clock, FileText } from 'lucide-react';
import gsap from 'gsap';

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('careerpilot_recent_searches');
      return saved ? JSON.parse(saved) : ['JEE Main', 'B.Tech Computing', 'NIRF Colleges'];
    } catch {
      return ['JEE Main', 'B.Tech Computing', 'NIRF Colleges'];
    }
  });

  const modalRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const searchItems = [
    { title: 'PCM: Physical Sciences & Engineering', category: 'Careers', icon: Compass, url: '/assessment?stream=pcm' },
    { title: 'PCB: Medicine, Genetics & Clinical Health', category: 'Careers', icon: Compass, url: '/assessment?stream=pcb' },
    { title: 'Commerce: Finance, Actuarial & Management', category: 'Careers', icon: Compass, url: '/assessment?stream=commerce' },
    { title: 'Arts & Humanities: Design, Law & Public Policy', category: 'Careers', icon: Compass, url: '/assessment?stream=arts' },
    { title: 'JEE Main & Advanced 2026 Examination Gateway', category: 'Exams', icon: Calendar, url: '/notifications' },
    { title: 'NEET-UG Medical Admissions Calendar', category: 'Exams', icon: Calendar, url: '/notifications' },
    { title: 'CUET-UG Central University Common Entrance', category: 'Exams', icon: Calendar, url: '/notifications' },
    { title: 'CLAT & NLU Integrated Law Admissions', category: 'Exams', icon: Calendar, url: '/notifications' },
    { title: 'Top National Government Universities (IITs, NITs, AIIMS)', category: 'Colleges', icon: GraduationCap, url: '/#streams' },
    { title: 'Premier Accredited Private Institutions (BITS, Manipal)', category: 'Colleges', icon: GraduationCap, url: '/#streams' },
    { title: 'Student Dossier & Evaluation Archive', category: 'Dashboard', icon: FileText, url: '/dashboard' },
    { title: 'Advisory Methodology: 4-Agent LangGraph Ensemble', category: 'Platform', icon: Compass, url: '/#methodology' },
    { title: 'Frequently Asked Questions & Cutoffs', category: 'Help', icon: HelpCircle, url: '/support' },
    { title: 'Advisory Secretariat & Student Desk', category: 'Support', icon: HelpCircle, url: '/contact' },
    { title: 'Cookie & Privacy Telemetry Preferences', category: 'Settings', icon: HelpCircle, url: '/cookies' },
  ];

  // Focus input and animate entrance
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      if (modalRef.current) {
        gsap.fromTo(
          modalRef.current,
          { opacity: 0, scale: 0.96, y: -10 },
          { opacity: 1, scale: 1, y: 0, duration: 0.25, ease: 'power2.out' }
        );
      }
    }
  }, [isOpen]);

  const filteredItems = query.trim()
    ? searchItems.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + (filteredItems.length || 1)) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems.length > 0 && filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  const handleSelect = (item) => {
    // Add to recents
    const updated = [item.title, ...recentSearches.filter((t) => t !== item.title)].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('careerpilot_recent_searches', JSON.stringify(updated));
    } catch {}

    onClose();
    if (item.url.startsWith('#') || item.url.includes('#')) {
      navigate(item.url);
    } else {
      navigate(item.url);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-fade-in no-print"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-surface rounded-3xl border border-borderMuted shadow-2xl overflow-hidden text-textPrimary"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative border-b border-borderMuted p-4 flex items-center gap-3">
          <Search className="w-5 h-5 text-accent flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search disciplines, colleges, entrance exams, or help..."
            className="w-full bg-transparent text-sm text-textPrimary placeholder:text-textMuted focus:outline-hidden font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-textMuted hover:text-textPrimary"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-background border border-borderMuted text-textMuted">
            ESC to exit
          </span>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-1">
          {query.trim() === '' ? (
            <div className="p-4">
              <span className="text-[11px] font-mono uppercase tracking-widest text-textSecondary block mb-3">
                Recent Searches
              </span>
              <div className="flex flex-wrap gap-2 mb-6">
                {recentSearches.map((term, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(term)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background border border-borderMuted text-xs font-mono text-textPrimary hover:border-accent/40 transition-colors cursor-pointer"
                  >
                    <Clock className="w-3 h-3 text-textMuted" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>

              <span className="text-[11px] font-mono uppercase tracking-widest text-textSecondary block mb-2">
                Quick Navigation
              </span>
              <div className="space-y-1">
                {searchItems.slice(0, 4).map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-background/80 transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-accent" />
                        <span className="text-xs font-medium text-textPrimary">{item.title}</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase text-textMuted">{item.category}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-12 text-center text-textSecondary">
              <p className="font-serif text-lg mb-1">No matching curriculum elements found</p>
              <p className="text-xs font-mono text-textMuted">Try searching for "PCM", "NEET", "IIT", or "Cutoffs".</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = selectedIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(item)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left cursor-pointer ${
                    isSelected ? 'bg-background border border-accent/30 shadow-xs' : 'hover:bg-background/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-surface border border-borderMuted flex items-center justify-center text-accent flex-shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-medium text-textPrimary truncate">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-surface border border-borderMuted text-textSecondary">
                      {item.category}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-accent opacity-0 group-hover:opacity-100" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2.5 bg-secondary border-t border-borderMuted text-[11px] font-mono text-textMuted flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>&uarr;&darr; to navigate</span>
            <span>&crarr; to select</span>
          </div>
          <span>CareerPilot Command Palette</span>
        </div>
      </div>
    </div>
  );
}
