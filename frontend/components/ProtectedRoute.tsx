'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticatedUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticatedUser) router.push('/login');
  }, [isAuthenticatedUser, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e7f3f0] text-[#0d766e]">
            <Loader2 className="h-5 w-5 animate-spin" />
          </span>
          <p className="mt-3 text-sm font-bold text-[#607b81]">Checking clinician session…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticatedUser) return null;
  return <>{children}</>;
};

export default ProtectedRoute;
