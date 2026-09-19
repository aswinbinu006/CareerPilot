import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = "Unable to connect to advisory service",
  message = "We encountered a network difficulty communicating with the CareerPilot server. Please ensure the backend is active.",
  onRetry,
}) {
  return (
    <div className="w-full p-8 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/40 dark:bg-red-950/30 flex flex-col items-center text-center">
      <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-700 dark:text-red-300 mb-4">
        <AlertCircle className="w-5 h-5 stroke-[1.75]" />
      </div>
      <h3 className="font-serif text-2xl text-textPrimary mb-2">
        {title}
      </h3>
      <p className="text-sm text-textSecondary max-w-md mb-6 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} icon={RefreshCw}>
          Retry Connection
        </Button>
      )}
    </div>
  );
}
