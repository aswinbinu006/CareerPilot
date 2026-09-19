import React, { useEffect, useRef } from 'react';
import { AlertCircle, X } from 'lucide-react';
import gsap from 'gsap';

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    if (modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.94 },
        { opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(1.7)' }
      );
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in no-print"
      onClick={onCancel}
    >
      <div
        ref={modalRef}
        className="max-w-md w-full bg-surface p-7 sm:p-8 rounded-3xl border border-borderMuted shadow-2xl text-textPrimary"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isDestructive ? 'bg-red-100 text-red-700' : 'bg-accent-light text-accent'
            }`}
          >
            <AlertCircle className="w-5 h-5 stroke-[2]" />
          </div>
          <button
            onClick={onCancel}
            aria-label="Close dialog"
            className="p-1.5 rounded-full text-textSecondary hover:text-textPrimary hover:bg-background/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="font-serif text-2xl text-textPrimary mb-2 leading-tight">
          {title}
        </h3>

        <p className="text-xs sm:text-sm text-textSecondary leading-relaxed mb-8">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3 font-mono text-xs">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-full bg-background hover:bg-surfaceLight border border-borderMuted text-textPrimary transition-all cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-full text-white transition-all shadow-xs cursor-pointer font-medium ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-charcoal hover:bg-accent'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
