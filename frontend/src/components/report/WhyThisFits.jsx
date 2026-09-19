import React from 'react';
import { BookOpen, CheckCircle, Sparkles, Compass } from 'lucide-react';

export default function WhyThisFits({ recommendation, markdownContent = '', stream = '' }) {
  // Extract "## Why This Fits You" from markdown report if present
  const extractWhyFitsSection = (text) => {
    if (!text) return '';
    const match = text.match(/##\s*Why This Fits You([\s\S]*?)(?=##|$)/i);
    if (match && match[1]) {
      return match[1].trim();
    }
    return '';
  };

  const whyFitsMarkdown = extractWhyFitsSection(markdownContent);
  const reasoning = recommendation?.reasoning || recommendation?.rationale || '';

  // If we have AI-generated rationale or markdown section, render it dynamically
  return (
    <div className="w-full mb-10">
      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent mb-2">
        <Sparkles className="w-3.5 h-3.5" />
        <span>APTITUDE HARMONY & REASONING</span>
      </div>
      <h3 className="font-serif text-2xl sm:text-3xl text-textPrimary mb-6">
        Why This Pathway Fits Your Profile
      </h3>

      <div className="p-8 rounded-2xl bg-surface border border-borderMuted shadow-xs space-y-6">
        {whyFitsMarkdown ? (
          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-textSecondary font-sans whitespace-pre-line">
            {whyFitsMarkdown}
          </div>
        ) : reasoning ? (
          <p className="text-sm sm:text-base leading-relaxed text-textSecondary font-sans">
            {reasoning}
          </p>
        ) : (
          <div className="p-4 rounded-xl bg-background border border-borderMuted text-xs font-mono text-textMuted flex items-center gap-2">
            <Compass className="w-4 h-4 text-accent" />
            <span>Detailed individualized rationale is synthesized in the full consultation dossier below.</span>
          </div>
        )}

        {/* Dynamic stream-grounded alignment breakdown if available */}
        {recommendation?.career_stream && (
          <div className="pt-6 border-t border-borderMuted/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-background border border-borderMuted">
              <span className="font-mono text-[10px] text-accent uppercase block mb-1">Academic Stream Alignment</span>
              <span className="font-medium text-textPrimary">{recommendation.career_stream}</span>
            </div>
            {recommendation?.recommended_degree && (
              <div className="p-4 rounded-xl bg-background border border-borderMuted">
                <span className="font-mono text-[10px] text-accent uppercase block mb-1">Target Discipline</span>
                <span className="font-medium text-textPrimary">{recommendation.recommended_degree}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
