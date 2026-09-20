import React from 'react';

export default function SectionHeader({
  tag,
  title,
  description,
  align = 'left',
  className = '',
}) {
  const alignment = {
    left: 'text-left items-start',
    center: 'text-center items-center mx-auto',
    right: 'text-right items-end ml-auto',
  };

  return (
    <div className={`flex flex-col max-w-3xl mb-12 ${alignment[align]} ${className}`}>
      {tag && (
        <span className="text-xs font-mono tracking-wider font-semibold text-accent mb-3 block">
          {tag}
        </span>
      )}
      <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight text-textPrimary leading-[1.1] mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-textSecondary text-base sm:text-lg leading-relaxed font-normal max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
}
