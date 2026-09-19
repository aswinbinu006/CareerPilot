import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from '../../services/api';

/**
 * Production-grade Route Guard
 * Protects authenticated sections of the application.
 * If user is not authenticated, preserves intended return destination in query param and navigation state.
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const isAuth = api.isAuthenticated();

  if (!isAuth) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?redirect=${returnUrl}`} state={{ from: location }} replace />;
  }

  return children;
}
