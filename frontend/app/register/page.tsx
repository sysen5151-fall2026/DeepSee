'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RegisterForm from '@/components/ui/RegisterForm';
import useAuth from '@/hooks/useAuth';
import { isDemoMode } from '@/lib/config';
import { Activity, FlaskConical, Loader2, LockKeyhole, ShieldCheck, Users } from 'lucide-react';

export default function RegisterPage() {
  const { isAuthenticatedUser, isLoading } = useAuth();
  const router = useRouter();
  const demo = isDemoMode();

  useEffect(() => {
    if (!isLoading && isAuthenticatedUser) router.push('/analyze');
  }, [isAuthenticatedUser, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#0d766e]" />
          <p className="mt-3 text-sm font-semibold text-[#71878c]">Opening secure workspace…</p>
        </div>
      </div>
    );
  }
  if (isAuthenticatedUser) return null;

  return (
    <div className="relative min-h-[calc(100vh-68px)] overflow-hidden bg-[#f5f8f7] soft-grid">
      <div className="absolute right-[-160px] top-[-180px] h-[500px] w-[500px] rounded-full bg-[#dcefe9] blur-3xl" />
      <div className="relative mx-auto grid max-w-[1240px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.98fr_1.02fr] lg:items-center lg:px-8 lg:py-16">
        <div className="hidden pr-10 lg:block">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0d766e] text-white"><Activity className="h-5 w-5" /></span>
            <div>
              <p className="text-xl font-extrabold tracking-[-0.025em] text-[#17383f]">DeepSee</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#7e9297]">Clinical AI workspace</p>
            </div>
          </div>
          <h1 className="mt-10 max-w-xl text-4xl font-extrabold tracking-[-0.045em] text-[#17383f] xl:text-5xl">Create a clinician account.</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-[#667f85]">
            Accounts live on the local inference service inside your network. They gate access to the review workspace; they never carry patient data.
          </p>

          <div className="mt-9 space-y-4">
            {[
              [Users, 'One account per clinician', 'Decisions and exported reports are attributed to the signed-in reviewer.'],
              [LockKeyhole, 'Local credentials', 'Authentication happens against the on-premise service, not a public identity provider.'],
              [ShieldCheck, 'Support, not substitution', 'Every suggestion still requires the clinician to accept, reject, or investigate it.'],
            ].map(([Icon, title, text]) => {
              const I = Icon as typeof Users;
              return (
                <div key={String(title)} className="flex max-w-lg gap-3 rounded-2xl border border-[#d6e5e1] bg-white/70 p-4 backdrop-blur">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e7f3f0] text-[#0d766e]"><I className="h-4 w-4" /></span>
                  <div>
                    <p className="text-sm font-extrabold text-[#31545b]">{String(title)}</p>
                    <p className="mt-1 text-xs leading-5 text-[#74898e]">{String(text)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mx-auto w-full max-w-[520px]">
          <div className="clinical-card p-6 sm:p-8">
            <div className="mb-7">
              <div className="mb-4 flex items-center gap-2 text-xs font-bold text-[#0d766e] lg:hidden"><Activity className="h-4 w-4" /> DeepSee</div>
              <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-[#23464d]">Register</h2>
              <p className="mt-2 text-sm leading-6 text-[#74898e]">Set up credentials for the clinical review workspace.</p>
            </div>

            {demo && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#efd0ad] bg-[#fff8ee] p-3.5">
                <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-[#b36a19]" />
                <p className="text-xs leading-5 text-[#9b6f3c]">
                  <span className="font-extrabold text-[#80501a]">Demo mode.</span> Accounts created here exist only for this browser session.
                </p>
              </div>
            )}

            <RegisterForm />

            <div className="mt-6 border-t border-[#e1ebe8] pt-5 text-center text-xs text-[#809398]">
              Already registered? <Link href="/login" className="font-extrabold text-[#0d766e] hover:underline">Sign in</Link>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#829499]"><ShieldCheck className="h-3.5 w-3.5 text-[#0d766e]" /> Human-in-the-loop decision support only</div>
        </div>
      </div>
    </div>
  );
}
