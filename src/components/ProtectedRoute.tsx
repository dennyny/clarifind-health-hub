import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredUserType?: 'patient' | 'doctor';
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredUserType,
  redirectTo 
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="font-semibold text-foreground mb-2">
              Checking Authentication
            </h3>
            <p className="text-sm text-muted-foreground">
              Please wait while we verify your access...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user || !profile) {
    const loginPath = requiredUserType === 'doctor' ? '/expert' : '/login';
    return (
      <Navigate 
        to={redirectTo || loginPath} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check if user type matches requirement
  if (requiredUserType && profile.user_type !== requiredUserType) {
    // Redirect doctors to expert portal if they're trying to access patient areas
    if (profile.user_type === 'doctor' && requiredUserType === 'patient') {
      return <Navigate to="/doctor" replace />;
    }
    
    // Redirect patients to home if they're trying to access doctor areas
    if (profile.user_type === 'patient' && requiredUserType === 'doctor') {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}

// Convenience component for doctor-only routes
export function DoctorRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredUserType="doctor" redirectTo="/expert">
      {children}
    </ProtectedRoute>
  );
}

// Convenience component for patient-only routes
export function PatientRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredUserType="patient" redirectTo="/login">
      {children}
    </ProtectedRoute>
  );
}
