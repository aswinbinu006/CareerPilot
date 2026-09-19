import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ customCrumbs = null }) {
  const location = useLocation();

  const pathMap = {
    '/dashboard': 'Dashboard',
    '/assessment': 'Advisory Assessment',
    '/processing': 'Agent Pipeline',
    '/profile': 'Profile & Settings',
    '/settings': 'Profile & Settings',
    '/support': 'Support Center',
    '/contact': 'Contact Secretariat',
    '/privacy': 'Privacy Policy',
    '/terms': 'Terms & Conditions',
    '/cookies': 'Cookie Preferences',
    '/notifications': 'Admissions Dispatches',
    '/maintenance': 'System Telemetry',
    '/offline': 'Offline Mode',
    '/reset-password': 'Password Reset',
    '/verify-email': 'Email Verification',
    '/404': 'Uncharted Route',
    '/403': 'Permission Perimeter',
  };

  const currentPath = location.pathname;
  if (currentPath === '/') return null;

  let crumbs = customCrumbs;
  if (!crumbs) {
    if (currentPath.startsWith('/report/')) {
      crumbs = [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Dossier Report', path: currentPath },
      ];
    } else {
      const pageTitle = pathMap[currentPath] || 'Overview';
      crumbs = [{ label: pageTitle, path: currentPath }];
    }
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="max-w-7xl mx-auto px-6 pt-6 pb-2 flex items-center gap-2 text-xs font-mono text-textMuted no-print"
    >
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-textPrimary transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>

      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;
        return (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3 h-3 text-borderMuted" />
            {isLast ? (
              <span className="text-textPrimary font-semibold truncate max-w-xs">
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="hover:text-textPrimary transition-colors truncate max-w-xs"
              >
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
