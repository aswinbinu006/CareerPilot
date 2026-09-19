import React from 'react';

export default function LoadingSkeleton({ className = '', lines = 1 }) {
  return (
    <div className="space-y-3 w-full animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`bg-surface rounded-md h-4 ${className}`}
          style={{ width: lines > 1 && i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}
