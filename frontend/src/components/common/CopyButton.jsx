import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyButton({
  text,
  label = 'Copy',
  successLabel = 'Copied!',
  className = '',
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      data-cursor="Copy"
      aria-label={`Copy ${text}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border transition-all cursor-pointer ${
        copied
          ? 'bg-accent-light text-accent border-accent/40 scale-102 font-medium'
          : 'bg-background hover:bg-surface text-textSecondary hover:text-textPrimary border-borderMuted'
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 stroke-[2.5]" />
          <span>{successLabel}</span>
        </>
      ) : (
        <>
          <Copy className="w-3 h-3 stroke-[1.75]" />
          {label && <span>{label}</span>}
        </>
      )}
    </button>
  );
}
