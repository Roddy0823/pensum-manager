import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/ui/loading-skeleton';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, session } = useAuth();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);

  // Add a small delay to prevent flash of loading state
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setIsReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Show loading state
  if (loading || !isReady) {
    return <PageLoader />;
  }

  // Redirect to auth if not logged in
  if (!user || !session) {
    // Save the intended destination
    return (
      <Navigate
        to="/auth"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Check session expiration
  if (session.expires_at) {
    const expiresAt = new Date(session.expires_at * 1000);
    const now = new Date();

    if (now >= expiresAt) {
      return (
        <Navigate
          to="/auth"
          state={{
            from: location.pathname,
            message: 'Tu sesión ha expirado. Inicia sesión nuevamente.'
          }}
          replace
        />
      );
    }
  }

  // Role-based access control (if needed in future)
  if (requiredRole) {
    const userRole = user.user_metadata?.role;
    if (userRole !== requiredRole) {
      return (
        <Navigate
          to="/dashboard"
          state={{ message: 'No tienes acceso a esta sección.' }}
          replace
        />
      );
    }
  }

  return <>{children}</>;
}
