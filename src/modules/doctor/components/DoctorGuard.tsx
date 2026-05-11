import { Navigate, useLocation } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';
import { useDoctorAuth } from '../hooks/useDoctorAuth';
import type { ReactNode } from 'react';

/**
 * DoctorGuard — wraps every /doctor/* route.
 *
 * States:
 *  1. Loading  → healthcare-themed spinner
 *  2. No doctorProfile → redirect to /login
 *  3. Authenticated doctor → render children
 */
export default function DoctorGuard({ children }: { children: ReactNode }) {
  const { isDoctorLoading, isDoctorLoggedIn } = useDoctorAuth();
  const location = useLocation();

  if (isDoctorLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center">
              <Stethoscope className="w-8 h-8 text-teal-600" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-teal-300 border-t-teal-600 animate-spin" />
          </div>
          <p className="text-sm font-medium text-teal-700 animate-pulse">
            Verifying doctor credentials…
          </p>
        </div>
      </div>
    );
  }

  if (!isDoctorLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
