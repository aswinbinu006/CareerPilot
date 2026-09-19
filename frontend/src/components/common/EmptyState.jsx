import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, BellOff, BookmarkX, SearchX, ArrowRight, RefreshCw } from 'lucide-react';
import Button from './Button';
import MagneticButton from './MagneticButton';

/**
 * High-end empty state module with dedicated presets for assessments,
 * notifications, saved colleges, and search queries.
 */
export default function EmptyState({
  variant = 'assessments', // 'assessments' | 'notifications' | 'colleges' | 'search' | 'custom'
  title,
  description,
  actionText,
  actionLink,
  onAction,
  icon: CustomIcon,
}) {
  const presets = {
    assessments: {
      icon: Compass,
      defaultTitle: 'No advisory dossiers compiled yet.',
      defaultDesc:
        'Complete the 8-step Class 12 evaluation to generate your personalized degree match, entrance examination timeline, and four-year curriculum runway.',
      defaultActionText: 'Begin Advisory Assessment',
      defaultActionLink: '/assessment',
    },
    notifications: {
      icon: BellOff,
      defaultTitle: 'No unread dispatches.',
      defaultDesc:
        'You are entirely up to date. You will receive notifications when NTA registration dates or verified NIRF college rankings update.',
      defaultActionText: 'Explore Academic Streams',
      defaultActionLink: '/#streams',
    },
    colleges: {
      icon: BookmarkX,
      defaultTitle: 'No institutions bookmarked.',
      defaultDesc:
        'During assessment reviews, bookmark target universities (IITs, NITs, Central Universities, Premier Private Institutions) to compare cutoffs side by side.',
      defaultActionText: 'Browse Stream Disciplines',
      defaultActionLink: '/#streams',
    },
    search: {
      icon: SearchX,
      defaultTitle: 'No corresponding curriculum records found.',
      defaultDesc:
        'We could not locate universities or examinations matching your specific search query. Try broader keywords such as "B.Tech", "NEET", or "CUET".',
      defaultActionText: 'Clear Search Query',
      defaultActionLink: null,
    },
  };

  const current = presets[variant] || presets.assessments;
  const Icon = CustomIcon || current.icon;
  const displayTitle = title || current.defaultTitle;
  const displayDesc = description || current.defaultDesc;
  const displayActionText = actionText || current.defaultActionText;
  const displayActionLink = actionLink !== undefined ? actionLink : current.defaultActionLink;

  return (
    <div className="w-full py-16 px-8 rounded-3xl border border-dashed border-borderMuted bg-secondary/40 flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-surface border border-borderMuted flex items-center justify-center text-accent mb-4 shadow-xs">
        <Icon className="w-7 h-7 stroke-[1.5]" />
      </div>

      <h3 className="font-serif text-2xl sm:text-3xl text-textPrimary mb-2">
        {displayTitle}
      </h3>

      <p className="text-xs sm:text-sm text-textSecondary max-w-md mb-6 leading-relaxed">
        {displayDesc}
      </p>

      {displayActionLink ? (
        <MagneticButton>
          <Link to={displayActionLink}>
            <Button variant="primary" size="md" icon={ArrowRight}>
              {displayActionText}
            </Button>
          </Link>
        </MagneticButton>
      ) : onAction ? (
        <MagneticButton>
          <Button variant="secondary" size="md" icon={RefreshCw} onClick={onAction}>
            {displayActionText}
          </Button>
        </MagneticButton>
      ) : null}
    </div>
  );
}
