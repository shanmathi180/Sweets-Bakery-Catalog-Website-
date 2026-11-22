import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-12 h-12 border-4 border-neutral-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="text-center max-w-md">
          <h1 className="font-display text-3xl font-bold text-neutral-900 mb-3">Access Denied</h1>
          <p className="text-neutral-500 mb-6">
            You need administrator privileges to access this area. Sign in with an admin account to continue.
          </p>
          <a
            href={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bootstrap-admin`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-brand-600 hover:underline"
          >
            Bootstrap admin access
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
