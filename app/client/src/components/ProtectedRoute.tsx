// UNUSED - kept for future Google OAuth integration.
// When auth is re-enabled, wrap protected routes with this component in App.tsx.
// Requires AuthProvider to be active in main.tsx.

import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}
