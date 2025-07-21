import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if we're sure about the auth state
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Show loading while auth is loading OR while we have a user but no profile yet (when admin required)
  if (loading || (user && requireAdmin && profile === null)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If no user, don't render (useEffect will handle redirect)
  if (!user) {
    return null;
  }

  // If admin required and user doesn't have admin role, redirect
  if (requireAdmin && profile && profile.role !== 'admin') {
    navigate('/auth');
    return null;
  }

  // If admin required but profile failed to load, redirect
  if (requireAdmin && !loading && profile === null) {
    navigate('/auth');
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;