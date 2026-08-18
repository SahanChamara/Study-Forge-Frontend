import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { AppShell } from './AppShell';
import { Spinner } from './ui/Spinner';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-content">
          <div className="brand-logo-large">SF</div>
          <h2>StudyForge</h2>
          <p>Preparing your learning workspace...</p>
          <Spinner size="lg" color="var(--color-primary)" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <AppShell />;
}
